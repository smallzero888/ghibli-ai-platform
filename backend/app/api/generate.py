"""
图片生成相关的API路由
处理AI图片生成请求和任务管理，集成硅基流动服务
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime, timedelta
import logging

from ..core.database import get_db
from ..core.auth import get_current_user, check_rate_limit, log_user_action
from ..schemas.generation import (
    GenerationRequest, GenerationResponse, GenerationTask,
    GenerationHistory, ModelsResponse, GenerationStats
)
# Simplified schemas for now
from ..schemas.common import SuccessResponse
from ..models.generation_task import GenerationTask as GenerationTaskModel
from ..models.user import User
from ..models.image import Image
from ..services.ai_service_manager import ai_service_manager
from ..services.siliconflow_service import siliconflow_service, SiliconFlowError

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/simple", response_model=Dict[str, Any])
async def create_simple_generation(
    request: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    简单的图片生成任务（无需认证，用于测试）
    """
    try:
        prompt = request.get("prompt", "a cute cat")
        model = request.get("model", "stabilityai/stable-diffusion-xl-base-1.0")
        
        # 调用硅基流动服务
        result = await siliconflow_service.generate_image(
            prompt=prompt,
            model=model,
            width=request.get("width", 512),
            height=request.get("height", 512),
            steps=request.get("steps", 20)
        )
        
        return {
            "success": True,
            "message": "图片生成成功",
            "result": result
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"生成失败: {str(e)}"
        )

async def process_generation_task(
    task_id: str,
    request: GenerationRequest,
    db: Session
):
    """
    后台处理图片生成任务
    """
    task = db.query(GenerationTaskModel).filter(GenerationTaskModel.id == task_id).first()
    if not task:
        return
    
    try:
        # 更新任务状态为处理中
        task.status = "processing"
        db.commit()
        
        # 调用AI服务生成图片
        result = await ai_service_manager.generate_image_with_fallback(
            prompt=request.prompt,
            model=request.ai_model.value,
            negative_prompt=request.negative_prompt,
            width=request.width,
            height=request.height,
            steps=request.steps,
            guidance_scale=request.guidance_scale,
            seed=request.seed,
            num_outputs=request.batch_size
        )
        
        if result["success"] and result["images"]:
            # 保存生成的图片到数据库
            for image_url in result["images"]:
                image = Image(
                    user_id=task.user_id,
                    prompt=request.prompt,
                    negative_prompt=request.negative_prompt,
                    ai_model=request.ai_model.value,
                    image_url=image_url,
                    width=request.width,
                    height=request.height,
                    generation_params=result.get("parameters", {}),
                    status="completed"
                )
                db.add(image)
            
            # 更新任务状态
            task.status = "completed"
            task.result_url = result["images"][0]  # 主要结果URL
            task.completed_at = datetime.now()
            
            # 更新用户生成计数
            user = db.query(User).filter(User.id == task.user_id).first()
            if user:
                user.generation_count += len(result["images"])
                user.last_generation_at = datetime.now()
            
            db.commit()
            
        else:
            raise Exception("生成结果为空")
            
    except Exception as e:
        # 更新任务状态为失败
        task.status = "failed"
        task.error_message = str(e)
        task.completed_at = datetime.now()
        db.commit()

@router.get("/tasks/{task_id}", response_model=GenerationTask)
async def get_generation_task(
    task_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取生成任务状态
    """
    task = db.query(GenerationTaskModel).filter(
        GenerationTaskModel.id == task_id,
        GenerationTaskModel.user_id == current_user["id"]
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )
    
    return GenerationTask.from_orm(task)

@router.get("/tasks", response_model=GenerationHistory)
async def get_generation_history(
    page: int = 1,
    size: int = 20,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取用户的生成历史
    """
    offset = (page - 1) * size
    
    # 查询任务
    tasks_query = db.query(GenerationTaskModel).filter(
        GenerationTaskModel.user_id == current_user["id"]
    ).order_by(GenerationTaskModel.created_at.desc())
    
    total = tasks_query.count()
    tasks = tasks_query.offset(offset).limit(size).all()
    
    return GenerationHistory(
        items=[GenerationTask.from_orm(task) for task in tasks],
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size
    )

@router.get("/models", response_model=ModelsResponse)
async def get_available_models():
    """
    获取可用的AI模型列表
    """
    try:
        models = await ai_service_manager.get_all_models()
        return ModelsResponse(
            models=models,
            total=len(models)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取模型列表失败: {str(e)}"
        )

@router.get("/stats", response_model=GenerationStats)
async def get_generation_stats(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取用户的生成统计信息
    """
    user_id = current_user["id"]
    
    # 统计任务数量
    total_generations = db.query(GenerationTaskModel).filter(
        GenerationTaskModel.user_id == user_id
    ).count()
    
    successful_generations = db.query(GenerationTaskModel).filter(
        GenerationTaskModel.user_id == user_id,
        GenerationTaskModel.status == "completed"
    ).count()
    
    failed_generations = db.query(GenerationTaskModel).filter(
        GenerationTaskModel.user_id == user_id,
        GenerationTaskModel.status == "failed"
    ).count()
    
    pending_generations = db.query(GenerationTaskModel).filter(
        GenerationTaskModel.user_id == user_id,
        GenerationTaskModel.status.in_(["pending", "processing"])
    ).count()
    
    # 最常用的模型
    most_used_model_result = db.query(
        GenerationTaskModel.ai_model,
        db.func.count(GenerationTaskModel.ai_model).label('count')
    ).filter(
        GenerationTaskModel.user_id == user_id
    ).group_by(GenerationTaskModel.ai_model).order_by(
        db.func.count(GenerationTaskModel.ai_model).desc()
    ).first()
    
    most_used_model = most_used_model_result[0] if most_used_model_result else None
    
    return GenerationStats(
        total_generations=total_generations,
        successful_generations=successful_generations,
        failed_generations=failed_generations,
        pending_generations=pending_generations,
        most_used_model=most_used_model
    )

@router.delete("/tasks/{task_id}", response_model=SuccessResponse)
async def cancel_generation_task(
    task_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    取消生成任务
    """
    task = db.query(GenerationTaskModel).filter(
        GenerationTaskModel.id == task_id,
        GenerationTaskModel.user_id == current_user["id"]
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )
    
    if task.status in ["completed", "failed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="任务已完成，无法取消"
        )
    
    try:
        task.status = "cancelled"
        task.completed_at = datetime.now()
        db.commit()
        
        return SuccessResponse(message="任务已取消")
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"取消任务失败: {str(e)}"
        )

# Simplified SiliconFlow endpoint removed for now

# Batch generation endpoint removed for now

# SiliconFlow specific endpoints removed for now

# Service status endpoint removed for now

# 辅助函数
async def _validate_user_generation_permissions(user: User, db: Session):
    """验证用户生成权限"""
    
    # 检查账户状态
    if not hasattr(user, 'is_active') or not user.is_active:
        raise ValueError("账户已被禁用")
    
    # 检查每日限制
    daily_limits = {
        "free": 10,
        "premium": 100,
        "pro": 500
    }
    
    daily_limit = daily_limits.get(user.subscription_type, 10)
    
    # 计算今日生成次数
    today = datetime.now().date()
    today_count = db.query(GenerationTaskModel).filter(
        GenerationTaskModel.user_id == user.id,
        GenerationTaskModel.created_at >= today,
        GenerationTaskModel.status.in_(["completed", "processing"])
    ).count()
    
    if today_count >= daily_limit:
        raise ValueError(f"已达到每日生成限制 ({daily_limit} 次)，请升级订阅或明天再试")
    
    return True

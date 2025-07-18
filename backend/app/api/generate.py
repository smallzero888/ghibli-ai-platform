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
from ..schemas.siliconflow import (
    SiliconFlowImageGenerationRequest, BatchGenerationRequest,
    BatchGenerationResponse, GenerationHistory as SFGenerationHistory
)
from ..schemas.common import SuccessResponse
from ..models.generation_task import GenerationTask as GenerationTaskModel
from ..models.user import User
from ..models.image import Image
from ..services.ai_service_manager import ai_service_manager
from ..services.siliconflow_service import siliconflow_client, SiliconFlowAPIError

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/", response_model=GenerationResponse)
async def create_generation_task(
    request: GenerationRequest,
    background_tasks: BackgroundTasks,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    创建图片生成任务
    """
    # 检查速率限制
    check_rate_limit(request, current_user)
    
    # 检查用户生成限制
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 根据订阅类型检查生成限制
    generation_limits = {
        "free": 50,
        "premium": 500,
        "pro": 2000
    }
    
    limit = generation_limits.get(user.subscription_type, 50)
    if user.generation_count >= limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"已达到生成限制 ({limit})，请升级订阅"
        )
    
    try:
        # 创建生成任务记录
        task = GenerationTaskModel(
            user_id=current_user["id"],
            prompt=request.prompt,
            ai_model=request.ai_model.value,
            status="pending"
        )
        
        db.add(task)
        db.commit()
        db.refresh(task)
        
        # 估算生成时间
        estimated_time = await ai_service_manager.estimate_generation_time(
            model=request.ai_model.value,
            width=request.width,
            height=request.height,
            steps=request.steps,
            num_outputs=request.batch_size
        )
        
        # 添加后台任务处理图片生成
        background_tasks.add_task(
            process_generation_task,
            task_id=str(task.id),
            request=request,
            db=db
        )
        
        return GenerationResponse(
            task_id=task.id,
            status="pending",
            message="生成任务已创建，正在处理中...",
            estimated_time=estimated_time
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建生成任务失败: {str(e)}"
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

@router.post("/siliconflow", response_model=GenerationResponse)
async def create_siliconflow_generation(
    request: SiliconFlowImageGenerationRequest,
    request_obj: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    使用硅基流动API创建图片生成任务
    """
    # 检查速率限制
    check_rate_limit(request_obj, current_user)
    
    # 获取用户信息
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 验证用户权限
    try:
        await _validate_user_generation_permissions(user, db)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(e)
        )
    
    try:
        # 创建生成任务记录
        task_id = str(uuid.uuid4())
        task = GenerationTaskModel(
            id=task_id,
            user_id=current_user["id"],
            prompt=request.prompt,
            ai_model="siliconflow-" + (request.model or "stable-diffusion-xl"),
            status="pending"
        )
        
        db.add(task)
        db.commit()
        db.refresh(task)
        
        # 记录用户操作
        log_user_action(
            action="image_generation_request",
            resource_type="generation_task",
            resource_id=task_id,
            details={
                "prompt": request.prompt[:100],
                "model": request.model,
                "style": request.style.value
            },
            request=request_obj,
            current_user=current_user,
            db=db
        )
        
        # 直接调用硅基流动API
        task.status = "processing"
        db.commit()
        
        try:
            result = await siliconflow_client.generate_image(request)
            
            # 保存生成结果
            image = Image(
                user_id=user.id,
                prompt=request.prompt,
                negative_prompt=request.negative_prompt,
                ai_model=task.ai_model,
                image_url=result.url,
                width=result.width,
                height=result.height,
                generation_params={
                    "guidance_scale": result.guidance_scale,
                    "num_inference_steps": result.num_inference_steps,
                    "seed": result.seed,
                    "model": result.model
                },
                status="completed"
            )
            db.add(image)
            
            # 更新任务状态
            task.status = "completed"
            task.result_url = result.url
            task.completed_at = datetime.now()
            
            # 更新用户统计
            user.generation_count += 1
            user.last_generation_at = datetime.now()
            
            db.commit()
            
            return GenerationResponse(
                task_id=task.id,
                status="completed",
                message="图片生成成功"
            )
            
        except SiliconFlowAPIError as e:
            # 硅基流动API错误
            task.status = "failed"
            task.error_message = e.message
            task.completed_at = datetime.now()
            db.commit()
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"图片生成失败: {e.message}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"SiliconFlow generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"生成任务创建失败: {str(e)}"
        )

@router.post("/batch", response_model=BatchGenerationResponse)
async def create_batch_generation(
    request: BatchGenerationRequest,
    request_obj: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    批量生成图片
    """
    # 检查用户权限
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 检查批量生成权限
    if user.subscription_type == "free":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="免费用户不支持批量生成，请升级订阅"
        )
    
    # 验证批量请求数量
    batch_size = len(request.requests)
    if batch_size > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="批量请求不能超过10个"
        )
    
    try:
        batch_response = BatchGenerationResponse(
            batch_id=request.batch_id,
            total_requests=batch_size
        )
        
        # 处理每个生成请求
        for i, gen_request in enumerate(request.requests):
            try:
                # 创建单个任务
                task_id = str(uuid.uuid4())
                task = GenerationTaskModel(
                    id=task_id,
                    user_id=current_user["id"],
                    prompt=gen_request.prompt,
                    ai_model="siliconflow-batch",
                    status="pending"
                )
                
                db.add(task)
                db.commit()
                db.refresh(task)
                
                # 调用硅基流动API
                result = await siliconflow_client.generate_image(gen_request)
                
                # 保存结果
                image = Image(
                    user_id=user.id,
                    prompt=gen_request.prompt,
                    negative_prompt=gen_request.negative_prompt,
                    ai_model=task.ai_model,
                    image_url=result.url,
                    width=result.width,
                    height=result.height,
                    generation_params={
                        "batch_id": request.batch_id,
                        "batch_index": i
                    },
                    status="completed"
                )
                db.add(image)
                
                task.status = "completed"
                task.result_url = result.url
                task.completed_at = datetime.now()
                
                batch_response.successful += 1
                batch_response.results.append(GenerationTask.from_orm(task))
                
            except Exception as e:
                # 单个任务失败
                task.status = "failed"
                task.error_message = str(e)
                task.completed_at = datetime.now()
                
                batch_response.failed += 1
                batch_response.results.append(GenerationTask.from_orm(task))
                
                logger.warning(f"Batch generation item {i} failed: {e}")
        
        # 更新用户统计
        user.generation_count += batch_response.successful
        user.last_generation_at = datetime.now()
        
        db.commit()
        
        return batch_response
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"批量生成失败: {str(e)}"
        )

@router.get("/siliconflow/models")
async def get_siliconflow_models(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    获取硅基流动可用模型列表
    """
    try:
        models = await siliconflow_client.get_available_models()
        return {
            "models": [model.dict() for model in models],
            "total": len(models),
            "provider": "siliconflow"
        }
    except SiliconFlowAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"获取模型列表失败: {e.message}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取模型列表失败: {str(e)}"
        )

@router.get("/siliconflow/account")
async def get_siliconflow_account_info(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    获取硅基流动账户信息
    """
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要管理员权限"
        )
    
    try:
        account_info = await siliconflow_client.get_account_info()
        return account_info.dict()
    except SiliconFlowAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"获取账户信息失败: {e.message}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取账户信息失败: {str(e)}"
        )

@router.get("/service-status")
async def get_service_status(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    获取AI服务状态（管理员功能）
    """
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要管理员权限"
        )
    
    try:
        # 获取硅基流动服务状态
        siliconflow_status = {
            "provider": "siliconflow",
            "status": "unknown",
            "models_count": 0,
            "account_info": None,
            "last_check": datetime.now().isoformat()
        }
        
        try:
            models = await siliconflow_client.get_available_models()
            account_info = await siliconflow_client.get_account_info()
            
            siliconflow_status.update({
                "status": "healthy",
                "models_count": len(models),
                "account_info": {
                    "balance": account_info.balance,
                    "daily_limit": account_info.daily_limit,
                    "remaining_today": account_info.remaining_today,
                    "subscription_type": account_info.subscription_type
                }
            })
        except Exception as e:
            siliconflow_status.update({
                "status": "unhealthy",
                "error": str(e)
            })
        
        return {
            "services": {
                "siliconflow": siliconflow_status
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取服务状态失败: {str(e)}"
        )

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
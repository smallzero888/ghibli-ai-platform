"""
Replicate专用API路由 - 增强版
基于Replicate官方文档实现完整功能
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks, Header
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime
import logging
import json

from ..core.database import get_db
from ..core.auth import get_current_user, check_rate_limit, log_user_action
from ..schemas.generation import GenerationResponse, GenerationTask
from ..schemas.common import SuccessResponse
from ..schemas.replicate import ReplicateWebhookPayload
from ..models.generation_task import GenerationTask as GenerationTaskModel
from ..models.user import User
from ..models.image import Image
from ..services.replicate_service import replicate_service, ReplicateError

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/generate", response_model=GenerationResponse)
async def generate_image(
    request: Request,
    background_tasks: BackgroundTasks,
    prompt: str,
    model: str = "flux-schnell",
    negative_prompt: Optional[str] = None,
    width: int = 1024,
    height: int = 1024,
    num_inference_steps: int = 20,
    guidance_scale: float = 7.5,
    seed: Optional[int] = None,
    num_outputs: int = 1,
    aspect_ratio: Optional[str] = None,
    output_format: str = "png",
    output_quality: int = 90,
    style_preset: Optional[str] = None,
    use_webhook: bool = False,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """通用图片生成接口 - 支持所有Replicate模型"""
    
    # 检查速率限制
    check_rate_limit(request, current_user)
    
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
    
    # 验证模型
    try:
        model_info = await replicate_service.get_model_info(model)
    except ReplicateError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # 增强吉卜力风格提示词
    enhanced_prompt = await replicate_service.enhance_ghibli_prompt(prompt)
    
    try:
        # 创建生成任务记录
        task_id = str(uuid.uuid4())
        task = GenerationTaskModel(
            id=task_id,
            user_id=current_user["id"],
            prompt=enhanced_prompt,
            original_prompt=prompt,
            ai_model=model,
            status="pending",
            parameters={
                "width": width,
                "height": height,
                "num_inference_steps": num_inference_steps,
                "guidance_scale": guidance_scale,
                "seed": seed,
                "num_outputs": num_outputs,
                "aspect_ratio": aspect_ratio,
                "output_format": output_format,
                "output_quality": output_quality,
                "style_preset": style_preset,
                "negative_prompt": negative_prompt
            }
        )
        
        db.add(task)
        db.commit()
        db.refresh(task)
        
        # 记录用户操作
        log_user_action(
            action="replicate_generation_request",
            resource_type="generation_task",
            resource_id=task_id,
            details={
                "prompt": enhanced_prompt[:100],
                "model": model,
                "width": width,
                "height": height,
                "use_webhook": use_webhook
            },
            request=request,
            current_user=current_user,
            db=db
        )
        
        # 异步处理生成任务
        task.status = "processing"
        db.commit()
        
        if use_webhook:
            # 使用webhook模式
            webhook_url = f"{request.base_url}api/webhooks/replicate/{task_id}"
            background_tasks.add_task(
                _process_generation_with_webhook,
                task_id,
                enhanced_prompt,
                model,
                task.parameters,
                webhook_url,
                db
            )
            
            return GenerationResponse(
                task_id=task.id,
                status="processing",
                message="生成任务已提交，将通过webhook通知结果"
            )
        else:
            # 同步处理
            try:
                result = await _process_generation_sync(
                    task_id,
                    enhanced_prompt,
                    model,
                    task.parameters,
                    db
                )
                
                return GenerationResponse(
                    task_id=task.id,
                    status="completed",
                    message="图片生成成功",
                    result=result
                )
                
            except ReplicateError as e:
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
        logger.error(f"Replicate generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"生成任务创建失败: {str(e)}"
        )

@router.post("/flux-schnell", response_model=GenerationResponse)
async def generate_with_flux_schnell(
    prompt: str,
    width: int = 1024,
    height: int = 1024,
    seed: Optional[int] = None,
    num_outputs: int = 1,
    aspect_ratio: Optional[str] = None,
    output_format: str = "png",
    output_quality: int = 90,
    request: Request = None,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """使用FLUX Schnell模型生成图片（快速版本）"""
    
    return await generate_image(
        request=request,
        prompt=prompt,
        model="flux-schnell",
        width=width,
        height=height,
        seed=seed,
        num_outputs=num_outputs,
        aspect_ratio=aspect_ratio,
        output_format=output_format,
        output_quality=output_quality,
        current_user=current_user,
        db=db
    )

@router.post("/sdxl", response_model=GenerationResponse)
async def generate_with_sdxl(
    prompt: str,
    negative_prompt: Optional[str] = None,
    width: int = 1024,
    height: int = 1024,
    num_inference_steps: int = 20,
    guidance_scale: float = 7.5,
    seed: Optional[int] = None,
    num_outputs: int = 1,
    style_preset: Optional[str] = None,
    request: Request = None,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """使用Stable Diffusion XL模型生成图片"""
    
    return await generate_image(
        request=request,
        prompt=prompt,
        model="sdxl",
        negative_prompt=negative_prompt,
        width=width,
        height=height,
        num_inference_steps=num_inference_steps,
        guidance_scale=guidance_scale,
        seed=seed,
        num_outputs=num_outputs,
        style_preset=style_preset,
        current_user=current_user,
        db=db
    )

@router.post("/flux", response_model=GenerationResponse)
async def generate_with_flux(
    prompt: str,
    width: int = 1024,
    height: int = 1024,
    num_inference_steps: int = 28,
    guidance_scale: float = 3.5,
    seed: Optional[int] = None,
    num_outputs: int = 1,
    request: Request = None,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """使用FLUX模型生成图片"""
    
    return await generate_image(
        request=request,
        prompt=prompt,
        model="flux",
        width=width,
        height=height,
        num_inference_steps=num_inference_steps,
        guidance_scale=guidance_scale,
        seed=seed,
        num_outputs=num_outputs,
        current_user=current_user,
        db=db
    )

@router.get("/models")
async def get_replicate_models(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """获取Replicate支持的模型列表"""
    try:
        models = replicate_service.get_supported_models()
        return {
            "models": models,
            "total": len(models),
            "provider": "replicate"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取模型列表失败: {str(e)}"
        )

@router.get("/models/{model_id}")
async def get_model_details(
    model_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """获取特定模型的详细信息"""
    try:
        model_info = await replicate_service.get_model_info(model_id)
        return model_info
    except ReplicateError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取模型详情失败: {str(e)}"
        )

@router.get("/account")
async def get_replicate_account_info(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """获取Replicate账户信息（管理员功能）"""
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要管理员权限"
        )
    
    try:
        account_info = await replicate_service.get_account_info()
        return account_info
    except ReplicateError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"获取账户信息失败: {e.message}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取账户信息失败: {str(e)}"
        )

@router.get("/predictions/{prediction_id}")
async def get_prediction_status(
    prediction_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """获取Replicate预测任务状态"""
    try:
        prediction = await replicate_service.get_prediction(prediction_id)
        return prediction
    except ReplicateError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"获取预测状态失败: {e.message}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取预测状态失败: {str(e)}"
        )

@router.post("/predictions/{prediction_id}/cancel", response_model=SuccessResponse)
async def cancel_prediction(
    prediction_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """取消Replicate预测任务"""
    try:
        result = await replicate_service.cancel_prediction(prediction_id)
        return SuccessResponse(message="预测任务已取消")
    except ReplicateError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"取消预测失败: {e.message}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"取消预测失败: {str(e)}"
        )

@router.post("/webhook/{task_id}")
async def handle_replicate_webhook(
    task_id: str,
    payload: ReplicateWebhookPayload,
    request: Request,
    db: Session = Depends(get_db)
):
    """处理Replicate webhook通知"""
    try:
        # 验证任务存在
        task = db.query(GenerationTaskModel).filter(
            GenerationTaskModel.id == task_id
        ).first()
        
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="任务不存在"
            )
        
        # 处理webhook数据
        if payload.status == "succeeded":
            # 保存生成结果
            output = payload.output or []
            if isinstance(output, str):
                output = [output]
            
            for image_url in output:
                image = Image(
                    user_id=task.user_id,
                    prompt=task.prompt,
                    ai_model=task.ai_model,
                    image_url=image_url,
                    generation_params=task.parameters,
                    status="completed"
                )
                db.add(image)
            
            # 更新任务状态
            task.status = "completed"
            task.result_url = output[0] if output else None
            task.completed_at = datetime.now()
            
            # 更新用户统计
            user = db.query(User).filter(User.id == task.user_id).first()
            if user:
                user.generation_count += len(output)
                user.last_generation_at = datetime.now()
                
        elif payload.status == "failed":
            task.status = "failed"
            task.error_message = payload.error
            task.completed_at = datetime.now()
        
        db.commit()
        
        return {"status": "processed"}
        
    except Exception as e:
        logger.error(f"处理webhook失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="处理webhook失败"
        )

@router.get("/service-status")
async def get_replicate_service_status(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """获取Replicate服务状态"""
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要管理员权限"
        )
    
    try:
        status_info = await replicate_service.check_service_status()
        return status_info
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "service": "replicate",
            "timestamp": datetime.now().isoformat()
        }

@router.post("/batch-generate")
async def batch_generate_images(
    requests: List[Dict[str, Any]],
    request: Request = None,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """批量生成图片"""
    
    if len(requests) > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="批量请求不能超过5个"
        )
    
    # 检查速率限制
    check_rate_limit(request, current_user)
    
    # 获取用户信息
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    try:
        # 批量处理
        results = await replicate_service.batch_generate(requests)
        
        # 记录操作
        log_user_action(
            action="replicate_batch_generation",
            resource_type="generation_task",
            resource_id="batch",
            details={
                "batch_size": len(requests),
                "results": results
            },
            request=request,
            current_user=current_user,
            db=db
        )
        
        return {
            "batch_id": str(uuid.uuid4()),
            "results": results,
            "total": len(results),
            "successful": len([r for r in results if r["status"] == "succeeded"]),
            "failed": len([r for r in results if r["status"] == "failed"])
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"批量生成失败: {str(e)}"
        )

@router.get("/estimate-time")
async def estimate_generation_time(
    model: str,
    width: int = 1024,
    height: int = 1024,
    steps: int = 20,
    batch_size: int = 1,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """估算生成时间"""
    try:
        estimated_time = await replicate_service.estimate_generation_time(
            model=model,
            width=width,
            height=height,
            steps=steps,
            batch_size=batch_size
        )
        return {
            "estimated_time": estimated_time,
            "model": model,
            "parameters": {
                "width": width,
                "height": height,
                "steps": steps,
                "batch_size": batch_size
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"估算时间失败: {str(e)}"
        )

# 辅助函数
async def _validate_user_generation_permissions(user: User, db: Session):
    """验证用户生成权限"""
    
    # 检查账户状态
    if not hasattr(user, 'is_active') or not user.is_active:
        raise ValueError("账户已被禁用")
    
    # 检查每日限制
    daily_limits = {
        "free": 5,      # 免费用户每日5次
        "premium": 50,  # 付费用户每日50次
        "pro": 200      # 专业用户每日200次
    }
    
    daily_limit = daily_limits.get(user.subscription_type, 5)
    
    # 计算今日生成次数
    today = datetime.now().date()
    today_count = db.query(GenerationTaskModel).filter(
        GenerationTaskModel.user_id == user.id,
        GenerationTaskModel.created_at >= today,
        GenerationTaskModel.status.in_(["completed", "processing"]),
        GenerationTaskModel.ai_model.like("replicate-%")
    ).count()
    
    if today_count >= daily_limit:
        raise ValueError(f"已达到Replicate每日生成限制 ({daily_limit} 次)，请升级订阅或明天再试")
    
    return True

async def _process_generation_sync(
    task_id: str,
    prompt: str,
    model: str,
    parameters: Dict[str, Any],
    db: Session
) -> Dict[str, Any]:
    """同步处理生成任务"""
    
    task = db.query(GenerationTaskModel).filter(GenerationTaskModel.id == task_id).first()
    if not task:
        raise ReplicateError("任务不存在")
    
    try:
        # 根据模型选择生成方法
        if model == "replicate-flux-schnell":
            result = await replicate_service.generate_image_flux_schnell(
                prompt=prompt,
                **parameters
            )
        elif model == "replicate-flux":
            result = await replicate_service.generate_image_flux(
                prompt=prompt,
                **parameters
            )
        elif model == "replicate-sdxl":
            result = await replicate_service.generate_image_sdxl(
                prompt=prompt,
                **parameters
            )
        elif model == "replicate-playground":
            result = await replicate_service.generate_image_playground(
                prompt=prompt,
                **parameters
            )
        else:
            raise ReplicateError(f"不支持的模型: {model}")
        
        # 保存结果
        task.status = "completed"
        task.result_url = result["images"][0] if result["images"] else None
        task.completed_at = datetime.now()
        
        # 保存图片记录
        user = db.query(User).filter(User.id == task.user_id).first()
        if user:
            for image_url in result["images"]:
                image = Image(
                    user_id=user.id,
                    prompt=prompt,
                    ai_model=model,
                    image_url=image_url,
                    width=parameters.get("width", 1024),
                    height=parameters.get("height", 1024),
                    generation_params=result.get("parameters", {}),
                    status="completed"
                )
                db.add(image)
            
            user.generation_count += len(result["images"])
            user.last_generation_at = datetime.now()
        
        db.commit()
        
        return result
        
    except Exception as e:
        task.status = "failed"
        task.error_message = str(e)
        task.completed_at = datetime.now()
        db.commit()
        raise

async def _process_generation_with_webhook(
    task_id: str,
    prompt: str,
    model: str,
    parameters: Dict[str, Any],
    webhook_url: str,
    db: Session
):
    """使用webhook异步处理生成任务"""
    
    task = db.query(GenerationTaskModel).filter(GenerationTaskModel.id == task_id).first()
    if not task:
        logger.error(f"任务不存在: {task_id}")
        return
    
    try:
        # 根据模型选择生成方法
        if model == "replicate-flux-schnell":
            result = await replicate_service.generate_image_flux_schnell(
                prompt=prompt,
                **parameters
            )
        elif model == "replicate-flux":
            result = await replicate_service.generate_image_flux(
                prompt=prompt,
                **parameters
            )
        elif model == "replicate-sdxl":
            result = await replicate_service.generate_image_sdxl(
                prompt=prompt,
                **parameters
            )
        elif model == "replicate-playground":
            result = await replicate_service.generate_image_playground(
                prompt=prompt,
                **parameters
            )
        else:
            raise ReplicateError(f"不支持的模型: {model}")
        
        # 保存结果
        task.status = "completed"
        task.result_url = result["images"][0] if result["images"] else None
        task.completed_at = datetime.now()
        
        # 保存图片记录
        user = db.query(User).filter(User.id == task.user_id).first()
        if user:
            for image_url in result["images"]:
                image = Image(
                    user_id=user.id,
                    prompt=prompt,
                    ai_model=model,
                    image_url=image_url,
                    width=parameters.get("width", 1024),
                    height=parameters.get("height", 1024),
                    generation_params=result.get("parameters", {}),
                    status="completed"
                )
                db.add(image)
            
            user.generation_count += len(result["images"])
            user.last_generation_at = datetime.now()
        
        db.commit()
        
    except Exception as e:
        task.status = "failed"
        task.error_message = str(e)
        task.completed_at = datetime.now()
        db.commit()
        logger.error(f"webhook处理失败: {e}")

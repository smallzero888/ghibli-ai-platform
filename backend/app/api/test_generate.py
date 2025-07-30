"""
测试图片生成API - 无需认证
用于测试图片生成功能
"""

from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any
import logging

from ..services.ai_service_manager import ai_service_manager
from ..services.siliconflow_service import siliconflow_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/test-generate", response_model=Dict[str, Any])
async def test_generate_image(request: dict):
    """
    测试图片生成 - 无需认证
    """
    try:
        prompt = request.get("prompt", "a cute cat in ghibli style")
        model = request.get("model", "stabilityai/stable-diffusion-xl-base-1.0")
        width = request.get("width", 512)
        height = request.get("height", 512)
        
        # 使用硅基流动服务直接生成
        result = await siliconflow_service.generate_image(
            prompt=prompt,
            model=model,
            width=width,
            height=height,
            steps=20
        )
        
        return {
            "success": True,
            "message": "测试生成成功",
            "result": result
        }
        
    except Exception as e:
        logger.error(f"测试生成失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"测试生成失败: {str(e)}"
        )

@router.get("/test-models", response_model=Dict[str, Any])
async def get_test_models():
    """
    获取测试模型列表 - 无需认证
    """
    try:
        # 返回静态模型列表用于测试
        models = [
            {
                "id": "stabilityai/stable-diffusion-xl-base-1.0",
                "name": "Stable Diffusion XL",
                "description": "高质量图片生成模型",
                "provider": "siliconflow",
                "max_width": 1024,
                "max_height": 1024,
                "max_steps": 100,
                "supports_negative_prompt": True,
                "estimated_time": 15
            },
            {
                "id": "black-forest-labs/flux-schnell",
                "name": "FLUX Schnell",
                "description": "快速高质量图片生成",
                "provider": "siliconflow",
                "max_width": 1024,
                "max_height": 1024,
                "max_steps": 50,
                "supports_negative_prompt": True,
                "estimated_time": 20
            }
        ]
        
        return {
            "models": models,
            "total": len(models)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取模型列表失败: {str(e)}"
        )

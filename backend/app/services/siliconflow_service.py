"""
硅基流动AI服务集成
提供图片生成功能的API客户端
"""

import httpx
import asyncio
import json
import time
from typing import Dict, Any, Optional, List
from datetime import datetime
import logging

from ..core.config import settings

logger = logging.getLogger(__name__)

class SiliconFlowError(Exception):
    """硅基流动API错误"""
    def __init__(self, message: str, status_code: Optional[int] = None, error_code: Optional[str] = None):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        super().__init__(self.message)

class SiliconFlowService:
    """硅基流动AI服务客户端"""
    
    def __init__(self):
        self.api_key = settings.SILICONFLOW_API_KEY
        self.base_url = "https://api.siliconflow.cn/v1"
        self.timeout = 60.0
        
        if not self.api_key:
            logger.warning("硅基流动API密钥未配置")
    
    def _get_headers(self) -> Dict[str, str]:
        """获取请求头"""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "Ghibli-AI-Platform/1.0"
        }
    
    async def _make_request(
        self, 
        method: str, 
        endpoint: str, 
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        timeout: Optional[float] = None
    ) -> Dict[str, Any]:
        """发送HTTP请求"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        headers = self._get_headers()
        
        async with httpx.AsyncClient(timeout=timeout or self.timeout) as client:
            try:
                if method.upper() == "GET":
                    response = await client.get(url, headers=headers, params=params)
                elif method.upper() == "POST":
                    response = await client.post(url, headers=headers, json=data, params=params)
                else:
                    raise ValueError(f"不支持的HTTP方法: {method}")
                
                # 记录请求日志
                logger.info(f"硅基流动API请求: {method} {url} - 状态码: {response.status_code}")
                
                if response.status_code == 200:
                    return response.json()
                else:
                    error_data = response.json() if response.content else {}
                    error_message = error_data.get("error", {}).get("message", "未知错误")
                    error_code = error_data.get("error", {}).get("code")
                    
                    raise SiliconFlowError(
                        message=f"API请求失败: {error_message}",
                        status_code=response.status_code,
                        error_code=error_code
                    )
                    
            except httpx.TimeoutException:
                raise SiliconFlowError("请求超时")
            except httpx.RequestError as e:
                raise SiliconFlowError(f"网络请求错误: {str(e)}")
    
    async def get_models(self) -> List[Dict[str, Any]]:
        """获取可用的AI模型列表"""
        try:
            response = await self._make_request("GET", "/models")
            models = response.get("data", [])
            
            # 过滤出图片生成相关的模型
            image_models = [
                model for model in models 
                if "image" in model.get("id", "").lower() or 
                   "diffusion" in model.get("id", "").lower() or
                   "flux" in model.get("id", "").lower()
            ]
            
            return image_models
            
        except SiliconFlowError:
            raise
        except Exception as e:
            raise SiliconFlowError(f"获取模型列表失败: {str(e)}")
    
    async def generate_image(
        self,
        prompt: str,
        model: str = "stabilityai/stable-diffusion-xl-base-1.0",
        negative_prompt: Optional[str] = None,
        width: int = 1024,
        height: int = 1024,
        steps: int = 20,
        guidance_scale: float = 7.5,
        seed: Optional[int] = None,
        batch_size: int = 1
    ) -> Dict[str, Any]:
        """
        生成图片
        
        Args:
            prompt: 生成提示词
            model: 使用的模型ID
            negative_prompt: 负面提示词
            width: 图片宽度
            height: 图片高度
            steps: 生成步数
            guidance_scale: 引导强度
            seed: 随机种子
            batch_size: 批次大小
            
        Returns:
            包含生成结果的字典
        """
        if not self.api_key:
            raise SiliconFlowError("硅基流动API密钥未配置")
        
        # 构建请求数据
        request_data = {
            "model": model,
            "prompt": prompt,
            "width": width,
            "height": height,
            "num_inference_steps": steps,
            "guidance_scale": guidance_scale,
            "num_images_per_prompt": batch_size,
            "response_format": "url"  # 返回图片URL而不是base64
        }
        
        if negative_prompt:
            request_data["negative_prompt"] = negative_prompt
        
        if seed is not None:
            request_data["seed"] = seed
        
        try:
            logger.info(f"开始生成图片: {prompt[:50]}...")
            start_time = time.time()
            
            response = await self._make_request(
                "POST", 
                "/images/generations",
                data=request_data,
                timeout=120.0  # 图片生成需要更长时间
            )
            
            generation_time = time.time() - start_time
            logger.info(f"图片生成完成，耗时: {generation_time:.2f}秒")
            
            # 处理响应数据
            images = response.get("data", [])
            if not images:
                raise SiliconFlowError("生成结果为空")
            
            return {
                "success": True,
                "images": [img.get("url") for img in images if img.get("url")],
                "model": model,
                "prompt": prompt,
                "negative_prompt": negative_prompt,
                "parameters": {
                    "width": width,
                    "height": height,
                    "steps": steps,
                    "guidance_scale": guidance_scale,
                    "seed": seed,
                    "batch_size": batch_size
                },
                "generation_time": generation_time,
                "created_at": datetime.now().isoformat()
            }
            
        except SiliconFlowError:
            raise
        except Exception as e:
            raise SiliconFlowError(f"图片生成失败: {str(e)}")
    
    async def check_service_status(self) -> Dict[str, Any]:
        """检查服务状态"""
        try:
            models = await self.get_models()
            return {
                "status": "healthy",
                "available_models": len(models),
                "service": "siliconflow",
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "service": "siliconflow",
                "timestamp": datetime.now().isoformat()
            }
    
    async def estimate_generation_time(
        self, 
        model: str, 
        width: int, 
        height: int, 
        steps: int,
        batch_size: int = 1
    ) -> int:
        """
        估算生成时间（秒）
        基于模型和参数复杂度
        """
        base_time = 10  # 基础时间
        
        # 根据分辨率调整
        resolution_factor = (width * height) / (512 * 512)
        
        # 根据步数调整
        steps_factor = steps / 20
        
        # 根据批次大小调整
        batch_factor = batch_size
        
        # 根据模型调整
        model_factor = 1.0
        if "xl" in model.lower():
            model_factor = 1.5
        elif "flux" in model.lower():
            model_factor = 2.0
        
        estimated_time = int(
            base_time * resolution_factor * steps_factor * batch_factor * model_factor
        )
        
        return max(estimated_time, 5)  # 最少5秒
    
    def get_supported_models(self) -> List[Dict[str, Any]]:
        """获取支持的模型信息（静态配置）"""
        return [
            {
                "id": "stabilityai/stable-diffusion-xl-base-1.0",
                "name": "Stable Diffusion XL",
                "description": "高质量图片生成模型，适合各种风格",
                "max_width": 2048,
                "max_height": 2048,
                "max_steps": 100,
                "supports_negative_prompt": True,
                "estimated_time": 15
            },
            {
                "id": "black-forest-labs/flux-schnell",
                "name": "FLUX Schnell",
                "description": "快速高质量图片生成模型",
                "max_width": 2048,
                "max_height": 2048,
                "max_steps": 50,
                "supports_negative_prompt": True,
                "estimated_time": 20
            },
            {
                "id": "stabilityai/stable-diffusion-2-1",
                "name": "Stable Diffusion 2.1",
                "description": "经典稳定扩散模型",
                "max_width": 1024,
                "max_height": 1024,
                "max_steps": 100,
                "supports_negative_prompt": True,
                "estimated_time": 12
            }
        ]

# 全局服务实例
siliconflow_service = SiliconFlowService()
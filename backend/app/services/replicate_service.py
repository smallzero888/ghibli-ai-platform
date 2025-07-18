"""
Replicate AI服务集成 - 增强版
基于Replicate官方文档实现完整功能
"""

import httpx
import asyncio
import json
import time
import hashlib
from typing import Dict, Any, Optional, List, Union, Callable
from datetime import datetime
import logging
from urllib.parse import urlparse

from ..core.config import settings

logger = logging.getLogger(__name__)

class ReplicateError(Exception):
    """Replicate API错误"""
    def __init__(self, message: str, status_code: Optional[int] = None, error_code: Optional[str] = None):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        super().__init__(self.message)

class ReplicateService:
    """Replicate AI服务客户端 - 增强版"""
    
    def __init__(self):
        self.api_token = settings.REPLICATE_API_TOKEN
        self.base_url = "https://api.replicate.com/v1"
        self.timeout = 60.0
        self.max_retries = 3
        self.retry_delay = 1.0
        
        if not self.api_token:
            logger.warning("Replicate API令牌未配置")
    
    def _get_headers(self) -> Dict[str, str]:
        """获取请求头"""
        return {
            "Authorization": f"Token {self.api_token}",
            "Content-Type": "application/json",
            "User-Agent": "Ghibli-AI-Platform/1.0"
        }
    
    async def _make_request(
        self, 
        method: str, 
        endpoint: str, 
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        timeout: Optional[float] = None,
        retries: int = 0
    ) -> Dict[str, Any]:
        """发送HTTP请求，带重试机制"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        headers = self._get_headers()
        
        async with httpx.AsyncClient(timeout=timeout or self.timeout) as client:
            for attempt in range(self.max_retries + 1):
                try:
                    if method.upper() == "GET":
                        response = await client.get(url, headers=headers, params=params)
                    elif method.upper() == "POST":
                        response = await client.post(url, headers=headers, json=data, params=params)
                    elif method.upper() == "PUT":
                        response = await client.put(url, headers=headers, json=data)
                    elif method.upper() == "DELETE":
                        response = await client.delete(url, headers=headers)
                    else:
                        raise ValueError(f"不支持的HTTP方法: {method}")
                    
                    logger.info(f"Replicate API请求: {method} {url} - 状态码: {response.status_code}")
                    
                    if response.status_code in [200, 201]:
                        return response.json()
                    elif response.status_code == 429 and attempt < self.max_retries:
                        # 速率限制，等待后重试
                        wait_time = self.retry_delay * (2 ** attempt)
                        logger.warning(f"速率限制，等待{wait_time}秒后重试...")
                        await asyncio.sleep(wait_time)
                        continue
                    else:
                        error_data = response.json() if response.content else {}
                        error_message = error_data.get("detail", error_data.get("message", "未知错误"))
                        
                        raise ReplicateError(
                            message=f"API请求失败: {error_message}",
                            status_code=response.status_code
                        )
                        
                except httpx.TimeoutException:
                    if attempt < self.max_retries:
                        await asyncio.sleep(self.retry_delay * (2 ** attempt))
                        continue
                    raise ReplicateError("请求超时")
                except httpx.RequestError as e:
                    if attempt < self.max_retries:
                        await asyncio.sleep(self.retry_delay * (2 ** attempt))
                        continue
                    raise ReplicateError(f"网络请求错误: {str(e)}")
    
    async def create_prediction(
        self,
        model_version: str,
        input_data: Dict[str, Any],
        webhook: Optional[str] = None,
        webhook_events_filter: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """创建预测任务 - 支持webhook"""
        request_data = {
            "version": model_version,
            "input": input_data
        }
        
        if webhook:
            request_data["webhook"] = webhook
            if webhook_events_filter:
                request_data["webhook_events_filter"] = webhook_events_filter
        
        try:
            response = await self._make_request("POST", "/predictions", data=request_data)
            return response
        except ReplicateError:
            raise
        except Exception as e:
            raise ReplicateError(f"创建预测任务失败: {str(e)}")
    
    async def get_prediction(self, prediction_id: str) -> Dict[str, Any]:
        """获取预测任务状态"""
        try:
            response = await self._make_request("GET", f"/predictions/{prediction_id}")
            return response
        except ReplicateError:
            raise
        except Exception as e:
            raise ReplicateError(f"获取预测状态失败: {str(e)}")
    
    async def wait_for_prediction(
        self, 
        prediction_id: str, 
        max_wait_time: int = 300,
        poll_interval: int = 2,
        callback: Optional[Callable[[Dict[str, Any]], None]] = None
    ) -> Dict[str, Any]:
        """等待预测任务完成 - 支持回调"""
        start_time = time.time()
        
        while time.time() - start_time < max_wait_time:
            prediction = await self.get_prediction(prediction_id)
            status = prediction.get("status")
            
            if callback:
                callback(prediction)
            
            if status == "succeeded":
                return prediction
            elif status == "failed":
                error_message = prediction.get("error", "预测任务失败")
                raise ReplicateError(f"预测失败: {error_message}")
            elif status == "canceled":
                raise ReplicateError("预测任务被取消")
            
            # 等待后继续轮询
            await asyncio.sleep(poll_interval)
        
        raise ReplicateError("预测任务超时")
    
    async def stream_prediction(
        self, 
        prediction_id: str, 
        callback: Callable[[Dict[str, Any]], None]
    ) -> Dict[str, Any]:
        """流式获取预测结果"""
        try:
            prediction = await self.get_prediction(prediction_id)
            status = prediction.get("status")
            
            if status == "starting":
                callback({"type": "status", "data": "正在启动..."})
            elif status == "processing":
                callback({"type": "status", "data": "正在处理..."})
            elif status == "succeeded":
                callback({"type": "result", "data": prediction})
                return prediction
            elif status == "failed":
                callback({"type": "error", "data": prediction.get("error", "未知错误")})
                raise ReplicateError(f"预测失败: {prediction.get('error', '未知错误')}")
            
            return prediction
            
        except ReplicateError:
            raise
        except Exception as e:
            raise ReplicateError(f"流式获取预测结果失败: {str(e)}")
    
    async def upload_file_to_replicate(self, file_url: str) -> str:
        """上传文件到Replicate"""
        try:
            # 验证URL
            parsed = urlparse(file_url)
            if not parsed.scheme or not parsed.netloc:
                raise ReplicateError("无效的文件URL")
            
            # 返回URL作为输入（Replicate支持直接URL输入）
            return file_url
            
        except Exception as e:
            raise ReplicateError(f"文件上传失败: {str(e)}")
    
    async def validate_input(self, input_data: Dict[str, Any], model_type: str) -> Dict[str, Any]:
        """验证输入参数"""
        validated = input_data.copy()
        
        # 通用验证
        if "prompt" not in validated or not validated["prompt"].strip():
            raise ReplicateError("提示词不能为空")
        
        # 模型特定验证
        if model_type in ["replicate-sdxl", "replicate-flux"]:
            if "width" in validated:
                validated["width"] = max(256, min(2048, validated["width"]))
            if "height" in validated:
                validated["height"] = max(256, min(2048, validated["height"]))
            if "num_inference_steps" in validated:
                validated["num_inference_steps"] = max(1, min(100, validated["num_inference_steps"]))
            if "guidance_scale" in validated:
                validated["guidance_scale"] = max(1.0, min(20.0, validated["guidance_scale"]))
        
        return validated
    
    async def generate_image_sdxl(
        self,
        prompt: str,
        negative_prompt: Optional[str] = None,
        width: int = 1024,
        height: int = 1024,
        num_inference_steps: int = 20,
        guidance_scale: float = 7.5,
        seed: Optional[int] = None,
        num_outputs: int = 1,
        style_preset: Optional[str] = None
    ) -> Dict[str, Any]:
        """使用Stable Diffusion XL生成图片 - 增强版"""
        if not self.api_token:
            raise ReplicateError("Replicate API令牌未配置")
        
        # 验证输入
        validated_input = await self.validate_input({
            "prompt": prompt,
            "width": width,
            "height": height,
            "num_inference_steps": num_inference_steps,
            "guidance_scale": guidance_scale,
            "num_outputs": num_outputs
        }, "replicate-sdxl")
        
        # SDXL模型版本ID
        model_version = "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"
        
        input_data = {
            "prompt": validated_input["prompt"],
            "width": validated_input["width"],
            "height": validated_input["height"],
            "num_inference_steps": validated_input["num_inference_steps"],
            "guidance_scale": validated_input["guidance_scale"],
            "num_outputs": validated_input["num_outputs"],
            "scheduler": "DPMSolverMultistep"
        }
        
        if negative_prompt:
            input_data["negative_prompt"] = negative_prompt
        
        if seed is not None:
            input_data["seed"] = seed
        
        if style_preset:
            input_data["style_preset"] = style_preset
        
        try:
            logger.info(f"开始Replicate SDXL生成: {prompt[:50]}...")
            start_time = time.time()
            
            # 创建预测任务
            prediction = await self.create_prediction(model_version, input_data)
            prediction_id = prediction["id"]
            
            # 等待任务完成
            completed_prediction = await self.wait_for_prediction(prediction_id)
            
            generation_time = time.time() - start_time
            logger.info(f"Replicate SDXL生成完成，耗时: {generation_time:.2f}秒")
            
            # 处理结果
            output = completed_prediction.get("output", [])
            if not output:
                raise ReplicateError("生成结果为空")
            
            return {
                "success": True,
                "images": output if isinstance(output, list) else [output],
                "model": "replicate-sdxl",
                "prompt": prompt,
                "negative_prompt": negative_prompt,
                "parameters": {
                    "width": width,
                    "height": height,
                    "steps": num_inference_steps,
                    "guidance_scale": guidance_scale,
                    "seed": seed,
                    "num_outputs": num_outputs,
                    "style_preset": style_preset
                },
                "generation_time": generation_time,
                "prediction_id": prediction_id,
                "created_at": datetime.now().isoformat(),
                "status": "completed"
            }
            
        except ReplicateError:
            raise
        except Exception as e:
            raise ReplicateError(f"SDXL图片生成失败: {str(e)}")
    
    async def generate_image_flux_schnell(
        self,
        prompt: str,
        width: int = 1024,
        height: int = 1024,
        num_inference_steps: int = 4,
        seed: Optional[int] = None,
        num_outputs: int = 1,
        aspect_ratio: Optional[str] = None,
        output_format: str = "png",
        output_quality: int = 90
    ) -> Dict[str, Any]:
        """使用FLUX Schnell模型生成图片 - 增强版"""
        if not self.api_token:
            raise ReplicateError("Replicate API令牌未配置")
        
        # 验证输入
        validated_input = await self.validate_input({
            "prompt": prompt,
            "width": width,
            "height": height,
            "num_inference_steps": num_inference_steps,
            "num_outputs": num_outputs
        }, "replicate-flux-schnell")
        
        # FLUX Schnell模型版本ID
        model_version = "black-forest-labs/flux-schnell"
        
        input_data = {
            "prompt": validated_input["prompt"],
            "num_outputs": validated_input["num_outputs"],
            "aspect_ratio": aspect_ratio or "1:1",
            "output_format": output_format,
            "output_quality": output_quality
        }
        
        if seed is not None:
            input_data["seed"] = seed
        
        try:
            logger.info(f"开始Replicate FLUX Schnell生成: {prompt[:50]}...")
            start_time = time.time()
            
            # 创建预测任务
            prediction = await self.create_prediction(model_version, input_data)
            prediction_id = prediction["id"]
            
            # 等待任务完成
            completed_prediction = await self.wait_for_prediction(prediction_id, max_wait_time=120)
            
            generation_time = time.time() - start_time
            logger.info(f"Replicate FLUX Schnell生成完成，耗时: {generation_time:.2f}秒")
            
            # 处理结果
            output = completed_prediction.get("output", [])
            if not output:
                raise ReplicateError("生成结果为空")
            
            return {
                "success": True,
                "images": output if isinstance(output, list) else [output],
                "model": "replicate-flux-schnell",
                "prompt": prompt,
                "parameters": {
                    "width": width,
                    "height": height,
                    "steps": num_inference_steps,
                    "seed": seed,
                    "num_outputs": num_outputs,
                    "aspect_ratio": aspect_ratio,
                    "output_format": output_format,
                    "output_quality": output_quality
                },
                "generation_time": generation_time,
                "prediction_id": prediction_id,
                "created_at": datetime.now().isoformat(),
                "status": "completed"
            }
            
        except ReplicateError:
            raise
        except Exception as e:
            raise ReplicateError(f"FLUX Schnell图片生成失败: {str(e)}")
    
    async def generate_image_flux(
        self,
        prompt: str,
        width: int = 1024,
        height: int = 1024,
        num_inference_steps: int = 28,
        guidance_scale: float = 3.5,
        seed: Optional[int] = None,
        num_outputs: int = 1
    ) -> Dict[str, Any]:
        """使用FLUX模型生成图片 - 增强版"""
        if not self.api_token:
            raise ReplicateError("Replicate API令牌未配置")
        
        # 验证输入
        validated_input = await self.validate_input({
            "prompt": prompt,
            "width": width,
            "height": height,
            "num_inference_steps": num_inference_steps,
            "guidance_scale": guidance_scale,
            "num_outputs": num_outputs
        }, "replicate-flux")
        
        # FLUX模型版本ID
        model_version = "8beff3369e81422112d93b89ca01426147de542cd4684c244b673b105188fe5f"
        
        input_data = {
            "prompt": validated_input["prompt"],
            "width": validated_input["width"],
            "height": validated_input["height"],
            "num_inference_steps": validated_input["num_inference_steps"],
            "guidance_scale": validated_input["guidance_scale"],
            "num_outputs": validated_input["num_outputs"]
        }
        
        if seed is not None:
            input_data["seed"] = seed
        
        try:
            logger.info(f"开始Replicate FLUX生成: {prompt[:50]}...")
            start_time = time.time()
            
            # 创建预测任务
            prediction = await self.create_prediction(model_version, input_data)
            prediction_id = prediction["id"]
            
            # 等待任务完成
            completed_prediction = await self.wait_for_prediction(prediction_id)
            
            generation_time = time.time() - start_time
            logger.info(f"Replicate FLUX生成完成，耗时: {generation_time:.2f}秒")
            
            # 处理结果
            output = completed_prediction.get("output", [])
            if not output:
                raise ReplicateError("生成结果为空")
            
            return {
                "success": True,
                "images": output if isinstance(output, list) else [output],
                "model": "replicate-flux",
                "prompt": prompt,
                "parameters": {
                    "width": width,
                    "height": height,
                    "steps": num_inference_steps,
                    "guidance_scale": guidance_scale,
                    "seed": seed,
                    "num_outputs": num_outputs
                },
                "generation_time": generation_time,
                "prediction_id": prediction_id,
                "created_at": datetime.now().isoformat(),
                "status": "completed"
            }
            
        except ReplicateError:
            raise
        except Exception as e:
            raise ReplicateError(f"FLUX图片生成失败: {str(e)}")
    
    async def cancel_prediction(self, prediction_id: str) -> Dict[str, Any]:
        """取消预测任务"""
        try:
            response = await self._make_request("POST", f"/predictions/{prediction_id}/cancel")
            return response
        except ReplicateError:
            raise
        except Exception as e:
            raise ReplicateError(f"取消预测任务失败: {str(e)}")
    
    async def get_account_info(self) -> Dict[str, Any]:
        """获取账户信息"""
        try:
            response = await self._make_request("GET", "/account")
            return response
        except ReplicateError:
            raise
        except Exception as e:
            raise ReplicateError(f"获取账户信息失败: {str(e)}")
    
    async def list_predictions(
        self, 
        cursor: Optional[str] = None,
        limit: int = 20
    ) -> Dict[str, Any]:
        """列出预测任务"""
        params = {"limit": limit}
        if cursor:
            params["cursor"] = cursor
        
        try:
            response = await self._make_request("GET", "/predictions", params=params)
            return response
        except ReplicateError:
            raise
        except Exception as e:
            raise ReplicateError(f"获取预测列表失败: {str(e)}")
    
    async def check_service_status(self) -> Dict[str, Any]:
        """检查服务状态"""
        try:
            # 尝试获取账户信息来验证API连接
            response = await self._make_request("GET", "/account")
            return {
                "status": "healthy",
                "service": "replicate",
                "account": response.get("username", "unknown"),
                "credits": response.get("credits", 0),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "service": "replicate",
                "timestamp": datetime.now().isoformat()
            }
    
    async def enhance_ghibli_prompt(self, original_prompt: str) -> str:
        """增强吉卜力风格提示词"""
        ghibli_keywords = [
            "Studio Ghibli style",
            "Miyazaki Hayao style", 
            "anime art",
            "soft watercolor painting",
            "pastoral landscape",
            "magical realism",
            "dreamy atmosphere",
            "hand-drawn animation style",
            "whimsical characters",
            "nature harmony",
            "warm color palette",
            "soft lighting",
            "detailed background",
            "fantasy elements"
        ]
        
        # 检查是否已包含吉卜力关键词
        prompt_lower = original_prompt.lower()
        has_ghibli_keywords = any(
            keyword.lower() in prompt_lower 
            for keyword in ghibli_keywords
        )
        
        if has_ghibli_keywords:
            return original_prompt
        
        # 添加吉卜力风格关键词
        style_keywords = ", ".join(ghibli_keywords[:5])
        enhanced_prompt = f"{original_prompt}, {style_keywords}"
        
        # 添加质量增强词
        quality_keywords = "high quality, detailed, masterpiece"
        enhanced_prompt = f"{enhanced_prompt}, {quality_keywords}"
        
        return enhanced_prompt
    
    async def batch_generate(
        self,
        requests: List[Dict[str, Any]],
        webhook_url: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """批量生成图片"""
        if len(requests) > 5:
            raise ReplicateError("批量请求不能超过5个")
        
        predictions = []
        
        for i, request_data in enumerate(requests):
            try:
                # 根据模型类型选择生成方法
                model = request_data.get("model", "flux-schnell")
                
                if model == "flux-schnell":
                    result = await self.generate_image_flux_schnell(**request_data)
                elif model == "flux":
                    result = await self.generate_image_flux(**request_data)
                elif model == "sdxl":
                    result = await self.generate_image_sdxl(**request_data)
                elif model == "playground":
                    result = await self.generate_image_playground(**request_data)
                else:
                    raise ReplicateError(f"不支持的模型: {model}")
                
                predictions.append({
                    "index": i,
                    "status": "succeeded",
                    "result": result
                })
                
            except Exception as e:
                predictions.append({
                    "index": i,
                    "status": "failed",
                    "error": str(e)
                })
                logger.error(f"批量生成第{i}个请求失败: {e}")
        
        return predictions
    
    async def estimate_generation_time(
        self, 
        model: str, 
        width: int, 
        height: int, 
        steps: int,
        batch_size: int = 1
    ) -> int:
        """估算生成时间"""
        # 基础时间（秒）
        base_times = {
            "replicate-flux-schnell": 15,
            "replicate-flux": 30,
            "replicate-sdxl": 25,
            "replicate-playground": 20
        }
        
        base_time = base_times.get(model, 20)
        
        # 根据分辨率调整
        resolution_factor = (width * height) / (1024 * 1024)
        
        # 根据步数调整
        steps_factor = steps / 25
        
        # 根据批次大小调整
        batch_factor = batch_size
        
        estimated_time = int(base_time * resolution_factor * steps_factor * batch_factor)
        return max(estimated_time, 10)  # 最少10秒
    
    def get_supported_models(self) -> List[Dict[str, Any]]:
        """获取支持的模型信息（静态配置）"""
        return [
            {
                "id": "replicate-flux-schnell",
                "name": "FLUX Schnell (Replicate)",
                "description": "快速高质量图片生成模型，4步生成",
                "max_width": 2048,
                "max_height": 2048,
                "max_steps": 4,
                "supports_negative_prompt": False,
                "estimated_time": 15,
                "cost_per_generation": 0.003,
                "tags": ["fast", "high-quality", "flux"]
            },
            {
                "id": "replicate-flux",
                "name": "FLUX Dev (Replicate)",
                "description": "开发版FLUX模型，质量更高",
                "max_width": 2048,
                "max_height": 2048,
                "max_steps": 50,
                "supports_negative_prompt": False,
                "estimated_time": 30,
                "cost_per_generation": 0.055,
                "tags": ["high-quality", "flux", "dev"]
            },
            {
                "id": "replicate-sdxl",
                "name": "Stable Diffusion XL (Replicate)",
                "description": "高质量图片生成，支持多种风格",
                "max_width": 2048,
                "max_height": 2048,
                "max_steps": 100,
                "supports_negative_prompt": True,
                "estimated_time": 25,
                "cost_per_generation": 0.0025,
                "tags": ["stable-diffusion", "xl", "versatile"]
            },
            {
                "id": "replicate-playground",
                "name": "Playground v2.5 (Replicate)",
                "description": "美学优化的图片生成模型",
                "max_width": 1024,
                "max_height": 1024,
                "max_steps": 50,
                "supports_negative_prompt": True,
                "estimated_time": 20,
                "cost_per_generation": 0.004,
                "tags": ["aesthetic", "playground", "optimized"]
            }
        ]
    
    async def get_model_info(self, model_id: str) -> Dict[str, Any]:
        """获取模型详细信息"""
        models = self.get_supported_models()
        for model in models:
            if model["id"] == model_id:
                return model
        raise ReplicateError(f"未找到模型: {model_id}")
    
    async def create_webhook_url(self, base_url: str, task_id: str) -> str:
        """创建webhook URL"""
        return f"{base_url}/api/webhooks/replicate/{task_id}"
    
    async def verify_webhook_signature(self, payload: bytes, signature: str, secret: str) -> bool:
        """验证webhook签名"""
        import hmac
        expected_signature = hmac.new(
            secret.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(signature, expected_signature)

# 全局服务实例
replicate_service = ReplicateService()

"""
Replicate API配置文件
包含API基础配置、模型配置、参数限制等
"""

from pydantic_settings import BaseSettings
from typing import Dict, List, Tuple, Optional
import os

class ReplicateConfig(BaseSettings):
    """Replicate API配置类"""
    
    # API基础配置
    base_url: str = "https://api.replicate.com/v1"
    api_token: str = ""
    timeout: int = 300  # Replicate需要更长的超时时间
    max_retries: int = 3
    retry_delay: float = 2.0
    
    # Webhook配置
    webhook_url: Optional[str] = None
    webhook_secret: Optional[str] = None
    
    # 支持的模型配置
    available_models: Dict[str, Dict[str, Any]] = {
        "flux-schnell": {
            "version": "f2ab8a5ac94f7b2b80f4e3a241d7f69c1dd309b3d2a0f4b5b5b5b5b5b5b5b5b5",
            "name": "FLUX.1 [schnell]",
            "description": "快速高质量图片生成模型",
            "max_width": 2048,
            "max_height": 2048,
            "supports_negative_prompt": False,
            "estimated_time": 15,
            "cost_per_generation": 0.003
        },
        "flux-dev": {
            "version": "black-forest-labs/flux-dev",
            "name": "FLUX.1 [dev]",
            "description": "开发版FLUX模型，质量更高",
            "max_width": 2048,
            "max_height": 2048,
            "supports_negative_prompt": False,
            "estimated_time": 25,
            "cost_per_generation": 0.055
        },
        "sdxl": {
            "version": "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
            "name": "Stable Diffusion XL",
            "description": "高质量图片生成，支持多种风格",
            "max_width": 2048,
            "max_height": 2048,
            "supports_negative_prompt": True,
            "estimated_time": 20,
            "cost_per_generation": 0.0025
        },
        "playground-v2.5": {
            "version": "playgroundai/playground-v2.5-1024px-aesthetic:42fe626e41cc811eaf02c94b892774839268ce1994ea778eba97103fe1ef51b8",
            "name": "Playground v2.5",
            "description": "美学优化的图片生成模型",
            "max_width": 1024,
            "max_height": 1024,
            "supports_negative_prompt": True,
            "estimated_time": 18,
            "cost_per_generation": 0.004
        },
        "kandinsky-2.2": {
            "version": "ai-forever/kandinsky-2.2:ad9d7879fbffa2874e1d909d1d37d9bc682889cc65b31f7bb00d2362619f194a",
            "name": "Kandinsky 2.2",
            "description": "俄罗斯开发的高质量图片生成模型",
            "max_width": 1024,
            "max_height": 1024,
            "supports_negative_prompt": True,
            "estimated_time": 22,
            "cost_per_generation": 0.0035
        }
    }
    
    # 默认模型
    default_model: str = "flux-schnell"
    
    # 生成参数限制
    max_prompt_length: int = 1000
    min_prompt_length: int = 1
    supported_sizes: List[Tuple[int, int]] = [
        (512, 512),
        (768, 768),
        (1024, 1024),
        (512, 768),
        (768, 512),
        (1024, 768),
        (768, 1024),
        (1536, 1024),
        (1024, 1536),
        (2048, 1024),
        (1024, 2048)
    ]
    
    # 参数范围
    guidance_scale_range: Tuple[float, float] = (1.0, 20.0)
    steps_range: Tuple[int, int] = (1, 100)
    default_guidance_scale: float = 7.5
    default_steps: int = 28
    
    # 吉卜力风格增强配置
    ghibli_style_keywords: List[str] = [
        "Studio Ghibli style",
        "Miyazaki Hayao style",
        "anime art",
        "soft watercolor",
        "pastoral landscape",
        "magical realism",
        "dreamy atmosphere",
        "hand-drawn animation style"
    ]
    
    default_negative_prompt: str = (
        "ugly, deformed, noisy, blurry, distorted, out of focus, "
        "bad anatomy, extra limbs, poorly drawn face, poorly drawn hands, "
        "missing fingers, nudity, nude, nsfw, text, watermark, signature"
    )
    
    # 轮询配置
    polling_interval: int = 2  # 秒
    max_polling_time: int = 600  # 10分钟最大等待时间
    
    # 错误码映射
    error_code_mapping: Dict[int, str] = {
        400: "请求参数无效",
        401: "API令牌无效或已过期",
        402: "账户余额不足",
        403: "访问被拒绝",
        404: "模型或预测不存在",
        422: "输入参数验证失败",
        429: "请求频率超限，请稍后重试",
        500: "Replicate服务器内部错误",
        503: "服务暂时不可用"
    }
    
    # 环境配置
    environment: str = "development"
    debug: bool = True
    log_requests: bool = True
    log_responses: bool = True
    
    class Config:
        env_prefix = "REPLICATE_"
        env_file = ".env"
        case_sensitive = False
    
    def get_model_info(self, model_key: str) -> Dict[str, Any]:
        """获取模型信息"""
        return self.available_models.get(model_key, self.available_models[self.default_model])
    
    def is_valid_size(self, width: int, height: int) -> bool:
        """验证图片尺寸是否支持"""
        return (width, height) in self.supported_sizes
    
    def get_enhanced_prompt(self, original_prompt: str, enable_ghibli: bool = True) -> str:
        """获取增强后的提示词"""
        if not enable_ghibli:
            return original_prompt
        
        # 检查是否已包含吉卜力关键词
        prompt_lower = original_prompt.lower()
        has_ghibli_keywords = any(
            keyword.lower() in prompt_lower 
            for keyword in self.ghibli_style_keywords
        )
        
        if has_ghibli_keywords:
            return original_prompt
        
        # 添加吉卜力风格关键词
        style_keywords = ", ".join(self.ghibli_style_keywords[:2])
        return f"{original_prompt}, {style_keywords}"
    
    def estimate_generation_time(self, model_key: str, width: int, height: int, steps: int) -> int:
        """估算生成时间"""
        model_info = self.get_model_info(model_key)
        base_time = model_info.get("estimated_time", 20)
        
        # 根据分辨率调整
        resolution_factor = (width * height) / (1024 * 1024)
        
        # 根据步数调整
        steps_factor = steps / 28
        
        estimated_time = int(base_time * resolution_factor * steps_factor)
        return max(estimated_time, 10)  # 最少10秒

# 创建全局配置实例
replicate_config = ReplicateConfig()
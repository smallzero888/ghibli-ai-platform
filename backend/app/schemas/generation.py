"""
图片生成相关的数据模式定义
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class AIModel(str, Enum):
    """AI模型枚举"""
    SILICONFLOW_SDXL = "siliconflow-sdxl"
    SILICONFLOW_FLUX = "siliconflow-flux"
    REPLICATE_FLUX = "replicate-flux"
    REPLICATE_SDXL = "replicate-sdxl"

class GenerationStatus(str, Enum):
    """生成状态枚举"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class GenerationRequest(BaseModel):
    """图片生成请求"""
    prompt: str = Field(..., min_length=1, max_length=2000, description="生成提示词")
    negative_prompt: Optional[str] = Field(None, max_length=1000, description="负面提示词")
    ai_model: AIModel = Field(AIModel.SILICONFLOW_SDXL, description="AI模型")
    width: int = Field(512, ge=256, le=2048, description="图片宽度")
    height: int = Field(512, ge=256, le=2048, description="图片高度")
    steps: int = Field(20, ge=1, le=100, description="生成步数")
    guidance_scale: float = Field(7.5, ge=1.0, le=20.0, description="引导强度")
    seed: Optional[int] = Field(None, ge=0, description="随机种子")
    batch_size: int = Field(1, ge=1, le=4, description="批次大小")

    @validator('prompt')
    def validate_prompt(cls, v):
        if not v.strip():
            raise ValueError('提示词不能为空')
        return v.strip()

class GenerationResponse(BaseModel):
    """图片生成响应"""
    task_id: str = Field(..., description="任务ID")
    status: GenerationStatus = Field(..., description="任务状态")
    message: str = Field(..., description="响应消息")
    estimated_time: Optional[int] = Field(None, description="预估时间(秒)")

class GenerationTask(BaseModel):
    """生成任务信息"""
    id: str
    user_id: str
    prompt: str
    negative_prompt: Optional[str] = None
    ai_model: str
    status: GenerationStatus
    result_url: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class GenerationHistory(BaseModel):
    """生成历史"""
    items: List[GenerationTask]
    total: int
    page: int
    size: int
    pages: int

class ModelInfo(BaseModel):
    """模型信息"""
    id: str
    name: str
    description: str
    provider: str
    max_width: int
    max_height: int
    max_steps: int
    supports_negative_prompt: bool
    estimated_time: int

class ModelsResponse(BaseModel):
    """模型列表响应"""
    models: List[ModelInfo]
    total: int

class GenerationStats(BaseModel):
    """生成统计"""
    total_generations: int
    successful_generations: int
    failed_generations: int
    pending_generations: int
    most_used_model: Optional[str] = None
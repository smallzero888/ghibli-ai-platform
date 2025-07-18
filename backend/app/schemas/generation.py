"""
图片生成相关的Pydantic模式
用于API请求和响应的数据验证和序列化
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID
from enum import Enum

class AIModel(str, Enum):
    """AI模型枚举"""
    SILICONFLOW_STABLE_DIFFUSION = "siliconflow-sd"
    SILICONFLOW_FLUX = "siliconflow-flux"
    REPLICATE_STABLE_DIFFUSION = "replicate-sd"
    REPLICATE_FLUX = "replicate-flux"

class TaskStatus(str, Enum):
    """任务状态枚举"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class GenerationRequest(BaseModel):
    """图片生成请求模式"""
    prompt: str = Field(..., min_length=1, max_length=2000, description="生成提示词")
    negative_prompt: Optional[str] = Field(None, max_length=1000, description="负面提示词")
    ai_model: AIModel = Field(..., description="AI模型")
    width: Optional[int] = Field(512, ge=256, le=2048, description="图片宽度")
    height: Optional[int] = Field(512, ge=256, le=2048, description="图片高度")
    steps: Optional[int] = Field(20, ge=10, le=100, description="生成步数")
    guidance_scale: Optional[float] = Field(7.5, ge=1.0, le=20.0, description="引导强度")
    seed: Optional[int] = Field(None, ge=0, le=2147483647, description="随机种子")
    batch_size: Optional[int] = Field(1, ge=1, le=4, description="批次大小")
    
    @validator('prompt')
    def validate_prompt(cls, v):
        """验证提示词"""
        if not v.strip():
            raise ValueError('提示词不能为空')
        return v.strip()

class GenerationResponse(BaseModel):
    """图片生成响应模式"""
    task_id: UUID
    status: TaskStatus
    message: str
    estimated_time: Optional[int] = None  # 预计完成时间（秒）
    queue_position: Optional[int] = None  # 队列位置
    
class GenerationTask(BaseModel):
    """生成任务模式"""
    id: UUID
    user_id: UUID
    prompt: str
    ai_model: str
    status: TaskStatus
    external_task_id: Optional[str] = None
    result_url: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class GenerationTaskDetail(GenerationTask):
    """生成任务详细信息模式"""
    generation_params: Optional[Dict[str, Any]] = None
    progress: Optional[int] = None  # 进度百分比
    logs: Optional[List[str]] = None  # 生成日志

class GenerationHistory(BaseModel):
    """生成历史模式"""
    items: List[GenerationTask]
    total: int
    page: int
    size: int
    pages: int

class GenerationStats(BaseModel):
    """生成统计模式"""
    total_generations: int
    successful_generations: int
    failed_generations: int
    pending_generations: int
    average_generation_time: Optional[float] = None
    most_used_model: Optional[str] = None
    generation_by_model: Dict[str, int] = {}

class ModelInfo(BaseModel):
    """AI模型信息模式"""
    id: str
    name: str
    description: str
    provider: str  # siliconflow, replicate
    max_width: int
    max_height: int
    max_steps: int
    supports_negative_prompt: bool
    cost_per_generation: Optional[float] = None
    estimated_time: Optional[int] = None
    is_available: bool = True

class ModelsResponse(BaseModel):
    """模型列表响应模式"""
    models: List[ModelInfo]
    total: int
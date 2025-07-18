"""
Replicate相关数据模型
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ReplicateWebhookPayload(BaseModel):
    """Replicate webhook payload schema"""
    id: str = Field(..., description="预测任务ID")
    status: str = Field(..., description="任务状态: starting, processing, succeeded, failed, canceled")
    output: Optional[List[str]] = Field(None, description="生成结果URL列表")
    error: Optional[str] = Field(None, description="错误信息")
    logs: Optional[str] = Field(None, description="日志信息")
    metrics: Optional[Dict[str, Any]] = Field(None, description="性能指标")
    version: Optional[str] = Field(None, description="模型版本")
    urls: Optional[Dict[str, str]] = Field(None, description="相关URL")
    created_at: Optional[datetime] = Field(None, description="创建时间")
    started_at: Optional[datetime] = Field(None, description="开始时间")
    completed_at: Optional[datetime] = Field(None, description="完成时间")

class ReplicateModelInfo(BaseModel):
    """Replicate模型信息"""
    id: str = Field(..., description="模型ID")
    name: str = Field(..., description="模型名称")
    description: str = Field(..., description="模型描述")
    max_width: int = Field(..., description="最大宽度")
    max_height: int = Field(..., description="最大高度")
    max_steps: int = Field(..., description="最大步数")
    supports_negative_prompt: bool = Field(..., description="是否支持负面提示词")
    estimated_time: int = Field(..., description="预估生成时间(秒)")
    cost_per_generation: float = Field(..., description="每次生成成本")
    tags: List[str] = Field(default_factory=list, description="标签列表")

class ReplicateGenerationRequest(BaseModel):
    """Replicate生成请求"""
    prompt: str = Field(..., description="提示词")
    model: str = Field(default="flux-schnell", description="模型类型")
    negative_prompt: Optional[str] = Field(None, description="负面提示词")
    width: int = Field(default=1024, description="图片宽度")
    height: int = Field(default=1024, description="图片高度")
    num_inference_steps: int = Field(default=20, description="推理步数")
    guidance_scale: float = Field(default=7.5, description="引导系数")
    seed: Optional[int] = Field(None, description="随机种子")
    num_outputs: int = Field(default=1, description="输出数量")
    aspect_ratio: Optional[str] = Field(None, description="宽高比")
    output_format: str = Field(default="png", description="输出格式")
    output_quality: int = Field(default=90, description="输出质量")
    style_preset: Optional[str] = Field(None, description="风格预设")
    use_webhook: bool = Field(default=False, description="是否使用webhook")

class ReplicateGenerationResponse(BaseModel):
    """Replicate生成响应"""
    task_id: str = Field(..., description="任务ID")
    status: str = Field(..., description="任务状态")
    message: str = Field(..., description="状态消息")
    result: Optional[Dict[str, Any]] = Field(None, description="生成结果")
    prediction_id: Optional[str] = Field(None, description="Replicate预测ID")
    estimated_time: Optional[int] = Field(None, description="预估时间")

class ReplicateAccountInfo(BaseModel):
    """Replicate账户信息"""
    username: str = Field(..., description="用户名")
    credits: float = Field(..., description="剩余积分")
    email: Optional[str] = Field(None, description="邮箱")
    github_url: Optional[str] = Field(None, description="GitHub URL")
    type: Optional[str] = Field(None, description="账户类型")

class ReplicatePredictionStatus(BaseModel):
    """Replicate预测状态"""
    id: str = Field(..., description="预测ID")
    version: str = Field(..., description="模型版本")
    status: str = Field(..., description="状态")
    input: Dict[str, Any] = Field(..., description="输入参数")
    output: Optional[List[str]] = Field(None, description="输出")
    error: Optional[str] = Field(None, description="错误信息")
    logs: Optional[str] = Field(None, description="日志")
    metrics: Optional[Dict[str, Any]] = Field(None, description="指标")
    created_at: datetime = Field(..., description="创建时间")
    started_at: Optional[datetime] = Field(None, description="开始时间")
    completed_at: Optional[datetime] = Field(None, description="完成时间")
    urls: Optional[Dict[str, str]] = Field(None, description="相关URL")

class ReplicateBatchRequest(BaseModel):
    """Replicate批量请求"""
    requests: List[ReplicateGenerationRequest] = Field(..., description="批量请求列表")
    webhook_url: Optional[str] = Field(None, description="webhook URL")

class ReplicateBatchResponse(BaseModel):
    """Replicate批量响应"""
    batch_id: str = Field(..., description="批次ID")
    results: List[Dict[str, Any]] = Field(..., description="结果列表")
    total: int = Field(..., description="总数")
    successful: int = Field(..., description="成功数")
    failed: int = Field(..., description="失败数")

class ReplicateTimeEstimate(BaseModel):
    """Replicate时间估算"""
    estimated_time: int = Field(..., description="预估时间(秒)")
    model: str = Field(..., description="模型")
    parameters: Dict[str, Any] = Field(..., description="参数")

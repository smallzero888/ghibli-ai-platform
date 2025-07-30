"""
SiliconFlow API schemas
用于处理硅基流动AI服务的请求和响应
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class SiliconFlowRequest(BaseModel):
    """硅基流动API请求模式"""
    model: str = Field(..., description="模型名称")
    prompt: str = Field(..., description="提示词")
    negative_prompt: Optional[str] = Field(None, description="负面提示词")
    width: int = Field(512, ge=64, le=2048, description="图片宽度")
    height: int = Field(512, ge=64, le=2048, description="图片高度")
    num_inference_steps: int = Field(20, ge=1, le=100, description="推理步数")
    guidance_scale: float = Field(7.5, ge=1.0, le=20.0, description="引导系数")
    num_outputs: int = Field(1, ge=1, le=4, description="输出图片数量")
    scheduler: str = Field("K_EULER", description="调度器类型")
    seed: Optional[int] = Field(None, description="随机种子")

class SiliconFlowResponse(BaseModel):
    """硅基流动API响应模式"""
    images: List[str] = Field(..., description="生成的图片URL列表")
    timings: Dict[str, float] = Field(..., description="时间统计")
    seed: int = Field(..., description="使用的随机种子")
    status: str = Field(..., description="处理状态")

class SiliconFlowError(BaseModel):
    """硅基流动API错误模式"""
    error: str = Field(..., description="错误信息")
    error_type: str = Field(..., description="错误类型")
    details: Optional[Dict[str, Any]] = Field(None, description="详细错误信息")

class SiliconFlowModel(BaseModel):
    """硅基流动模型信息"""
    id: str = Field(..., description="模型ID")
    name: str = Field(..., description="模型名称")
    description: Optional[str] = Field(None, description="模型描述")
    type: str = Field(..., description="模型类型")
    pricing: Dict[str, float] = Field(..., description="定价信息")
    max_tokens: Optional[int] = Field(None, description="最大token数")
    supported_params: List[str] = Field(..., description="支持的参数列表")

class SiliconFlowUsage(BaseModel):
    """硅基流动使用统计"""
    prompt_tokens: int = Field(..., description="提示词token数")
    completion_tokens: int = Field(..., description="完成token数")
    total_tokens: int = Field(..., description="总token数")
    cost: float = Field(..., description="费用")

class SiliconFlowGenerationTask(BaseModel):
    """硅基流动生成任务"""
    id: str = Field(..., description="任务ID")
    status: str = Field(..., description="任务状态")
    prompt: str = Field(..., description="提示词")
    model: str = Field(..., description="使用的模型")
    created_at: datetime = Field(..., description="创建时间")
    completed_at: Optional[datetime] = Field(None, description="完成时间")
    result_url: Optional[str] = Field(None, description="结果URL")
    error_message: Optional[str] = Field(None, description="错误信息")
    usage: Optional[SiliconFlowUsage] = Field(None, description="使用统计")

class SiliconFlowImageGenerationRequest(BaseModel):
    """硅基流动图片生成请求"""
    prompt: str = Field(..., description="提示词")
    negative_prompt: Optional[str] = Field(None, description="负面提示词")
    model: str = Field("stable-diffusion-xl", description="模型名称")
    width: int = Field(512, ge=64, le=2048, description="图片宽度")
    height: int = Field(512, ge=64, le=2048, description="图片高度")
    num_inference_steps: int = Field(20, ge=1, le=100, description="推理步数")
    guidance_scale: float = Field(7.5, ge=1.0, le=20.0, description="引导系数")
    num_outputs: int = Field(1, ge=1, le=4, description="输出图片数量")
    style: Optional[str] = Field(None, description="风格参数")

class BatchGenerationRequest(BaseModel):
    """批量生成请求"""
    batch_id: str = Field(..., description="批次ID")
    requests: List[SiliconFlowImageGenerationRequest] = Field(..., description="生成请求列表")

class BatchGenerationResponse(BaseModel):
    """批量生成响应"""
    batch_id: str = Field(..., description="批次ID")
    total_requests: int = Field(..., description="总请求数")
    successful: int = Field(0, description="成功数")
    failed: int = Field(0, description="失败数")
    results: List[Any] = Field(default_factory=list, description="结果列表")
    created_at: datetime = Field(default_factory=datetime.now, description="创建时间")

class GenerationHistory(BaseModel):
    """生成历史"""
    items: List[Any] = Field(..., description="任务列表")
    total: int = Field(..., description="总数")
    page: int = Field(..., description="当前页")
    size: int = Field(..., description="每页数量")
    pages: int = Field(..., description="总页数")

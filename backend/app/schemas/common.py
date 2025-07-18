"""
通用的Pydantic模式
用于API通用响应和错误处理
"""

from pydantic import BaseModel, Field
from typing import Optional, Any, Dict, List
from datetime import datetime

class BaseResponse(BaseModel):
    """基础响应模式"""
    success: bool = True
    message: str = "操作成功"
    timestamp: datetime = Field(default_factory=datetime.now)

class SuccessResponse(BaseResponse):
    """成功响应模式"""
    data: Optional[Any] = None

class ErrorResponse(BaseResponse):
    """错误响应模式"""
    success: bool = False
    error_code: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

class PaginationParams(BaseModel):
    """分页参数模式"""
    page: int = Field(1, ge=1, description="页码")
    size: int = Field(20, ge=1, le=100, description="每页数量")
    sort_by: Optional[str] = Field("created_at", description="排序字段")
    sort_order: str = Field("desc", regex="^(asc|desc)$", description="排序方向")

class PaginationResponse(BaseModel):
    """分页响应模式"""
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int
    has_next: bool
    has_prev: bool

class HealthCheck(BaseModel):
    """健康检查模式"""
    status: str = "healthy"
    service: str
    version: str
    timestamp: float
    database: Optional[str] = "connected"
    redis: Optional[str] = "connected"
    ai_services: Optional[Dict[str, str]] = {}

class ValidationError(BaseModel):
    """验证错误模式"""
    field: str
    message: str
    value: Optional[Any] = None

class ValidationErrorResponse(ErrorResponse):
    """验证错误响应模式"""
    errors: List[ValidationError]

class FileUpload(BaseModel):
    """文件上传模式"""
    filename: str
    content_type: str
    size: int
    url: str

class TagResponse(BaseModel):
    """标签响应模式"""
    id: str
    name: str
    description: Optional[str] = None
    color: str = "#3B82F6"
    usage_count: Optional[int] = 0
    created_at: datetime
    
    class Config:
        from_attributes = True

class SystemStats(BaseModel):
    """系统统计模式"""
    total_users: int
    total_images: int
    total_generations: int
    active_users_today: int
    generations_today: int
    storage_used_mb: float
    api_calls_today: int
    error_rate: float

class UserActivity(BaseModel):
    """用户活动模式"""
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    timestamp: datetime
    ip_address: Optional[str] = None
    
class NotificationSettings(BaseModel):
    """通知设置模式"""
    email_notifications: bool = True
    generation_complete: bool = True
    weekly_summary: bool = True
    marketing_emails: bool = False

class UserPreferences(BaseModel):
    """用户偏好设置模式"""
    language: str = "zh"
    theme: str = "light"  # light, dark, auto
    default_ai_model: Optional[str] = None
    auto_save_generations: bool = True
    notifications: NotificationSettings = NotificationSettings()

class APIUsageStats(BaseModel):
    """API使用统计模式"""
    endpoint: str
    method: str
    total_calls: int
    success_rate: float
    average_response_time: float
    last_called: datetime
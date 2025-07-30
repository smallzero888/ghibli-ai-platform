"""
用户相关的数据模式定义
"""

from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional
from datetime import datetime

class UserLogin(BaseModel):
    """用户登录请求"""
    email: EmailStr = Field(..., description="邮箱地址")
    password: str = Field(..., min_length=6, description="密码")

class UserRegister(BaseModel):
    """用户注册请求"""
    email: EmailStr = Field(..., description="邮箱地址")
    password: str = Field(..., min_length=6, description="密码")
    username: Optional[str] = Field(None, min_length=2, max_length=50, description="用户名")
    full_name: Optional[str] = Field(None, max_length=100, description="全名")

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('密码长度至少6位')
        return v

class UserUpdate(BaseModel):
    """用户更新请求"""
    username: Optional[str] = Field(None, min_length=2, max_length=50, description="用户名")
    full_name: Optional[str] = Field(None, max_length=100, description="全名")
    avatar_url: Optional[str] = Field(None, description="头像URL")

class UserResponse(BaseModel):
    """用户信息响应"""
    id: str
    email: str
    username: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_admin: bool = False
    subscription_type: str = "free"
    generation_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserProfile(BaseModel):
    """用户个人资料"""
    id: str
    email: str
    username: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_admin: bool = False
    subscription_type: str = "free"
    generation_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserStats(BaseModel):
    """用户统计信息"""
    total_generations: int
    successful_generations: int
    failed_generations: int
    public_images: int
    total_likes: int
    total_views: int

class TokenResponse(BaseModel):
    """令牌响应"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

class PasswordReset(BaseModel):
    """密码重置请求"""
    email: EmailStr = Field(..., description="邮箱地址")

class PasswordResetConfirm(BaseModel):
    """密码重置确认"""
    token: str = Field(..., description="重置令牌")
    new_password: str = Field(..., min_length=6, description="新密码")

    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('密码长度至少6位')
        return v

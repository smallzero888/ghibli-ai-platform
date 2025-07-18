"""
用户相关的Pydantic模式
用于API请求和响应的数据验证和序列化
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class UserBase(BaseModel):
    """用户基础模式"""
    email: EmailStr
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    full_name: Optional[str] = Field(None, max_length=255)
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    """创建用户模式"""
    password: str = Field(..., min_length=8, max_length=100)
    
    @validator('password')
    def validate_password(cls, v):
        """验证密码强度"""
        if len(v) < 8:
            raise ValueError('密码长度至少8位')
        if not any(c.isupper() for c in v):
            raise ValueError('密码必须包含至少一个大写字母')
        if not any(c.islower() for c in v):
            raise ValueError('密码必须包含至少一个小写字母')
        if not any(c.isdigit() for c in v):
            raise ValueError('密码必须包含至少一个数字')
        return v

class UserUpdate(BaseModel):
    """更新用户模式"""
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    full_name: Optional[str] = Field(None, max_length=255)
    avatar_url: Optional[str] = None

class UserResponse(UserBase):
    """用户响应模式"""
    id: UUID
    is_admin: bool = False
    subscription_type: str = "free"
    generation_count: int = 0
    last_generation_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserProfile(UserResponse):
    """用户详细资料模式"""
    total_images: Optional[int] = 0
    total_favorites: Optional[int] = 0
    recent_activity: Optional[List[dict]] = []

class UserLogin(BaseModel):
    """用户登录模式"""
    email: EmailStr
    password: str

class UserRegister(UserCreate):
    """用户注册模式"""
    confirm_password: str
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        """验证密码确认"""
        if 'password' in values and v != values['password']:
            raise ValueError('密码确认不匹配')
        return v

class PasswordReset(BaseModel):
    """密码重置模式"""
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    """密码重置确认模式"""
    token: str
    new_password: str = Field(..., min_length=8, max_length=100)
    confirm_password: str
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        """验证密码确认"""
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('密码确认不匹配')
        return v

class TokenResponse(BaseModel):
    """令牌响应模式"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

class UserStats(BaseModel):
    """用户统计模式"""
    total_generations: int
    total_images: int
    total_favorites: int
    subscription_type: str
    generation_limit: int
    remaining_generations: int
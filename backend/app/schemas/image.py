"""
图片相关的数据模式定义
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime

class ImageResponse(BaseModel):
    """图片响应"""
    id: str
    user_id: str
    prompt: str
    negative_prompt: Optional[str] = None
    ai_model: str
    image_url: str
    thumbnail_url: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    generation_params: Optional[Dict[str, Any]] = None
    status: str
    is_public: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

class ImageUpdate(BaseModel):
    """图片更新请求"""
    is_public: Optional[bool] = None
    tags: Optional[List[str]] = None

class ImageList(BaseModel):
    """图片列表响应"""
    images: List[ImageResponse]
    total: int
    page: int
    per_page: int
    total_pages: int

class ImageSearch(BaseModel):
    """图片搜索请求"""
    query: Optional[str] = None
    ai_model: Optional[str] = None
    is_public: Optional[bool] = None
    page: int = Field(1, ge=1)
    per_page: int = Field(20, ge=1, le=100)

class ImageShare(BaseModel):
    """图片分享请求"""
    image_id: str
    expires_in: Optional[int] = Field(None, description="过期时间(秒)")

class ImageShareResponse(BaseModel):
    """图片分享响应"""
    share_url: str
    expires_at: Optional[datetime] = None

class ImageFavorite(BaseModel):
    """图片收藏"""
    image_id: str
    is_favorite: bool

class ImageTag(BaseModel):
    """图片标签"""
    name: str
    color: Optional[str] = None
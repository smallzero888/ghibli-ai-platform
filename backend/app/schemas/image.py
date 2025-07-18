"""
图片相关的Pydantic模式
用于API请求和响应的数据验证和序列化
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

class ImageBase(BaseModel):
    """图片基础模式"""
    prompt: str = Field(..., min_length=1, max_length=2000)
    negative_prompt: Optional[str] = Field(None, max_length=1000)
    ai_model: str = Field(..., min_length=1, max_length=50)
    is_public: bool = False

class ImageCreate(ImageBase):
    """创建图片模式"""
    image_url: str
    thumbnail_url: Optional[str] = None
    width: Optional[int] = Field(None, gt=0, le=4096)
    height: Optional[int] = Field(None, gt=0, le=4096)
    generation_params: Optional[Dict[str, Any]] = None

class ImageUpdate(BaseModel):
    """更新图片模式"""
    prompt: Optional[str] = Field(None, min_length=1, max_length=2000)
    negative_prompt: Optional[str] = Field(None, max_length=1000)
    is_public: Optional[bool] = None
    tags: Optional[List[str]] = None

class ImageResponse(ImageBase):
    """图片响应模式"""
    id: UUID
    user_id: UUID
    image_url: str
    thumbnail_url: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    generation_params: Optional[Dict[str, Any]] = None
    status: str = "completed"
    created_at: datetime
    
    # 关联数据
    tags: Optional[List[str]] = []
    is_favorited: Optional[bool] = False
    favorite_count: Optional[int] = 0
    
    class Config:
        from_attributes = True

class ImageDetail(ImageResponse):
    """图片详细信息模式"""
    user: Optional[Dict[str, Any]] = None
    share_url: Optional[str] = None
    download_count: Optional[int] = 0

class ImageList(BaseModel):
    """图片列表模式"""
    items: List[ImageResponse]
    total: int
    page: int
    size: int
    pages: int

class ImageSearch(BaseModel):
    """图片搜索模式"""
    query: Optional[str] = None
    tags: Optional[List[str]] = None
    ai_model: Optional[str] = None
    user_id: Optional[UUID] = None
    is_public: Optional[bool] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    sort_by: str = Field("created_at", regex="^(created_at|prompt|ai_model)$")
    sort_order: str = Field("desc", regex="^(asc|desc)$")
    page: int = Field(1, ge=1)
    size: int = Field(20, ge=1, le=100)

class ImageShare(BaseModel):
    """图片分享模式"""
    expires_in_hours: Optional[int] = Field(None, ge=1, le=8760)  # 最多1年
    max_views: Optional[int] = Field(None, ge=1, le=10000)
    
class ImageShareResponse(BaseModel):
    """图片分享响应模式"""
    share_token: str
    share_url: str
    expires_at: Optional[datetime] = None
    max_views: Optional[int] = None
    
class ImageFavorite(BaseModel):
    """图片收藏模式"""
    image_id: UUID

class ImageTag(BaseModel):
    """图片标签模式"""
    image_id: UUID
    tags: List[str] = Field(..., min_items=1, max_items=10)
    
    @validator('tags')
    def validate_tags(cls, v):
        """验证标签"""
        for tag in v:
            if len(tag.strip()) < 1 or len(tag.strip()) > 50:
                raise ValueError('标签长度必须在1-50字符之间')
        return [tag.strip() for tag in v]
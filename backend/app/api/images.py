"""
图片管理相关的API路由
处理图片的CRUD操作、分享、收藏等功能
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime, timedelta

from ..core.database import get_db
from ..core.auth import get_current_user, verify_user_access
from ..schemas.image import (
    ImageResponse, ImageUpdate, ImageList, ImageSearch,
    ImageShare, ImageShareResponse, ImageFavorite, ImageTag
)
from ..schemas.common import SuccessResponse
from ..models.image import Image
from ..models.user_favorite import UserFavorite
from ..models.system_log import ImageShare as ImageShareModel
from ..models.user import User

router = APIRouter()

@router.get("/", response_model=ImageList)
async def get_user_images(
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    ai_model: Optional[str] = Query(None, description="AI模型筛选"),
    is_public: Optional[bool] = Query(None, description="是否公开"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户的图片列表"""
    
    # 构建查询
    query = db.query(Image).filter(Image.user_id == current_user["id"])
    
    # 添加搜索条件
    if search:
        query = query.filter(Image.prompt.ilike(f"%{search}%"))
    
    if ai_model:
        query = query.filter(Image.ai_model == ai_model)
    
    if is_public is not None:
        query = query.filter(Image.is_public == is_public)
    
    # 排序
    query = query.order_by(Image.created_at.desc())
    
    # 分页
    total = query.count()
    offset = (page - 1) * size
    images = query.offset(offset).limit(size).all()
    
    return ImageList(
        images=[ImageResponse.from_orm(img) for img in images],
        total=total,
        page=page,
        per_page=size,
        total_pages=(total + size - 1) // size
    )

@router.get("/{image_id}", response_model=ImageResponse)
async def get_image_detail(
    image_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取图片详情"""
    
    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="图片不存在"
        )
    
    # 检查访问权限
    if image.user_id != current_user["id"] and not image.is_public:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权访问此图片"
        )
    
    return ImageResponse.from_orm(image)

@router.put("/{image_id}", response_model=ImageResponse)
async def update_image(
    image_id: str,
    update_data: ImageUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新图片信息"""
    
    image = db.query(Image).filter(
        Image.id == image_id,
        Image.user_id == current_user["id"]
    ).first()
    
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="图片不存在或无权修改"
        )
    
    # 更新字段
    update_dict = update_data.dict(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(image, field, value)
    
    try:
        db.commit()
        db.refresh(image)
        return ImageResponse.from_orm(image)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新图片失败: {str(e)}"
        )

@router.delete("/{image_id}", response_model=SuccessResponse)
async def delete_image(
    image_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除图片"""
    
    image = db.query(Image).filter(
        Image.id == image_id,
        Image.user_id == current_user["id"]
    ).first()
    
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="图片不存在或无权删除"
        )
    
    try:
        db.delete(image)
        db.commit()
        return SuccessResponse(message="图片删除成功")
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"删除图片失败: {str(e)}"
        )

@router.get("/public/gallery", response_model=ImageList)
async def get_public_gallery(
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    ai_model: Optional[str] = Query(None, description="AI模型筛选"),
    db: Session = Depends(get_db)
):
    """获取公开图片画廊"""
    
    # 构建查询 - 只显示公开图片
    query = db.query(Image).filter(Image.is_public == True)
    
    # 添加搜索条件
    if search:
        query = query.filter(Image.prompt.ilike(f"%{search}%"))
    
    if ai_model:
        query = query.filter(Image.ai_model == ai_model)
    
    # 排序
    query = query.order_by(Image.created_at.desc())
    
    # 分页
    total = query.count()
    offset = (page - 1) * size
    images = query.offset(offset).limit(size).all()
    
    return ImageList(
        images=[ImageResponse.from_orm(img) for img in images],
        total=total,
        page=page,
        per_page=size,
        total_pages=(total + size - 1) // size
    )
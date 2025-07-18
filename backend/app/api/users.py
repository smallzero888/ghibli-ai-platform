"""
用户管理相关的API路由
处理用户资料、统计、偏好设置等功能
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from ..core.database import get_db
from ..core.auth import get_current_user, verify_user_access
from ..schemas.user import UserUpdate, UserResponse, UserProfile, UserStats
from ..schemas.common import SuccessResponse, PaginationParams
from ..models.user import User
from ..models.image import Image
from ..models.user_favorite import UserFavorite

router = APIRouter()

@router.get("/profile", response_model=UserProfile)
async def get_user_profile(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户详细资料"""
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 获取用户统计信息
    total_images = db.query(Image).filter(Image.user_id == user.id).count()
    total_favorites = db.query(UserFavorite).filter(UserFavorite.user_id == user.id).count()
    
    # 获取最近活动（简化版本）
    recent_images = db.query(Image).filter(
        Image.user_id == user.id
    ).order_by(Image.created_at.desc()).limit(5).all()
    
    recent_activity = [
        {
            "type": "image_generated",
            "data": {
                "id": str(img.id),
                "prompt": img.prompt[:50] + "..." if len(img.prompt) > 50 else img.prompt,
                "ai_model": img.ai_model
            },
            "timestamp": img.created_at.isoformat()
        }
        for img in recent_images
    ]
    
    user_profile = UserProfile.from_orm(user)
    user_profile.total_images = total_images
    user_profile.total_favorites = total_favorites
    user_profile.recent_activity = recent_activity
    
    return user_profile

@router.put("/profile", response_model=UserResponse)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新用户资料"""
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 检查用户名是否已被使用
    if user_update.username and user_update.username != user.username:
        existing_user = db.query(User).filter(
            User.username == user_update.username,
            User.id != user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="该用户名已被使用"
            )
    
    # 更新用户信息
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    try:
        db.commit()
        db.refresh(user)
        return UserResponse.from_orm(user)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新用户资料时发生错误: {str(e)}"
        )

@router.get("/stats", response_model=UserStats)
async def get_user_stats(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户统计信息"""
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 计算统计数据
    total_images = db.query(Image).filter(Image.user_id == user.id).count()
    total_favorites = db.query(UserFavorite).filter(UserFavorite.user_id == user.id).count()
    
    # 根据订阅类型设置生成限制
    generation_limits = {
        "free": 50,
        "premium": 500,
        "pro": 2000
    }
    
    generation_limit = generation_limits.get(user.subscription_type, 50)
    remaining_generations = max(0, generation_limit - user.generation_count)
    
    return UserStats(
        total_generations=user.generation_count,
        total_images=total_images,
        total_favorites=total_favorites,
        subscription_type=user.subscription_type,
        generation_limit=generation_limit,
        remaining_generations=remaining_generations
    )

@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """根据ID获取用户信息（仅管理员或用户本人）"""
    # 验证访问权限
    verify_user_access(user_id, current_user)
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    return UserResponse.from_orm(user)

@router.delete("/account", response_model=SuccessResponse)
async def delete_user_account(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除用户账户"""
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    try:
        # 删除用户（级联删除相关数据）
        db.delete(user)
        db.commit()
        
        return SuccessResponse(message="账户删除成功")
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"删除账户时发生错误: {str(e)}"
        )
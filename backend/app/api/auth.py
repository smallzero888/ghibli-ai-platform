"""
认证相关的API路由
处理用户注册、登录、密码重置等功能
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Dict, Any

from ..core.database import get_db, get_supabase
from ..core.auth import get_current_user, log_user_action
from ..core.security import (
    verify_password, get_password_hash, create_access_token,
    validate_email, validate_password_strength
)
from ..schemas.user import (
    UserLogin, UserRegister, UserResponse, TokenResponse,
    PasswordReset, PasswordResetConfirm
)
from ..schemas.common import SuccessResponse, ErrorResponse
from ..models.user import User

router = APIRouter()

@router.post("/register", response_model=TokenResponse)
async def register(
    user_data: UserRegister,
    request: Request,
    db: Session = Depends(get_db)
):
    """用户注册"""
    # 验证邮箱格式
    if not validate_email(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邮箱格式无效"
        )
    
    # 验证密码强度
    is_strong, message = validate_password_strength(user_data.password)
    if not is_strong:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    
    # 检查邮箱是否已存在
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该邮箱已被注册"
        )
    
    try:
        # 使用Supabase进行用户注册
        supabase = get_supabase()
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password
        })
        
        if auth_response.user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="注册失败，请稍后重试"
            )
        
        # 在本地数据库创建用户记录
        db_user = User(
            id=auth_response.user.id,
            email=user_data.email,
            username=user_data.username,
            full_name=user_data.full_name
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # 创建访问令牌
        access_token = create_access_token(
            data={"sub": str(db_user.id), "email": db_user.email}
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=1800,
            user=UserResponse.from_orm(db_user)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"注册过程中发生错误: {str(e)}"
        )

@router.post("/login", response_model=TokenResponse)
async def login(
    login_data: UserLogin,
    request: Request,
    db: Session = Depends(get_db)
):
    """用户登录"""
    try:
        # 使用Supabase进行用户认证
        supabase = get_supabase()
        auth_response = supabase.auth.sign_in_with_password({
            "email": login_data.email,
            "password": login_data.password
        })
        
        if auth_response.user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="邮箱或密码错误"
            )
        
        # 从本地数据库获取用户信息
        db_user = db.query(User).filter(User.id == auth_response.user.id).first()
        if not db_user:
            # 如果本地数据库没有用户记录，创建一个
            db_user = User(
                id=auth_response.user.id,
                email=auth_response.user.email
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
        
        return TokenResponse(
            access_token=auth_response.session.access_token,
            token_type="bearer",
            expires_in=auth_response.session.expires_in,
            user=UserResponse.from_orm(db_user)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"登录过程中发生错误: {str(e)}"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取当前用户信息"""
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    return UserResponse.from_orm(user)
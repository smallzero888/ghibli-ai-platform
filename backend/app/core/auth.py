"""
认证和授权相关的核心功能
"""

import jwt
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import time

from .config import settings
from .database import get_db
from ..models.user import User
from ..models.system_log import SystemLog

security = HTTPBearer()

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """创建访问令牌"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Dict[str, Any]:
    """验证令牌"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="令牌已过期",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的令牌",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """获取当前用户"""
    token = credentials.credentials
    payload = verify_token(token)
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的令牌",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户已被禁用",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "is_admin": user.is_admin,
        "subscription_type": user.subscription_type
    }

def verify_user_access(user: Dict[str, Any], required_role: str = None) -> bool:
    """验证用户访问权限"""
    if required_role == "admin" and not user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要管理员权限"
        )
    return True

# 速率限制相关
_rate_limit_cache = {}

def check_rate_limit(request: Request, user: Dict[str, Any], limit: int = 60, window: int = 60):
    """检查速率限制"""
    user_id = user["id"]
    current_time = time.time()
    
    # 清理过期的记录
    for key in list(_rate_limit_cache.keys()):
        if current_time - _rate_limit_cache[key]["start_time"] > window:
            del _rate_limit_cache[key]
    
    # 检查当前用户的请求次数
    if user_id not in _rate_limit_cache:
        _rate_limit_cache[user_id] = {
            "count": 1,
            "start_time": current_time
        }
    else:
        _rate_limit_cache[user_id]["count"] += 1
        
        if _rate_limit_cache[user_id]["count"] > limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"请求过于频繁，请在{window}秒后重试"
            )

def log_user_action(
    action: str,
    resource_type: str = None,
    resource_id: str = None,
    details: Dict[str, Any] = None,
    request: Request = None,
    current_user: Dict[str, Any] = None,
    db: Session = None
):
    """记录用户操作日志"""
    if db is None:
        return
    
    try:
        log_entry = SystemLog(
            user_id=current_user.get("id") if current_user else None,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        
        db.add(log_entry)
        db.commit()
    except Exception as e:
        # 日志记录失败不应该影响主要功能
        print(f"Failed to log user action: {e}")
        db.rollback()
"""
认证相关依赖和中间件
处理用户认证、权限验证等功能
"""

from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .database import get_db, get_supabase
from .security import verify_supabase_jwt, extract_user_id_from_token
from ..models.user import User

# HTTP Bearer认证方案
security = HTTPBearer(auto_error=False)

class AuthenticationError(HTTPException):
    """认证错误异常"""
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"}
        )

class AuthorizationError(HTTPException):
    """授权错误异常"""
    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )

async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[Dict[str, Any]]:
    """
    获取当前用户（可选）
    如果没有提供令牌或令牌无效，返回None
    """
    if not credentials:
        return None
    
    try:
        # 验证Supabase JWT令牌
        payload = verify_supabase_jwt(credentials.credentials)
        user_id = payload.get("sub")
        
        if not user_id:
            return None
        
        # 从数据库获取用户信息
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        return {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "is_admin": user.is_admin,
            "subscription_type": user.subscription_type
        }
    
    except Exception:
        return None

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    获取当前用户（必需）
    如果没有提供令牌或令牌无效，抛出认证错误
    """
    if not credentials:
        raise AuthenticationError("Missing authentication token")
    
    try:
        # 验证Supabase JWT令牌
        payload = verify_supabase_jwt(credentials.credentials)
        user_id = payload.get("sub")
        
        if not user_id:
            raise AuthenticationError("Invalid token: no user ID found")
        
        # 从数据库获取用户信息
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise AuthenticationError("User not found")
        
        return {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "is_admin": user.is_admin,
            "subscription_type": user.subscription_type
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise AuthenticationError(f"Authentication failed: {str(e)}")

async def get_admin_user(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    获取管理员用户
    验证当前用户是否具有管理员权限
    """
    if not current_user.get("is_admin", False):
        raise AuthorizationError("Admin privileges required")
    
    return current_user

async def verify_user_access(
    resource_user_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> bool:
    """
    验证用户是否有权访问特定资源
    用户可以访问自己的资源，管理员可以访问所有资源
    """
    if current_user.get("is_admin", False):
        return True
    
    if current_user["id"] == resource_user_id:
        return True
    
    raise AuthorizationError("Access denied to this resource")

class RateLimiter:
    """简单的速率限制器"""
    def __init__(self):
        self.requests = {}
    
    def is_allowed(self, key: str, limit: int, window: int) -> bool:
        """
        检查是否允许请求
        key: 限制键（通常是用户ID或IP）
        limit: 限制次数
        window: 时间窗口（秒）
        """
        import time
        now = time.time()
        
        if key not in self.requests:
            self.requests[key] = []
        
        # 清理过期的请求记录
        self.requests[key] = [
            req_time for req_time in self.requests[key] 
            if now - req_time < window
        ]
        
        # 检查是否超过限制
        if len(self.requests[key]) >= limit:
            return False
        
        # 记录当前请求
        self.requests[key].append(now)
        return True

# 全局速率限制器实例
rate_limiter = RateLimiter()

def check_rate_limit(
    request: Request,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional),
    limit: int = 100,
    window: int = 3600  # 1小时
):
    """
    检查速率限制
    对已认证用户使用用户ID，对未认证用户使用IP地址
    """
    if current_user:
        key = f"user:{current_user['id']}"
        # 付费用户有更高的限制
        if current_user.get("subscription_type") == "premium":
            limit = limit * 5
    else:
        # 使用客户端IP作为限制键
        client_ip = request.client.host
        key = f"ip:{client_ip}"
        limit = limit // 10  # 未认证用户限制更严格
    
    if not rate_limiter.is_allowed(key, limit, window):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later."
        )

def log_user_action(
    action: str,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    request: Request = None,
    current_user: Optional[Dict[str, Any]] = None,
    db: Session = Depends(get_db)
):
    """
    记录用户操作日志
    """
    try:
        from ..models.system_log import SystemLog
        
        log_entry = SystemLog(
            user_id=current_user["id"] if current_user else None,
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
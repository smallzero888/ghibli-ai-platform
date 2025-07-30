"""
安全相关的核心功能
"""

import re
import hashlib
from passlib.context import CryptContext
from typing import Tuple
from datetime import datetime, timedelta
import secrets
import jwt

from .config import settings

# 密码加密上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """获取密码哈希"""
    return pwd_context.hash(password)

def validate_email(email: str) -> bool:
    """验证邮箱格式"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password_strength(password: str) -> Tuple[bool, str]:
    """验证密码强度"""
    if len(password) < 6:
        return False, "密码长度至少6位"
    
    if len(password) > 128:
        return False, "密码长度不能超过128位"
    
    # 检查是否包含至少一个字母和一个数字
    has_letter = re.search(r'[a-zA-Z]', password)
    has_number = re.search(r'\d', password)
    
    if not (has_letter and has_number):
        return False, "密码必须包含至少一个字母和一个数字"
    
    return True, "密码强度合格"

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """创建访问令牌"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def generate_reset_token() -> str:
    """生成密码重置令牌"""
    return secrets.token_urlsafe(32)

def hash_string(text: str) -> str:
    """字符串哈希"""
    return hashlib.sha256(text.encode()).hexdigest()

def generate_api_key() -> str:
    """生成API密钥"""
    return f"ghibli_{secrets.token_urlsafe(32)}"

def validate_api_key(api_key: str) -> bool:
    """验证API密钥格式"""
    return api_key.startswith("ghibli_") and len(api_key) > 10

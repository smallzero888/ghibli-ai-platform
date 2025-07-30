"""
系统日志数据模型
"""

from sqlalchemy import Column, String, Text, DateTime, JSON
from sqlalchemy.sql import func
import uuid

from ..core.database import Base

class SystemLog(Base):
    """系统日志模型"""
    __tablename__ = "system_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=True, index=True)
    action = Column(String, nullable=False, index=True)
    resource_type = Column(String, nullable=True)
    resource_id = Column(String, nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self):
        return f"<SystemLog(id={self.id}, action={self.action})>"

class ImageShare(Base):
    """图片分享记录模型"""
    __tablename__ = "image_shares"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    image_id = Column(String, nullable=False, index=True)
    user_id = Column(String, nullable=False, index=True)
    share_token = Column(String, nullable=False, unique=True, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self):
        return f"<ImageShare(id={self.id}, image_id={self.image_id})>"
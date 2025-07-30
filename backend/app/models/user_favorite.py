"""
用户收藏数据模型
"""

from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.sql import func
import uuid

from ..core.database import Base

class UserFavorite(Base):
    """用户收藏模型"""
    __tablename__ = "user_favorites"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    image_id = Column(String, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self):
        return f"<UserFavorite(user_id={self.user_id}, image_id={self.image_id})>"
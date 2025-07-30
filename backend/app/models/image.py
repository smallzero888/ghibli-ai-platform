"""
图片数据模型
"""

from sqlalchemy import Column, String, Text, DateTime, Integer, Boolean, JSON, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from ..core.database import Base

class Image(Base):
    """图片模型"""
    __tablename__ = "images"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    prompt = Column(Text, nullable=False)
    negative_prompt = Column(Text, nullable=True)
    ai_model = Column(String, nullable=False)
    image_url = Column(Text, nullable=False)
    thumbnail_url = Column(Text, nullable=True)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    generation_params = Column(JSON, nullable=True)
    status = Column(String, nullable=False, default="completed")
    is_public = Column(Boolean, default=False, nullable=False, index=True)
    likes_count = Column(Integer, default=0, nullable=False)
    views_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Image(id={self.id}, user_id={self.user_id})>"
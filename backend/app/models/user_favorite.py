"""
用户收藏数据模型
"""

from sqlalchemy import Column, DateTime, func, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..core.database import Base
import uuid

class UserFavorite(Base):
    __tablename__ = "user_favorites"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    image_id = Column(UUID(as_uuid=True), ForeignKey("images.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 唯一约束
    __table_args__ = (UniqueConstraint('user_id', 'image_id', name='unique_user_favorite'),)
    
    # 关系
    user = relationship("User", back_populates="favorites")
    image = relationship("Image", back_populates="favorites")
    
    def __repr__(self):
        return f"<UserFavorite(user_id={self.user_id}, image_id={self.image_id})>"
    
    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "image_id": str(self.image_id),
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
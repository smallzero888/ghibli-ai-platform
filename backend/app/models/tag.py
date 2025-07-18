"""
标签相关数据模型
"""

from sqlalchemy import Column, String, Text, DateTime, func, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..core.database import Base
import uuid

class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String(7), default='#3B82F6')  # 十六进制颜色代码
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关系
    image_tags = relationship("ImageTag", back_populates="tag", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Tag(id={self.id}, name={self.name})>"
    
    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "color": self.color,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class ImageTag(Base):
    __tablename__ = "image_tags"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    image_id = Column(UUID(as_uuid=True), ForeignKey("images.id", ondelete="CASCADE"), nullable=False)
    tag_id = Column(UUID(as_uuid=True), ForeignKey("tags.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 唯一约束
    __table_args__ = (UniqueConstraint('image_id', 'tag_id', name='unique_image_tag'),)
    
    # 关系
    image = relationship("Image", back_populates="tags")
    tag = relationship("Tag", back_populates="image_tags")
    
    def __repr__(self):
        return f"<ImageTag(image_id={self.image_id}, tag_id={self.tag_id})>"
    
    def to_dict(self):
        return {
            "id": str(self.id),
            "image_id": str(self.image_id),
            "tag_id": str(self.tag_id),
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
"""
生成任务数据模型
"""

from sqlalchemy import Column, String, DateTime, Text, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..core.database import Base
import uuid

class GenerationTask(Base):
    __tablename__ = "generation_tasks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    prompt = Column(Text, nullable=False)
    ai_model = Column(String(50), nullable=False)
    status = Column(String(20), default='pending')  # pending, processing, completed, failed
    external_task_id = Column(String(255), nullable=True)
    result_url = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # 关系
    user = relationship("User", back_populates="generation_tasks")
    
    def __repr__(self):
        return f"<GenerationTask(id={self.id}, user_id={self.user_id}, status={self.status})>"
    
    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "prompt": self.prompt,
            "ai_model": self.ai_model,
            "status": self.status,
            "external_task_id": self.external_task_id,
            "result_url": self.result_url,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }
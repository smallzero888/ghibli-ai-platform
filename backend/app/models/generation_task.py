"""
生成任务数据模型
"""

from sqlalchemy import Column, String, Text, DateTime, Integer, Boolean, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from ..core.database import Base

class GenerationTask(Base):
    """生成任务模型"""
    __tablename__ = "generation_tasks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    prompt = Column(Text, nullable=False)
    negative_prompt = Column(Text, nullable=True)
    ai_model = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending", index=True)
    external_task_id = Column(String, nullable=True)
    result_url = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    generation_params = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<GenerationTask(id={self.id}, status={self.status})>"
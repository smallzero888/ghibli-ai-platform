#!/usr/bin/env python3
"""
简化的测试服务器
用于快速测试后端API功能
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 创建FastAPI应用
app = FastAPI(
    title="吉卜力AI平台测试服务器",
    version="1.0.0",
    description="用于测试的简化后端API"
)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据模型
class GenerationRequest(BaseModel):
    prompt: str
    width: Optional[int] = 512
    height: Optional[int] = 512

class GenerationResponse(BaseModel):
    task_id: str
    status: str
    message: str

# 根端点
@app.get("/")
async def root():
    return {
        "message": "吉卜力AI平台测试服务器",
        "version": "1.0.0",
        "status": "running"
    }

# 健康检查
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ghibli-ai-test-server"
    }

# 测试生成端点
@app.post("/api/generate", response_model=GenerationResponse)
async def test_generate(request: GenerationRequest):
    """测试图片生成端点"""
    return GenerationResponse(
        task_id="test-task-123",
        status="completed",
        message="测试生成成功"
    )

# 获取任务状态
@app.get("/api/generate/{task_id}")
async def get_task_status(task_id: str):
    return {
        "task_id": task_id,
        "status": "completed",
        "result_url": "https://example.com/test-image.jpg",
        "prompt": "测试提示词"
    }

# 获取用户图片列表
@app.get("/api/images")
async def get_user_images():
    return {
        "data": [],
        "total": 0,
        "page": 1,
        "limit": 20
    }

# 获取公开图片
@app.get("/api/images/public")
async def get_public_images():
    return {
        "data": [],
        "total": 0,
        "page": 1,
        "limit": 20
    }

if __name__ == "__main__":
    print("🚀 启动吉卜力AI测试服务器...")
    print("📍 服务地址: http://localhost:8000")
    print("📖 API文档: http://localhost:8000/docs")
    
    uvicorn.run(
        "test_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
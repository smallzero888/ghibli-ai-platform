import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # 应用配置
    APP_NAME: str = "Ghibli AI Platform"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # 数据库配置
    POSTGRES_URL: str = os.getenv("POSTGRES_URL", "")
    POSTGRES_URL_NON_POOLING: str = os.getenv("POSTGRES_URL_NON_POOLING", "")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_DATABASE: str = os.getenv("POSTGRES_DATABASE", "postgres")
    
    # Supabase配置
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
    
    # JWT配置
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # AI服务配置
    SILICONFLOW_API_KEY: Optional[str] = os.getenv("SILICONFLOW_API_KEY")
    SILICONFLOW_BASE_URL: str = os.getenv("SILICONFLOW_BASE_URL", "https://api.siliconflow.cn/v1")
    REPLICATE_API_TOKEN: Optional[str] = os.getenv("REPLICATE_API_TOKEN")
    
    # Replicate配置
    REPLICATE_WEBHOOK_URL: Optional[str] = os.getenv("REPLICATE_WEBHOOK_URL")
    REPLICATE_WEBHOOK_SECRET: Optional[str] = os.getenv("REPLICATE_WEBHOOK_SECRET")
    
    # Redis配置（用于异步任务）
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # 文件存储配置
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # CORS配置
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://your-domain.com"
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
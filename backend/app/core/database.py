from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
import logging

from .config import settings

logger = logging.getLogger(__name__)

# SQLAlchemy配置
def create_database_engine():
    """创建数据库引擎"""
    if not settings.POSTGRES_URL_NON_POOLING:
        raise ValueError("POSTGRES_URL_NON_POOLING环境变量未设置")
    
    engine = create_engine(
        settings.POSTGRES_URL_NON_POOLING,
        poolclass=QueuePool,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=settings.DEBUG,
        connect_args={
            "options": "-c timezone=utc"
        }
    )
    
    logger.info("✅ 数据库引擎创建成功")
    return engine

# 创建引擎和会话
engine = create_database_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 数据库依赖
def get_db():
    """获取数据库会话"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 测试数据库连接
def test_database_connection():
    """测试数据库连接"""
    try:
        with engine.connect() as connection:
            result = connection.execute("SELECT 1")
            logger.info("✅ 数据库连接测试成功")
            return True
    except Exception as e:
        logger.error(f"❌ 数据库连接测试失败: {e}")
        return False
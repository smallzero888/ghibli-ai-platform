"""
FastAPI主应用程序
吉卜力AI图片生成平台后端服务
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import time
import logging
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base, test_database_connection
from app.core.supabase import supabase_manager

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用程序生命周期管理"""
    # 启动时执行
    logger.info("🚀 启动吉卜力AI平台后端服务...")
    
    # 测试数据库连接
    logger.info("🔍 测试数据库连接...")
    if test_database_connection():
        logger.info("✅ 数据库连接正常")
    else:
        logger.warning("⚠️ 数据库连接异常，请检查配置")
    
    # 测试Supabase连接
    logger.info("🔍 测试Supabase连接...")
    try:
        supabase_results = await supabase_manager.test_connection()
        if supabase_results["database_accessible"]:
            logger.info("✅ Supabase连接正常")
        else:
            logger.warning("⚠️ Supabase连接异常，请检查配置")
    except Exception as e:
        logger.error(f"❌ Supabase连接测试失败: {e}")
    
    # 创建数据库表（如果不存在）
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ 数据库表检查完成")
    except Exception as e:
        logger.error(f"❌ 数据库初始化失败: {e}")
    
    logger.info("🎉 服务启动完成!")
    yield
    
    # 关闭时执行
    logger.info("🛑 关闭吉卜力AI平台后端服务...")

# 创建FastAPI应用实例
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="吉卜力AI图片生成平台的后端API服务",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 添加可信主机中间件
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.vercel.app", "*.netlify.app"]
)

# 请求处理时间中间件
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """添加请求处理时间到响应头"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# 全局异常处理器
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """HTTP异常处理器"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "status_code": exc.status_code,
            "path": str(request.url)
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """通用异常处理器"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "message": "Internal server error",
            "status_code": 500,
            "path": str(request.url)
        }
    )

# 健康检查端点
@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.VERSION,
        "timestamp": time.time()
    }

# 连接测试端点
@app.get("/test-connections")
async def test_connections():
    """测试所有连接状态"""
    results = {
        "service": settings.APP_NAME,
        "version": settings.VERSION,
        "timestamp": time.time(),
        "connections": {
            "database": False,
            "supabase": {}
        },
        "overall_status": "unhealthy"
    }
    
    # 测试数据库连接
    results["connections"]["database"] = test_database_connection()
    
    # 测试Supabase连接
    try:
        supabase_results = await supabase_manager.test_connection()
        results["connections"]["supabase"] = supabase_results
    except Exception as e:
        results["connections"]["supabase"] = {
            "error": str(e),
            "client_connection": False,
            "admin_connection": False,
            "database_accessible": False,
            "auth_accessible": False,
            "storage_accessible": False
        }
    
    # 确定整体状态
    db_ok = results["connections"]["database"]
    supabase_ok = results["connections"]["supabase"].get("database_accessible", False)
    
    if db_ok and supabase_ok:
        results["overall_status"] = "healthy"
    elif db_ok or supabase_ok:
        results["overall_status"] = "partial"
    else:
        results["overall_status"] = "unhealthy"
    
    return results

# 根端点
@app.get("/")
async def root():
    """根端点"""
    return {
        "message": f"欢迎使用{settings.APP_NAME} API",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/health"
    }

# 导入API路由
from app.api import auth, users, generate, images

# 注册API路由
app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
app.include_router(users.router, prefix="/api/users", tags=["用户管理"])
app.include_router(generate.router, prefix="/api/generate", tags=["图片生成"])
app.include_router(images.router, prefix="/api/images", tags=["图片管理"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )

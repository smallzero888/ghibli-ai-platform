"""
Supabase配置和工具类
提供完整的Supabase集成支持
"""

from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import asyncio
from supabase import create_client, Client
from supabase.lib.client_options import ClientOptions

from .config import settings

class SupabaseManager:
    """Supabase管理器 - 统一管理Supabase服务"""
    
    def __init__(self):
        self.client: Optional[Client] = None
        self.admin_client: Optional[Client] = None
        self._initialized = False
    
    def initialize(self):
        """初始化Supabase客户端"""
        if not self._initialized:
            # 普通客户端（用于前端认证）
            self.client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_ANON_KEY,
                options=ClientOptions(
                    auto_refresh_token=True,
                    persist_session=True
                )
            )
            
            # 管理员客户端（用于服务端操作）
            self.admin_client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_ROLE_KEY,
                options=ClientOptions(
                    auto_refresh_token=False,
                    persist_session=False
                )
            )
            
            self._initialized = True
    
    def get_client(self) -> Client:
        """获取普通客户端"""
        if not self._initialized:
            self.initialize()
        return self.client
    
    def get_admin_client(self) -> Client:
        """获取管理员客户端"""
        if not self._initialized:
            self.initialize()
        return self.admin_client
    
    async def sign_up(self, email: str, password: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """用户注册"""
        try:
            response = self.get_admin_client().auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": metadata or {}
                }
            })
            
            return {
                "success": True,
                "user": response.user,
                "session": response.session
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def sign_in(self, email: str, password: str) -> Dict[str, Any]:
        """用户登录"""
        try:
            response = self.get_client().auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            return {
                "success": True,
                "user": response.user,
                "session": response.session
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def sign_out(self, access_token: str) -> Dict[str, Any]:
        """用户登出"""
        try:
            # 使用管理员客户端撤销令牌
            self.get_admin_client().auth.admin.sign_out(access_token)
            return {"success": True}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """刷新访问令牌"""
        try:
            response = self.get_client().auth.refresh_session(refresh_token)
            return {
                "success": True,
                "session": response.session
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """根据ID获取用户信息"""
        try:
            response = self.get_admin_client().auth.admin.get_user_by_id(user_id)
            return response.user.model_dump() if response.user else None
        except Exception:
            return None
    
    async def update_user(self, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """更新用户信息"""
        try:
            response = self.get_admin_client().auth.admin.update_user_by_id(
                user_id,
                updates
            )
            return {
                "success": True,
                "user": response.user
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def delete_user(self, user_id: str) -> Dict[str, Any]:
        """删除用户"""
        try:
            self.get_admin_client().auth.admin.delete_user(user_id)
            return {"success": True}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def list_users(self, page: int = 1, per_page: int = 50) -> Dict[str, Any]:
        """获取用户列表"""
        try:
            response = self.get_admin_client().auth.admin.list_users({
                "page": page,
                "per_page": per_page
            })
            
            return {
                "success": True,
                "users": [user.model_dump() for user in response.users],
                "total": len(response.users)
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_storage_stats(self) -> Dict[str, Any]:
        """获取存储统计信息"""
        try:
            # 获取存储桶统计
            buckets = self.get_admin_client().storage.list_buckets()
            
            total_size = 0
            file_count = 0
            
            for bucket in buckets:
                files = self.get_admin_client().storage.from_(bucket.name).list()
                file_count += len(files)
                # 计算总大小（需要遍历文件）
                for file in files:
                    if hasattr(file, 'metadata') and file.metadata:
                        total_size += file.metadata.get('size', 0)
            
            return {
                "success": True,
                "buckets": len(buckets),
                "files": file_count,
                "total_size": total_size
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def upload_file(
        self,
        bucket: str,
        path: str,
        file_data: bytes,
        content_type: str = "application/octet-stream"
    ) -> Dict[str, Any]:
        """上传文件到Supabase Storage"""
        try:
            response = self.get_admin_client().storage.from_(bucket).upload(
                path,
                file_data,
                {"content-type": content_type}
            )
            
            # 获取公开URL
            public_url = self.get_admin_client().storage.from_(bucket).get_public_url(path)
            
            return {
                "success": True,
                "path": path,
                "url": public_url
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def delete_file(self, bucket: str, path: str) -> Dict[str, Any]:
        """删除文件"""
        try:
            self.get_admin_client().storage.from_(bucket).remove([path])
            return {"success": True}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def create_bucket(self, bucket_name: str, public: bool = True) -> Dict[str, Any]:
        """创建存储桶"""
        try:
            self.get_admin_client().storage.create_bucket(
                bucket_name,
                {"public": public}
            )
            return {"success": True}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def check_health(self) -> Dict[str, Any]:
        """检查Supabase服务健康状态"""
        try:
            # 测试数据库连接
            response = self.get_admin_client().table('users').select("*").limit(1).execute()
            
            return {
                "success": True,
                "status": "healthy",
                "database": "connected",
                "auth": "available"
            }
        except Exception as e:
            return {
                "success": False,
                "status": "unhealthy",
                "error": str(e)
            }

# 全局Supabase管理器实例
supabase_manager = SupabaseManager()

# 快捷访问函数
def get_supabase_client() -> Client:
    """获取Supabase客户端"""
    return supabase_manager.get_client()

def get_supabase_admin() -> Client:
    """获取Supabase管理员客户端"""
    return supabase_manager.get_admin_client()

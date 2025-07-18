#!/usr/bin/env python3
"""
Supabase配置和初始化脚本
用于设置和验证Supabase项目配置
"""

import os
import sys
import asyncio
from typing import Dict, Any
from pathlib import Path

# 添加项目根目录到Python路径
sys.path.append(str(Path(__file__).parent))

from app.core.config import settings
from app.core.supabase import supabase_manager
from app.core.database import engine, Base
from sqlalchemy import text

class SupabaseSetup:
    """Supabase设置和验证工具"""
    
    def __init__(self):
        self.setup_complete = False
        
    async def check_environment(self) -> Dict[str, Any]:
        """检查环境配置"""
        required_vars = [
            'SUPABASE_URL',
            'SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_ROLE_KEY',
            'SUPABASE_JWT_SECRET',
            'POSTGRES_URL',
            'POSTGRES_URL_NON_POOLING'
        ]
        
        missing_vars = []
        config_status = {}
        
        for var in required_vars:
            value = getattr(settings, var, None)
            if not value:
                missing_vars.append(var)
                config_status[var] = "❌ 缺失"
            else:
                config_status[var] = "✅ 已配置"
        
        return {
            "missing_vars": missing_vars,
            "config_status": config_status,
            "all_configured": len(missing_vars) == 0
        }
    
    async def test_database_connection(self) -> Dict[str, Any]:
        """测试数据库连接"""
        try:
            # 测试SQLAlchemy连接
            with engine.connect() as conn:
                result = conn.execute(text("SELECT 1"))
                conn.commit()
            
            # 测试Supabase连接
            health = await supabase_manager.check_health()
            
            return {
                "success": True,
                "database": "✅ 连接成功",
                "supabase": "✅ 服务正常" if health.get("success") else "❌ 服务异常",
                "details": health
            }
        except Exception as e:
            return {
                "success": False,
                "database": "❌ 连接失败",
                "error": str(e)
            }
    
    async def setup_storage_buckets(self) -> Dict[str, Any]:
        """设置存储桶"""
        buckets_to_create = [
            {"name": "user-avatars", "public": True},
            {"name": "generated-images", "public": True},
            {"name": "thumbnails", "public": True},
            {"name": "temp-uploads", "public": False}
        ]
        
        results = []
        
        for bucket_config in buckets_to_create:
            try:
                result = await supabase_manager.create_bucket(
                    bucket_config["name"],
                    bucket_config["public"]
                )
                results.append({
                    "bucket": bucket_config["name"],
                    "status": "✅ 创建成功" if result["success"] else "⚠️ 已存在或创建失败",
                    "details": result
                })
            except Exception as e:
                results.append({
                    "bucket": bucket_config["name"],
                    "status": "❌ 创建失败",
                    "error": str(e)
                })
        
        return {
            "success": all(r["status"] != "❌ 创建失败" for r in results),
            "buckets": results
        }
    
    async def create_database_tables(self) -> Dict[str, Any]:
        """创建数据库表"""
        try:
            # 创建所有表
            Base.metadata.create_all(bind=engine)
            
            # 验证表创建
            with engine.connect() as conn:
                tables = conn.execute(text("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                """)).fetchall()
                
                table_names = [table[0] for table in tables]
                
            return {
                "success": True,
                "tables_created": table_names,
                "message": "✅ 数据库表创建成功"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "❌ 数据库表创建失败"
            }
    
    async def setup_policies(self) -> Dict[str, Any]:
        """设置数据库策略（RSL）"""
        policies = [
            # 用户策略
            """
            CREATE POLICY "Users can view own profile" ON users
            FOR SELECT USING (auth.uid() = id);
            """,
            
            # 图片策略
            """
            CREATE POLICY "Users can view own images" ON images
            FOR SELECT USING (auth.uid() = user_id);
            """,
            
            """
            CREATE POLICY "Users can insert own images" ON images
            FOR INSERT WITH CHECK (auth.uid() = user_id);
            """,
            
            """
            CREATE POLICY "Users can update own images" ON images
            FOR UPDATE USING (auth.uid() = user_id);
            """,
            
            """
            CREATE POLICY "Users can delete own images" ON images
            FOR DELETE USING (auth.uid() = user_id);
            """,
            
            # 生成任务策略
            """
            CREATE POLICY "Users can view own tasks" ON generation_tasks
            FOR SELECT USING (auth.uid() = user_id);
            """,
            
            """
            CREATE POLICY "Users can insert own tasks" ON generation_tasks
            FOR INSERT WITH CHECK (auth.uid() = user_id);
            """,
            
            """
            CREATE POLICY "Users can update own tasks" ON generation_tasks
            FOR UPDATE USING (auth.uid() = user_id);
            """
        ]
        
        results = []
        
        try:
            with engine.connect() as conn:
                for policy in policies:
                    try:
                        conn.execute(text(policy))
                        results.append({"policy": policy[:50] + "...", "status": "✅ 创建成功"})
                    except Exception as e:
                        # 策略可能已经存在
                        results.append({
                            "policy": policy[:50] + "...",
                            "status": "⚠️ 已存在或跳过",
                            "error": str(e)
                        })
                
                conn.commit()
            
            return {
                "success": True,
                "policies": results,
                "message": "✅ 数据库策略设置完成"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "❌ 数据库策略设置失败"
            }
    
    async def run_full_setup(self) -> Dict[str, Any]:
        """运行完整设置"""
        print("🚀 开始Supabase配置和初始化...")
        
        # 1. 检查环境配置
        print("\n📋 检查环境配置...")
        env_check = await self.check_environment()
        
        if not env_check["all_configured"]:
            print("❌ 环境配置不完整:")
            for var, status in env_check["config_status"].items():
                print(f"  {var}: {status}")
            return {
                "success": False,
                "error": "环境配置不完整",
                "missing_vars": env_check["missing_vars"]
            }
        
        print("✅ 环境配置检查通过")
        
        # 2. 测试数据库连接
        print("\n🔗 测试数据库连接...")
        db_test = await self.test_database_connection()
        
        if not db_test["success"]:
            print(f"❌ 数据库连接失败: {db_test.get('error', '未知错误')}")
            return {
                "success": False,
                "error": "数据库连接失败",
                "details": db_test
            }
        
        print("✅ 数据库连接成功")
        
        # 3. 创建数据库表
        print("\n🗄️ 创建数据库表...")
        tables_result = await self.create_database_tables()
        
        if not tables_result["success"]:
            print(f"❌ 数据库表创建失败: {tables_result.get('error', '未知错误')}")
            return tables_result
        
        print(f"✅ 数据库表创建成功: {len(tables_result['tables_created'])} 个表")
        
        # 4. 设置存储桶
        print("\n📦 设置存储桶...")
        buckets_result = await self.setup_storage_buckets()
        
        if buckets_result["success"]:
            for bucket in buckets_result["buckets"]:
                print(f"  {bucket['bucket']}: {bucket['status']}")
        
        # 5. 设置数据库策略
        print("\n🔐 设置数据库策略...")
        policies_result = await self.setup_policies()
        
        if policies_result["success"]:
            print("✅ 数据库策略设置完成")
        
        print("\n🎉 Supabase配置和初始化完成！")
        
        return {
            "success": True,
            "environment": env_check,
            "database": db_test,
            "tables": tables_result,
            "buckets": buckets_result,
            "policies": policies_result
        }

async def main():
    """主函数"""
    setup = SupabaseSetup()
    result = await setup.run_full_setup()
    
    if result["success"]:
        print("\n✅ 所有配置步骤已完成！")
        print("\n下一步:")
        print("1. 确保.env文件包含所有必需的Supabase配置")
        print("2. 运行: python -m backend.main 启动后端服务")
        print("3. 访问: http://localhost:8000/docs 查看API文档")
    else:
        print("\n❌ 配置失败:")
        print(f"错误: {result.get('error', '未知错误')}")
        
        if "missing_vars" in result:
            print("\n缺失的环境变量:")
            for var in result["missing_vars"]:
                print(f"  - {var}")
        
        print("\n请检查.env文件并重新运行此脚本")

if __name__ == "__main__":
    asyncio.run(main())

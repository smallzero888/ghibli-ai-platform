#!/usr/bin/env python3
"""
测试数据库连接脚本
验证Supabase和PostgreSQL连接是否正常
"""

import os
import sys
from pathlib import Path

# 添加项目根目录到Python路径
sys.path.append(str(Path(__file__).parent))

from app.core.config import settings
from app.core.database import test_database_connection
from app.core.supabase import supabase_manager
import psycopg2
import asyncio

def test_postgres_connection():
    """测试PostgreSQL直连"""
    print("🔍 测试PostgreSQL连接...")
    
    try:
        conn = psycopg2.connect(settings.POSTGRES_URL_NON_POOLING)
        cursor = conn.cursor()
        
        # 执行简单查询
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        
        print(f"✅ PostgreSQL连接成功!")
        print(f"📊 数据库版本: {version[0][:50]}...")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ PostgreSQL连接失败: {e}")
        return False

async def test_supabase_connection():
    """测试Supabase连接"""
    print("\n🔍 测试Supabase连接...")
    
    try:
        results = await supabase_manager.test_connection()
        
        if results["database_accessible"]:
            print("✅ Supabase连接成功!")
            print(f"📊 数据库访问: 正常")
            print(f"📊 认证服务: {'正常' if results['auth_accessible'] else '异常'}")
            print(f"📊 存储服务: {'正常' if results['storage_accessible'] else '异常'}")
        else:
            print("❌ Supabase连接失败!")
            if results["errors"]:
                for error in results["errors"]:
                    print(f"  • {error}")
        
        return results["database_accessible"]
        
    except Exception as e:
        print(f"❌ Supabase连接失败: {e}")
        return False

def check_environment():
    """检查环境变量"""
    print("🔍 检查环境变量...")
    
    required_vars = [
        'POSTGRES_URL_NON_POOLING',
        'SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY'
    ]
    
    missing_vars = []
    for var in required_vars:
        value = getattr(settings, var, None)
        if not value:
            missing_vars.append(var)
        else:
            # 只显示前10个字符，保护敏感信息
            masked_value = value[:10] + "..." if len(value) > 10 else value
            print(f"  ✅ {var}: {masked_value}")
    
    if missing_vars:
        print(f"❌ 缺少环境变量: {', '.join(missing_vars)}")
        return False
    
    print("✅ 所有必需的环境变量都已设置")
    return True

if __name__ == "__main__":
    print("🚀 开始数据库连接测试...\n")
    
    # 检查环境变量
    if not check_environment():
        print("\n❌ 环境变量检查失败，请检查.env文件")
        sys.exit(1)
    
    # 测试连接
    postgres_ok = test_postgres_connection()
    supabase_ok = test_supabase_connection()
    
    print("\n" + "="*50)
    if postgres_ok and supabase_ok:
        print("🎉 所有数据库连接测试通过!")
        print("✨ 可以开始运行迁移脚本了")
    else:
        print("❌ 部分连接测试失败，请检查配置")
        sys.exit(1)
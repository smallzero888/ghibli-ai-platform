#!/usr/bin/env python3
"""
数据库迁移脚本
运行所有SQL迁移文件来设置数据库结构
"""

import os
import sys
import psycopg2
from pathlib import Path
from app.core.config import settings

def run_migrations():
    """执行数据库迁移"""
    try:
        # 连接数据库
        conn = psycopg2.connect(settings.POSTGRES_URL_NON_POOLING)
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("🔗 已连接到数据库")
        
        # 获取迁移文件目录
        migrations_dir = Path(__file__).parent / "migrations"
        
        # 获取所有SQL文件并排序
        sql_files = sorted(migrations_dir.glob("*.sql"))
        
        if not sql_files:
            print("❌ 未找到迁移文件")
            return False
        
        # 执行每个迁移文件
        for sql_file in sql_files:
            print(f"📄 执行迁移: {sql_file.name}")
            
            with open(sql_file, 'r', encoding='utf-8') as f:
                sql_content = f.read()
            
            try:
                cursor.execute(sql_content)
                print(f"✅ {sql_file.name} 执行成功")
            except Exception as e:
                print(f"❌ {sql_file.name} 执行失败: {e}")
                return False
        
        print("🎉 所有迁移执行完成!")
        return True
        
    except Exception as e:
        print(f"❌ 数据库连接失败: {e}")
        return False
    
    finally:
        if 'conn' in locals():
            conn.close()
            print("🔌 数据库连接已关闭")

def verify_tables():
    """验证表是否创建成功"""
    try:
        conn = psycopg2.connect(settings.POSTGRES_URL_NON_POOLING)
        cursor = conn.cursor()
        
        # 检查表是否存在
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """)
        
        tables = cursor.fetchall()
        print("\n📋 数据库中的表:")
        for table in tables:
            print(f"  - {table[0]}")
        
        # 检查特定表
        expected_tables = ['users', 'images', 'generation_tasks']
        existing_tables = [table[0] for table in tables]
        
        missing_tables = set(expected_tables) - set(existing_tables)
        if missing_tables:
            print(f"⚠️  缺少表: {', '.join(missing_tables)}")
            return False
        else:
            print("✅ 所有必需的表都已创建")
            return True
            
    except Exception as e:
        print(f"❌ 验证表失败: {e}")
        return False
    
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    print("🚀 开始数据库迁移...")
    
    # 检查环境变量
    if not settings.POSTGRES_URL_NON_POOLING:
        print("❌ 未找到数据库连接URL，请检查环境变量")
        sys.exit(1)
    
    # 执行迁移
    if run_migrations():
        # 验证表创建
        if verify_tables():
            print("\n🎊 数据库设置完成!")
            sys.exit(0)
        else:
            print("\n❌ 表验证失败")
            sys.exit(1)
    else:
        print("\n❌ 迁移失败")
        sys.exit(1)
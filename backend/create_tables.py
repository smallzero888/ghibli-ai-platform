#!/usr/bin/env python3
"""
创建数据库表的简单脚本
"""

import sys
import os

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base
from app.models.user import User
from app.models.image import Image
from app.models.generation_task import GenerationTask
from app.models.user_favorite import UserFavorite
from app.models.system_log import SystemLog, ImageShare

def create_tables():
    """创建所有数据库表"""
    try:
        print("正在创建数据库表...")
        Base.metadata.create_all(bind=engine)
        print("✅ 数据库表创建成功!")
        
        # 列出创建的表
        print("\n创建的表:")
        for table_name in Base.metadata.tables.keys():
            print(f"  - {table_name}")
            
    except Exception as e:
        print(f"❌ 创建数据库表失败: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = create_tables()
    sys.exit(0 if success else 1)
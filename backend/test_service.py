#!/usr/bin/env python3
"""
测试硅基流动服务
"""

import asyncio
import sys
import os

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.siliconflow_service import siliconflow_service

async def test_service():
    """测试硅基流动服务"""
    print("🔍 正在测试硅基流动服务...")
    
    try:
        # 检查服务状态
        print("📡 检查服务状态...")
        status = await siliconflow_service.check_service_status()
        print("✅ 服务状态:", status)
        
        # 获取可用模型
        print("\n📋 获取可用模型...")
        models = await siliconflow_service.get_models()
        print(f"✅ 找到 {len(models)} 个模型")
        for model in models[:5]:  # 只显示前5个
            print(f"   - {model.get('id', 'Unknown')}")
        
        # 测试简单生成
        print("\n🎨 测试图片生成...")
        result = await siliconflow_service.generate_image(
            prompt="a cute cat, ghibli style",
            model="stabilityai/stable-diffusion-xl-base-1.0",
            width=512,
            height=512,
            steps=10
        )
        
        if result.get("success"):
            print("✅ 图片生成成功!")
            print(f"   - 生成时间: {result.get('generation_time', 'N/A')} 秒")
            print(f"   - 图片URL: {result.get('images', [])[0] if result.get('images') else 'N/A'}")
        else:
            print("❌ 图片生成失败")
            
    except Exception as e:
        print(f"❌ 错误: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_service())

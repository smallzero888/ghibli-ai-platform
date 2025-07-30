#!/usr/bin/env python3
"""
简单的后端测试脚本
"""

import asyncio
import sys
import os

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.siliconflow_service import siliconflow_service

async def test_siliconflow():
    """测试硅基流动服务"""
    try:
        print("测试硅基流动服务...")
        
        # 测试服务状态
        status = await siliconflow_service.check_service_status()
        print(f"服务状态: {status}")
        
        # 测试图片生成（如果API密钥配置了）
        if siliconflow_service.api_key:
            print("测试图片生成...")
            result = await siliconflow_service.generate_image(
                prompt="a cute cat",
                model="stabilityai/stable-diffusion-xl-base-1.0",
                width=512,
                height=512,
                steps=10
            )
            print(f"生成结果: {result}")
        else:
            print("⚠️ 硅基流动API密钥未配置，跳过生成测试")
        
        return True
        
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        return False

async def main():
    """主函数"""
    print("🧪 开始后端服务测试...\n")
    
    # 测试硅基流动服务
    siliconflow_ok = await test_siliconflow()
    
    print(f"\n📊 测试结果:")
    print(f"  硅基流动服务: {'✅' if siliconflow_ok else '❌'}")
    
    if siliconflow_ok:
        print("\n🎉 所有测试通过!")
        return True
    else:
        print("\n⚠️ 部分测试失败")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
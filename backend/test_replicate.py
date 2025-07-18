#!/usr/bin/env python3
"""
测试Replicate API集成
验证AI服务是否正常工作
"""

import asyncio
import sys
from pathlib import Path

# 添加项目根目录到Python路径
sys.path.append(str(Path(__file__).parent))

from app.services.replicate_service import ReplicateService
from app.services.ai_service_manager import ai_service_manager
from app.schemas.generation import GenerationRequest, AIModel
from app.core.config import settings

async def test_replicate_service():
    """测试Replicate服务"""
    print("🔍 测试Replicate服务...")
    
    if not settings.REPLICATE_API_TOKEN:
        print("❌ Replicate API Token未配置")
        print("请在.env文件中设置 REPLICATE_API_TOKEN")
        return False
    
    try:
        service = ReplicateService()
        
        # 测试获取可用模型
        print("📋 获取可用模型...")
        models = await service.get_available_models()
        print(f"✅ 找到 {len(models)} 个可用模型:")
        for model in models:
            print(f"  - {model['id']}: {model['name']}")
        
        # 测试生成请求（不实际执行）
        print("\n🎨 测试生成请求...")
        test_request = GenerationRequest(
            prompt="A beautiful landscape in Studio Ghibli style",
            ai_model=AIModel.REPLICATE_FLUX,
            width=512,
            height=512,
            steps=20
        )
        
        print(f"✅ 生成请求参数验证通过:")
        print(f"  - 提示词: {test_request.prompt}")
        print(f"  - 模型: {test_request.ai_model}")
        print(f"  - 尺寸: {test_request.width}x{test_request.height}")
        
        return True
        
    except Exception as e:
        print(f"❌ Replicate服务测试失败: {e}")
        return False

async def test_ai_service_manager():
    """测试AI服务管理器"""
    print("\n🔍 测试AI服务管理器...")
    
    try:
        # 测试获取服务状态
        print("📊 获取服务状态...")
        status = await ai_service_manager.get_service_status()
        print("✅ 服务状态:")
        for provider, info in status.items():
            print(f"  - {provider}: {info['status']}")
        
        # 测试获取可用模型
        print("\n📋 获取所有可用模型...")
        models = await ai_service_manager.get_available_models()
        print(f"✅ 总共找到 {len(models)} 个模型")
        
        # 测试推荐模型
        recommended = ai_service_manager.get_recommended_model()
        print(f"✅ 推荐模型: {recommended}")
        
        return True
        
    except Exception as e:
        print(f"❌ AI服务管理器测试失败: {e}")
        return False

async def main():
    """主测试函数"""
    print("🚀 开始测试Replicate API集成...\n")
    
    # 检查配置
    print("🔧 检查配置...")
    if settings.REPLICATE_API_TOKEN:
        token_preview = settings.REPLICATE_API_TOKEN[:10] + "..."
        print(f"✅ Replicate API Token: {token_preview}")
    else:
        print("❌ Replicate API Token未配置")
        return
    
    # 测试Replicate服务
    replicate_ok = await test_replicate_service()
    
    # 测试AI服务管理器
    manager_ok = await test_ai_service_manager()
    
    print("\n" + "="*50)
    if replicate_ok and manager_ok:
        print("🎉 所有测试通过!")
        print("✨ Replicate API集成正常工作")
    else:
        print("❌ 部分测试失败")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
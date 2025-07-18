"""
Replicate集成测试
验证Replicate API集成的完整功能
"""

import asyncio
import pytest
from datetime import datetime
from sqlalchemy.orm import Session
from app.services.replicate_service import replicate_service, ReplicateError
from app.services.ai_service_manager import ai_service_manager
from app.core.config import settings

# 测试配置
TEST_PROMPT = "a beautiful landscape in Studio Ghibli style"
TEST_WIDTH = 512
TEST_HEIGHT = 512

@pytest.mark.asyncio
async def test_replicate_service_initialization():
    """测试Replicate服务初始化"""
    assert replicate_service.api_token is not None
    assert replicate_service.base_url == "https://api.replicate.com/v1"

@pytest.mark.asyncio
async def test_replicate_models_info():
    """测试获取Replicate模型信息"""
    models = replicate_service.get_supported_models()
    
    assert isinstance(models, list)
    assert len(models) > 0
    
    # 检查模型结构
    for model in models:
        assert "id" in model
        assert "name" in model
        assert "description" in model
        assert "max_width" in model
        assert "max_height" in model

@pytest.mark.asyncio
async def test_replicate_flux_schnell_generation():
    """测试FLUX Schnell模型生成"""
    if not settings.REPLICATE_API_TOKEN:
        pytest.skip("Replicate API token not configured")
    
    try:
        result = await replicate_service.generate_image_flux_schnell(
            prompt=TEST_PROMPT,
            width=TEST_WIDTH,
            height=TEST_HEIGHT,
            num_outputs=1
        )
        
        assert result["success"] is True
        assert "images" in result
        assert len(result["images"]) > 0
        assert result["model"] == "replicate-flux-schnell"
        assert result["prompt"] == TEST_PROMPT
        
        # 验证图片URL
        for image_url in result["images"]:
            assert image_url.startswith("https://")
            
    except ReplicateError as e:
        pytest.fail(f"Replicate generation failed: {e}")

@pytest.mark.asyncio
async def test_replicate_sdxl_generation():
    """测试SDXL模型生成"""
    if not settings.REPLICATE_API_TOKEN:
        pytest.skip("Replicate API token not configured")
    
    try:
        result = await replicate_service.generate_image_sdxl(
            prompt=TEST_PROMPT,
            width=TEST_WIDTH,
            height=TEST_HEIGHT,
            num_inference_steps=10,
            guidance_scale=7.5
        )
        
        assert result["success"] is True
        assert "images" in result
        assert len(result["images"]) > 0
        assert result["model"] == "replicate-sdxl"
        
    except ReplicateError as e:
        pytest.fail(f"Replicate SDXL generation failed: {e}")

@pytest.mark.asyncio
async def test_replicate_flux_generation():
    """测试FLUX模型生成"""
    if not settings.REPLICATE_API_TOKEN:
        pytest.skip("Replicate API token not configured")
    
    try:
        result = await replicate_service.generate_image_flux(
            prompt=TEST_PROMPT,
            width=TEST_WIDTH,
            height=TEST_HEIGHT,
            num_inference_steps=10,
            guidance_scale=3.5
        )
        
        assert result["success"] is True
        assert "images" in result
        assert len(result["images"]) > 0
        assert result["model"] == "replicate-flux"
        
    except ReplicateError as e:
        pytest.fail(f"Replicate FLUX generation failed: {e}")

@pytest.mark.asyncio
async def test_replicate_batch_generation():
    """测试批量生成"""
    if not settings.REPLICATE_API_TOKEN:
        pytest.skip("Replicate API token not configured")
    
    requests = [
        {
            "prompt": "a cat in Studio Ghibli style",
            "model": "flux-schnell",
            "width": 512,
            "height": 512
        },
        {
            "prompt": "a dog in Studio Ghibli style",
            "model": "flux-schnell",
            "width": 512,
            "height": 512
        }
    ]
    
    try:
        results = await replicate_service.batch_generate(requests)
        
        assert isinstance(results, list)
        assert len(results) == 2
        
        for result in results:
            assert "status" in result
            if result["status"] == "succeeded":
                assert "result" in result
                assert result["result"]["success"] is True
                
    except ReplicateError as e:
        pytest.fail(f"Replicate batch generation failed: {e}")

@pytest.mark.asyncio
async def test_replicate_time_estimation():
    """测试时间估算"""
    estimated_time = await replicate_service.estimate_generation_time(
        model="replicate-flux-schnell",
        width=1024,
        height=1024,
        steps=4,
        batch_size=1
    )
    
    assert isinstance(estimated_time, int)
    assert estimated_time > 0
    assert estimated_time < 300  # 应该小于5分钟

@pytest.mark.asyncio
async def test_replicate_service_status():
    """测试服务状态检查"""
    if not settings.REPLICATE_API_TOKEN:
        pytest.skip("Replicate API token not configured")
    
    status = await replicate_service.check_service_status()
    
    assert isinstance(status, dict)
    assert "status" in status
    assert "service" in status
    assert status["service"] == "replicate"

@pytest.mark.asyncio
async def test_replicate_error_handling():
    """测试错误处理"""
    # 测试无效参数
    with pytest.raises(ReplicateError):
        await replicate_service.generate_image_flux_schnell(
            prompt="",  # 空提示词
            width=100,
            height=100
        )

@pytest.mark.asyncio
async def test_ai_service_manager_initialization():
    """测试AI服务管理器初始化"""
    manager = ai_service_manager
    
    services = manager.get_supported_models()
    
    assert isinstance(services, dict)
    assert "replicate" in services
    assert "siliconflow" in services

@pytest.mark.asyncio
async def test_ai_service_manager_health_check():
    """测试AI服务管理器健康检查"""
    health_status = await ai_service_manager.check_all_services_health()
    
    assert isinstance(health_status, dict)
    assert "services" in health_status
    assert "timestamp" in health_status
    assert "healthy_count" in health_status
    assert "total_count" in health_status

@pytest.mark.asyncio
async def test_ai_service_manager_service_selection():
    """测试服务选择"""
    available_services = ai_service_manager.get_available_services()
    
    assert isinstance(available_services, list)
    
    if available_services:
        selected_service = ai_service_manager.select_best_service()
        assert selected_service in available_services

@pytest.mark.asyncio
async def test_ai_service_manager_unified_generation():
    """测试统一生成接口"""
    if not settings.REPLICATE_API_TOKEN:
        pytest.skip("Replicate API token not configured")
    
    try:
        result = await ai_service_manager.generate_image(
            prompt=TEST_PROMPT,
            width=TEST_WIDTH,
            height=TEST_HEIGHT,
            service="replicate",
            model="flux-schnell"
        )
        
        assert result["success"] is True
        assert "service_used" in result
        assert result["service_used"] == "replicate"
        
    except Exception as e:
        pytest.fail(f"AI service manager generation failed: {e}")

@pytest.mark.asyncio
async def test_replicate_prompt_enhancement():
    """测试提示词增强"""
    original_prompt = "a beautiful landscape"
    enhanced_prompt = await replicate_service.enhance_ghibli_prompt(original_prompt)
    
    assert isinstance(enhanced_prompt, str)
    assert len(enhanced_prompt) > len(original_prompt)
    assert "Studio Ghibli" in enhanced_prompt or "Ghibli" in enhanced_prompt

@pytest.mark.asyncio
async def test_replicate_webhook_url_generation():
    """测试webhook URL生成"""
    base_url = "https://api.example.com"
    task_id = "test-task-123"
    
    webhook_url = await replicate_service.create_webhook_url(base_url, task_id)
    
    assert webhook_url == f"{base_url}/api/webhooks/replicate/{task_id}"

@pytest.mark.asyncio
async def test_replicate_model_info():
    """测试模型信息获取"""
    try:
        model_info = await replicate_service.get_model_info("replicate-flux-schnell")
        
        assert isinstance(model_info, dict)
        assert "id" in model_info
        assert "name" in model_info
        assert "description" in model_info
        assert "estimated_time" in model_info
        
    except ReplicateError as e:
        pytest.fail(f"获取模型信息失败: {e}")

if __name__ == "__main__":
    # 运行测试
    asyncio.run(test_replicate_service_initialization())
    asyncio.run(test_replicate_models_info())
    
    print("✅ Replicate集成测试完成！")

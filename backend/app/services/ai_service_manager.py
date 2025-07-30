"""
AI服务管理器 - 统一接口管理多个AI服务
实现服务可用性检测、负载均衡和降级策略
"""

import asyncio
import logging
from typing import Dict, Any, List, Optional, Union
from datetime import datetime, timedelta
import random

from .replicate_service import replicate_service, ReplicateError
from .siliconflow_service import siliconflow_service, SiliconFlowError

logger = logging.getLogger(__name__)

class AIServiceError(Exception):
    """AI服务错误"""
    def __init__(self, message: str, service: str = None, error_code: str = None):
        self.message = message
        self.service = service
        self.error_code = error_code
        super().__init__(self.message)

class AIServiceManager:
    """AI服务管理器 - 统一接口"""
    
    def __init__(self):
        self.services = {
            "replicate": {
                "service": replicate_service,
                "priority": 1,
                "enabled": True,
                "last_check": None,
                "health_status": "unknown",
                "response_time": 0,
                "error_count": 0,
                "success_count": 0
            },
            "siliconflow": {
                "service": siliconflow_service,
                "priority": 2,
                "enabled": True,
                "last_check": None,
                "health_status": "unknown",
                "response_time": 0,
                "error_count": 0,
                "success_count": 0
            }
        }
        self.health_check_interval = 300  # 5分钟
        self.max_error_threshold = 5
        self.circuit_breaker_timeout = 60  # 1分钟
    
    async def check_service_health(self, service_name: str) -> Dict[str, Any]:
        """检查单个服务健康状态"""
        if service_name not in self.services:
            return {"status": "unknown", "error": "服务不存在"}
        
        service_config = self.services[service_name]
        service = service_config["service"]
        
        try:
            start_time = datetime.now()
            
            if service_name == "replicate":
                status = await service.check_service_status()
                is_healthy = status.get("status") == "healthy"
            elif service_name == "siliconflow":
                status = await service.check_service_status()
                is_healthy = status.get("status") == "healthy"
            else:
                is_healthy = False
            
            response_time = (datetime.now() - start_time).total_seconds()
            
            service_config["last_check"] = datetime.now()
            service_config["health_status"] = "healthy" if is_healthy else "unhealthy"
            service_config["response_time"] = response_time
            
            if is_healthy:
                service_config["success_count"] += 1
                service_config["error_count"] = 0
            else:
                service_config["error_count"] += 1
            
            return {
                "service": service_name,
                "status": "healthy" if is_healthy else "unhealthy",
                "response_time": response_time,
                "last_check": service_config["last_check"].isoformat(),
                "error_count": service_config["error_count"],
                "success_count": service_config["success_count"]
            }
            
        except Exception as e:
            service_config["error_count"] += 1
            service_config["health_status"] = "unhealthy"
            service_config["last_check"] = datetime.now()
            
            return {
                "service": service_name,
                "status": "unhealthy",
                "error": str(e),
                "error_count": service_config["error_count"],
                "last_check": service_config["last_check"].isoformat()
            }
    
    async def check_all_services_health(self) -> Dict[str, Any]:
        """检查所有服务健康状态"""
        results = {}
        
        for service_name in self.services:
            results[service_name] = await self.check_service_health(service_name)
        
        return {
            "services": results,
            "timestamp": datetime.now().isoformat(),
            "healthy_count": sum(1 for r in results.values() if r["status"] == "healthy"),
            "total_count": len(results)
        }
    
    def get_available_services(self) -> List[str]:
        """获取可用服务列表"""
        available = []
        
        for service_name, config in self.services.items():
            if config["enabled"] and config["health_status"] == "healthy":
                available.append(service_name)
        
        return available
    
    async def select_best_service(self, preferred_service: Optional[str] = None) -> str:
        """选择最佳服务"""
        available_services = self.get_available_services()
        
        if not available_services:
            raise AIServiceError("没有可用的AI服务")
        
        if preferred_service and preferred_service in available_services:
            return preferred_service
        
        # 按优先级排序
        sorted_services = sorted(
            [(name, config) for name, config in self.services.items() 
             if name in available_services],
            key=lambda x: (x[1]["priority"], x[1]["response_time"])
        )
        
        if not sorted_services:
            raise AIServiceError("没有可用的AI服务")
        
        return sorted_services[0][0]
    
    async def generate_image(
        self,
        prompt: str,
        service: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """统一图片生成接口"""
        
        # 选择服务
        selected_service = await self.select_best_service(service)
        
        try:
            service_config = self.services[selected_service]
            service_instance = service_config["service"]
            
            # 根据服务类型调用相应方法
            if selected_service == "replicate":
                model = kwargs.get("model", "flux-schnell")
                
                if model == "flux-schnell":
                    result = await service_instance.generate_image_flux_schnell(
                        prompt=prompt,
                        **{k: v for k, v in kwargs.items() if k != "model"}
                    )
                elif model == "flux":
                    result = await service_instance.generate_image_flux(
                        prompt=prompt,
                        **{k: v for k, v in kwargs.items() if k != "model"}
                    )
                elif model == "sdxl":
                    result = await service_instance.generate_image_sdxl(
                        prompt=prompt,
                        **{k: v for k, v in kwargs.items() if k != "model"}
                    )
                else:
                    raise AIServiceError(f"不支持的Replicate模型: {model}")
                    
            elif selected_service == "siliconflow":
                result = await service_instance.generate_image(
                    prompt=prompt,
                    **kwargs
                )
            else:
                raise AIServiceError(f"不支持的服务: {selected_service}")
            
            # 更新成功计数
            service_config["success_count"] += 1
            
            # 添加服务信息
            result["service_used"] = selected_service
            result["service_model"] = kwargs.get("model", "default")
            
            return result
            
        except (ReplicateError, SiliconFlowError) as e:
            # 更新错误计数
            service_config["error_count"] += 1
            
            # 如果当前服务失败，尝试其他服务
            if service is None:  # 自动选择模式
                available_services = [s for s in self.get_available_services() 
                                    if s != selected_service]
                
                if available_services:
                    fallback_service = random.choice(available_services)
                    logger.warning(f"服务 {selected_service} 失败，尝试 {fallback_service}: {e}")
                    
                    try:
                        return await self.generate_image(
                            prompt=prompt,
                            service=fallback_service,
                            **kwargs
                        )
                    except Exception as fallback_error:
                        logger.error(f"回退服务 {fallback_service} 也失败: {fallback_error}")
            
            raise AIServiceError(
                f"{selected_service} 服务生成失败: {str(e)}",
                service=selected_service
            )
        
        except Exception as e:
            service_config["error_count"] += 1
            raise AIServiceError(
                f"生成图片失败: {str(e)}",
                service=selected_service
            )
    
    async def batch_generate(
        self,
        requests: List[Dict[str, Any]],
        service: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """批量生成图片"""
        
        if len(requests) > 10:
            raise AIServiceError("批量请求不能超过10个")
        
        results = []
        
        # 选择服务
        selected_service = await self.select_best_service(service)
        
        try:
            if selected_service == "replicate":
                results = await replicate_service.batch_generate(requests)
            elif selected_service == "siliconflow":
                # 硅基流动不支持批量，逐个处理
                for request_data in requests:
                    try:
                        result = await siliconflow_service.generate_image(**request_data)
                        results.append({
                            "status": "succeeded",
                            "result": result
                        })
                    except Exception as e:
                        results.append({
                            "status": "failed",
                            "error": str(e)
                        })
            else:
                raise AIServiceError(f"不支持的服务: {selected_service}")
            
            return results
            
        except Exception as e:
            raise AIServiceError(f"批量生成失败: {str(e)}")
    
    def get_service_info(self, service_name: str) -> Dict[str, Any]:
        """获取服务信息"""
        if service_name not in self.services:
            raise AIServiceError(f"服务不存在: {service_name}")
        
        config = self.services[service_name]
        
        return {
            "name": service_name,
            "enabled": config["enabled"],
            "priority": config["priority"],
            "health_status": config["health_status"],
            "response_time": config["response_time"],
            "error_count": config["error_count"],
            "success_count": config["success_count"],
            "last_check": config["last_check"].isoformat() if config["last_check"] else None
        }
    
    def get_all_services_info(self) -> Dict[str, Any]:
        """获取所有服务信息"""
        info = {}
        
        for service_name, config in self.services.items():
            info[service_name] = self.get_service_info(service_name)
        
        return info
    
    async def enable_service(self, service_name: str):
        """启用服务"""
        if service_name in self.services:
            self.services[service_name]["enabled"] = True
            logger.info(f"服务 {service_name} 已启用")
    
    async def disable_service(self, service_name: str):
        """禁用服务"""
        if service_name in self.services:
            self.services[service_name]["enabled"] = False
            logger.info(f"服务 {service_name} 已禁用")
    
    def get_supported_models(self) -> Dict[str, List[Dict[str, Any]]]:
        """获取所有支持的模型"""
        models = {}
        
        # Replicate模型
        try:
            models["replicate"] = replicate_service.get_supported_models()
        except Exception as e:
            logger.error(f"获取Replicate模型失败: {e}")
            models["replicate"] = []
        
        # 硅基流动模型
        try:
            models["siliconflow"] = siliconflow_service.get_supported_models()
        except Exception as e:
            logger.error(f"获取硅基流动模型失败: {e}")
            models["siliconflow"] = []
        
        return models
    
    async def estimate_generation_time(
        self,
        prompt: str,
        service: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """估算生成时间"""
        
        if service:
            if service == "replicate":
                return await replicate_service.estimate_generation_time(**kwargs)
            elif service == "siliconflow":
                return await siliconflow_service.estimate_generation_time(**kwargs)
            else:
                raise AIServiceError(f"不支持的服务: {service}")
        
        # 获取所有可用服务的时间估算
        estimates = {}
        
        for service_name in self.get_available_services():
            try:
                if service_name == "replicate":
                    estimate = await replicate_service.estimate_generation_time(**kwargs)
                    estimates[service_name] = estimate
                elif service_name == "siliconflow":
                    estimate = await siliconflow_service.estimate_generation_time(**kwargs)
                    estimates[service_name] = estimate
            except Exception as e:
                logger.warning(f"估算 {service_name} 时间失败: {e}")
        
        return estimates
    
    async def periodic_health_check(self):
        """定期健康检查"""
        while True:
            try:
                await self.check_all_services_health()
                await asyncio.sleep(self.health_check_interval)
            except Exception as e:
                logger.error(f"健康检查失败: {e}")
                await asyncio.sleep(60)  # 失败后1分钟重试

# 全局服务管理器实例
ai_service_manager = AIServiceManager()

# 启动健康检查任务
async def start_health_check():
    """启动健康检查"""
    asyncio.create_task(ai_service_manager.periodic_health_check())

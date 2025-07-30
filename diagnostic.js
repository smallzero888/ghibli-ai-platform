// 诊断脚本 - 检查所有服务状态
const https = require('https');
const http = require('http');

async function checkService(url, name) {
    return new Promise((resolve) => {
        const client = url.startsWith('https') ? https : http;
        
        const req = client.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    name,
                    status: res.statusCode,
                    success: res.statusCode === 200,
                    message: `HTTP ${res.statusCode}`
                });
            });
        });
        
        req.on('error', (err) => {
            resolve({
                name,
                status: 0,
                success: false,
                message: err.message
            });
        });
        
        req.on('timeout', () => {
            resolve({
                name,
                status: 0,
                success: false,
                message: 'Timeout'
            });
        });
        
        req.write(JSON.stringify({
            prompt: 'test',
            model: 'stabilityai/stable-diffusion-xl-base-1.0',
            width: 512,
            height: 512
        }));
        
        req.end();
    });
}

async function runDiagnostics() {
    console.log('🔍 开始诊断服务状态...\n');
    
    const services = [
        { url: 'http://localhost:8000/api/generate/simple', name: '后端API' },
        { url: 'http://localhost:3001', name: '前端开发服务器' }
    ];
    
    for (const service of services) {
        if (service.name === '前端开发服务器') {
            // 前端服务器简单检查
            try {
                const response = await fetch(service.url);
                console.log(`✅ ${service.name}: 运行正常 (${response.status})`);
            } catch (error) {
                console.log(`❌ ${service.name}: ${error.message}`);
            }
        } else {
            const result = await checkService(service.url, service.name);
            if (result.success) {
                console.log(`✅ ${result.name}: 运行正常 (${result.status})`);
            } else {
                console.log(`❌ ${result.name}: ${result.message}`);
            }
        }
    }
    
    console.log('\n📋 环境变量检查:');
    console.log(`NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`);
    
    console.log('\n🎯 测试建议:');
    console.log('1. 打开浏览器访问: http://localhost:3001');
    console.log('2. 在生成页面输入提示词测试图片生成');
    console.log('3. 检查浏览器控制台是否有错误信息');
}

// 运行诊断
runDiagnostics().catch(console.error);

# Ghibli AI Platform 使用指南

## 🚀 快速开始

### 1. 启动服务

**后端服务** (端口 8000):
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**前端服务** (端口 3001):
```bash
npm run dev
```

### 2. 访问应用

打开浏览器访问: http://localhost:3001

### 3. 测试图片生成

1. 在首页点击"开始创作"或直接访问: http://localhost:3001/zh/generate
2. 输入提示词，例如："一只可爱的龙猫在森林中，吉卜力风格"
3. 点击"开始生成"按钮
4. 等待3-5秒，查看生成的图片

## 🔧 故障排除

### 生成失败常见问题

#### 1. 后端API连接失败
- **症状**: 前端显示"请求失败"或"网络错误"
- **解决**: 
  - 确保后端服务已启动: `curl http://localhost:8000/api/generate/simple`
  - 检查端口是否被占用: `lsof -i :8000`

#### 2. 硅基流动API密钥问题
- **症状**: 后端日志显示"API密钥未配置"
- **解决**: 
  - 检查 `backend/.env` 文件中的 `SILICONFLOW_API_KEY`
  - 确保密钥有效且未过期

#### 3. 前端环境变量问题
- **症状**: API请求发送到错误地址
- **解决**: 
  - 检查 `.env.local` 文件中的 `NEXT_PUBLIC_API_URL`
  - 重启前端服务: `npm run dev`

### 4. 服务状态检查

运行诊断脚本:
```bash
node diagnostic.js
```

## 📋 测试用例

### 成功测试提示词
- "一只可爱的龙猫在森林中，吉卜力风格"
- "千与千寻中的汤屋，夜晚灯光温暖"
- "天空之城的城堡漂浮在云端"

### API测试
```bash
# 测试后端API
curl -X POST http://localhost:8000/api/generate/simple \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test cat","model":"stabilityai/stable-diffusion-xl-base-1.0","width":512,"height":512}'
```

## 🎯 预期结果

- **成功**: 返回包含图片URL的JSON响应
- **失败**: 返回错误信息和状态码

## 📞 技术支持

如果问题仍然存在，请检查:
1. 后端日志输出
2. 浏览器控制台错误
3. 网络连接状态
4. API密钥有效性

# 🎨 Ghibli AI Platform

一个基于AI的吉卜力风格图片生成平台

## ✨ 特性

- 🤖 AI驱动的吉卜力风格图片生成
- 🎨 多种艺术风格选择
- 👥 社区分享和交流
- 📱 响应式设计，支持移动端

## 🛠️ 技术栈

### 前端
- Next.js 14 + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand + React Query

### 后端
- Python + FastAPI
- Supabase (数据库 + 认证 + 存储)

### AI服务
- 硅基流动 (主要)
- Replicate (备用)

## 🚀 快速开始

### 前端开发
```bash
npm install
npm run dev
```

### 后端开发
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 📝 环境变量配置

### 前端 (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 后端 (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
SILICONFLOW_API_KEY=your_siliconflow_key
REPLICATE_API_TOKEN=your_replicate_token
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests！
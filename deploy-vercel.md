# Vercel 部署指南

## 🚀 一键部署到 Vercel

### 步骤 1: 设置环境变量
在 Vercel 控制台中设置以下环境变量：

```bash
# 必需的环境变量
NEXT_PUBLIC_SUPABASE_URL=https://wqzjtjcrjvgspalihvqw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indxemp0amNyanZnc3BhbGlodnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MjExMzksImV4cCI6MjA2ODI5NzEzOX0.7IAQq5J4OyqFqZNEO0yL2w7NWVUvQYTvqZrXNYs8IlU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indxemp0amNyanZnc3BhbGlodnF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjcyMTEzOSwiZXhwIjoyMDY4Mjk3MTM5fQ.wTgyHIkyKc7og_CnQa8WHiQ1_JAf8mqJxFspjkwLMyk
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
SILICONFLOW_API_KEY=sk-nnseooccndfasbhthzafmyygbefcaujmdmobdwakioilzman
REPLICATE_API_TOKEN=your-replicate-api-token
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=https://your-domain.com
```

### 步骤 2: 部署方式

#### 方式 A: 使用 Vercel CLI（推荐）
```bash
# 1. 确保已登录
vercel login

# 2. 设置环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_API_URL
vercel env add SILICONFLOW_API_KEY
vercel env add REPLICATE_API_TOKEN
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL

# 3. 部署
vercel --prod
```

#### 方式 B: 使用 Vercel Dashboard
1. 访问 https://vercel.com/dashboard
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. 在 "Environment Variables" 部分添加上述变量
5. 点击 "Deploy"

#### 方式 C: 一键部署按钮
复制以下链接到浏览器：
```
https://vercel.com/new/clone?repository-url=https://github.com/your-username/ghibli-ai-platform
```

### 步骤 3: 验证部署
部署完成后，访问你的 Vercel 域名，确保：
- ✅ 页面正常加载
- ✅ Supabase 连接正常
- ✅ 所有功能可用

### 🔧 故障排除
如果部署失败，检查：
1. 所有必需的环境变量是否已设置
2. `.env.local` 文件中的值是否正确
3. 构建日志中的错误信息

### 📱 部署地址
部署成功后，你将获得类似以下的地址：
```
https://ghibli-ai-platform-xxx.vercel.app
```

## 当前部署状态
项目已准备就绪，只需在 Vercel 控制台设置环境变量即可成功部署！

# 部署指南

## 🚀 部署到 GitHub 和 Vercel

### 步骤 1: 推送到 GitHub

1. **初始化 Git 仓库**（如果尚未初始化）：
```bash
git init
```

2. **添加所有文件到 Git**：
```bash
git add .
```

3. **提交更改**：
```bash
git commit -m "实现Google用户登录功能"
```

4. **添加远程仓库**：
```bash
git remote add origin https://github.com/your-username/ghibli-ai-platform.git
```

5. **推送到 GitHub**：
```bash
git push -u origin main
```

### 步骤 2: 设置环境变量

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

# Google OAuth 配置
NEXT_PUBLIC_GOOGLE_CLIENT_ID=973481826556-hmglkp5666gba5g72r6ie06p08h1bdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 步骤 3: 部署到 Vercel

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
vercel env add NEXT_PUBLIC_GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET

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

### 步骤 4: 配置 Supabase Google OAuth

1. **登录 Supabase 控制台**：
   - 访问 https://supabase.com/dashboard
   - 选择你的项目

2. **配置 Google OAuth**：
   - 导航到 "Authentication" > "Providers"
   - 找到 "Google" 并启用它
   - 添加以下信息：
     - **Client ID**: `973481826556-hmglkp5666gba5g72r6ie06p08h1bdef.apps.googleusercontent.com`
     - **Client Secret**: 在 Google Cloud Console 中获取
     - **Redirect URL**: `https://your-vercel-domain.com/auth/callback?provider=google`

3. **配置站点 URL**：
   - 导航到 "Authentication" > "URL Configuration"
   - 添加你的 Vercel 域名到 "Site URL" 和 "Redirect URLs"

### 步骤 5: 验证部署

部署完成后，访问你的 Vercel 域名，确保：
- ✅ 页面正常加载
- ✅ Supabase 连接正常
- ✅ Google OAuth 登录功能正常
- ✅ 用户数据同步正常
- ✅ 积分系统正常工作

### 🔧 故障排除

如果部署失败，检查：
1. 所有必需的环境变量是否已设置
2. `.env.local` 文件中的值是否正确
3. 构建日志中的错误信息
4. Supabase Google OAuth 配置是否正确

### 📱 部署地址

部署成功后，你将获得类似以下的地址：
```
https://ghibli-ai-platform-xxx.vercel.app
```

### 🧪 测试 Google 登录功能

1. **访问登录页面**：
   - 导航到 `https://your-vercel-domain.com/login`

2. **点击 Google 登录按钮**：
   - 确保能够重定向到 Google 登录页面
   - 完成登录后能够重定向回仪表板

3. **验证用户信息**：
   - 检查用户信息是否正确显示
   - 确认用户数据已同步到后端
   - 验证积分系统是否正常工作

4. **测试用户偏好设置**：
   - 导航到设置页面
   - 确保 Google 特有设置选项可见且可用

## 当前部署状态

项目已准备就绪，只需推送到 GitHub 并在 Vercel 控制台设置环境变量即可成功部署！
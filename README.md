# Ghibli AI 图片生成器

一个使用人工智能技术生成吉卜力风格图片的Web应用程序。

## 功能特点

- 🎨 AI驱动的图片生成
- 🌐 支持14种语言（中文、英语、日语、韩语、西班牙语、法语、德语、俄语、意大利语、葡萄牙语、阿拉伯语、印地语、泰语、越南语）
- 💳 多种支付方式（Stripe、Creem）
- 👤 用户认证和授权
- 📊 仪表板和统计分析
- 🖼️ 画廊和作品管理
- ⚙️ 个性化设置
- 📱 响应式设计

## 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes, Python (FastAPI)
- **数据库**: Supabase (PostgreSQL)
- **认证**: NextAuth.js, Supabase Auth
- **支付**: Stripe, Creem
- **AI服务**: OpenAI API
- **部署**: Vercel

## 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- npm 或 yarn
- Git

### 安装依赖

```bash
npm install
```

### 环境配置

1. 复制环境变量模板：
```bash
cp .env.example .env.local
```

2. 编辑 `.env.local` 文件，填入必要的环境变量：
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
OPENAI_API_KEY=your-openai-api-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

### 运行开发服务器

```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用程序。

## 部署到 Vercel

### 自动部署

使用提供的部署脚本：

```bash
# 给脚本添加执行权限
chmod +x deploy-vercel.sh

# 运行部署脚本
./deploy-vercel.sh
```

### 手动部署

1. 检查环境变量配置：
```bash
node check-env.js
```

2. 安装 Vercel CLI：
```bash
npm install -g vercel
```

3. 登录 Vercel：
```bash
vercel login
```

4. 部署项目：
```bash
vercel --prod
```

### 部署后测试

部署完成后，运行测试脚本验证应用程序是否正常运行：

```bash
node test-deployment.js https://your-app.vercel.app
```

## 项目结构

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/           # 国际化路由
│   │   ├── api/                # API 路由
│   │   ├── auth/               # 认证相关页面
│   │   └── test-google-oauth/   # Google OAuth 测试页面
│   ├── components/            # React 组件
│   ├── hooks/                 # 自定义 Hooks
│   ├── lib/                   # 工具库
│   ├── messages/              # 国际化消息文件
│   └── styles/                # 全局样式
├── backend/                   # Python 后端
│   ├── app/                   # FastAPI 应用
│   └── services/              # AI 服务
├── public/                    # 静态资源
├── .env.example              # 环境变量模板
├── next.config.js            # Next.js 配置
├── tailwind.config.js        # Tailwind CSS 配置
├── tsconfig.json             # TypeScript 配置
├── deploy-vercel.sh          # Vercel 部署脚本
├── check-env.js              # 环境变量检查脚本
├── test-deployment.js        # 部署测试脚本
└── DEPLOY_VERCEL_GUIDE.md    # Vercel 部署详细指南
```

## 国际化

项目支持14种语言，可以通过以下方式添加新语言：

1. 在 `src/messages/` 目录下创建新的语言文件（如 `fr.json`）
2. 在 `src/i18n.ts` 中添加新语言配置
3. 在 `src/app/[locale]/page.tsx` 中添加新语言的翻译内容

## 支付集成

项目支持两种支付方式：

### Stripe

1. 在 [Stripe 控制台](https://dashboard.stripe.com) 创建账户
2. 获取 API 密钥并配置到环境变量
3. 设置 Webhook 端点：`https://your-app.vercel.app/api/payment/stripe-webhook`

### Creem

1. 在 [Creem 控制台](https://dashboard.creem.io) 创建账户
2. 获取 API 密钥并配置到环境变量
3. 设置 Webhook 端点：`https://your-app.vercel.app/api/payment/creem-webhook`

## API 文档

### 前端 API

- `/api/auth/[...nextauth]` - NextAuth.js 认证
- `/api/payment/stripe` - Stripe 支付处理
- `/api/payment/creem` - Creem 支付处理
- `/api/generate` - 图片生成

### 后端 API

- `/api/generate` - 图片生成（Python 后端）
- `/api/models` - AI 模型列表
- `/api/styles` - 艺术风格列表

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 支持

如果您在使用过程中遇到问题，请：

1. 查看 [DEPLOY_VERCEL_GUIDE.md](DEPLOY_VERCEL_GUIDE.md) 获取部署帮助
2. 查看 [Issues](https://github.com/yourusername/ghibli-ai-generator/issues) 页面寻找解决方案
3. 创建新的 Issue 描述您的问题

## 更新日志

### v1.0.0 (2023-08-01)

- 初始版本发布
- 支持14种语言
- 集成 Stripe 和 Creem 支付
- 完整的用户认证和授权系统
- 响应式设计
- Vercel 部署支持
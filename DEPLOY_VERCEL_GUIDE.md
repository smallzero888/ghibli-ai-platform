# Vercel 部署指南

本指南将帮助您将 Ghibli AI 图片生成器项目部署到 Vercel 平台。

## 前提条件

- 拥有一个 GitHub 账户
- 拥有一个 Vercel 账户
- 项目代码已推送到 GitHub 仓库

## 环境变量配置

在部署之前，您需要在 Vercel 中配置以下环境变量：

### 必需的环境变量

```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
```

### 可选的环境变量

```
OPENAI_API_KEY=your-openai-api-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret
```

## 部署步骤

### 1. 连接 GitHub 仓库

1. 登录您的 Vercel 账户
2. 点击 "New Project" 按钮
3. 选择 "Import Git Repository"
4. 选择您的项目仓库
5. 点击 "Import"

### 2. 配置环境变量

1. 在项目设置中，找到 "Environment Variables" 部分
2. 添加上述必需的环境变量
3. 如果需要，添加可选的环境变量
4. 点击 "Save"

### 3. 配置构建设置

1. 在项目设置中，找到 "Build & Development" 部分
2. 确保 "Build Command" 设置为 `npm run build`
3. 确保 "Output Directory" 设置为 `.next`
4. 确保 "Install Command" 设置为 `npm install`

### 4. 部署项目

1. 点击 "Deploy" 按钮
2. Vercel 将自动构建和部署您的项目
3. 部署完成后，您将获得一个 URL，例如 `https://your-app.vercel.app`

## 部署后验证

### 1. 检查基本功能

- 访问部署后的 URL
- 确认主页正常加载
- 测试语言切换功能
- 确认所有链接正常工作

### 2. 测试用户功能

- 尝试注册新账户
- 尝试登录现有账户
- 测试密码重置功能
- 测试社交媒体登录（如果已配置）

### 3. 测试图片生成功能

- 尝试生成图片
- 确认生成的图片可以下载
- 测试不同的生成参数

### 4. 测试支付功能（如果已配置）

- 尝试升级订阅计划
- 测试不同的支付方式
- 确认支付成功后账户状态正确更新

## 自定义域名

如果您想使用自定义域名：

1. 在项目设置中，找到 "Domains" 部分
2. 点击 "Add Domain"
3. 输入您的域名，例如 `www.yourdomain.com`
4. 按照 Vercel 的指示配置 DNS 记录

## 监控和分析

Vercel 提供了内置的监控和分析工具：

1. 在项目仪表板中，查看 "Analytics" 部分
2. 监控网站流量和用户行为
3. 查看 "Functions" 部分以监控 API 性能
4. 设置 "Logs" 以排查问题

## 故障排除

### 常见问题

1. **构建失败**
   - 检查构建日志中的错误信息
   - 确保所有依赖项已正确安装
   - 检查代码中是否有语法错误

2. **环境变量未加载**
   - 确认环境变量已正确设置
   - 检查环境变量名称是否正确
   - 重新部署项目以应用环境变量更改

3. **API 调用失败**
   - 检查 API 密钥是否正确配置
   - 确认外部服务（如 Supabase、OpenAI）是否正常运行
   - 查看 Vercel 函数日志以获取更多错误信息

4. **页面加载缓慢**
   - 检查图片和资源是否已优化
   - 考虑使用 Vercel 的边缘网络缓存
   - 优化数据库查询

### 获取帮助

如果您在部署过程中遇到问题：

1. 查看 Vercel [文档](https://vercel.com/docs)
2. 检查 Vercel [状态页面](https://status.vercel.com) 以确认服务是否正常运行
3. 在 Vercel [社区论坛](https://vercel.com/forum) 寻求帮助
4. 联系 Vercel [支持团队](https://vercel.com/support)

## 性能优化建议

1. **图片优化**
   - 使用 Vercel 的图片优化功能
   - 考虑使用 CDN 托管图片
   - 实现懒加载

2. **代码分割**
   - 使用 Next.js 的动态导入功能
   - 按路由分割代码
   - 优化第三方库的使用

3. **缓存策略**
   - 实现适当的缓存头
   - 使用 Vercel 的边缘缓存
   - 考虑使用 Redis 进行数据缓存

4. **数据库优化**
   - 优化数据库查询
   - 实现适当的索引
   - 考虑使用数据库连接池

## 更新部署

当您需要更新部署时：

1. 将代码更改推送到 GitHub 仓库
2. Vercel 将自动检测更改并触发新的部署
3. 您可以在 Vercel 仪表板中监控部署进度
4. 部署完成后，更改将自动生效

## 回滚部署

如果新部署出现问题：

1. 在 Vercel 仪表板中，转到 "Deployments" 部分
2. 找到您想要回滚到的先前部署
3. 点击部署旁边的三个点菜单
4. 选择 "Rollback"
5. 确认回滚操作

## 总结

通过遵循本指南，您应该能够成功地将 Ghibli AI 图片生成器项目部署到 Vercel，并确保其在生产环境中正常运行。如果您有任何问题或需要进一步的帮助，请参考 Vercel 的官方文档或联系他们的支持团队。
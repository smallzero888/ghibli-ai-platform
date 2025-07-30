# Google OAuth 配置检查清单

## 当前状态
✅ 前端组件已集成
✅ 环境变量已配置
✅ 登录/注册页面已添加Google按钮

## 需要完成的配置

### 1. Google Cloud Console 设置
- [ ] 创建Google Cloud项目
- [ ] 启用Google+ API和Google Identity Services API
- [ ] 配置OAuth同意屏幕
- [ ] 创建OAuth 2.0凭据

### 2. 环境变量配置
在 `.env.local` 文件中设置：
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
```

### 3. Supabase 配置
- [ ] 登录Supabase控制台
- [ ] 转到 Authentication > Providers
- [ ] 启用 Google 提供商
- [ ] 输入Google OAuth客户端ID和密钥

### 4. 授权配置
开发环境需要配置：
- **已获授权的JavaScript来源**: `http://localhost:3000`
- **已获授权的重定向URI**: `http://localhost:3000/auth/callback`

### 5. 测试步骤
1. 启动开发服务器: `npm run dev`
2. 访问登录页面: `http://localhost:3000/auth/login`
3. 点击"使用Google账户登录"
4. 完成授权流程

## 常见问题解决

### 按钮不显示
- 检查浏览器控制台是否有错误
- 确保 `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 已正确设置
- 检查网络连接

### 授权失败
- 确认OAuth凭据配置正确
- 检查重定向URI是否匹配
- 确保域名在已获授权列表中

## 下一步操作
请按照 GOOGLE_OAUTH_SETUP.md 中的详细步骤完成配置。

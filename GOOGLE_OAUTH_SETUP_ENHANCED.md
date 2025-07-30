# Google OAuth 增强配置指南

本指南提供了完整的Google OAuth配置步骤，包括开发环境和生产环境的设置。

## 🚀 快速开始

### 1. 环境变量配置

在 `.env.local` 文件中添加以下配置：

```bash
# Google OAuth 配置
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# 确保这些变量已配置
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. 验证配置

运行以下命令验证配置是否正确：

```bash
npm run dev
# 访问 http://localhost:3000/login
# 检查控制台是否有Google OAuth相关错误
```

## 📋 详细配置步骤

### 步骤1：创建Google Cloud项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 确保已启用结算功能

### 步骤2：启用必要的API

1. 导航到 "API和服务" > "库"
2. 启用以下API：
   - Google+ API
   - Google Identity Services API
   - OAuth 2.0 API

### 步骤3：配置OAuth同意屏幕

1. 转到 "API和服务" > "OAuth同意屏幕"
2. 选择用户类型：
   - **外部**：适用于测试和个人项目
   - **内部**：适用于Google Workspace组织
3. 填写应用信息：
   ```
   应用名称：Ghibli AI Platform
   用户支持邮箱：your-email@example.com
   开发者联系信息：your-email@example.com
   ```
4. 添加范围：
   - email
   - profile
   - openid
5. 添加测试用户（开发阶段必需）

### 步骤4：创建OAuth 2.0凭据

1. 转到 "API和服务" > "凭据"
2. 点击 "创建凭据" > "OAuth 2.0客户端ID"
3. 配置如下：

#### 开发环境
- **应用类型**：Web应用
- **名称**：Ghibli AI Platform Dev
- **已获授权的JavaScript来源**：
  - `http://localhost:3000`
- **已获授权的重定向URI**：
  - `http://localhost:3000/auth/callback`

#### 生产环境
- **已获授权的JavaScript来源**：
  - `https://your-domain.com`
- **已获授权的重定向URI**：
  - `https://your-domain.com/auth/callback`

### 步骤5：配置Supabase

1. 登录Supabase Dashboard
2. 转到 "Authentication" > "Providers"
3. 启用Google提供商
4. 输入：
   - Client ID：从Google Cloud获取
   - Client Secret：从Google Cloud获取
   - 授权重定向URI：`https://your-project.supabase.co/auth/v1/callback`

## 🔧 故障排除

### 常见错误及解决方案

#### 1. redirect_uri_mismatch
```
错误：redirect_uri_mismatch
解决：确保Google Cloud中的重定向URI与代码中的完全一致
```

#### 2. invalid_client
```
错误：invalid_client
解决：检查NEXT_PUBLIC_GOOGLE_CLIENT_ID是否正确配置
```

#### 3. popup_blocked_by_browser
```
错误：弹窗被阻止
解决：指导用户允许弹窗，或使用重定向模式
```

#### 4. access_denied
```
错误：access_denied
解决：用户取消了授权，这是正常行为
```

### 调试工具

使用以下代码检查配置：

```typescript
import { validateGoogleOAuthConfig } from '@/lib/google-oauth'

const validation = validateGoogleOAuthConfig()
if (!validation.valid) {
  console.error('Google OAuth配置错误:', validation.error)
}
```

## 🛡️ 安全最佳实践

### 1. 环境变量安全
- 永远不要提交 `.env.local` 到版本控制
- 使用不同的密钥用于开发和生产环境
- 定期轮换密钥

### 2. 域名验证
- 在Google Cloud中验证您的域名
- 使用HTTPS在生产环境中
- 配置正确的CORS策略

### 3. 用户数据保护
- 仅请求必要的权限
- 实施适当的数据保留政策
- 遵守GDPR和其他隐私法规

## 🔄 高级配置

### 自定义登录按钮

```typescript
import { GoogleLogin } from '@/components/auth/google-login'

// 在登录页面
<GoogleLogin mode="login" />

// 在注册页面
<GoogleLogin mode="register" />
```

### 错误处理

```typescript
import { getGoogleOAuthErrorMessage } from '@/lib/google-oauth'

try {
  // Google登录逻辑
} catch (error) {
  const message = getGoogleOAuthErrorMessage(error)
  showToast.error(message)
}
```

## 📊 监控和分析

### 设置Google Analytics
1. 创建Google Analytics 4属性
2. 配置转化事件
3. 监控登录成功率

### 日志记录
```typescript
// 记录登录事件
console.log('Google login attempted', {
  timestamp: new Date().toISOString(),
  success: true/false,
  error: error?.message
})
```

## 🚀 部署检查清单

- [ ] 生产环境Google Client ID已配置
- [ ] 生产域名已添加到Google Cloud
- [ ] HTTPS证书已配置
- [ ] Supabase重定向URI已更新
- [ ] 环境变量已设置
- [ ] 测试用户已添加（如需要）
- [ ] 错误处理已测试
- [ ] 移动端测试已完成

## 📞 支持

如果遇到问题：
1. 检查浏览器控制台错误
2. 验证所有配置步骤
3. 查看Google Cloud日志
4. 联系开发团队

## 🔗 相关资源

- [Google OAuth 2.0文档](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth文档](https://supabase.com/docs/guides/auth)
- [Next.js环境变量](https://nextjs.org/docs/basic-features/environment-variables)

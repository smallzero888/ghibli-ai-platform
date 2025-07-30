# Google OAuth 官方集成指南

基于 Google Identity Services (GIS) 官方文档的最佳实践

## 🔧 配置步骤

### 1. 创建 Google OAuth 凭据

1. 访问 [Google Cloud Console](https://console.developers.google.com/apis/credentials)
2. 点击 **创建凭据** → **OAuth 客户端 ID**
3. 选择 **Web 应用**
4. 配置以下内容：
   - **名称**: 吉卜力AI平台
   - **已获授权的重定向 URI**:
     ```
     http://localhost:3000/auth/callback
     https://your-domain.com/auth/callback
     ```
   - **已获授权的 JavaScript 来源**:
     ```
     http://localhost:3000
     https://your-domain.com
     ```

### 2. 环境变量配置

```bash
# .env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 3. 使用官方 Google 登录按钮

我们提供了两种实现方式：

#### 方式一：官方按钮（推荐）
使用 `GoogleLoginOfficial` 组件，完全遵循 Google 官方样式：

```typescript
import { GoogleLoginOfficial } from '@/components/auth/google-login-official'

// 在登录页面
<GoogleLoginOfficial mode="login" onClose={() => setShowModal(false)} />

// 在注册页面
<GoogleLoginOfficial mode="register" onClose={() => setShowModal(false)} />
```

#### 方式二：自定义按钮
使用 `GoogleLogin` 组件，支持自定义样式：

```typescript
import { GoogleLogin } from '@/components/auth/google-login'

<GoogleLogin mode="login" onClose={() => setShowModal(false)} />
```

## 🎯 官方按钮特性

### 标准样式
- **主题**: outline（白色背景，蓝色边框）
- **尺寸**: large
- **形状**: 矩形
- **语言**: 中文（zh-CN）
- **宽度**: 100% 自适应

### 支持的按钮类型
- `signin_with` - 登录按钮
- `signup_with` - 注册按钮
- `continue_with` - 继续按钮

### 主题选项
- `outline` - 白色背景，蓝色边框（推荐）
- `filled_blue` - 蓝色背景，白色文字
- `filled_black` - 黑色背景，白色文字

## 🔒 安全最佳实践

### 1. 使用 ID Token 而非 Access Token
```typescript
// 正确做法：使用ID Token
const { data, error } = await supabase.auth.signInWithIdToken({
  provider: 'google',
  token: response.credential,
})
```

### 2. 验证令牌
后端应验证ID Token的签名和声明。

### 3. 作用域配置
默认作用域已包含：
- `openid`
- `email`
- `profile`

## 🚀 高级功能

### One Tap 登录
自动显示的便捷登录提示，无需用户点击按钮。

### 自动选择
当用户只有一个Google账户时自动登录。

### 弹出模式
使用弹出窗口而非重定向，提供更好的用户体验。

## 📱 响应式设计

官方按钮自动适配：
- 桌面端：大尺寸按钮
- 平板端：中尺寸按钮
- 移动端：全宽按钮

## 🎨 自定义样式

如需自定义样式，可以使用 `GoogleLogin` 组件，它提供了：
- 自定义颜色和主题
- 加载状态
- 错误处理
- 重试机制

## 🔍 调试指南

### 常见问题
1. **按钮不显示**: 检查 `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 是否设置
2. **登录失败**: 检查重定向URI配置
3. **跨域错误**: 检查已获授权的JavaScript来源

### 测试工具
```bash
# 运行配置测试
npm run dev
# 访问 http://localhost:3000
# 点击登录按钮测试Google登录
```

## 📋 部署检查清单

- [ ] 设置生产环境的 Google Client ID
- [ ] 配置生产环境的重定向 URI
- [ ] 配置生产环境的 JavaScript 来源
- [ ] 测试 One Tap 登录功能
- [ ] 验证移动端体验
- [ ] 检查错误处理流程

## 🔄 迁移指南

从旧版 Google Sign-In 迁移到 Google Identity Services：

1. 替换 `gapi.auth2` 为 `google.accounts.id`
2. 使用 `initialize` 和 `renderButton` 方法
3. 更新回调处理函数
4. 使用 ID Token 而非 Access Token

## 📚 相关资源

- [Google Identity Services 文档](https://developers.google.com/identity/gsi/web)
- [OAuth 2.0 最佳实践](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Google Auth 文档](https://supabase.com/docs/guides/auth/social-login/auth-google)

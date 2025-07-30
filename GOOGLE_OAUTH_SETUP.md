# Google OAuth 设置指南

本指南将帮助您配置Google OAuth登录功能。

## 1. 创建Google Cloud项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 点击项目选择器，然后点击"新建项目"
3. 输入项目名称（例如：ghibli-ai-platform）
4. 点击"创建"

## 2. 启用Google+ API

1. 在Google Cloud Console中，转到"API和服务" > "库"
2. 搜索"Google+ API"或"Google Identity"
3. 点击"Google+ API"并启用它
4. 同时启用"Google Identity Services API"

## 3. 配置OAuth同意屏幕

1. 转到"API和服务" > "OAuth同意屏幕"
2. 选择"外部"用户类型（除非您有Google Workspace账户）
3. 填写必需信息：
   - 应用名称：Ghibli AI Platform
   - 用户支持电子邮件：您的邮箱
   - 开发者联系信息：您的邮箱
4. 点击"保存并继续"
5. 在"范围"页面，点击"保存并继续"
6. 在"测试用户"页面，添加您要测试的邮箱地址

## 4. 创建OAuth 2.0凭据

1. 转到"API和服务" > "凭据"
2. 点击"创建凭据" > "OAuth 2.0客户端ID"
3. 选择应用类型："Web应用"
4. 输入名称：Ghibli AI Platform Web Client
5. 在"已获授权的JavaScript来源"中添加：
   - `http://localhost:3000` (开发环境)
   - `https://your-domain.com` (生产环境)
6. 在"已获授权的重定向URI"中添加：
   - `http://localhost:3000/auth/callback` (开发环境)
   - `https://your-domain.com/auth/callback` (生产环境)
7. 点击"创建"

## 5. 配置环境变量

1. 复制生成的客户端ID
2. 在您的`.env.local`文件中设置：
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   ```

## 6. 配置Supabase

1. 登录您的Supabase项目
2. 转到"Authentication" > "Providers"
3. 启用"Google"提供商
4. 输入您的Google OAuth客户端ID和客户端密钥
5. 设置重定向URL为：`https://your-supabase-project.supabase.co/auth/v1/callback`

## 7. 测试配置

1. 启动开发服务器：`npm run dev`
2. 访问登录页面
3. 点击"使用Google账户登录"按钮
4. 应该会弹出Google登录模态框
5. 点击Google登录按钮应该会跳转到Google授权页面

## 故障排除

### 常见错误

1. **"redirect_uri_mismatch"错误**
   - 确保在Google Cloud Console中添加了正确的重定向URI
   - 检查URL是否完全匹配（包括协议、域名、端口）

2. **"invalid_client"错误**
   - 检查客户端ID是否正确
   - 确保环境变量名称正确

3. **"access_blocked"错误**
   - 确保OAuth同意屏幕已正确配置
   - 检查是否添加了测试用户（开发阶段）

4. **Google按钮不显示**
   - 检查网络连接
   - 确保Google Identity Services脚本正确加载
   - 检查浏览器控制台是否有错误

### 开发环境注意事项

- 确保使用`http://localhost:3000`而不是`127.0.0.1:3000`
- 某些浏览器可能会阻止第三方cookies，影响Google登录
- 在开发环境中，可能需要将测试邮箱添加到OAuth同意屏幕的测试用户列表中

### 生产环境部署

1. 更新Google Cloud Console中的授权域名
2. 更新Supabase中的站点URL设置
3. 确保HTTPS配置正确
4. 更新环境变量中的域名设置

## 安全建议

1. 定期轮换客户端密钥
2. 限制OAuth范围到最小必需权限
3. 监控OAuth使用情况
4. 在生产环境中启用域名验证
5. 定期审查授权的重定向URI

## 支持的功能

- ✅ Google Identity Services (推荐)
- ✅ OAuth 2.0重定向流程
- ✅ 自动用户注册
- ✅ 会话管理
- ✅ 错误处理和重试机制
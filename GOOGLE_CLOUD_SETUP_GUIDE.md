# Google Cloud Console 详细配置指南

## 第一步：访问Google Cloud Console
1. 打开浏览器访问：https://console.cloud.google.com/
2. 使用你的Google账号登录

## 第二步：创建新项目
1. 点击顶部项目选择器（显示"选择项目"）
2. 点击"新建项目"
3. 输入项目名称：`ghibli-ai-platform`
4. 选择组织（如果有）
5. 点击"创建"

## 第三步：启用必要的API
1. 在左侧菜单点击"API和服务" → "库"
2. 搜索并启用以下API：
   - **Google+ API**（搜索"Google+ API"并点击启用）
   - **Google Identity Services API**（搜索"Google Identity Services"并启用）

## 第四步：配置OAuth同意屏幕
1. 左侧菜单点击"API和服务" → "OAuth同意屏幕"
2. 选择"外部"（适用于个人开发者）
3. 点击"创建"
4. 填写应用信息：
   - **应用名称**：`Ghibli AI Platform`
   - **用户支持电子邮件**：选择你的邮箱
   - **开发者联系信息**：输入你的邮箱
5. 点击"保存并继续"
6. 在"范围"页面直接点击"保存并继续"
7. 在"测试用户"页面添加你的邮箱地址（用于测试）
8. 点击"保存并继续"

## 第五步：创建OAuth 2.0凭据
1. 左侧菜单点击"API和服务" → "凭据"
2. 点击"创建凭据" → "OAuth 2.0客户端ID"
3. 配置如下：
   - **应用类型**：选择"Web应用"
   - **名称**：`Ghibli AI Platform Web Client`
   - **已获授权的JavaScript来源**：
     ```
     http://localhost:3000
     ```
   - **已获授权的重定向URI**：
     ```
     http://localhost:3000/auth/callback
     ```
4. 点击"创建"
5. 复制生成的**客户端ID**（格式类似：`123456789-abc123def456.apps.googleusercontent.com`）

## 第六步：更新环境变量
1. 打开项目根目录的 `.env.local` 文件
2. 将 `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 替换为你的实际客户端ID：
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
   ```

## 第七步：配置Supabase
1. 访问 https://supabase.com/dashboard
2. 登录并选择你的项目
3. 左侧菜单点击"Authentication" → "Providers"
4. 找到"Google"并启用
5. 输入以下信息：
   - **客户端ID**：粘贴你的Google客户端ID
   - **客户端密钥**：粘贴你的Google客户端密钥（在凭据页面可以找到）
   - **重定向URL**：`https://your-project.supabase.co/auth/v1/callback`

## 第八步：验证配置
1. 重启开发服务器：`npm run dev`
2. 访问：`http://localhost:3000/auth/login`
3. 应该能看到Google登录按钮
4. 点击测试授权流程

## 常见问题解决

### 按钮不显示
- 检查浏览器控制台是否有错误
- 确认客户端ID格式正确
- 确保网络连接正常

### 授权失败
- 检查重定向URI是否完全匹配
- 确认域名在已获授权列表中
- 检查是否使用了正确的协议（http vs https）

### 开发环境提示
- 开发阶段使用 `http://localhost:3000`
- 生产环境需要替换为你的实际域名
- 每次修改配置后需要重启开发服务器

## 完成后的文件结构
```
.env.local
├── NEXT_PUBLIC_GOOGLE_CLIENT_ID=你的实际客户端ID
└── 其他配置...
```

## 下一步
配置完成后，Google登录按钮将正常工作，用户可以通过Google账户快速注册和登录。

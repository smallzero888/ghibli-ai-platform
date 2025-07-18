# 吉卜力AI平台配置指南

## 🚀 快速开始

### 1. 环境配置

#### 后端环境配置 (.env)
```bash
# 复制环境文件
cp .env.example .env

# 编辑 .env 文件，填入您的配置
```

#### 前端环境配置 (.env.local)
```bash
# 复制前端环境文件
cp .env.local.example .env.local

# 编辑 .env.local 文件，填入您的配置
```

### 2. 必需的环境变量

#### 后端必需变量 (.env)
```bash
# Supabase配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# 数据库配置
POSTGRES_URL=postgresql://username:password@host:5432/database
POSTGRES_URL_NON_POOLING=postgresql://username:password@host:5432/database

# AI服务配置
SILICONFLOW_API_KEY=your-siliconflow-api-key
REPLICATE_API_TOKEN=your-replicate-api-token

# JWT配置
SECRET_KEY=your-secret-key-for-jwt
```

#### 前端必需变量 (.env.local)
```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# API配置
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# AI服务配置
SILICONFLOW_API_KEY=your-siliconflow-api-key
REPLICATE_API_TOKEN=your-replicate-api-token
```

### 3. 一键配置

运行自动化配置脚本：

```bash
# 安装依赖
pip install -r backend/requirements.txt
npm install

# 运行配置检查
python backend/setup_supabase.py

# 启动后端
python -m backend.main

# 启动前端（新终端）
npm run dev
```

### 4. 验证配置

#### 检查服务状态
- 后端API文档: http://localhost:8000/docs
- 健康检查: http://localhost:8000/health
- 前端应用: http://localhost:3000

#### 测试API端点
```bash
# 测试认证
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}'

# 测试AI服务
curl -X GET http://localhost:8000/api/replicate/models
```

### 5. Supabase项目设置

#### 创建Supabase项目
1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 创建新项目
3. 获取项目URL和密钥

#### 配置数据库表
项目会自动创建以下表：
- `users` - 用户信息
- `images` - 生成的图片
- `generation_tasks` - 生成任务
- `user_favorites` - 用户收藏
- `tags` - 图片标签

#### 配置存储桶
项目会自动创建以下存储桶：
- `user-avatars` - 用户头像
- `generated-images` - 生成的图片
- `thumbnails` - 缩略图
- `temp-uploads` - 临时文件

### 6. 环境变量详细说明

#### Supabase配置
- `SUPABASE_URL`: 您的Supabase项目URL
- `SUPABASE_ANON_KEY`: 匿名访问密钥（用于前端）
- `SUPABASE_SERVICE_ROLE_KEY`: 服务角色密钥（用于后端）
- `SUPABASE_JWT_SECRET`: JWT签名密钥

#### 数据库配置
- `POSTGRES_URL`: 主数据库连接字符串
- `POSTGRES_URL_NON_POOLING`: 非连接池数据库连接

#### AI服务配置
- `SILICONFLOW_API_KEY`: 硅基流动API密钥
- `REPLICATE_API_TOKEN`: Replicate API令牌

### 7. 故障排除

#### 常见问题

**问题1: 数据库连接失败**
```bash
# 检查数据库URL格式
postgresql://username:password@host:5432/database

# 测试连接
python -c "from app.core.database import engine; engine.connect()"
```

**问题2: Supabase认证失败**
```bash
# 检查JWT密钥
确保 SUPABASE_JWT_SECRET 与 Supabase 项目设置一致

# 检查服务角色密钥
确保 SUPABASE_SERVICE_ROLE_KEY 有管理员权限
```

**问题3: 存储桶创建失败**
```bash
# 手动创建存储桶
在 Supabase Dashboard -> Storage 中创建：
- user-avatars (public)
- generated-images (public)
- thumbnails (public)
- temp-uploads (private)
```

### 8. 开发环境

#### 启动开发服务器
```bash
# 后端开发模式
python -m backend.main --reload

# 前端开发模式
npm run dev
```

#### 运行测试
```bash
# 后端测试
python -m pytest backend/test_*.py -v

# 前端测试
npm run test

# 端到端测试
npm run test:e2e
```

### 9. 生产环境部署

#### 环境变量检查
```bash
# 验证所有必需变量
python backend/setup_supabase.py
```

#### 构建和部署
```bash
# 构建前端
npm run build

# 启动生产后端
python -m backend.main
```

### 10. 获取帮助

- **文档**: 查看 `/docs` 端点获取API文档
- **日志**: 检查控制台输出和日志文件
- **支持**: 创建GitHub issue获取技术支持

## 🔧 配置验证

运行以下命令验证配置：

```bash
# 检查环境配置
python backend/setup_supabase.py

# 测试数据库连接
python -c "from app.core.database import engine; print('✅ 数据库连接正常')"

# 测试Supabase连接
python -c "from app.core.supabase import supabase_manager; import asyncio; print(asyncio.run(supabase_manager.check_health()))"

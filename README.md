# 吉卜力AI图片生成平台

一个使用AI技术生成吉卜力风格图片的全栈Web应用程序。

## 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **后端**: Python + FastAPI
- **数据库**: Supabase (PostgreSQL)
- **AI服务**: 硅基流动 + Replicate

## 快速开始

### 1. 环境准备

确保你已经安装了以下软件：
- Node.js 18+
- Python 3.11+
- Git

### 2. 克隆项目

```bash
git clone <your-repo-url>
cd ghibli-ai-platform
```

### 3. 环境变量配置

复制环境变量模板文件并配置：

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量文件
# 需要配置以下关键信息：
# - Supabase数据库连接信息
# - 硅基流动API密钥
# - Replicate API令牌（可选）
# - JWT密钥
```

**重要配置项说明：**

- `SILICONFLOW_API_KEY`: 硅基流动API密钥，用于AI图片生成
- `SUPABASE_URL` 和相关密钥: 数据库和认证服务
- `SECRET_KEY`: JWT令牌签名密钥，请使用强密码

### 4. 后端设置

```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# macOS/Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 测试数据库连接
python test_connection.py

# 运行数据库迁移
python run_migrations.py
```

### 5. 前端设置

```bash
# 回到项目根目录
cd ..

# 安装前端依赖
npm install

# 启动开发服务器
npm run dev
```

### 6. 启动后端服务

```bash
# 在另一个终端窗口中
cd backend

# 激活虚拟环境
source venv/bin/activate

# 启动FastAPI服务器
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 项目结构

```
ghibli-ai-platform/
├── src/                    # 前端源码
│   ├── app/               # Next.js App Router
│   ├── components/        # React组件
│   ├── lib/              # 工具库
│   └── types/            # TypeScript类型
├── backend/               # 后端源码
│   ├── app/              # FastAPI应用
│   ├── migrations/       # 数据库迁移
│   └── requirements.txt  # Python依赖
├── .env.local            # 环境变量
└── README.md
```

## 开发指南

### 数据库操作

- 测试连接: `python backend/test_connection.py`
- 运行迁移: `python backend/run_migrations.py`
- 查看表结构: 登录Supabase控制台

### API文档

启动后端服务后，访问 `http://localhost:8000/docs` 查看自动生成的API文档。

## 部署

详细的部署指南将在后续添加。

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License
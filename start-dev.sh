#!/bin/bash

# 吉卜力AI平台开发环境启动脚本

echo "🎨 启动吉卜力AI平台开发环境..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装，请先安装 Python3"
    exit 1
fi

# 安装前端依赖
echo "📦 安装前端依赖..."
npm install

# 安装后端依赖
echo "📦 安装后端依赖..."
cd backend
pip install -r requirements.txt

# 创建数据库表
echo "🗄️ 创建数据库表..."
python create_tables.py

# 测试后端服务
echo "🧪 测试后端服务..."
python test_simple.py

cd ..

echo "✅ 开发环境准备完成!"
echo ""
echo "启动命令:"
echo "  前端: npm run dev"
echo "  后端: cd backend && python main.py"
echo ""
echo "访问地址:"
echo "  前端: http://localhost:3000"
echo "  后端: http://localhost:8000"
echo "  API文档: http://localhost:8000/docs"
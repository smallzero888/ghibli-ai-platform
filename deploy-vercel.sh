#!/bin/bash

# Ghibli AI 图片生成器 - Vercel 部署脚本
echo "🚀 开始部署 Ghibli AI 图片生成器到 Vercel..."

# 检查是否已安装 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装。正在安装..."
    npm install -g vercel
fi

# 检查是否已登录 Vercel
echo "🔍 检查 Vercel 登录状态..."
vercel whoami || {
    echo "❌ 您尚未登录 Vercel。正在打开登录页面..."
    vercel login
}

# 检查项目是否已初始化 Git
if [ ! -d .git ]; then
    echo "❌ 项目未初始化 Git。正在初始化..."
    git init
    git add .
    git commit -m "初始提交"
    echo "✅ Git 初始化完成"
fi

# 检查是否已连接到远程仓库
if [ -z "$(git remote get-url origin 2>/dev/null)" ]; then
    echo "❌ 项目未连接到远程仓库。"
    echo "请先将项目推送到 GitHub 仓库，然后重新运行此脚本。"
    echo "1. 在 GitHub 创建新仓库"
    echo "2. 运行以下命令（替换 YOUR_USERNAME 和 YOUR_REPO）："
    echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    exit 1
fi

# 推送最新代码到 GitHub
echo "📤 推送最新代码到 GitHub..."
git add .
git commit -m "更新代码以准备部署" || echo "✅ 没有新的更改需要提交"
git push origin main || git push origin master
echo "✅ 代码已推送到 GitHub"

# 部署到 Vercel
echo "🌐 部署到 Vercel..."
vercel --prod

echo "✅ 部署完成！"
echo ""
echo "📋 部署后检查清单："
echo "1. 在 Vercel 控制台中配置环境变量"
echo "2. 访问部署的 URL 测试基本功能"
echo "3. 测试用户注册和登录功能"
echo "4. 测试图片生成功能"
echo "5. 如果配置了支付功能，测试支付流程"
echo ""
echo "🔗 要查看部署日志，请运行：vercel logs"
echo "🔄 要回滚部署，请运行：vercel rollback"
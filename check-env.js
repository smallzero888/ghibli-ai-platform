const fs = require('fs');
const path = require('path');

// 必需的环境变量
const requiredEnvVars = [
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_JWT_SECRET'
];

// 可选的环境变量
const optionalEnvVars = [
  'OPENAI_API_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET'
];

// 检查环境变量文件
function checkEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ 环境变量文件 ${filePath} 不存在`);
    return false;
  }

  const envContent = fs.readFileSync(filePath, 'utf8');
  const envLines = envContent.split('\n');
  const envVars = {};

  envLines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  console.log(`\n📋 检查环境变量文件: ${filePath}`);
  
  // 检查必需的环境变量
  let missingRequired = [];
  requiredEnvVars.forEach(varName => {
    if (!envVars[varName] || envVars[varName] === '') {
      missingRequired.push(varName);
      console.log(`❌ 缺少必需的环境变量: ${varName}`);
    } else {
      console.log(`✅ 必需的环境变量已设置: ${varName}`);
    }
  });

  // 检查可选的环境变量
  optionalEnvVars.forEach(varName => {
    if (!envVars[varName] || envVars[varName] === '') {
      console.log(`⚠️ 缺少可选的环境变量: ${varName}`);
    } else {
      console.log(`✅ 可选的环境变量已设置: ${varName}`);
    }
  });

  if (missingRequired.length > 0) {
    console.log(`\n❌ 缺少 ${missingRequired.length} 个必需的环境变量`);
    return false;
  }

  console.log(`\n✅ 所有必需的环境变量都已设置`);
  return true;
}

// 检查多个环境变量文件
function checkAllEnvFiles() {
  const envFiles = ['.env', '.env.local', '.env.example'];
  let allGood = true;

  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const fileGood = checkEnvFile(file);
      if (!fileGood) {
        allGood = false;
      }
    }
  });

  return allGood;
}

// 主函数
function main() {
  console.log('🔍 检查 Ghibli AI 图片生成器的环境变量配置...\n');

  const allGood = checkAllEnvFiles();

  if (allGood) {
    console.log('\n✅ 环境变量配置检查通过！');
    console.log('\n📝 部署前请确保:');
    console.log('1. 所有必需的环境变量已在 Vercel 控制台中设置');
    console.log('2. NEXT_PUBLIC_APP_URL 已更新为您的 Vercel 部署 URL');
    console.log('3. SUPABASE_URL 和相关密钥已正确配置');
    console.log('\n🚀 您现在可以运行 deploy-vercel.sh 来部署项目');
  } else {
    console.log('\n❌ 环境变量配置检查失败！');
    console.log('\n📝 请按照以下步骤修复:');
    console.log('1. 在 .env.local 文件中设置所有必需的环境变量');
    console.log('2. 确保所有值都是正确的');
    console.log('3. 重新运行此脚本进行检查');
    console.log('\n📖 参考 DEPLOY_VERCEL_GUIDE.md 获取更多帮助');
  }
}

main();
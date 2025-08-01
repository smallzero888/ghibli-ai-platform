const https = require('https');
const { URL } = require('url');

// 测试用例
const testCases = [
  {
    name: '主页加载',
    path: '/',
    expectedStatus: 200,
    checkContent: ['Ghibli AI', 'AI-Powered', 'Start Creating']
  },
  {
    name: '登录页面',
    path: '/login',
    expectedStatus: 200,
    checkContent: ['Login', 'Email', 'Password']
  },
  {
    name: '注册页面',
    path: '/register',
    expectedStatus: 200,
    checkContent: ['Register', 'Email', 'Password', 'Confirm Password']
  },
  {
    name: '生成页面',
    path: '/generate',
    expectedStatus: 200,
    checkContent: ['Generate', 'Prompt', 'Style']
  },
  {
    name: '画廊页面',
    path: '/gallery',
    expectedStatus: 200,
    checkContent: ['Gallery', 'Artwork', 'Filter']
  },
  {
    name: '设置页面',
    path: '/settings',
    expectedStatus: 200,
    checkContent: ['Settings', 'Profile', 'Security']
  },
  {
    name: '订阅页面',
    path: '/subscription',
    expectedStatus: 200,
    checkContent: ['Subscription', 'Plan', 'Billing']
  },
  {
    name: '仪表板页面',
    path: '/dashboard',
    expectedStatus: 200,
    checkContent: ['Dashboard', 'Statistics', 'Recent Works']
  },
  {
    name: '不存在的页面',
    path: '/non-existent-page',
    expectedStatus: 404,
    checkContent: ['404', 'Not Found']
  }
];

// 执行HTTP请求
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// 检查响应内容
function checkContent(response, contentList) {
  const content = response.data.toLowerCase();
  return contentList.every(item => content.includes(item.toLowerCase()));
}

// 运行测试用例
async function runTest(baseUrl, testCase) {
  try {
    const url = new URL(testCase.path, baseUrl).toString();
    console.log(`🔍 测试: ${testCase.name} (${url})`);
    
    const response = await makeRequest(url);
    
    // 检查状态码
    if (response.status !== testCase.expectedStatus) {
      console.log(`❌ 状态码不匹配: 期望 ${testCase.expectedStatus}, 实际 ${response.status}`);
      return false;
    }
    
    // 检查内容
    if (testCase.checkContent && !checkContent(response, testCase.checkContent)) {
      console.log(`❌ 内容不匹配: 期望包含 ${testCase.checkContent.join(', ')}`);
      return false;
    }
    
    console.log(`✅ 测试通过: ${testCase.name}`);
    return true;
  } catch (error) {
    console.log(`❌ 测试失败: ${testCase.name} - ${error.message}`);
    return false;
  }
}

// 主函数
async function main() {
  const baseUrl = process.argv[2];
  
  if (!baseUrl) {
    console.log('❌ 请提供部署的 URL 作为参数');
    console.log('用法: node test-deployment.js https://your-app.vercel.app');
    process.exit(1);
  }
  
  console.log(`🧪 测试部署: ${baseUrl}\n`);
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    const passed = await runTest(baseUrl, testCase);
    if (passed) {
      passedTests++;
    }
    console.log(''); // 添加空行分隔测试结果
  }
  
  console.log(`\n📊 测试结果: ${passedTests}/${totalTests} 通过`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！部署成功！');
  } else {
    console.log('⚠️ 部分测试失败，请检查应用程序配置');
  }
  
  // 提供进一步测试建议
  console.log('\n📝 建议进行以下手动测试:');
  console.log('1. 测试用户注册和登录流程');
  console.log('2. 测试图片生成功能');
  console.log('3. 测试语言切换功能');
  console.log('4. 测试响应式设计（在移动设备上）');
  console.log('5. 如果配置了支付功能，测试支付流程');
  console.log('6. 测试错误处理和边界情况');
}

main();
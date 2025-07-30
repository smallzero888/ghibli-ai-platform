/**
 * Google OAuth 配置测试工具
 * 用于验证Google OAuth配置是否正确
 */

import { 
  isGoogleOAuthConfigured, 
  validateGoogleOAuthConfig, 
  isGoogleIdentityServicesSupported 
} from './google-oauth'

/**
 * 测试Google OAuth配置
 */
export async function testGoogleOAuthConfig() {
  console.log('🔍 正在测试Google OAuth配置...')
  
  const results = {
    configured: false,
    valid: false,
    supported: false,
    errors: [] as string[]
  }

  // 检查是否已配置
  results.configured = isGoogleOAuthConfigured()
  console.log(`✅ 已配置: ${results.configured}`)

  // 验证配置
  const validation = validateGoogleOAuthConfig()
  results.valid = validation.valid
  if (validation.error) {
    results.errors.push(validation.error)
    console.log(`❌ 配置错误: ${validation.error}`)
  } else {
    console.log('✅ 配置格式正确')
  }

  // 检查浏览器支持
  if (typeof window !== 'undefined') {
    results.supported = isGoogleIdentityServicesSupported()
    console.log(`✅ 浏览器支持: ${results.supported}`)
    
    if (!results.supported) {
      results.errors.push('Google Identity Services 未加载')
    }
  }

  // 检查环境变量
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  console.log(`📋 Client ID: ${clientId ? '已设置' : '未设置'}`)

  // 检查当前域名
  if (typeof window !== 'undefined') {
    console.log(`🌐 当前域名: ${window.location.origin}`)
  }

  return results
}

/**
 * 运行测试
 */
export function runGoogleOAuthTest() {
  if (typeof window === 'undefined') {
    console.log('⚠️ 请在浏览器环境中运行此测试')
    return
  }

  testGoogleOAuthConfig().then(results => {
    console.log('\n📊 测试结果总结:')
    console.log(`配置状态: ${results.configured ? '✅ 已配置' : '❌ 未配置'}`)
    console.log(`配置有效性: ${results.valid ? '✅ 有效' : '❌ 无效'}`)
    console.log(`浏览器支持: ${results.supported ? '✅ 支持' : '❌ 不支持'}`)
    
    if (results.errors.length > 0) {
      console.log('\n❌ 发现以下问题:')
      results.errors.forEach(error => console.log(`  - ${error}`))
    } else {
      console.log('\n✅ 所有检查通过！Google OAuth已正确配置')
    }
  })
}

// 自动运行测试（仅在开发环境）
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // 延迟执行，确保页面已加载
  setTimeout(() => {
    console.log('🚀 正在运行Google OAuth配置测试...')
    runGoogleOAuthTest()
  }, 1000)
}

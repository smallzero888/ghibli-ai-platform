/**
 * Google OAuth 配置和工具函数
 * 用于管理Google登录相关的配置和工具
 */

export interface GoogleOAuthConfig {
  clientId: string
  redirectUri: string
  scope: string[]
  prompt: string
  accessType: string
}

export const GOOGLE_OAUTH_CONFIG: GoogleOAuthConfig = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  redirectUri: typeof window !== 'undefined' 
    ? `${window.location.origin}/auth/callback`
    : '',
  scope: [
    'openid',
    'email',
    'profile',
  ],
  prompt: 'consent',
  accessType: 'offline',
}

/**
 * 检查Google OAuth配置是否完整
 */
export function isGoogleOAuthConfigured(): boolean {
  return Boolean(GOOGLE_OAUTH_CONFIG.clientId)
}

/**
 * 获取Google OAuth错误消息
 */
export function getGoogleOAuthErrorMessage(error: any): string {
  if (!error) return 'Google登录失败'

  const errorMessage = error.message || error.toString()

  // 常见错误映射
  const errorMap: Record<string, string> = {
    'popup_blocked_by_browser': '弹窗被浏览器阻止，请允许弹窗后重试',
    'popup_closed_by_user': '您关闭了登录窗口，请重试',
    'access_denied': '您取消了Google登录授权',
    'invalid_client': 'Google登录配置错误，请联系管理员',
    'network_error': '网络连接错误，请检查网络后重试',
    'server_error': 'Google服务器错误，请稍后重试',
    'user_not_found': 'Google账户未注册，请先注册',
    'invalid_token': 'Google登录凭证无效，请重试',
  }

  for (const [key, value] of Object.entries(errorMap)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }

  return errorMessage
}

/**
 * 验证Google OAuth配置
 */
export function validateGoogleOAuthConfig(): { valid: boolean; error?: string } {
  if (!GOOGLE_OAUTH_CONFIG.clientId) {
    return {
      valid: false,
      error: 'Google Client ID 未配置'
    }
  }

  if (!GOOGLE_OAUTH_CONFIG.clientId.includes('.apps.googleusercontent.com')) {
    return {
      valid: false,
      error: 'Google Client ID 格式不正确'
    }
  }

  return { valid: true }
}

/**
 * 获取Google登录URL
 */
export function getGoogleLoginUrl(): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CONFIG.clientId,
    redirect_uri: GOOGLE_OAUTH_CONFIG.redirectUri,
    scope: GOOGLE_OAUTH_CONFIG.scope.join(' '),
    response_type: 'code',
    access_type: GOOGLE_OAUTH_CONFIG.accessType,
    prompt: GOOGLE_OAUTH_CONFIG.prompt,
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/**
 * 检查浏览器是否支持Google Identity Services
 */
export function isGoogleIdentityServicesSupported(): boolean {
  return typeof window !== 'undefined' && 'google' in window
}

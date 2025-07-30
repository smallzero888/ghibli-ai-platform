'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { showToast } from '@/lib/toast'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface GoogleLoginProps {
  onClose?: () => void
  mode?: 'login' | 'register'
}

declare global {
  interface Window {
    google: any
  }
}

export function GoogleLogin({ onClose, mode = 'login' }: GoogleLoginProps) {
  const [loading, setLoading] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [scriptError, setScriptError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const supabase = createClient()
  const router = useRouter()
  const googleButtonRef = useRef<HTMLDivElement>(null)
  const maxRetries = 3

  // 清理Google Identity Services
  const cleanupGoogleServices = useCallback(() => {
    if (window.google && window.google.accounts) {
      try {
        window.google.accounts.id.cancel()
      } catch (error) {
        console.warn('Error cleaning up Google Identity Services:', error)
      }
    }
  }, [])

  // 加载Google Identity Services脚本
  const loadGoogleScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      // 检查是否已经加载
      if (window.google && window.google.accounts) {
        setScriptLoaded(true)
        resolve()
        return
      }

      // 移除已存在的脚本
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
      if (existingScript) {
        existingScript.remove()
      }

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      
      script.onload = () => {
        setScriptLoaded(true)
        setScriptError(false)
        resolve()
      }

      script.onerror = () => {
        console.error('Failed to load Google Identity Services script')
        setScriptError(true)
        reject(new Error('无法加载Google登录服务'))
      }

      document.head.appendChild(script)
    })
  }, [])

  // 初始化Google登录
  const initializeGoogleSignIn = useCallback(() => {
    if (!window.google || !googleButtonRef.current) return

    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      if (!clientId) {
        console.error('Google Client ID not configured')
        setScriptError(true)
        return
      }

      // 初始化Google Identity Services
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: true,
        prompt_parent_id: 'google-login-container',
      })

      // 渲染Google登录按钮
      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: mode === 'register' ? 'signup_with' : 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          locale: 'zh_CN',
        }
      )

      // 显示One Tap提示（可选）
      // window.google.accounts.id.prompt()
    } catch (error) {
      console.error('Failed to initialize Google Sign-In:', error)
      setScriptError(true)
    }
  }, [mode])

  // 重试加载脚本
  const handleRetry = async () => {
    if (retryCount >= maxRetries) {
      showToast.error('无法加载Google登录服务，请刷新页面重试')
      return
    }

    setRetryCount(prev => prev + 1)
    setLoading(true)
    
    try {
      await loadGoogleScript()
      initializeGoogleSignIn()
    } catch (error) {
      showToast.error(`加载失败 (${retryCount + 1}/${maxRetries})`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      try {
        await loadGoogleScript()
        if (isMounted && window.google) {
          initializeGoogleSignIn()
        }
      } catch (error) {
        if (isMounted) {
          console.error('Google login initialization failed:', error)
        }
      }
    }

    init()

    return () => {
      isMounted = false
      cleanupGoogleServices()
    }
  }, [loadGoogleScript, initializeGoogleSignIn, cleanupGoogleServices])

  // 处理Google登录响应
  const handleGoogleResponse = async (response: any) => {
    if (!response.credential) {
      showToast.error('Google登录失败：未获取到凭证')
      return
    }

    try {
      setLoading(true)
      const toastId = showToast.loading('正在验证Google账户...')

      // 使用Supabase的Google OAuth登录
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      })

      showToast.dismiss(toastId)

      if (error) {
        console.error('Supabase auth error:', error)
        
        // 提供更详细的错误信息
        let errorMessage = 'Google登录失败'
        if (error.message?.includes('user_not_found')) {
          errorMessage = 'Google账户未注册，请先注册'
        } else if (error.message?.includes('invalid_token')) {
          errorMessage = 'Google登录凭证无效，请重试'
        } else if (error.message?.includes('network')) {
          errorMessage = '网络连接错误，请检查网络后重试'
        } else {
          errorMessage = error.message || 'Google登录失败，请重试'
        }
        
        throw new Error(errorMessage)
      }

      if (data.user) {
        showToast.success(mode === 'register' ? 'Google注册成功！' : 'Google登录成功！')
        onClose?.()
        router.push('/dashboard')
        router.refresh() // 刷新页面状态
      } else {
        throw new Error('登录成功但未获取到用户信息')
      }
    } catch (error) {
      console.error('Google登录失败:', error)
      showToast.error(error instanceof Error ? error.message : 'Google登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 处理OAuth重定向登录
  const handleGoogleOAuthLogin = async () => {
    try {
      setLoading(true)
      const toastId = showToast.loading('正在跳转到Google...')

      // 保存当前页面以便返回
      const returnUrl = window.location.pathname + window.location.search
      sessionStorage.setItem('returnUrl', returnUrl)

      // 使用Supabase的OAuth重定向方式
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      showToast.dismiss(toastId)

      if (error) {
        if (error.message?.includes('popup_blocked')) {
          throw new Error('弹窗被阻止，请允许弹窗后重试')
        } else if (error.message?.includes('network')) {
          throw new Error('网络连接错误，请检查网络后重试')
        } else {
          throw error
        }
      }
    } catch (error) {
      console.error('Google OAuth登录失败:', error)
      showToast.error(error instanceof Error ? error.message : 'Google登录失败，请重试')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          使用Google账户{mode === 'register' ? '注册' : '登录'}
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          快速安全地{mode === 'register' ? '创建您的账户' : '登录您的账户'}
        </p>
      </div>

      <div id="google-login-container">
        {/* Google Identity Services按钮 */}
        {scriptLoaded && !scriptError && (
          <div className="space-y-4">
            <div 
              ref={googleButtonRef} 
              className="w-full flex justify-center"
              style={{ minHeight: '44px' }}
            />
            
            {/* 分隔线 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">或</span>
              </div>
            </div>
          </div>
        )}

        {/* 错误状态 */}
        {scriptError && (
          <div className="text-center py-4">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">无法加载Google登录服务</p>
            </div>
            <Button
              onClick={handleRetry}
              disabled={loading || retryCount >= maxRetries}
              variant="outline"
              size="sm"
            >
              {loading ? '重试中...' : `重试 (${retryCount}/${maxRetries})`}
            </Button>
          </div>
        )}

        {/* 加载状态 */}
        {!scriptLoaded && !scriptError && (
          <div className="text-center py-4">
            <div className="w-6 h-6 border-2 border-ghibli-green border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">正在加载Google登录服务...</p>
          </div>
        )}
      </div>

      {/* OAuth重定向按钮 */}
      <Button
        onClick={handleGoogleOAuthLogin}
        disabled={loading}
        variant="outline"
        className="w-full flex items-center justify-center gap-3 py-3 hover:bg-gray-50 transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            处理中...
          </>
        ) : (
          `通过Google重定向${mode === 'register' ? '注册' : '登录'}`
        )}
      </Button>

      {onClose && (
        <Button
          onClick={onClose}
          variant="ghost"
          className="w-full mt-4"
        >
          取消
        </Button>
      )}
    </div>
  )
}

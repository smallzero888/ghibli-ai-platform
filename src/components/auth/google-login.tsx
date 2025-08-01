'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { showToast } from '@/lib/toast'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface GoogleLoginProps {
  onClose?: () => void
  mode?: 'login' | 'register'
}

export function GoogleLogin({ onClose, mode = 'login' }: GoogleLoginProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  // 处理OAuth重定向登录
  const handleGoogleOAuthLogin = useCallback(async () => {
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
          redirectTo: 'https://wqzjtjcrjvgspalihvqw.supabase.co/auth/v1/callback?redirect_to=' + encodeURIComponent(`${window.location.origin}/auth/callback`),
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
  }, [supabase, router, mode, onClose])

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          使用Google账户{mode === 'register' ? '注册' : '登录'}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          快速安全地{mode === 'register' ? '创建您的账户' : '登录您的账户'}
        </p>
      </div>

      <Button
        onClick={handleGoogleOAuthLogin}
        disabled={loading}
        variant="outline"
        className="w-full flex items-center justify-center gap-3 py-3 hover:bg-gray-50 transition-colors border-gray-300"
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
          `通过Google${mode === 'register' ? '注册' : '登录'}`
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

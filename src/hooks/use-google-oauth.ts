import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { showToast } from '@/lib/toast'
import { useRouter } from 'next/navigation'
import { getGoogleOAuthErrorMessage } from '@/lib/google-oauth'

interface UseGoogleOAuthOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
  redirectTo?: string
}

interface UseGoogleOAuthReturn {
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithGooglePopup: () => Promise<void>
  error: string | null
}

/**
 * Google OAuth Hook
 * 用于简化Google登录集成
 */
export function useGoogleOAuth(options: UseGoogleOAuthOptions = {}): UseGoogleOAuthReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const { onSuccess, onError, redirectTo = '/dashboard' } = options

  /**
   * 使用重定向模式登录
   */
  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // 保存当前页面以便返回
      const returnUrl = window.location.pathname + window.location.search
      sessionStorage.setItem('returnUrl', returnUrl)

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

      if (error) {
        throw error
      }
    } catch (err) {
      const message = getGoogleOAuthErrorMessage(err)
      setError(message)
      showToast.error(message)
      onError?.(err as Error)
    } finally {
      setLoading(false)
    }
  }, [supabase.auth, onError, redirectTo])

  /**
   * 使用弹窗模式登录（需要Google Identity Services）
   */
  const signInWithGooglePopup = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // 检查Google Identity Services是否可用
      if (!window.google?.accounts?.id) {
        throw new Error('Google Identity Services 未加载')
      }

      // 使用Google Identity Services
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        callback: async (response: any) => {
          try {
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: 'google',
              token: response.credential,
            })

            if (error) {
              throw error
            }

            if (data.user) {
              showToast.success('Google登录成功！')
              onSuccess?.()
              router.push(redirectTo)
              router.refresh()
            }
          } catch (err) {
            const message = getGoogleOAuthErrorMessage(err)
            setError(message)
            showToast.error(message)
            onError?.(err as Error)
          } finally {
            setLoading(false)
          }
        },
      })

      // 触发登录
      window.google.accounts.id.prompt()
    } catch (err) {
      const message = getGoogleOAuthErrorMessage(err)
      setError(message)
      showToast.error(message)
      onError?.(err as Error)
      setLoading(false)
    }
  }, [supabase.auth, onSuccess, onError, redirectTo, router])

  return {
    loading,
    signInWithGoogle,
    signInWithGooglePopup,
    error,
  }
}

/**
 * 检查Google OAuth是否已配置
 */
export function useGoogleOAuthStatus() {
  const [configured, setConfigured] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkConfig = () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      setConfigured(Boolean(clientId))
      setLoading(false)
    }

    checkConfig()
  }, [])

  return { configured, loading }
}

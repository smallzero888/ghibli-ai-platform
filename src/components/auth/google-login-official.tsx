'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { showToast } from '@/lib/toast'
import { useRouter } from 'next/navigation'

interface GoogleLoginOfficialProps {
  mode?: 'login' | 'register'
  onSuccess?: () => void
  onClose?: () => void
}

// 声明全局类型
declare global {
  interface Window {
    google?: any
  }
}

/**
 * 官方Google登录按钮组件
 * 遵循Google Identity Services最佳实践
 */
export function GoogleLoginOfficial({ mode = 'login', onSuccess, onClose }: GoogleLoginOfficialProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // 加载Google Identity Services
    const loadGoogleScript = () => {
      if (document.getElementById('google-identity-services')) return

      const script = document.createElement('script')
      script.id = 'google-identity-services'
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    loadGoogleScript()

    return () => {
      // 清理Google Identity Services
      const script = document.getElementById('google-identity-services')
      if (script) {
        script.remove()
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.google || !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return

    // 初始化Google Identity Services
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      context: mode === 'register' ? 'signup' : 'signin',
      ux_mode: 'popup',
      auto_select: false,
      cancel_on_tap_outside: true,
    })

    // 渲染Google登录按钮
    const buttonContainer = document.getElementById('google-signin-button')
    if (buttonContainer) {
      window.google.accounts.id.renderButton(
        buttonContainer,
        {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: mode === 'register' ? 'signup_with' : 'signin_with',
          shape: 'rect',
          logo_alignment: 'left',
          width: '100%',
          locale: 'zh-CN',
        }
      )
    }

    // 显示One Tap提示
    window.google.accounts.id.prompt()
  }, [mode])

  const handleCredentialResponse = async (response: any) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        showToast.success(mode === 'register' ? 'Google注册成功！' : 'Google登录成功！')
        onSuccess?.()
        router.push('/dashboard')
        router.refresh()
        onClose?.()
      }
    } catch (err) {
      console.error('Google登录失败:', err)
      showToast.error('Google登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600">Google OAuth未配置</p>
        <p className="text-sm text-gray-600 mt-2">
          请设置 NEXT_PUBLIC_GOOGLE_CLIENT_ID 环境变量
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div id="google-signin-button" className="w-full"></div>
      {loading && (
        <div className="text-center mt-4">
          <div className="inline-block w-6 h-6 border-2 border-ghibli-green border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600 mt-2">正在处理...</p>
        </div>
      )}
    </div>
  )
}

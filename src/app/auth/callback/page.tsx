'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { showToast } from '@/lib/toast'
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // 检查URL中的错误参数
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        if (error) {
          console.error('OAuth error:', error, errorDescription)
          setStatus('error')
          
          let message = '登录失败'
          switch (error) {
            case 'access_denied':
              message = '您取消了Google登录授权'
              break
            case 'invalid_request':
              message = '无效的登录请求'
              break
            case 'server_error':
              message = 'Google服务器错误，请稍后重试'
              break
            case 'temporarily_unavailable':
              message = 'Google服务暂时不可用，请稍后重试'
              break
            default:
              message = errorDescription || '登录过程中发生错误'
          }
          
          setErrorMessage(message)
          showToast.error(message)
          
          // 延迟跳转，让用户看到错误信息
          setTimeout(() => {
            router.push('/login')
          }, 3000)
          return
        }

        // 处理URL中的hash参数（包含access_token等）
        const hash = window.location.hash
        if (hash) {
          // 解析hash参数
          const params = new URLSearchParams(hash.substring(1))
          const accessToken = params.get('access_token')
          const refreshToken = params.get('refresh_token')
          
          if (accessToken && refreshToken) {
            // 设置会话
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })
            
            if (sessionError) {
              console.error('Session error:', sessionError)
              setStatus('error')
              setErrorMessage('设置会话失败，请重试')
              showToast.error('设置会话失败，请重试')
              
              setTimeout(() => {
                router.push('/login')
              }, 3000)
              return
            }

            if (data.session) {
              // 同步用户信息到数据库
              try {
                const syncResponse = await fetch('/api/auth/sync-google-user', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    user: data.session.user,
                    session: data.session
                  }),
                })

                if (!syncResponse.ok) {
                  console.warn('Failed to sync user data, but login successful')
                }
              } catch (syncError) {
                console.warn('User sync error:', syncError)
                // 继续登录流程，同步失败不影响登录
              }

              setStatus('success')
              showToast.success('Google登录成功！')
              
              // 获取返回URL
              const returnUrl = sessionStorage.getItem('returnUrl') || '/dashboard'
              sessionStorage.removeItem('returnUrl')
              
              setTimeout(() => {
                router.push(returnUrl)
                router.refresh()
              }, 1500)
              return
            }
          }
        }

        // 检查URL中的code参数（Supabase OAuth回调）
        const code = searchParams.get('code')
        if (code) {
          // 使用code交换session
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError)
            setStatus('error')
            setErrorMessage('交换认证信息失败，请重试')
            showToast.error('交换认证信息失败，请重试')
            
            setTimeout(() => {
              router.push('/login')
            }, 3000)
            return
          }

          if (data.session) {
            // 同步用户信息到数据库
            try {
              const syncResponse = await fetch('/api/auth/sync-google-user', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  user: data.session.user,
                  session: data.session
                }),
              })

              if (!syncResponse.ok) {
                console.warn('Failed to sync user data, but login successful')
              }
            } catch (syncError) {
              console.warn('User sync error:', syncError)
              // 继续登录流程，同步失败不影响登录
            }

            setStatus('success')
            showToast.success('Google登录成功！')
            
            // 获取返回URL
            const returnUrl = sessionStorage.getItem('returnUrl') || '/dashboard'
            sessionStorage.removeItem('returnUrl')
            
            setTimeout(() => {
              router.push(returnUrl)
              router.refresh()
            }, 1500)
            return
          }
        }

        // 如果没有hash参数和code参数，尝试获取当前会话
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setStatus('error')
          setErrorMessage('获取会话失败，请重试')
          showToast.error('获取会话失败，请重试')
          
          setTimeout(() => {
            router.push('/login')
          }, 3000)
          return
        }

        if (session) {
          // 同步用户信息到数据库
          try {
            const syncResponse = await fetch('/api/auth/sync-google-user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user: session.user,
                session: session
              }),
            })

            if (!syncResponse.ok) {
              console.warn('Failed to sync user data, but login successful')
            }
          } catch (syncError) {
            console.warn('User sync error:', syncError)
            // 继续登录流程，同步失败不影响登录
          }

          setStatus('success')
          showToast.success('Google登录成功！')
          
          // 获取返回URL
          const returnUrl = sessionStorage.getItem('returnUrl') || '/dashboard'
          sessionStorage.removeItem('returnUrl')
          
          setTimeout(() => {
            router.push(returnUrl)
            router.refresh()
          }, 1500)
        } else {
          // 没有会话，可能是首次登录或需要注册
          const { data: { user } } = await supabase.auth.getUser()
          
          if (user) {
            // 用户已登录但可能需要完善信息
            setStatus('success')
            showToast.success('登录成功！')
            
            setTimeout(() => {
              router.push('/dashboard')
              router.refresh()
            }, 1500)
          } else {
            setStatus('error')
            setErrorMessage('登录失败，请重试')
            showToast.error('登录失败，请重试')
            
            setTimeout(() => {
              router.push('/login')
            }, 3000)
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setErrorMessage('系统错误，请稍后重试')
        showToast.error('系统错误，请稍后重试')
        
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [router, searchParams, supabase.auth])

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="w-16 h-16 bg-ghibli-green rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )
      case 'success':
        return (
          <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
        )
      case 'error':
        return (
          <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-white" />
          </div>
        )
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'loading':
        return {
          title: '正在处理登录...',
          description: '请稍候，我们正在验证您的Google账户'
        }
      case 'success':
        return {
          title: '登录成功！',
          description: '正在为您跳转到主页...'
        }
      case 'error':
        return {
          title: '登录失败',
          description: errorMessage || '登录过程中发生错误'
        }
    }
  }

  const statusInfo = getStatusMessage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-ghibli-cream via-ghibli-green/10 to-ghibli-blue/10 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {getStatusIcon()}
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">{statusInfo.title}</h2>
        <p className="text-gray-600 mb-6">{statusInfo.description}</p>
        
        {status === 'error' && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
            
            <Button
              onClick={() => router.push('/login')}
              variant="outline"
              className="w-full"
            >
              返回登录页面
            </Button>
          </div>
        )}

        {status === 'loading' && (
          <div className="space-y-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-ghibli-green h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <p className="text-sm text-gray-500">正在验证您的身份...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-ghibli-cream via-ghibli-green/10 to-ghibli-blue/10 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-ghibli-green rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">正在处理登录...</h2>
          <p className="text-gray-600 mb-6">请稍候，我们正在验证您的Google账户</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-ghibli-green h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}

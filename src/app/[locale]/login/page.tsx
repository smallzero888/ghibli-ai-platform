'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/hooks/use-i18n'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { showToast } from '@/lib/toast'
import { GoogleLogin } from '@/components/auth/google-login'

export default function LoginPage({ params }: { params: { locale: string } }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const { signIn } = useAuth()
  const router = useRouter()
  const { locale, auth } = useI18n()
  const { t } = useI18n()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Loading...</div>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || !password.trim()) {
      showToast.error(t.auth?.emailRequired || '请填写完整的登录信息')
      return
    }

    setLoading(true)
    const toastId = showToast.loading(t.auth?.loggingIn || '正在登录...')

    try {
      await signIn(email, password)
      showToast.dismiss(toastId)
      showToast.success(t.auth?.loginSuccess || '登录成功！')
      router.push(`/${locale}/dashboard`)
    } catch (err) {
      showToast.dismiss(toastId)
      showToast.error(err instanceof Error ? err.message : t.auth?.loginFailed || '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ghibli-cream via-ghibli-green/10 to-ghibli-blue/10 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-ghibli-green rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">AI</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t.auth?.welcomeBack || '欢迎回来'}
          </h1>
          <p className="text-gray-600">
            {t.auth?.loginSubtitle || '登录您的账户继续创作精美作品'}
          </p>
        </div>

        <div className="card bg-white/80 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t.auth?.email || '邮箱地址'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  required
                  className="input-field pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.auth?.emailPlaceholder || 'you@example.com'}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t.auth?.password || '密码'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input-field pl-10 pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.auth?.passwordPlaceholder || '请输入密码'}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-ghibli-green focus:ring-ghibli-green" />
                <span className="ml-2 text-sm text-gray-600">
                  {t.auth?.rememberMe || '记住我'}
                </span>
              </label>
              <Link href={`/${locale}/forgot-password`} className="text-sm text-ghibli-green hover:underline">
                {t.auth?.forgotPassword || '忘记密码？'}
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {t.auth?.loggingIn || '登录中...'}
                </>
              ) : (
                t.auth?.login || '登录'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t.auth?.noAccount || '还没有账户？'}{' '}
              <Link href={`/${locale}/register`} className="text-ghibli-green hover:text-ghibli-green/80 font-medium">
                {t.auth?.register || '立即注册'}
              </Link>
            </p>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {t.auth?.or || '或'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <GoogleLogin mode="login" />
          </div>
        </div>
      </div>
    </div>
  )
}
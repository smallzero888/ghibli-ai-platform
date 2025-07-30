'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/hooks/use-i18n'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { showToast } from '@/lib/toast'
import { GoogleLogin } from '@/components/auth/google-login'

export default function RegisterPage({ params }: { params: { locale: string } }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { signUp } = useAuth()
  const router = useRouter()
  const { locale, t } = useI18n()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || !password.trim() || !username.trim()) {
      showToast.error(t.auth?.fillAllFields || '请填写完整的注册信息')
      return
    }

    if (password !== confirmPassword) {
      showToast.error(t.auth?.passwordMismatch || '两次输入的密码不一致')
      return
    }

    if (password.length < 6) {
      showToast.error(t.auth?.passwordTooShort || '密码长度至少为6位')
      return
    }

    setLoading(true)
    const toastId = showToast.loading(t.auth?.registering || '正在注册...')

    try {
      await signUp(email, password)
      showToast.dismiss(toastId)
      showToast.success(t.auth?.registerSuccess || '注册成功！请登录')
      router.push(`/${locale}/login`)
    } catch (err) {
      showToast.dismiss(toastId)
      showToast.error(err instanceof Error ? err.message : t.auth?.registerFailed || '注册失败，请重试')
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
            {t.auth?.createAccount || '创建账户'}
          </h1>
          <p className="text-gray-600">
            {t.auth?.registerSubtitle || '开始您的AI艺术创作之旅'}
          </p>
        </div>

        <div className="card bg-white/80 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                {t.auth?.username || '用户名'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="username"
                  type="text"
                  required
                  className="input-field pl-10"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t.auth?.usernamePlaceholder || '请输入用户名'}
                />
              </div>
            </div>

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
                  placeholder={t.auth?.passwordPlaceholder || '请输入密码（至少6位）'}
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {t.auth?.confirmPassword || '确认密码'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="input-field pl-10 pr-12"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.auth?.confirmPasswordPlaceholder || '请再次输入密码'}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="agree"
                type="checkbox"
                required
                className="rounded border-gray-300 text-ghibli-green focus:ring-ghibli-green"
              />
              <label htmlFor="agree" className="ml-2 text-sm text-gray-600">
                {t.auth?.agreeTerms || '我同意'}<a href="#" className="text-ghibli-green hover:underline">{t.auth?.termsOfService || '服务条款'}</a>{t.auth?.and || '和'}<a href="#" className="text-ghibli-green hover:underline">{t.auth?.privacyPolicy || '隐私政策'}</a>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {t.auth?.registering || '注册中...'}
                </>
              ) : (
                t.auth?.register || '注册'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t.auth?.hasAccount || '已有账户？'}{' '}
              <Link href={`/${locale}/login`} className="text-ghibli-green hover:text-ghibli-green/80 font-medium">
                {t.auth?.login || '立即登录'}
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
            <GoogleLogin mode="register" />
          </div>
        </div>
      </div>
    </div>
  )
}
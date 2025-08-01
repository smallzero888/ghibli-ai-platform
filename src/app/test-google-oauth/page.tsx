'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { GoogleLogin } from '@/components/auth/google-login'
import { useRouter } from 'next/navigation'
import { showToast } from '@/lib/toast'

export default function TestGoogleOAuthPage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const testConfiguration = async () => {
    setLoading(true)
    try {
      // 测试环境变量
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      
      const results = {
        environment: {
          clientId: clientId ? '✅ 已配置' : '❌ 未配置',
          supabaseUrl: supabaseUrl ? '✅ 已配置' : '❌ 未配置',
        },
        browser: {
          supportsGoogle: typeof window !== 'undefined' && 'google' in window ? '✅ 支持' : '❌ 不支持',
          origin: typeof window !== 'undefined' ? window.location.origin : 'N/A'
        }
      }
      
      setTestResults(results)
      
      if (clientId && supabaseUrl) {
        showToast.success('配置检查完成')
      } else {
        showToast.error('配置不完整，请检查环境变量')
      }
    } catch (error) {
      showToast.error('测试失败')
      console.error('Test error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testConfiguration()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-ghibli-cream via-ghibli-green/10 to-ghibli-blue/10 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Google OAuth 测试页面</h1>
          <p className="text-gray-600">测试Google登录功能是否正常工作</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 space-y-6">
          {/* 测试结果 */}
          {testResults && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">配置检查结果</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">环境配置</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Google Client ID:</span>
                      <span>{testResults.environment.clientId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Supabase URL:</span>
                      <span>{testResults.environment.supabaseUrl}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">浏览器支持</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Google Services:</span>
                      <span>{testResults.browser.supportsGoogle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>当前域名:</span>
                      <span className="truncate">{testResults.browser.origin}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Google登录测试 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Google登录测试</h2>
            <GoogleLogin mode="login" />
          </div>

          {/* 重新测试按钮 */}
          <div className="text-center">
            <Button 
              onClick={testConfiguration} 
              disabled={loading}
              variant="outline"
            >
              {loading ? '测试中...' : '重新测试配置'}
            </Button>
          </div>
        </div>

        <div className="text-center">
          <Button 
            onClick={() => router.push('/')}
            variant="ghost"
          >
            返回首页
          </Button>
        </div>
      </div>
    </div>
  )
}

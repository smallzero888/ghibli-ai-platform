'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Header } from '@/components/layout/header'
import { GenerationForm } from '@/components/generate/generation-form'
import { GenerationResult } from '@/components/generate/generation-result'
import { HistoryPanel } from '@/components/generate/history-panel'
import { UserPreferences } from '@/components/settings/user-preferences'
import { GenerationTask } from '@/types'
import { useI18n } from '@/lib/i18n'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutGrid, History, Settings, Palette, CreditCard, User } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { showToast } from '@/lib/toast'

export default function DashboardPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const { syncGoogleUserToBackend, credits, subscription_tier } = useAuthStore()
  const [currentTask, setCurrentTask] = useState<GenerationTask | null>(null)
  const [activeTab, setActiveTab] = useState('generate')
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    // 检查是否是Google用户登录后重定向
    const checkGoogleLogin = async () => {
      if (user && user.app_metadata?.provider === 'google') {
        setSyncing(true)
        try {
          await syncGoogleUserToBackend(user)
          showToast.success('Google账户已成功同步！')
          
          // 如果是首次登录，显示欢迎消息
          const isNewUser = localStorage.getItem(`new-google-user-${user.id}`)
          if (!isNewUser) {
            localStorage.setItem(`new-google-user-${user.id}`, 'true')
            showToast.success(`欢迎，${user.user_metadata?.full_name || user.user_metadata?.name || user.email}！您已获得10个免费积分。`)
          }
        } catch (error) {
          console.error('Error syncing Google user:', error)
          showToast.error('同步Google账户时出错，请重试')
        } finally {
          setSyncing(false)
        }
      }
      setLoading(false)
    }

    checkGoogleLogin()
  }, [user, syncGoogleUserToBackend])

  // 获取用户显示名称
  const getDisplayName = () => {
    if (!user) return ''
    
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    
    if (user.user_metadata?.name) {
      return user.user_metadata.name
    }
    
    return user.email?.split('@')[0] || ''
  }

  // 获取订阅类型显示名称
  const getSubscriptionDisplay = () => {
    switch (subscription_tier) {
      case 'free': return '免费版'
      case 'pro': return '专业版'
      case 'enterprise': return '企业版'
      default: return '免费版'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ghibli-cream">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 border-4 border-ghibli-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载用户信息...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-ghibli-cream">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('auth.login.title')}
          </h1>
          <p className="text-gray-600 mb-8">
            您需要登录后才能访问仪表板
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ghibli-cream">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 用户信息卡片 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-ghibli-green rounded-full flex items-center justify-center text-white text-xl font-bold">
                {getDisplayName().charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  欢迎回来，{getDisplayName()}！
                </h1>
                <p className="text-gray-600">
                  {user.app_metadata?.provider === 'google' ? '通过Google登录' : '通过邮箱登录'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="flex items-center justify-center text-ghibli-green mb-1">
                  <CreditCard className="w-5 h-5 mr-1" />
                  <span className="text-lg font-semibold">{credits}</span>
                </div>
                <p className="text-sm text-gray-600">剩余积分</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center text-ghibli-green mb-1">
                  <User className="w-5 h-5 mr-1" />
                  <span className="text-lg font-semibold">{getSubscriptionDisplay()}</span>
                </div>
                <p className="text-sm text-gray-600">订阅类型</p>
              </div>
            </div>
          </div>
          
          {syncing && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              <p className="text-sm text-blue-700">正在同步您的Google账户信息...</p>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span>生成</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span>历史</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span>设置</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <GenerationForm onTaskCreated={setCurrentTask} />
              </div>
              <div>
                <GenerationResult task={currentTask} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <HistoryPanel userId={user.id} />
          </TabsContent>

          <TabsContent value="settings">
            <UserPreferences />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
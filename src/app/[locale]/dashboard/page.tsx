'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RecentWorks } from '@/components/dashboard/recent-works'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { Image as ImageType } from '@/types'
import { apiClient } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { 
  User, 
  Crown, 
  Zap, 
  TrendingUp,
  Calendar,
  Award,
  Target,
  Lightbulb
} from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '@/hooks/use-i18n'

export default function DashboardPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const [images, setImages] = useState<ImageType[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalImages: 0,
    thisMonth: 0,
    publicImages: 0,
    totalLikes: 0,
    totalViews: 0,
    storageUsed: 0,
    creditsLeft: 100,
  })

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getUserImages()
      if (response.data) {
        const imageData = response.data.data
        setImages(imageData)
        
        // Calculate stats
        const now = new Date()
        const thisMonthImages = imageData.filter(img => {
          const createdDate = new Date(img.created_at)
          return createdDate.getMonth() === now.getMonth() && 
                 createdDate.getFullYear() === now.getFullYear()
        })

        setStats({
          totalImages: response.data.total,
          thisMonth: thisMonthImages.length,
          publicImages: imageData.filter(img => img.is_public).length,
          totalLikes: imageData.reduce((sum, img) => sum + (img.likes_count || 0), 0),
          totalViews: imageData.reduce((sum, img) => sum + (img.views_count || 0), 0),
          storageUsed: imageData.length * 2 * 1024 * 1024, // Estimate 2MB per image
          creditsLeft: 100 - (thisMonthImages.length * 2), // Estimate 2 credits per generation
        })
      }
    } catch (error) {
      console.error('加载Dashboard数据失败:', error)
      showToast.error(t('dashboard.messages.loadError'))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (confirm(t('dashboard.messages.deleteConfirm'))) {
      try {
        await apiClient.deleteImage(imageId)
        setImages(images.filter(img => img.id !== imageId))
        setStats(prev => ({
          ...prev,
          totalImages: prev.totalImages - 1,
          publicImages: prev.publicImages - (images.find(img => img.id === imageId)?.is_public ? 1 : 0)
        }))
        showToast.success(t('dashboard.messages.deleteSuccess'))
      } catch (error) {
        console.error('删除图片失败:', error)
        showToast.error(t('dashboard.messages.deleteError'))
      }
    }
  }

  const handleToggleVisibility = async (imageId: string, isPublic: boolean) => {
    try {
      await apiClient.updateImage(imageId, { is_public: !isPublic })
      setImages(images.map(img => 
        img.id === imageId ? { ...img, is_public: !isPublic } : img
      ))
      setStats(prev => ({
        ...prev,
        publicImages: prev.publicImages + (isPublic ? -1 : 1)
      }))
      showToast.success(isPublic ? t('dashboard.messages.setPrivate') : t('dashboard.messages.setPublic'))
    } catch (error) {
      console.error('更新图片可见性失败:', error)
      showToast.error(t('dashboard.messages.updateError'))
    }
  }

  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      showToast.success(t('dashboard.messages.downloadStart'))
    } catch (error) {
      console.error('下载失败:', error)
      showToast.error(t('dashboard.messages.downloadError'))
    }
  }

  const handleShare = async (image: ImageType) => {
    try {
      const response = await apiClient.shareImage(image.id)
      if (response.data) {
        await navigator.clipboard.writeText(response.data.share_url)
        showToast.success(t('dashboard.messages.shareSuccess'))
      }
    } catch (error) {
      console.error('分享失败:', error)
      showToast.error(t('dashboard.messages.shareError'))
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-ghibli-cream flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <User className="w-12 h-12 text-ghibli-green mx-auto mb-4" />
            <CardTitle className="text-2xl">{t('dashboard.loginRequired')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {t('dashboard.loginDesc')}
            </p>
            <Link href="/login">
              <Button className="w-full">
                {t('dashboard.goLogin')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ghibli-cream">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('dashboard.title')}
              </h1>
              <p className="text-gray-600">
                {t('dashboard.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-ghibli-gold/20 to-ghibli-orange/20 rounded-lg">
                <Crown className="h-4 w-4 text-ghibli-gold" />
                <span className="text-sm font-medium">Free Plan</span>
              </div>
              <Link href="/generate">
                <Button>
                  <Zap className="w-4 h-4 mr-2" />
                  {t('dashboard.quickActions.createNew')}
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Welcome Message */}
          <div className="bg-gradient-to-r from-ghibli-green/10 to-ghibli-blue/10 rounded-lg p-6 border border-ghibli-green/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-ghibli-green to-ghibli-blue rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('dashboard.welcome', { name: user.full_name || user.username || user.email })}
                </h2>
                <p className="text-gray-600">
                  继续您的创作之旅，探索无限可能
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <StatsCards stats={stats} loading={loading} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions & Recent Works */}
          <div className="lg:col-span-2 space-y-8">
            <QuickActions />
            <RecentWorks 
              images={images}
              loading={loading}
              onDelete={handleDeleteImage}
              onToggleVisibility={handleToggleVisibility}
              onDownload={handleDownload}
              onShare={handleShare}
            />
          </div>

          {/* Right Column - Activity & Insights */}
          <div className="space-y-8">
            <ActivityFeed loading={loading} />
            
            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-ghibli-gold" />
                  {t('dashboard.achievements.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-ghibli-green/10 rounded-lg">
                    <div className="w-8 h-8 bg-ghibli-green rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-xs font-medium text-ghibli-green">
                      {t('dashboard.achievements.firstGeneration')}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-100 rounded-lg opacity-50">
                    <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Target className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="text-xs font-medium text-gray-500">
                      {t('dashboard.achievements.tenGenerations')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-ghibli-blue" />
                  {t('dashboard.insights.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('dashboard.insights.mostUsedStyle')}</span>
                  <span className="text-sm font-medium">经典吉卜力</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('dashboard.insights.creationTrend')}</span>
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    <span className="text-sm font-medium">+12%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('dashboard.insights.popularTimes')}</span>
                  <span className="text-sm font-medium">晚上 8-10点</span>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  创作小贴士
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-ghibli-green rounded-full mt-2 flex-shrink-0"></div>
                    <p>详细的提示词能帮助AI更好地理解您的创意</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-ghibli-blue rounded-full mt-2 flex-shrink-0"></div>
                    <p>尝试不同的艺术风格来获得独特的效果</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-ghibli-gold rounded-full mt-2 flex-shrink-0"></div>
                    <p>分享您的作品到社区获得更多灵感</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
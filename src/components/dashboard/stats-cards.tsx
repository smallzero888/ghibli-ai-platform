'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  Eye, 
  Heart, 
  HardDrive,
  Coins,
  BarChart3
} from 'lucide-react'
import { useI18n } from '@/hooks/use-i18n'

interface StatsData {
  totalImages: number
  thisMonth: number
  publicImages: number
  totalLikes: number
  totalViews?: number
  storageUsed?: number
  storageLimit?: number
  creditsLeft?: number
  creditsLimit?: number
  apiCallsUsed?: number
  apiCallsLimit?: number
  plan?: 'free' | 'pro' | 'enterprise'
}

interface StatsCardsProps {
  stats: StatsData
  loading?: boolean
}

export function StatsCards({ stats, loading = false }: StatsCardsProps) {
  const { t } = useI18n()

  const statsConfig = [
    {
      title: t('dashboard.stats.totalWorks'),
      value: stats.totalImages,
      icon: Sparkles,
      color: 'text-ghibli-green',
      bgColor: 'bg-ghibli-green/10',
      trend: '+12%',
      trendUp: true
    },
    {
      title: t('dashboard.stats.thisMonth'),
      value: stats.thisMonth,
      icon: Calendar,
      color: 'text-ghibli-blue',
      bgColor: 'bg-ghibli-blue/10',
      trend: '+8%',
      trendUp: true
    },
    {
      title: t('dashboard.stats.publicWorks'),
      value: stats.publicImages,
      icon: Eye,
      color: 'text-ghibli-gold',
      bgColor: 'bg-ghibli-gold/10',
      trend: '+5%',
      trendUp: true
    },
    {
      title: t('dashboard.stats.totalLikes'),
      value: stats.totalLikes,
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      trend: '+15%',
      trendUp: true
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-12"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value.toLocaleString()}
                </div>
                <Badge 
                  variant={stat.trendUp ? 'success' : 'warning'}
                  className="text-xs"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )
      })}
      
      {/* Additional stats if available */}
      {stats.storageUsed !== undefined && stats.storageLimit !== undefined && (
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('dashboard.stats.storageUsed')}
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-50">
              <HardDrive className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500 mb-2">
              {(stats.storageUsed / 1024 / 1024).toFixed(1)} MB
            </div>
            <Progress value={(stats.storageUsed / stats.storageLimit) * 100} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">
              of {(stats.storageLimit / 1024 / 1024).toFixed(0)} MB used
            </p>
          </CardContent>
        </Card>
      )}
      
      {stats.creditsLeft !== undefined && stats.creditsLimit !== undefined && (
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('dashboard.stats.creditsLeft')}
            </CardTitle>
            <div className="p-2 rounded-lg bg-orange-50">
              <Coins className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {stats.creditsLeft}
            </div>
            <Progress value={(stats.creditsLeft / stats.creditsLimit) * 100} className="h-2 mt-2" />
            <p className="text-xs text-gray-500 mt-1">
              of {stats.creditsLimit} credits remaining
            </p>
          </CardContent>
        </Card>
      )}
      
      {stats.apiCallsUsed !== undefined && stats.apiCallsLimit !== undefined && (
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('dashboard.stats.apiCalls')}
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-50">
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {stats.apiCallsUsed}
            </div>
            <Progress value={(stats.apiCallsUsed / stats.apiCallsLimit) * 100} className="h-2 mt-2" />
            <p className="text-xs text-gray-500 mt-1">
              of {stats.apiCallsLimit} API calls used
            </p>
          </CardContent>
        </Card>
      )}
      
      {stats.plan && (
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('dashboard.stats.currentPlan')}
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-50">
              <Coins className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500 capitalize">
              {stats.plan}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.plan === 'free' ? 'Upgrade for more features' : 'Active subscription'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
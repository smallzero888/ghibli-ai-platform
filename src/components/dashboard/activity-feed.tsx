'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  Sparkles, 
  Heart, 
  Share2, 
  MessageCircle, 
  UserPlus,
  Clock
} from 'lucide-react'
import { useI18n } from '@/hooks/use-i18n'

interface ActivityItem {
  id: string
  type: 'generated' | 'liked' | 'shared' | 'commented' | 'followed'
  title: string
  description?: string
  timestamp: string
  metadata?: {
    imageUrl?: string
    userName?: string
    count?: number
  }
}

interface ActivityFeedProps {
  activities?: ActivityItem[]
  loading?: boolean
}

export function ActivityFeed({ activities = [], loading = false }: ActivityFeedProps) {
  const { t } = useI18n()

  // Mock data for demonstration
  const mockActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'generated',
      title: '生成了新作品',
      description: '一只可爱的龙猫在森林中，吉卜力风格',
      timestamp: '2小时前',
      metadata: { count: 1 }
    },
    {
      id: '2',
      type: 'liked',
      title: '点赞了作品',
      description: '千与千寻中的汤屋，夜晚灯光温暖',
      timestamp: '4小时前',
      metadata: { userName: '艺术爱好者' }
    },
    {
      id: '3',
      type: 'shared',
      title: '分享了作品',
      description: '天空之城的城堡漂浮在云端',
      timestamp: '1天前'
    },
    {
      id: '4',
      type: 'generated',
      title: '生成了新作品',
      description: '魔女宅急便中的琪琪骑着扫帚飞翔',
      timestamp: '2天前',
      metadata: { count: 3 }
    },
    {
      id: '5',
      type: 'followed',
      title: '关注了用户',
      description: '吉卜力大师',
      timestamp: '3天前',
      metadata: { userName: '吉卜力大师' }
    }
  ]

  const displayActivities = activities.length > 0 ? activities : mockActivities

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'generated':
        return <Sparkles className="h-4 w-4 text-ghibli-green" />
      case 'liked':
        return <Heart className="h-4 w-4 text-red-500" />
      case 'shared':
        return <Share2 className="h-4 w-4 text-blue-500" />
      case 'commented':
        return <MessageCircle className="h-4 w-4 text-purple-500" />
      case 'followed':
        return <UserPlus className="h-4 w-4 text-orange-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'generated':
        return 'bg-ghibli-green/10 border-ghibli-green/20'
      case 'liked':
        return 'bg-red-50 border-red-100'
      case 'shared':
        return 'bg-blue-50 border-blue-100'
      case 'commented':
        return 'bg-purple-50 border-purple-100'
      case 'followed':
        return 'bg-orange-50 border-orange-100'
      default:
        return 'bg-gray-50 border-gray-100'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-ghibli-green" />
            {t('dashboard.activity.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-ghibli-green" />
          {t('dashboard.activity.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayActivities.length > 0 ? (
          <div className="space-y-4">
            {displayActivities.map((activity) => (
              <div 
                key={activity.id} 
                className={`flex items-start gap-3 p-3 rounded-lg border ${getActivityColor(activity.type)}`}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border flex items-center justify-center">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    {activity.metadata?.count && activity.metadata.count > 1 && (
                      <Badge variant="secondary" className="text-xs">
                        +{activity.metadata.count}
                      </Badge>
                    )}
                  </div>
                  {activity.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {activity.description}
                    </p>
                  )}
                  {activity.metadata?.userName && (
                    <p className="text-xs text-gray-500 mt-1">
                      by {activity.metadata.userName}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {activity.timestamp}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              {t('dashboard.activity.noActivity')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
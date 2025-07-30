'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { 
  Plus, 
  Image as ImageIcon, 
  Settings, 
  User, 
  CreditCard, 
  HelpCircle,
  Palette,
  Share2,
  Download,
  Bookmark
} from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '@/hooks/use-i18n'

export function QuickActions() {
  const { t } = useI18n()

  const primaryActions = [
    {
      title: t('dashboard.quickActions.createNew'),
      description: '开始新的AI艺术创作',
      icon: Plus,
      href: '/generate',
      color: 'bg-gradient-to-r from-ghibli-green to-ghibli-blue',
      textColor: 'text-white'
    },
    {
      title: t('dashboard.quickActions.viewGallery'),
      description: '浏览您的作品集',
      icon: ImageIcon,
      href: '/gallery',
      color: 'bg-gradient-to-r from-ghibli-gold to-ghibli-orange',
      textColor: 'text-white'
    }
  ]

  const secondaryActions = [
    {
      title: '个人资料',
      icon: User,
      href: '/profile'
    },
    {
      title: '账户设置',
      icon: Settings,
      href: '/settings'
    },
    {
      title: '账单管理',
      icon: CreditCard,
      href: '/billing'
    },
    {
      title: '帮助支持',
      icon: HelpCircle,
      href: '/help'
    }
  ]

  const toolActions = [
    {
      title: '风格编辑器',
      description: '自定义艺术风格',
      icon: Palette,
      href: '/style-editor',
      badge: 'New'
    },
    {
      title: '批量下载',
      description: '下载多个作品',
      icon: Download,
      href: '/batch-download'
    },
    {
      title: '分享管理',
      description: '管理分享链接',
      icon: Share2,
      href: '/share-manager'
    },
    {
      title: '收藏管理',
      description: '整理收藏作品',
      icon: Bookmark,
      href: '/favorites'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Primary Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-ghibli-green" />
            {t('dashboard.quickActions.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {primaryActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Link key={index} href={action.href}>
                  <div className={`${action.color} ${action.textColor} p-6 rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer group`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="h-6 w-6" />
                      <h3 className="font-semibold text-lg">{action.title}</h3>
                    </div>
                    <p className="text-sm opacity-90">{action.description}</p>
                    <div className="mt-4 flex justify-end">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <Plus className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Secondary Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">账户管理</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {secondaryActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Link key={index} href={action.href}>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium">{action.title}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">创作工具</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {toolActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Link key={index} href={action.href}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-gray-600" />
                        <div>
                          <div className="text-sm font-medium flex items-center gap-2">
                            {action.title}
                            {action.badge && (
                              <span className="px-2 py-0.5 text-xs bg-ghibli-green text-white rounded-full">
                                {action.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{action.description}</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  EyeOff, 
  Heart, 
  Share2, 
  Download, 
  Trash2, 
  Clock,
  ArrowRight
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useI18n } from '@/hooks/use-i18n'
import { Image as ImageType } from '@/types'

interface RecentWorksProps {
  images: ImageType[]
  loading?: boolean
  onDelete?: (id: string) => Promise<void>
  onToggleVisibility?: (id: string, isPublic: boolean) => Promise<void>
  onDownload?: (url: string, filename: string) => Promise<void>
  onShare?: (image: ImageType) => Promise<void>
}

export function RecentWorks({ 
  images, 
  loading = false,
  onDelete,
  onToggleVisibility,
  onDownload,
  onShare
}: RecentWorksProps) {
  const { t } = useI18n()
  const [actioningId, setActioningId] = useState<string | null>(null)

  const handleAction = async (action: () => Promise<void>, imageId: string) => {
    setActioningId(imageId)
    try {
      await action()
    } finally {
      setActioningId(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-ghibli-green" />
              {t('dashboard.recentWorks.title')}
            </div>
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const recentImages = images.slice(0, 6)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-ghibli-green" />
            {t('dashboard.recentWorks.title')}
          </div>
          <Link href="/gallery">
            <Button variant="ghost" size="sm" className="text-ghibli-green hover:text-ghibli-green/80">
              {t('dashboard.recentWorks.viewAll')}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentImages.map((image) => (
              <div key={image.id} className="group relative">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
                  {image.image_url ? (
                    <Image
                      src={image.image_url}
                      alt={image.prompt}
                      fill
                      className="object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-ghibli-green/20 to-ghibli-blue/20 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">{t('dashboard.messages.imageLoading')}</span>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge 
                      variant={image.is_public ? 'success' : 'secondary'}
                      className="text-xs"
                    >
                      {image.is_public ? t('dashboard.status.public') : t('dashboard.status.private')}
                    </Badge>
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="flex gap-2">
                      {onDownload && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={() => onDownload(image.image_url, `ghibli-ai-${image.id}.png`)}
                          disabled={actioningId === image.id}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      {onShare && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={() => onShare(image)}
                          disabled={actioningId === image.id}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      )}
                      {onToggleVisibility && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={() => handleAction(
                            async () => {
                              if (onToggleVisibility) {
                                await onToggleVisibility(image.id, image.is_public)
                              }
                            },
                            image.id
                          )}
                          disabled={actioningId === image.id}
                        >
                          {image.is_public ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          onClick={() => handleAction(
                            async () => {
                              if (onDelete) {
                                await onDelete(image.id)
                              }
                            },
                            image.id
                          )}
                          disabled={actioningId === image.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-medium text-sm text-gray-900 line-clamp-2 leading-tight">
                    {image.prompt}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(image.created_at).toLocaleDateString()}</span>
                    <div className="flex items-center gap-2">
                      {(image.likes_count || 0) > 0 && (
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span>{image.likes_count}</span>
                        </div>
                      )}
                      {(image.views_count || 0) > 0 && (
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{image.views_count}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Clock className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('dashboard.recentWorks.noWorks')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('dashboard.recentWorks.createFirst')}
            </p>
            <Link href="/generate">
              <Button>
                {t('common.generate')}
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { Image as ImageType, PaginatedResponse } from '@/types'
import { useI18n } from '@/lib/i18n'
import { Download, Share2, Trash2, Calendar, Image as ImageIcon } from 'lucide-react'
import { downloadImage } from '@/lib/utils'
import { showToast } from '@/lib/toast'

interface HistoryPanelProps {
  userId?: string
  className?: string
}

export function HistoryPanel({ userId, className = '' }: HistoryPanelProps) {
  const { t } = useI18n()
  const [images, setImages] = useState<ImageType[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    loadImages()
  }, [page, userId])

  const loadImages = async () => {
    if (!userId) return
    
    setLoading(true)
    try {
      const response = await apiClient.getUserImages(page, 12)
      if (response.data) {
        if (page === 1) {
          setImages(response.data.data)
        } else {
          setImages(prev => [...prev, ...(response.data?.data || [])])
        }
        setTotal(response.data.total)
        setHasMore(response.data.has_next)
      }
    } catch (error) {
      showToast.error('加载图片失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (image: ImageType) => {
    if (image.image_url) {
      downloadImage(image.image_url, `ghibli-ai-${image.id}.png`)
    }
  }

  const handleShare = async (image: ImageType) => {
    if (image.image_url) {
      try {
        await navigator.share({
          title: '我的AI生成作品',
          text: image.prompt,
          url: image.image_url,
        })
      } catch (error) {
        // 如果不支持原生分享，复制链接到剪贴板
        navigator.clipboard.writeText(image.image_url)
        showToast.success('链接已复制到剪贴板')
      }
    }
  }

  const handleDelete = async (imageId: string) => {
    try {
      const response = await apiClient.deleteImage(imageId)
      if (response.data !== undefined) {
        setImages(prev => prev.filter(img => img.id !== imageId))
        showToast.success('图片已删除')
      }
    } catch (error) {
      showToast.error('删除图片失败')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!userId) {
    return (
      <div className={`card ${className}`}>
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            请先登录
          </h3>
          <p className="text-gray-600">
            登录后可查看您的生成历史
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">生成历史</h2>
        <div className="text-sm text-gray-600">
          共 {total} 张图片
        </div>
      </div>

      {loading && page === 1 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            暂无生成记录
          </h3>
          <p className="text-gray-600">
            开始创作您的第一张AI图片吧
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="group relative">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={image.image_url}
                    alt={image.prompt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDownload(image)}
                      className="bg-white/20 hover:bg-white/30 text-white"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleShare(image)}
                      className="bg-white/20 hover:bg-white/30 text-white"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDelete(image.id)}
                      className="bg-white/20 hover:bg-white/30 text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-2">
                  <p className="text-sm text-gray-600 truncate" title={image.prompt}>
                    {image.prompt}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{formatDate(image.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(p => p + 1)}
                disabled={loading}
              >
                {loading ? '加载中...' : '加载更多'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
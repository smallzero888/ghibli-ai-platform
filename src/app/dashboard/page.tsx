'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Image as ImageType } from '@/types'
import { apiClient } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { Plus, Download, Share2, Trash2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { DashboardStatsSkeleton, GallerySkeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const { user } = useAuth()
  const [images, setImages] = useState<ImageType[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalImages: 0,
    thisMonth: 0,
    publicImages: 0,
  })
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadUserImages()
    }
  }, [user])

  const loadUserImages = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getUserImages()
      if (response.data) {
        setImages(response.data.data)
        setStats({
          totalImages: response.data.total,
          thisMonth: response.data.data.filter(img => {
            const createdDate = new Date(img.created_at)
            const now = new Date()
            return createdDate.getMonth() === now.getMonth() && 
                   createdDate.getFullYear() === now.getFullYear()
          }).length,
          publicImages: response.data.data.filter(img => img.is_public).length,
        })
      }
    } catch (error) {
      console.error('加载用户图片失败:', error)
      showToast.error('加载图片失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (confirm('确定要删除这张图片吗？此操作不可撤销。')) {
      try {
        setDeletingId(imageId)
        await apiClient.deleteImage(imageId)
        setImages(images.filter(img => img.id !== imageId))
        setStats(prev => ({
          ...prev,
          totalImages: prev.totalImages - 1,
          publicImages: prev.publicImages - (images.find(img => img.id === imageId)?.is_public ? 1 : 0)
        }))
        showToast.success('图片删除成功')
      } catch (error) {
        console.error('删除图片失败:', error)
        showToast.error('删除图片失败，请稍后重试')
      } finally {
        setDeletingId(null)
      }
    }
  }

  const toggleImageVisibility = async (imageId: string, isPublic: boolean) => {
    try {
      setTogglingId(imageId)
      await apiClient.updateImage(imageId, { is_public: !isPublic })
      setImages(images.map(img => 
        img.id === imageId ? { ...img, is_public: !isPublic } : img
      ))
      setStats(prev => ({
        ...prev,
        publicImages: prev.publicImages + (isPublic ? -1 : 1)
      }))
      showToast.success(isPublic ? '已设为私有' : '已设为公开')
    } catch (error) {
      console.error('更新图片可见性失败:', error)
      showToast.error('更新失败，请稍后重试')
    } finally {
      setTogglingId(null)
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
      showToast.success('下载开始')
    } catch (error) {
      console.error('下载失败:', error)
      showToast.error('下载失败，请稍后重试')
    }
  }

  const handleShare = async (image: ImageType) => {
    try {
      const response = await apiClient.shareImage(image.id)
      if (response.data) {
        await navigator.clipboard.writeText(response.data.share_url)
        showToast.success('分享链接已复制到剪贴板')
      }
    } catch (error) {
      console.error('分享失败:', error)
      showToast.error('分享失败，请稍后重试')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-ghibli-cream">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            请先登录
          </h1>
          <p className="text-gray-600 mb-8">
            您需要登录后才能查看个人作品
          </p>
          <Link href="/auth/login">
            <Button>前往登录</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ghibli-cream">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              我的作品
            </h1>
            <p className="text-gray-600">
              管理您创作的AI艺术作品
            </p>
          </div>
          <Link href="/generate">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              创作新作品
            </Button>
          </Link>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card text-center">
            <div className="text-3xl font-bold text-ghibli-green mb-2">
              {stats.totalImages}
            </div>
            <div className="text-gray-600">总作品数</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-ghibli-blue mb-2">
              {stats.thisMonth}
            </div>
            <div className="text-gray-600">本月创作</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-ghibli-gold mb-2">
              {stats.publicImages}
            </div>
            <div className="text-gray-600">公开作品</div>
          </div>
        </div>

        {loading ? (
          <>
            <DashboardStatsSkeleton />
            <GallerySkeleton />
          </>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <div key={image.id} className="card">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                  {image.image_url ? (
                    <Image
                      src={image.image_url}
                      alt={image.prompt}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-ghibli-green/20 to-ghibli-blue/20 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">图片加载中</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      image.is_public 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {image.is_public ? '公开' : '私有'}
                    </span>
                  </div>
                </div>
                
                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                  {image.prompt}
                </h3>
                
                <div className="text-sm text-gray-500 mb-3">
                  {new Date(image.created_at).toLocaleDateString()}
                </div>
                
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleDownload(image.image_url, `ghibli-ai-${image.id}.png`)}
                    disabled={!image.image_url}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleShare(image)}
                    disabled={togglingId === image.id}
                  >
                    <Share2 className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => toggleImageVisibility(image.id, image.is_public)}
                    disabled={togglingId === image.id}
                  >
                    {image.is_public ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteImage(image.id)}
                    disabled={deletingId === image.id}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              还没有作品
            </h3>
            <p className="text-gray-600 mb-6">
              开始您的第一个AI艺术创作吧
            </p>
            <Link href="/generate">
              <Button>
                立即创作
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

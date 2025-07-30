'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Header } from '@/components/layout/header'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { Button } from '@/components/ui/button'
import { Image as ImageType } from '@/types'
import { apiClient } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { Search, Filter, Download, Share2, X } from 'lucide-react'
import { GallerySkeleton } from '@/components/ui/skeleton'

export default function GalleryPage() {
  const [images, setImages] = useState<ImageType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null)

  useEffect(() => {
    loadImages()
  }, [])

  const loadImages = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getPublicImages()
      if (response.data) {
        setImages(response.data.data)
      }
    } catch (error) {
      console.error('加载图片失败:', error)
      showToast.error('加载图片失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const filteredImages = images.filter(image =>
    image.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI生成的吉卜力风格作品',
          text: image.prompt,
          url: window.location.href,
        })
      } catch (error) {
        console.error('分享失败:', error)
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        showToast.success('链接已复制到剪贴板')
      } catch (error) {
        console.error('复制失败:', error)
        showToast.error('复制失败，请手动复制')
      }
    }
  }

  return (
    <div className="min-h-screen bg-ghibli-cream">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            作品画廊
          </h1>
          <p className="text-xl text-gray-600">
            探索社区用户创作的精美AI艺术作品
          </p>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索作品..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            筛选
          </Button>
        </div>

        {loading ? (
          <GallerySkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="card cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => setSelectedImage(image)}
              >
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
                </div>
                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                  {image.prompt}
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{image.ai_model}</span>
                  <span>{new Date(image.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredImages.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">没有找到匹配的作品</p>
          </div>
        )}

        {/* 图片详情模态框 */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">作品详情</h2>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedImage(null)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    {selectedImage.image_url ? (
                      <Image
                        src={selectedImage.image_url}
                        alt={selectedImage.prompt}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-ghibli-green/20 to-ghibli-blue/20 flex items-center justify-center">
                        <span className="text-gray-500">图片加载中</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">提示词</h3>
                      <p className="text-gray-600">{selectedImage.prompt}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">生成信息</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>AI模型: {selectedImage.ai_model}</p>
                        <p>创建时间: {new Date(selectedImage.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleDownload(selectedImage.image_url, `ghibli-ai-${selectedImage.id}.png`)}
                        className="flex-1"
                        disabled={!selectedImage.image_url}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        下载
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleShare(selectedImage)}
                        className="flex-1"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        分享
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

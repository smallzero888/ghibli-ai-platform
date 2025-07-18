'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { Image as ImageType } from '@/types'
import { apiClient } from '@/lib/api'
import { GallerySkeleton } from '@/components/ui/skeleton'

export function Gallery() {
  const [images, setImages] = useState<ImageType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedImages()
  }, [])

  const loadFeaturedImages = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getPublicImages(1, 6)
      if (response.data) {
        setImages(response.data.data.slice(0, 6))
      }
    } catch (error) {
      console.error('加载精选图片失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-20 bg-ghibli-cream">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            精选作品
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            探索社区用户创作的精彩作品，获取灵感
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card">
                <div className="aspect-square bg-gray-200 rounded-lg mb-4 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {images.map((image) => (
              <div key={image.id} className="card group">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                  {image.image_url ? (
                    <Image
                      src={image.image_url}
                      alt={image.prompt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-ghibli-green/20 to-ghibli-blue/20 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">图片加载中</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
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

        <div className="text-center">
          <Link href="/gallery">
            <Button variant="outline" size="lg">
              查看更多作品
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

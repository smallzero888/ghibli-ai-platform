'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, Eye, Download, Share2, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'

interface ImageCardProps {
  image: {
    id: string
    url: string
    thumbnail_url?: string
    title?: string
    prompt: string
    user: {
      username: string
      avatar_url?: string
    }
    likes_count: number
    views_count: number
    created_at: string
    is_liked?: boolean
    is_favorited?: boolean
  }
  showUser?: boolean
  onLike?: (id: string) => void
  onFavorite?: (id: string) => void
  onClick?: (id: string) => void
  className?: string
}

export function ImageCard({
  image,
  showUser = true,
  onLike,
  onFavorite,
  onClick,
  className
}: ImageCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    onLike?.(image.id)
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFavorite?.(image.id)
  }

  const handleClick = () => {
    onClick?.(image.id)
  }

  return (
    <motion.div
      className={cn(
        "ghibli-card cursor-pointer group overflow-hidden",
        className
      )}
      onClick={handleClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 图片区域 */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-ghibli-cream-100 mb-4">
        {!imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 image-placeholder flex items-center justify-center">
                <div className="loading-dots">
                  <div style={{ '--i': 0 } as React.CSSProperties}></div>
                  <div style={{ '--i': 1 } as React.CSSProperties}></div>
                  <div style={{ '--i': 2 } as React.CSSProperties}></div>
                </div>
              </div>
            )}
            <Image
              src={image.thumbnail_url || image.url}
              alt={image.title || image.prompt}
              fill
              className={cn(
                "object-cover transition-all duration-300 group-hover:scale-105",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-ghibli-cream-200 flex items-center justify-center">
            <span className="text-ghibli-cream-500 text-sm">图片加载失败</span>
          </div>
        )}
        
        {/* 悬浮操作按钮 */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200">
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex space-x-1">
              <motion.button
                className="p-2 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
                onClick={handleLike}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart 
                  className={cn(
                    "w-4 h-4",
                    image.is_liked ? "fill-red-500 text-red-500" : "text-gray-600"
                  )} 
                />
              </motion.button>
              <motion.button
                className="p-2 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <MoreHorizontal className="w-4 h-4 text-gray-600" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* 图片信息 */}
      <div className="space-y-3">
        {/* 用户信息 */}
        {showUser && (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-ghibli-green-400 flex items-center justify-center text-white text-xs font-medium">
              {image.user.username[0]?.toUpperCase()}
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              {image.user.username}
            </span>
          </div>
        )}

        {/* 标题和描述 */}
        <div>
          {image.title && (
            <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
              {image.title}
            </h3>
          )}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {image.prompt}
          </p>
        </div>

        {/* 统计信息 */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Heart className="w-3 h-3" />
              <span>{image.likes_count}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{image.views_count}</span>
            </div>
          </div>
          <span>{formatDate(image.created_at)}</span>
        </div>
      </div>
    </motion.div>
  )
}
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Zap } from 'lucide-react'
import { showToast } from '@/lib/toast'

export function Hero() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-ghibli-cream via-ghibli-green/20 to-ghibli-blue/20">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%239C92AC%22%20fill-opacity=%220.05%22%3E%3Cpath%20d=%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
      
      <div className="max-w-7xl mx-auto px-4 py-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 bg-ghibli-green/10 rounded-full text-ghibli-green text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              AI 驱动的艺术创作
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              用 AI 创造
              <br />
              <span className="text-ghibli-green">吉卜力风格</span>
              <br />
              艺术作品
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
              使用先进的人工智能技术，将您的创意转化为精美的吉卜力风格图片。
              无需专业技能，只需描述您的想法，AI 就能为您创作。
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/generate">
                <Button 
                  size="lg" 
                  className="group"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  开始创作
                  <ArrowRight className={`w-5 h-5 ml-2 transition-transform ${isHovered ? 'translate-x-1' : ''}`} />
                </Button>
              </Link>
              
              <Link href="/gallery">
                <Button size="lg" variant="outline">
                  浏览画廊
                </Button>
              </Link>
            </div>
            
            <div className="mt-8 flex items-center justify-center lg:justify-start gap-8 text-sm text-gray-500">
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-1 text-ghibli-green" />
                <span>快速生成</span>
              </div>
              <div className="flex items-center">
                <Sparkles className="w-4 h-4 mr-1 text-ghibli-green" />
                <span>高质量输出</span>
              </div>
              <div className="flex items-center">
                <span>免费使用</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-ghibli-green/20 to-ghibli-blue/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-white/50 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Sparkles className="w-16 h-16 text-ghibli-green" />
                  </div>
                  <p className="text-gray-600">您的创意将在这里变成现实</p>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute top-4 right-4 w-16 h-16 bg-ghibli-green/10 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 bg-ghibli-blue/10 rounded-full animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

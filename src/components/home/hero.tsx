'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Zap } from 'lucide-react'
import { useI18n } from '@/hooks/use-i18n'

export function Hero() {
  const [isHovered, setIsHovered] = useState(false)
  const { locale, t, isRTL } = useI18n()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-ghibli-cream via-ghibli-green/20 to-ghibli-blue/20" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%239C92AC%22%20fill-opacity=%220.05%22%3E%3Cpath%20d=%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
      
      <div className="max-w-7xl mx-auto px-4 py-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 bg-ghibli-green/10 rounded-full text-ghibli-green text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              {t('components.hero.badge')}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {t('components.hero.title')}
              <br />
              <span className="text-ghibli-green">{t('components.hero.titleHighlight')}</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
              {t('components.hero.description')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href={`/${locale}/generate`}>
                <Button 
                  size="lg" 
                  className="group"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  {t('components.hero.startCreating')}
                  <ArrowRight className={`w-5 h-5 ml-2 transition-transform ${isHovered ? 'translate-x-1' : ''} ${isRTL ? 'rotate-180' : ''}`} />
                </Button>
              </Link>
              
              <Link href={`/${locale}/gallery`}>
                <Button size="lg" variant="outline">
                  {t('components.hero.browseGallery')}
                </Button>
              </Link>
            </div>
            
            <div className="mt-8 flex items-center justify-center lg:justify-start gap-8 text-sm text-gray-500">
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-1 text-ghibli-green" />
                <span>{t('components.hero.features.fastGeneration')}</span>
              </div>
              <div className="flex items-center">
                <Sparkles className="w-4 h-4 mr-1 text-ghibli-green" />
                <span>{t('components.hero.features.multipleStyles')}</span>
              </div>
              <div className="flex items-center">
                <span>{t('components.hero.features.freeDownload')}</span>
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
                  <p className="text-gray-600">{t('components.hero.featuredWorks')}</p>
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

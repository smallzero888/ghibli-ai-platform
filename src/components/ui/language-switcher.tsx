'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/use-i18n'

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const { locale, t, isRTL } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const languages = [
    { code: 'zh', name: '中文', nativeName: '中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' }
  ]

  const currentLanguage = languages.find(lang => lang.code === locale)

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (typeof window !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [])

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === locale) {
      setIsOpen(false)
      return
    }

    // 构建新的路径
    let newPath = pathname
    
    // 如果当前路径包含语言代码，替换它
    if (pathname.startsWith(`/${locale}`)) {
      newPath = pathname.replace(`/${locale}`, `/${newLocale}`)
    } else {
      // 如果没有语言代码，添加新的语言代码
      newPath = `/${newLocale}${pathname}`
    }

    // 保存语言偏好到localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', newLocale)
    }
    
    router.push(newPath)
    setIsOpen(false)
  }

  return (
    <div className="relative language-switcher" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 text-gray-700 hover:text-ghibli-green-600 hover:border-ghibli-green-300 transition-all duration-200 min-w-[110px] justify-between bg-white/80 backdrop-blur-sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('components.languageSwitcher.switchLanguage') || 'Switch Language'}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{currentLanguage?.flag}</span>
          <span 
            className="font-medium text-sm" 
            lang={currentLanguage?.code}
            style={{ 
              fontFamily: currentLanguage?.code === 'ar' ? "'Noto Sans Arabic', Arial, sans-serif" : 'inherit'
            }}
          >
            {currentLanguage?.nativeName}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200`}>
          <div className="py-2">
            <div className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 bg-gradient-to-r from-ghibli-green-50 to-ghibli-blue-50">
              <Globe className="w-4 h-4 inline mr-2" />
              {t('components.languageSwitcher.switchLanguage') || 'Switch Language'}
            </div>
            <div className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-ghibli-green-50 hover:to-ghibli-blue-50 transition-all duration-150 flex items-center justify-between group ${
                    locale === lang.code 
                      ? 'bg-gradient-to-r from-ghibli-green-50 to-ghibli-blue-50 text-ghibli-green-700 font-medium border-l-4 border-ghibli-green-500' 
                      : 'text-gray-700 hover:text-ghibli-green-700'
                  }`}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg transition-transform group-hover:scale-110">{lang.flag}</span>
                    <div className="flex flex-col items-start">
                      <span 
                        className="font-medium" 
                        lang={lang.code}
                        style={{ 
                          fontFamily: lang.code === 'ar' ? "'Noto Sans Arabic', Arial, sans-serif" : 'inherit'
                        }}
                      >
                        {lang.nativeName}
                      </span>
                      <span className="text-xs text-gray-500 group-hover:text-ghibli-green-600">
                        {lang.name}
                      </span>
                    </div>
                  </div>
                  {locale === lang.code && (
                    <Check className="w-4 h-4 text-ghibli-green-600 animate-in zoom-in-50 duration-200" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
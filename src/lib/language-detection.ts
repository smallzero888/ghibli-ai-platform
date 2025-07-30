'use client'

/**
 * 语言检测和自动跳转工具
 */

// 支持的语言列表
export const SUPPORTED_LOCALES = ['zh', 'en'] as const
export type SupportedLocale = typeof SUPPORTED_LOCALES[number]

// 默认语言
export const DEFAULT_LOCALE: SupportedLocale = 'zh'

/**
 * 从浏览器获取用户首选语言
 */
export function getBrowserLanguage(): SupportedLocale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE
  }

  // 获取浏览器语言设置
  const browserLanguages = navigator.languages || [navigator.language]
  
  for (const lang of browserLanguages) {
    // 提取主要语言代码 (例如: 'zh-CN' -> 'zh')
    const primaryLang = lang.split('-')[0].toLowerCase()
    
    // 检查是否支持该语言
    if (SUPPORTED_LOCALES.includes(primaryLang as SupportedLocale)) {
      return primaryLang as SupportedLocale
    }
  }
  
  return DEFAULT_LOCALE
}

/**
 * 从localStorage获取用户保存的语言偏好
 */
export function getSavedLanguage(): SupportedLocale | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const saved = localStorage.getItem('preferred-language')
    if (saved && SUPPORTED_LOCALES.includes(saved as SupportedLocale)) {
      return saved as SupportedLocale
    }
  } catch (error) {
    console.warn('Failed to read language preference from localStorage:', error)
  }
  
  return null
}

/**
 * 保存用户语言偏好到localStorage
 */
export function saveLanguagePreference(locale: SupportedLocale): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem('preferred-language', locale)
  } catch (error) {
    console.warn('Failed to save language preference to localStorage:', error)
  }
}

/**
 * 获取用户首选语言（优先级：保存的偏好 > 浏览器语言 > 默认语言）
 */
export function getPreferredLanguage(): SupportedLocale {
  // 1. 首先检查用户保存的偏好
  const savedLanguage = getSavedLanguage()
  if (savedLanguage) {
    return savedLanguage
  }
  
  // 2. 然后检查浏览器语言
  const browserLanguage = getBrowserLanguage()
  if (browserLanguage) {
    return browserLanguage
  }
  
  // 3. 最后使用默认语言
  return DEFAULT_LOCALE
}

/**
 * 从URL路径中提取当前语言
 */
export function getCurrentLocaleFromPath(pathname: string): SupportedLocale | null {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]
  
  if (firstSegment && SUPPORTED_LOCALES.includes(firstSegment as SupportedLocale)) {
    return firstSegment as SupportedLocale
  }
  
  return null
}

/**
 * 构建带有语言前缀的URL路径
 */
export function buildLocalizedPath(path: string, locale: SupportedLocale): string {
  // 移除现有的语言前缀（如果有）
  const cleanPath = path.replace(/^\/(?:zh|en)/, '') || '/'
  
  // 添加新的语言前缀
  return `/${locale}${cleanPath === '/' ? '' : cleanPath}`
}

/**
 * 检查是否需要重定向到用户首选语言
 */
export function shouldRedirectToPreferredLanguage(currentPath: string): {
  shouldRedirect: boolean
  redirectPath?: string
  preferredLocale?: SupportedLocale
} {
  const currentLocale = getCurrentLocaleFromPath(currentPath)
  const preferredLocale = getPreferredLanguage()
  
  // 如果当前路径没有语言前缀，或者语言不匹配用户偏好
  if (!currentLocale || currentLocale !== preferredLocale) {
    return {
      shouldRedirect: true,
      redirectPath: buildLocalizedPath(currentPath, preferredLocale),
      preferredLocale
    }
  }
  
  return { shouldRedirect: false }
}

/**
 * 语言显示名称映射
 */
export const LANGUAGE_NAMES: Record<SupportedLocale, { native: string; english: string }> = {
  zh: { native: '中文', english: 'Chinese' },
  en: { native: 'English', english: 'English' }
}
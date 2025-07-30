import { NextRequest, NextResponse } from 'next/server'

const supportedLocales = ['zh', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ar', 'hi', 'th', 'vi']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if pathname starts with supported locales
  const pathnameHasLocale = supportedLocales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (!pathnameHasLocale) {
    // Get preferred language from Accept-Language header or default to zh
    const acceptLanguage = request.headers.get('accept-language')
    let preferredLocale = 'zh'
    
    if (acceptLanguage) {
      const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim().toLowerCase())
      for (const lang of languages) {
        const primaryLang = lang.split('-')[0]
        if (supportedLocales.includes(primaryLang)) {
          preferredLocale = primaryLang
          break
        }
      }
    }
    
    return NextResponse.redirect(new URL(`/${preferredLocale}${pathname}`, request.url))
  }
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|favicon.ico).*)',
  ],
}

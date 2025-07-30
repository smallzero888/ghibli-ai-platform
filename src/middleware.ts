import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 支持的语言列表
const locales = ['zh', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ar', 'hi', 'th', 'vi'];
const defaultLocale = 'zh';

export function middleware(request: NextRequest) {
  // 检查路径中是否已有语言前缀
  const pathname = request.nextUrl.pathname;
  
  // 检查路径是否已经包含语言前缀
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // 如果路径缺少语言前缀，则重定向到默认语言
  if (pathnameIsMissingLocale) {
    // 如果是根路径，重定向到默认语言
    if (pathname === '/') {
      return NextResponse.redirect(
        new URL(`/${defaultLocale}`, request.url)
      );
    }
    
    // 对于其他路径，添加默认语言前缀
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  // 匹配除了静态文件和API路由之外的所有路径
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
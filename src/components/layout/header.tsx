'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { MobileNavigation } from '@/components/layout/mobile-navigation'
import { useI18n } from '@/hooks/use-i18n'

export function Header() {
  const { user, signOut } = useAuth()
  const { locale, nav, isRTL } = useI18n()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href={`/${locale}`} className="text-2xl font-bold text-ghibli-green-600 hover:text-ghibli-green-700 transition-colors">
              🎨 吉卜力AI
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link href={`/${locale}`} className="text-gray-700 hover:text-ghibli-green-600 font-medium transition-colors">
              {nav.home}
            </Link>
            <Link href={`/${locale}/faq`} className="text-gray-700 hover:text-ghibli-green-600 font-medium transition-colors">
              {nav.faq}
            </Link>
            <Link href={`/${locale}/pricing`} className="text-gray-700 hover:text-ghibli-green-600 font-medium transition-colors">
              {nav.pricing}
            </Link>
            <Link href={`/${locale}/generate`} className="text-gray-700 hover:text-ghibli-green-600 font-medium transition-colors">
              {nav.generate}
            </Link>
            <Link href={`/${locale}/gallery`} className="text-gray-700 hover:text-ghibli-green-600 font-medium transition-colors">
              {nav.gallery}
            </Link>
            {user && (
              <Link href={`/${locale}/dashboard`} className="text-gray-700 hover:text-ghibli-green-600 font-medium transition-colors">
                {nav.dashboard}
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {/* Desktop Language Switcher */}
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            
            {/* Desktop Auth */}
            {user ? (
              <div className="hidden md:flex items-center space-x-3">
                <Avatar user={user} />
                <Button variant="outline" onClick={signOut}>
                  {nav.logout}
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link href={`/${locale}/login`}>
                  <Button variant="outline">{nav.login}</Button>
                </Link>
                <Link href={`/${locale}/register`}>
                  <Button>{nav.register}</Button>
                </Link>
              </div>
            )}

            {/* Mobile Navigation */}
            <MobileNavigation />
          </div>
        </div>
      </div>
    </header>
  )
}
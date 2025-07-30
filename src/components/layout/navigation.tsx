'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Wand2, Image, User, HelpCircle, DollarSign } from 'lucide-react'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { useI18n } from '@/hooks/use-i18n'
import { useAuth } from '@/lib/auth-context'
import { Avatar } from '@/components/ui/avatar'

interface NavigationProps {
  locale: string
}

export function Navigation({ locale }: NavigationProps) {
  const { nav, isRTL } = useI18n()
  const { user, signOut } = useAuth()

  const navItems = [
    {
      href: `/${locale}`,
      icon: Home,
      label: nav.home
    },
    {
      href: `/${locale}/faq`,
      icon: HelpCircle,
      label: nav.faq
    },
    {
      href: `/${locale}/pricing`,
      icon: DollarSign,
      label: nav.pricing
    },
    {
      href: `/${locale}/generate`,
      icon: Wand2,
      label: nav.generate
    },
    {
      href: `/${locale}/gallery`,
      icon: Image,
      label: nav.gallery
    }
  ]

  // Add dashboard item for logged-in users
  if (user) {
    navItems.push({
      href: `/${locale}/dashboard`,
      icon: User,
      label: nav.dashboard
    })
  }

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href={`/${locale}`} className="text-2xl font-bold text-ghibli-green-600">
            🎨 吉卜力AI
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 text-gray-700 hover:text-ghibli-green-600 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            
            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-3">
                <Avatar user={user} />
                <Button variant="outline" size="sm" onClick={signOut}>
                  {nav.logout}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href={`/${locale}/login`}>
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    {nav.login}
                  </Button>
                </Link>
                <Link href={`/${locale}/register`}>
                  <Button size="sm">
                    {nav.register}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
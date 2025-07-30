'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Home, Wand2, Image, User, Settings, LogOut, HelpCircle, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { useI18n } from '@/hooks/use-i18n'
import { useAuth } from '@/lib/auth-context'

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { locale, nav, isRTL } = useI18n()
  const { user, signOut } = useAuth()

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

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

  const userNavItems = user ? [
    {
      href: `/${locale}/dashboard`,
      icon: User,
      label: nav.dashboard
    },
    {
      href: `/${locale}/profile`,
      icon: Settings,
      label: nav.profile
    }
  ] : []

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMenu}
          className="p-2"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={closeMenu} />
          
          <div className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <Link href={`/${locale}`} className="text-xl font-bold text-ghibli-green-600" onClick={closeMenu}>
                  🎨 吉卜力AI
                </Link>
                <Button variant="ghost" size="sm" onClick={closeMenu} className="p-2">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Navigation items */}
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:text-ghibli-green-600 hover:bg-ghibli-green-50 rounded-lg transition-colors"
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}

                  {/* User navigation items */}
                  {userNavItems.length > 0 && (
                    <>
                      <div className="border-t border-gray-200 my-4" />
                      {userNavItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMenu}
                          className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:text-ghibli-green-600 hover:bg-ghibli-green-50 rounded-lg transition-colors"
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      ))}
                    </>
                  )}
                </nav>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 space-y-4">
                {/* Language switcher */}
                <div className="flex justify-center">
                  <LanguageSwitcher />
                </div>

                {/* Auth buttons */}
                {user ? (
                  <div className="space-y-2">
                    <div className="text-center text-sm text-gray-600">
                      {user.email}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        signOut()
                        closeMenu()
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {nav.logout}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link href={`/${locale}/login`} onClick={closeMenu}>
                      <Button variant="outline" className="w-full">
                        <User className="w-4 h-4 mr-2" />
                        {nav.login}
                      </Button>
                    </Link>
                    <Link href={`/${locale}/register`} onClick={closeMenu}>
                      <Button className="w-full">
                        {nav.register}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, CreditCard, Settings, LogOut } from 'lucide-react'

export function Header() {
  const { user, signOut } = useAuth()
  const { t } = useI18n()

  // 获取用户显示名称
  const getDisplayName = () => {
    if (!user) return ''
    
    // 优先使用full_name，然后是name，最后是email
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    
    if (user.user_metadata?.name) {
      return user.user_metadata.name
    }
    
    // 如果都没有，使用email的用户名部分
    return user.email?.split('@')[0] || ''
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-ghibli-green">
              吉卜力AI
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link href="/generate" className="text-gray-700 hover:text-ghibli-green">
              {t('navigation.generate')}
            </Link>
            <Link href="/gallery" className="text-gray-700 hover:text-ghibli-green">
              {t('navigation.gallery')}
            </Link>
            {user && (
              <Link href="/dashboard" className="text-gray-700 hover:text-ghibli-green">
                {t('navigation.dashboard')}
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center space-x-2 cursor-pointer">
                    <Avatar user={user} />
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {getDisplayName()}
                    </span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>仪表板</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard?tab=settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>设置</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/credits" className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>积分管理</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('navigation.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="outline">{t('auth.login.submit')}</Button>
                </Link>
                <Link href="/register">
                  <Button>{t('auth.register.submit')}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
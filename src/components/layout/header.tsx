'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'

export function Header() {
  const { user, signOut } = useAuth()

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
              生成图片
            </Link>
            <Link href="/gallery" className="text-gray-700 hover:text-ghibli-green">
              图片库
            </Link>
            {user && (
              <Link href="/dashboard" className="text-gray-700 hover:text-ghibli-green">
                我的作品
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <Avatar user={user} />
                <Button variant="outline" onClick={signOut}>
                  退出
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/login">
                  <Button variant="outline">登录</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>注册</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
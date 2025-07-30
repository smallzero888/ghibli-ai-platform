'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/hooks/use-i18n'

export default function DashboardRedirect() {
  const router = useRouter()
  const { locale } = useI18n()

  useEffect(() => {
    // Redirect to the localized dashboard
    router.replace(`/${locale}/dashboard`)
  }, [router, locale])

  return (
    <div className="min-h-screen bg-ghibli-cream flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ghibli-green mx-auto mb-4"></div>
        <p className="text-gray-600">正在跳转到个人中心...</p>
      </div>
    </div>
  )
}
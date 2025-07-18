'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { GenerationForm } from '@/components/generate/generation-form'
import { GenerationResult } from '@/components/generate/generation-result'
import { Header } from '@/components/layout/header'
import { GenerationTask } from '@/types'

export default function GeneratePage() {
  const { user } = useAuth()
  const [currentTask, setCurrentTask] = useState<GenerationTask | null>(null)

  if (!user) {
    return (
      <div className="min-h-screen bg-ghibli-cream">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            请先登录
          </h1>
          <p className="text-gray-600 mb-8">
            您需要登录后才能使用图片生成功能
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ghibli-cream">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            AI图片生成
          </h1>
          <p className="text-xl text-gray-600">
            输入您的创意描述，让AI为您创作吉卜力风格的艺术作品
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <GenerationForm onTaskCreated={setCurrentTask} />
          </div>
          <div>
            <GenerationResult task={currentTask} />
          </div>
        </div>
      </div>
    </div>
  )
}
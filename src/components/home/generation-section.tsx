'use client'

import { useState, useRef } from 'react'
// Removed next-intl dependency
import { GenerationForm } from '@/components/generate/generation-form'
import { GenerationResult } from '@/components/generate/generation-result'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowRight, Send } from 'lucide-react'
import Link from 'next/link'

// 快速生成表单组件
function QuickGenerationForm({ onGenerate }: { onGenerate: (prompt: string) => void }) {
  const [prompt, setPrompt] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      onGenerate(prompt.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="描述您想要的图片，例如：一只可爱的龙猫在森林中..."
        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7FB069] focus:border-transparent"
      />
      <Button
        type="submit"
        disabled={!prompt.trim()}
        className="bg-[#7FB069] hover:bg-[#4a7c59] px-6"
      >
        <Send className="w-4 h-4 mr-2" />
        生成
      </Button>
    </form>
  )
}

export function GenerationSection() {
  const [result, setResult] = useState<any>(null)
  const [showFullInterface, setShowFullInterface] = useState(false)
  const formRef = useRef<{ setPrompt: (prompt: string) => void }>(null)
  // Removed translation hook

  const handleExampleClick = (example: string) => {
    if (formRef.current) {
      formRef.current.setPrompt(example)
    }
    setShowFullInterface(true)
  }

  const handleQuickGenerate = async (prompt: string) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_BASE_URL}/api/test/test-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model: "stabilityai/stable-diffusion-xl-base-1.0",
          width: 512,
          height: 512
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Create a mock task for the result component
        const mockTask = {
          id: Date.now().toString(),
          user_id: 'test-user',
          prompt: prompt.trim(),
          ai_model: 'siliconflow',
          status: 'completed',
          result_url: data.result?.images?.[0] || 'https://via.placeholder.com/512x512?text=Generated+Image',
          created_at: new Date().toISOString()
        }
        
        setResult(mockTask)
        setShowFullInterface(true)
      } else {
        alert('生成失败: ' + (data.error || data.message || '未知错误'))
      }
    } catch (error) {
      alert('生成失败: ' + (error instanceof Error ? error.message : '网络错误'))
    }
  }

  const quickExamples = [
    "一只可爱的龙猫在森林中，吉卜力风格",
    "千与千寻中的汤屋，夜晚灯光温暖",
    "天空之城的城堡漂浮在云端",
    "魔女宅急便中的琪琪骑着扫帚飞翔"
  ]

  return (
    <section id="generation-section" className="py-20 bg-gradient-to-br from-[#87ceeb]/5 to-[#7FB069]/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-[#7FB069]/10 rounded-full text-[#7FB069] text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            立即体验
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            开始您的创作之旅
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            选择示例或输入您的创意，立即生成精美的吉卜力风格图片
          </p>
        </div>

        {!showFullInterface ? (
          // 简化界面 - 显示示例按钮
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {quickExamples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="group p-4 md:p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-left border border-gray-100 hover:border-[#7FB069]/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-2">
                      <p className="text-gray-800 font-medium mb-2 group-hover:text-[#7FB069] transition-colors text-sm md:text-base">
                        {example}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500">
                        点击立即生成
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-[#7FB069] group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>

            {/* 快速输入框 */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                或者输入您的创意想法
              </h3>
              <QuickGenerationForm onGenerate={handleQuickGenerate} />
            </div>

            <div className="text-center space-y-4">
              <Button
                onClick={() => setShowFullInterface(true)}
                size="lg"
                variant="outline"
                className="border-[#7FB069] text-[#7FB069] hover:bg-[#7FB069] hover:text-white"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                高级设置
              </Button>
              
              <div className="text-sm text-gray-500">
                需要更多选项？{' '}
                <Link href="/generate" className="text-[#7FB069] hover:underline">
                  前往完整生成页面
                </Link>
              </div>
            </div>
          </div>
        ) : (
          // 完整界面 - 显示生成表单和结果
          <div className="max-w-4xl mx-auto space-y-8">
            {/* 生成表单 */}
            <div>
              <GenerationForm ref={formRef} onTaskCreated={setResult} />
            </div>

            {/* 生成结果 */}
            {result && (
              <div>
                <GenerationResult task={result} />
              </div>
            )}

            {/* 示例提示词 */}
            <div className="mt-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">💡 更多示例提示词</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFullInterface(false)}
                  >
                    收起界面
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    "一只可爱的龙猫在森林中，吉卜力风格",
                    "千与千寻中的汤屋，夜晚灯光温暖", 
                    "天空之城的城堡漂浮在云端",
                    "魔女宅急便中的琪琪骑着扫帚飞翔",
                    "哈尔的移动城堡在花海中",
                    "悬崖上的金鱼姬在海边奔跑",
                    "波妞在海浪中游泳，可爱风格",
                    "森林中的小精灵，梦幻光影"
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      className="text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm cursor-pointer"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link href="/generate">
                <Button variant="outline" size="lg">
                  前往完整生成页面
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
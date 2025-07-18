'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { GenerationTask, GenerationRequest } from '@/types'
import { showToast } from '@/lib/toast'

interface GenerationFormProps {
  onTaskCreated: (task: GenerationTask) => void
}

export function GenerationForm({ onTaskCreated }: GenerationFormProps) {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [aiModel, setAiModel] = useState<'siliconflow' | 'replicate'>('siliconflow')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) {
      showToast.error('请输入图片描述')
      return
    }

    setLoading(true)
    const toastId = showToast.loading('正在创建生成任务...')

    try {
      const request: GenerationRequest = {
        prompt: prompt.trim(),
        negative_prompt: negativePrompt.trim() || undefined,
        ai_model: aiModel,
        width: 512,
        height: 512,
        steps: 20,
        guidance_scale: 7.5,
      }

      const response = await apiClient.createGenerationTask(request)
      if (response.data) {
        onTaskCreated(response.data)
        setPrompt('')
        setNegativePrompt('')
        showToast.success('生成任务已创建')
      } else {
        showToast.error(response.error || '生成任务创建失败')
      }
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : '请求失败')
    } finally {
      setLoading(false)
      showToast.dismiss(toastId)
    }
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">创作设置</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
            描述您想要的图片 *
          </label>
          <textarea
            id="prompt"
            required
            rows={4}
            className="input-field resize-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="例如：一个穿着红色裙子的女孩在绿色草地上奔跑，吉卜力工作室风格，高质量，详细"
          />
          <p className="mt-1 text-sm text-gray-500">
            详细的描述能帮助AI更好地理解您的创意
          </p>
        </div>

        <div>
          <label htmlFor="negativePrompt" className="block text-sm font-medium text-gray-700 mb-2">
            不想要的元素（可选）
          </label>
          <textarea
            id="negativePrompt"
            rows={2}
            className="input-field resize-none"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="例如：低质量，模糊，变形，丑陋"
          />
        </div>

        <div>
          <label htmlFor="aiModel" className="block text-sm font-medium text-gray-700 mb-2">
            AI模型
          </label>
          <select
            id="aiModel"
            className="input-field"
            value={aiModel}
            onChange={(e) => setAiModel(e.target.value as 'siliconflow' | 'replicate')}
          >
            <option value="siliconflow">硅基流动 (推荐)</option>
            <option value="replicate">Replicate</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              图片尺寸
            </label>
            <select className="input-field" defaultValue="512x512">
              <option value="512x512">512 × 512</option>
              <option value="768x768">768 × 768</option>
              <option value="1024x1024">1024 × 1024</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              生成步数
            </label>
            <select className="input-field" defaultValue="20">
              <option value="10">10 (快速)</option>
              <option value="20">20 (推荐)</option>
              <option value="30">30 (精细)</option>
            </select>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading || !prompt.trim()}
        >
          {loading ? '生成中...' : '开始生成'}
        </Button>
      </form>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { GenerationTask, GenerationRequest } from '@/types'
import { showToast } from '@/lib/toast'
import { useI18n } from '@/lib/i18n'
import { Settings, Image as ImageIcon, RefreshCw } from 'lucide-react'

interface GenerationFormProps {
  onTaskCreated: (task: GenerationTask) => void
}

export function GenerationForm({ onTaskCreated }: GenerationFormProps) {
  const { t } = useI18n()
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [aiModel, setAiModel] = useState<'siliconflow' | 'replicate' | 'stability' | 'midjourney'>('siliconflow')
  const [model, setModel] = useState('stable-diffusion-xl')
  const [style, setStyle] = useState('ghibli')
  const [width, setWidth] = useState(512)
  const [height, setHeight] = useState(512)
  const [steps, setSteps] = useState(20)
  const [guidanceScale, setGuidanceScale] = useState(7.5)
  const [seed, setSeed] = useState<number | undefined>(undefined)
  const [batchSize, setBatchSize] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) {
      showToast.error(t('generate.error.incomplete'))
      return
    }

    setLoading(true)
    const toastId = showToast.loading(t('generate.generating'))

    try {
      const request: GenerationRequest = {
        prompt: prompt.trim(),
        negative_prompt: negativePrompt.trim() || undefined,
        ai_model: aiModel,
        model,
        style,
        width,
        height,
        steps,
        guidance_scale: guidanceScale,
        seed,
        batch_size: batchSize,
      }

      const response = await apiClient.createGenerationTask(request)
      if (response.data) {
        onTaskCreated(response.data)
        setPrompt('')
        setNegativePrompt('')
        showToast.success(t('generate.success'))
      } else {
        showToast.error(response.error || t('generate.error.failed'))
      }
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setLoading(false)
      showToast.dismiss(toastId)
    }
  }

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000))
  }

  const presetSizes = [
    { label: '512 × 512', width: 512, height: 512 },
    { label: '768 × 768', width: 768, height: 768 },
    { label: '1024 × 1024', width: 1024, height: 1024 },
    { label: '512 × 768', width: 512, height: 768 },
    { label: '768 × 512', width: 768, height: 512 },
  ]

  const styleOptions = [
    { value: 'ghibli', label: '吉卜力风格' },
    { value: 'anime', label: '动漫风格' },
    { value: 'realistic', label: '写实风格' },
    { value: 'watercolor', label: '水彩风格' },
    { value: 'oil-painting', label: '油画风格' },
    { value: 'sketch', label: '素描风格' },
  ]

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('generate.title')}</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Settings className="w-4 h-4 mr-2" />
          {showAdvanced ? '隐藏高级' : '显示高级'}
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
            {t('generate.prompt')} *
          </label>
          <textarea
            id="prompt"
            required
            rows={4}
            className="input-field resize-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t('generate.promptPlaceholder')}
          />
          <p className="mt-1 text-sm text-gray-500">
            详细的描述能帮助AI更好地理解您的创意
          </p>
        </div>

        <div>
          <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-2">
            艺术风格
          </label>
          <div className="grid grid-cols-3 gap-2">
            {styleOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  style === option.value
                    ? 'bg-ghibli-green text-white border-ghibli-green'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setStyle(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="negativePrompt" className="block text-sm font-medium text-gray-700 mb-2">
            {t('generate.negativePrompt')}
          </label>
          <textarea
            id="negativePrompt"
            rows={2}
            className="input-field resize-none"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder={t('generate.negativePromptPlaceholder')}
          />
        </div>

        <div>
          <label htmlFor="aiModel" className="block text-sm font-medium text-gray-700 mb-2">
            {t('generate.model')}
          </label>
          <select
            id="aiModel"
            className="input-field"
            value={aiModel}
            onChange={(e) => setAiModel(e.target.value as 'siliconflow' | 'replicate' | 'stability' | 'midjourney')}
          >
            <option value="siliconflow">硅基流动 (推荐)</option>
            <option value="replicate">Replicate</option>
            <option value="stability">Stability AI</option>
            <option value="midjourney">Midjourney</option>
          </select>
        </div>

        {aiModel === 'siliconflow' && (
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
              具体模型
            </label>
            <select
              id="model"
              className="input-field"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="stable-diffusion-xl">Stable Diffusion XL</option>
              <option value="dreamshaper">DreamShaper</option>
              <option value="realistic-vision">Realistic Vision</option>
              <option value="epic-realism">Epic Realism</option>
            </select>
          </div>
        )}

        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900">高级设置</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('generate.width')} × {t('generate.height')}
                </label>
                <select
                  className="input-field"
                  value={`${width}x${height}`}
                  onChange={(e) => {
                    const [w, h] = e.target.value.split('x').map(Number)
                    setWidth(w)
                    setHeight(h)
                  }}
                >
                  {presetSizes.map((size) => (
                    <option key={size.label} value={`${size.width}x${size.height}`}>
                      {size.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('generate.steps')}
                </label>
                <select
                  className="input-field"
                  value={steps}
                  onChange={(e) => setSteps(Number(e.target.value))}
                >
                  <option value="10">10 (快速)</option>
                  <option value="20">20 (推荐)</option>
                  <option value="30">30 (精细)</option>
                  <option value="50">50 (超精细)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('generate.guidanceScale')}
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={guidanceScale}
                  onChange={(e) => setGuidanceScale(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600 mt-1">
                  {guidanceScale}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  随机种子
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="input-field flex-1"
                    value={seed || ''}
                    onChange={(e) => setSeed(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="随机"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRandomSeed}
                  >
                    随机
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                生成数量
              </label>
              <select
                className="input-field"
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
              >
                <option value="1">1 张</option>
                <option value="2">2 张</option>
                <option value="3">3 张</option>
                <option value="4">4 张</option>
              </select>
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading || !prompt.trim()}
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              {t('generate.generating')}
            </>
          ) : (
            <>
              <ImageIcon className="w-4 h-4 mr-2" />
              {t('generate.generate')}
            </>
          )}
        </Button>
      </form>
    </div>
  )
}

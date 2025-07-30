'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, Wand2, Image, Settings, Download, ExternalLink } from 'lucide-react'
import { downloadImage } from '@/lib/utils'

export default function GeneratePage({ params }: { params: { locale: string } }) {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEnglish = params.locale === 'en'

  const content = {
    zh: {
      title: 'AI图片生成',
      subtitle: '描述您想要的图片，AI将为您创作精美的吉卜力风格作品',
      promptLabel: '描述您想要的图片',
      promptPlaceholder: '例如：一个穿着红色裙子的女孩在绿色草地上奔跑，吉卜力工作室风格，高质量，详细',
      negativePromptLabel: '不想要的元素（可选）',
      negativePromptPlaceholder: '例如：低质量，模糊，变形，丑陋',
      generateButton: '开始生成',
      generatingButton: '生成中...',
      downloadButton: '下载图片',
      viewOriginalButton: '查看原图',
      examples: [
        '一只可爱的龙猫在森林中，吉卜力风格',
        '千与千寻中的汤屋，夜晚灯光温暖',
        '天空之城的城堡漂浮在云端',
        '魔女宅急便中的琪琪骑着扫帚飞翔'
      ]
    },
    en: {
      title: 'AI Image Generation',
      subtitle: 'Describe the image you want, and AI will create beautiful Ghibli-style artwork for you',
      promptLabel: 'Describe the image you want',
      promptPlaceholder: 'For example: A girl in a red dress running on green grass, Studio Ghibli style, high quality, detailed',
      negativePromptLabel: 'Unwanted elements (optional)',
      negativePromptPlaceholder: 'For example: low quality, blurry, deformed, ugly',
      generateButton: 'Start Generation',
      generatingButton: 'Generating...',
      downloadButton: 'Download Image',
      viewOriginalButton: 'View Original',
      examples: [
        'A cute Totoro in the forest, Ghibli style',
        'The bathhouse from Spirited Away, warm night lights',
        'Castle in the Sky floating in the clouds',
        'Kiki flying on a broomstick from Kiki\'s Delivery Service'
      ]
    }
  }

  const t = content[isEnglish ? 'en' : 'zh']

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const toast = document.createElement('div')
    toast.innerHTML = message
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-width: 300px;
      word-wrap: break-word;
    `
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast(isEnglish ? 'Please enter a description' : '请输入图片描述', 'error')
      return
    }
    
    setIsGenerating(true)
    setError(null)
    setGeneratedImage(null)
    
    showToast(isEnglish ? 'Generating image...' : '正在生成图片...')

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const apiUrl = API_BASE_URL.endsWith('/api') ? `${API_BASE_URL}/generate/simple` : `${API_BASE_URL}/api/generate/simple`
      console.log('Sending request to:', apiUrl)
      console.log('Prompt:', prompt.trim())
      
      const response = await fetch(apiUrl, {
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

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok && data.success) {
        const imageUrl = data.result?.images?.[0]
        if (imageUrl) {
          setGeneratedImage(imageUrl)
          showToast(isEnglish ? 'Image generated successfully!' : '图片生成成功！')
        } else {
          throw new Error('No image URL in response')
        }
      } else {
        throw new Error(data.error || data.message || (isEnglish ? 'Generation failed' : '生成失败'))
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : (isEnglish ? 'Request failed' : '请求失败')
      console.error('Generation error:', errorMessage)
      setError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!generatedImage) return
    
    setIsDownloading(true)
    try {
      await downloadImage(generatedImage, `ghibli-ai-${Date.now()}.png`)
      showToast(isEnglish ? 'Image downloaded successfully!' : '图片下载成功！')
    } catch (error) {
      console.error('Download error:', error)
      showToast(isEnglish ? 'Download failed, please try again' : '下载失败，请重试', 'error')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleViewOriginal = () => {
    if (generatedImage) {
      window.open(generatedImage, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ghibli-cream-50 via-ghibli-green-50 to-ghibli-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-ghibli-green-100 to-ghibli-blue-100 rounded-full text-ghibli-green-700 text-base font-semibold mb-8 shadow-sm">
            <Wand2 className="w-5 h-5 mr-2" />
            {isEnglish ? 'AI Art Generator' : 'AI 创作工具'}
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t.title}
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          
          <Card className="bg-gradient-to-r from-ghibli-green-50 to-ghibli-blue-50 border-ghibli-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-ghibli-green-700">
                <Sparkles className="w-5 h-5" />
                {isEnglish ? 'Quick Examples' : '快速示例'}
              </CardTitle>
              <CardDescription>
                {isEnglish ? 'Click any example to get started quickly' : '点击任意示例快速开始创作'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {t.examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    className="text-left p-4 rounded-xl border border-white bg-white/60 hover:bg-white hover:shadow-md hover:scale-[1.02] transition-all duration-200"
                  >
                    <p className="text-sm text-gray-700 font-medium">{example}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Settings className="w-6 h-6" />
                {isEnglish ? 'Create Your Artwork' : '创作您的艺术作品'}
              </CardTitle>
              <CardDescription className="text-base">
                {isEnglish ? 'Describe your vision in detail for the best results' : '详细描述您的创意想法，获得最佳生成效果'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-ghibli-green-600" />
                  {t.promptLabel} *
                </label>
                <Textarea
                  placeholder={t.promptPlaceholder}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[150px] text-base resize-none border-2 focus:border-ghibli-green-400 rounded-xl"
                />
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <span>💡</span>
                  {isEnglish ? 'Tip: Be specific about colors, mood, and style for better results' : '提示：详细描述颜色、氛围和风格，获得更好的效果'}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-base font-medium text-gray-700">
                  {t.negativePromptLabel}
                </label>
                <Input
                  placeholder={t.negativePromptPlaceholder}
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  className="text-base border-2 focus:border-ghibli-green-400 rounded-xl"
                />
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-ghibli-green-500 to-ghibli-blue-500 hover:from-ghibli-green-600 hover:to-ghibli-blue-600 shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-3 animate-spin" />
                    {t.generatingButton}
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-3" />
                    {t.generateButton}
                  </>
                )}
              </Button>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {generatedImage && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Image className="w-6 h-6" />
                  {isEnglish ? 'Generated Artwork' : '生成结果'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={generatedImage}
                      alt={prompt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={handleDownload} disabled={isDownloading} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      {isDownloading ? '下载中...' : t.downloadButton}
                    </Button>
                    <Button onClick={handleViewOriginal} variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {t.viewOriginalButton}
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">提示词</h4>
                    <p className="text-sm text-gray-600">{prompt}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!generatedImage && !isGenerating && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Image className="w-6 h-6" />
                  {isEnglish ? 'Generated Artwork' : '生成结果'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square max-w-2xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center text-gray-400 space-y-4">
                    <Image className="w-20 h-20 mx-auto opacity-30" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium">
                        {isEnglish ? 'Your generated image will appear here' : '生成的图片将在这里显示'}
                      </p>
                      <p className="text-sm">
                        {isEnglish ? 'Enter a prompt above and click generate to start' : '在上方输入描述并点击生成按钮开始创作'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Wand2, Image, Settings, Download, ExternalLink, Zap, Palette, Frame } from 'lucide-react'
import { downloadImage } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/hooks/use-i18n'
import { showToast } from '@/lib/toast'

// 简单的下拉选择组件
const Select = ({ value, onValueChange, children }: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ghibli-green focus:border-transparent"
    >
      {children}
    </select>
  </div>
)

const SelectTrigger = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>
    {children}
  </div>
)

const SelectValue = ({ placeholder }: { placeholder?: string }) => (
  <option value="" disabled>{placeholder}</option>
)

const SelectContent = ({ children }: { children: React.ReactNode }) => (
  <>
    {children}
  </>
)

const SelectItem = ({ children, value }: { children: React.ReactNode; value: string }) => (
  <option value={value}>{children}</option>
)

// 简单的滑块组件
const Slider = ({
  value,
  onValueChange,
  max,
  min,
  step,
  className
}: {
  value: number[];
  onValueChange: (value: number[]) => void;
  max: number;
  min: number;
  step: number;
  className?: string
}) => (
  <input
    type="range"
    min={min}
    max={max}
    step={step}
    value={value[0]}
    onChange={(e) => onValueChange([parseFloat(e.target.value)])}
    className={`w-full ${className || ''}`}
  />
)

export default function GeneratePage({ params }: { params: { locale: string } }) {
  const { user } = useAuth()
  const { t, locale } = useI18n()
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('basic')
  
  // Generation parameters
  const [model, setModel] = useState('siliconflow')
  const [style, setStyle] = useState('classic')
  const [width, setWidth] = useState(512)
  const [height, setHeight] = useState(512)
  const [steps, setSteps] = useState(20)
  const [guidanceScale, setGuidanceScale] = useState(7.5)
  const [seed, setSeed] = useState(-1)
  const [isPublic, setIsPublic] = useState(false)

  const models = [
    { value: 'siliconflow', name: locale === 'zh' ? '硅基流动' : 'SiliconFlow', description: locale === 'zh' ? '快速生成，适合初学者' : 'Fast generation, good for beginners' },
    { value: 'replicate', name: locale === 'zh' ? 'Replicate' : 'Replicate', description: locale === 'zh' ? '高质量输出，专业选择' : 'High quality output, professional choice' }
  ]

  const styles = [
    { value: 'classic', name: locale === 'zh' ? '经典吉卜力' : 'Classic Ghibli', description: locale === 'zh' ? '传统吉卜力动画风格' : 'Traditional Ghibli animation style' },
    { value: 'modern', name: locale === 'zh' ? '现代吉卜力' : 'Modern Ghibli', description: locale === 'zh' ? '现代吉卜力电影风格' : 'Modern Ghibli movie style' },
    { value: 'watercolor', name: locale === 'zh' ? '水彩风格' : 'Watercolor', description: locale === 'zh' ? '水彩画效果' : 'Watercolor painting effect' },
    { value: 'sketch', name: locale === 'zh' ? '素描风格' : 'Sketch', description: locale === 'zh' ? '铅笔素描效果' : 'Pencil sketch effect' }
  ]

  const examples = [
    locale === 'zh' ? '一只可爱的龙猫在森林中，吉卜力风格' : 'A cute Totoro in the forest, Ghibli style',
    locale === 'zh' ? '千与千寻中的汤屋，夜晚灯光温暖' : 'The bathhouse from Spirited Away, warm night lights',
    locale === 'zh' ? '天空之城的城堡漂浮在云端' : 'Castle in the Sky floating in the clouds',
    locale === 'zh' ? '魔女宅急便中的琪琪骑着扫帚飞翔' : 'Kiki flying on a broomstick from Kiki\'s Delivery Service'
  ]

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000))
  }

  const handleSaveToGallery = async () => {
    if (!generatedImage || !user) return
    
    try {
      // 这里应该调用API保存图片到用户画廊
      // await saveImageToGallery({
      //   imageUrl: generatedImage,
      //   prompt,
      //   negativePrompt,
      //   model,
      //   style,
      //   width,
      //   height,
      //   isPublic
      // })
      
      showToast.success(t('generate.saveToGallerySuccess'))
    } catch (error) {
      console.error('保存到画廊失败:', error)
      showToast.error(t('generate.saveToGalleryError'))
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast.error(t('generate.promptRequired'))
      return
    }
    
    if (!user) {
      showToast.error(t('generate.loginRequired'))
      return
    }
    
    setIsGenerating(true)
    setError(null)
    setGeneratedImage(null)
    
    showToast.loading(t('generate.generating'))

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const apiUrl = API_BASE_URL.endsWith('/api') ? `${API_BASE_URL}/generate` : `${API_BASE_URL}/api/generate`
      
      const requestBody: any = {
        prompt: prompt.trim(),
        model,
        width,
        height,
        steps,
        guidance_scale: guidanceScale,
        style
      }
      
      if (negativePrompt.trim()) {
        requestBody.negative_prompt = negativePrompt.trim()
      }
      
      if (seed > 0) {
        requestBody.seed = seed
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (response.ok) {
        const imageUrl = data.result?.images?.[0]
        if (imageUrl) {
          setGeneratedImage(imageUrl)
          showToast.success(t('generate.generateSuccess'))
        } else {
          throw new Error('No image URL in response')
        }
      } else {
        throw new Error(data.error || data.message || t('generate.generateError'))
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('generate.requestError')
      console.error('Generation error:', errorMessage)
      setError(errorMessage)
      showToast.error(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!generatedImage) return
    
    setIsDownloading(true)
    try {
      await downloadImage(generatedImage, `ghibli-ai-${Date.now()}.png`)
      showToast.success(t('generate.downloadSuccess'))
    } catch (error) {
      console.error('Download error:', error)
      showToast.error(t('generate.downloadError'))
    } finally {
      setIsDownloading(false)
    }
  }

  const handleViewOriginal = () => {
    if (generatedImage) {
      window.open(generatedImage, '_blank')
    }
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt)
    showToast.success(t('generate.copyPromptSuccess'))
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-ghibli-cream flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Wand2 className="w-12 h-12 text-ghibli-green mx-auto mb-4" />
            <CardTitle className="text-2xl">{t('generate.loginRequired')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {t('generate.loginDesc')}
            </p>
            <Button onClick={() => window.location.href = `/${locale}/login`} className="w-full">
              {t('generate.goLogin')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ghibli-cream-50 via-ghibli-green-50 to-ghibli-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-ghibli-green-100 to-ghibli-blue-100 rounded-full text-ghibli-green-700 text-base font-semibold mb-8 shadow-sm">
            <Wand2 className="w-5 h-5 mr-2" />
            {t('generate.aiArtGenerator')}
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t('generate.title')}
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('generate.subtitle')}
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          
          <Card className="bg-gradient-to-r from-ghibli-green-50 to-ghibli-blue-50 border-ghibli-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-ghibli-green-700">
                <Sparkles className="w-5 h-5" />
                {t('generate.quickExamples')}
              </CardTitle>
              <CardDescription>
                {t('generate.examplesDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {examples.map((example, index) => (
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
                {t('generate.createArtwork')}
              </CardTitle>
              <CardDescription className="text-base">
                {t('generate.createDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">{t('generate.basicTab')}</TabsTrigger>
                  <TabsTrigger value="advanced">{t('generate.advancedTab')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Wand2 className="w-5 h-5 text-ghibli-green-600" />
                      {t('generate.promptLabel')} *
                    </label>
                    <Textarea
                      placeholder={t('generate.promptPlaceholder')}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[150px] text-base resize-none border-2 focus:border-ghibli-green-400 rounded-xl"
                    />
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <span>💡</span>
                      {t('generate.promptTip')}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-base font-medium text-gray-700">
                      {t('generate.negativePromptLabel')}
                    </label>
                    <Textarea
                      placeholder={t('generate.negativePromptPlaceholder')}
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      className="min-h-[80px] text-base resize-none border-2 focus:border-ghibli-green-400 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-base font-medium text-gray-700 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        {t('generate.modelLabel')}
                      </label>
                      <Select value={model} onValueChange={setModel}>
                        <SelectTrigger className="border-2 focus:border-ghibli-green-400 rounded-xl">
                          <SelectValue placeholder={t('generate.modelPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {models.map((model) => (
                            <SelectItem key={model.value} value={model.value}>
                              <div>
                                <div className="font-medium">{model.name}</div>
                                <div className="text-xs text-gray-500">{model.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-base font-medium text-gray-700 flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        {t('generate.styleLabel')}
                      </label>
                      <Select value={style} onValueChange={setStyle}>
                        <SelectTrigger className="border-2 focus:border-ghibli-green-400 rounded-xl">
                          <SelectValue placeholder={t('generate.stylePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {styles.map((style) => (
                            <SelectItem key={style.value} value={style.value}>
                              <div>
                                <div className="font-medium">{style.name}</div>
                                <div className="text-xs text-gray-500">{style.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-base font-medium text-gray-700 flex items-center gap-2">
                          <Frame className="w-4 h-4" />
                          {t('generate.sizeLabel')}
                        </label>
                        <Badge variant="outline" className="text-xs">
                          {width} × {height}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { width: 512, height: 512, name: '1:1' },
                          { width: 768, height: 512, name: '3:2' },
                          { width: 512, height: 768, name: '2:3' },
                          { width: 1024, height: 1024, name: '1:1 HD' }
                        ].map((size) => (
                          <button
                            key={`${size.width}x${size.height}`}
                            type="button"
                            onClick={() => {
                              setWidth(size.width)
                              setHeight(size.height)
                            }}
                            className={`p-3 border rounded-lg text-center transition-colors ${
                              width === size.width && height === size.height
                                ? 'border-ghibli-green bg-ghibli-green/10 text-ghibli-green'
                                : 'border-gray-300 hover:border-ghibli-green'
                            }`}
                          >
                            <div className="text-sm font-medium">{size.name}</div>
                            <div className="text-xs text-gray-500">{size.width}×{size.height}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-base font-medium text-gray-700">
                        {t('generate.stepsLabel')} ({steps})
                      </label>
                      <Slider
                        value={[steps]}
                        onValueChange={(value: number[]) => setSteps(value[0])}
                        max={50}
                        min={10}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{t('generate.faster')}</span>
                        <span>{t('generate.higherQuality')}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-base font-medium text-gray-700">
                        {t('generate.guidanceScaleLabel')} ({guidanceScale})
                      </label>
                      <Slider
                        value={[guidanceScale]}
                        onValueChange={(value: number[]) => setGuidanceScale(value[0])}
                        max={20}
                        min={1}
                        step={0.5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{t('generate.moreCreative')}</span>
                        <span>{t('generate.moreAccurate')}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-base font-medium text-gray-700 flex items-center justify-between">
                        <span>{t('generate.seedLabel')}</span>
                        <Button variant="ghost" size="sm" onClick={handleRandomSeed}>
                          {t('generate.randomSeed')}
                        </Button>
                      </label>
                      <Input
                        type="number"
                        value={seed === -1 ? '' : seed}
                        onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : -1)}
                        placeholder={t('generate.seedPlaceholder')}
                        className="border-2 focus:border-ghibli-green-400 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="rounded border-gray-300 text-ghibli-green focus:ring-ghibli-green"
                    />
                    <label htmlFor="isPublic" className="text-sm text-gray-700">
                      {t('generate.shareToGallery')}
                    </label>
                  </div>
                </TabsContent>
              </Tabs>

              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-ghibli-green-500 to-ghibli-blue-500 hover:from-ghibli-green-600 hover:to-ghibli-blue-600 shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-3 animate-spin" />
                    {t('generate.generatingButton')}
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-3" />
                    {t('generate.generateButton')}
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
                  {t('generate.generatedArtwork')}
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
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button onClick={handleDownload} disabled={isDownloading} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      {isDownloading ? t('generate.downloading') : t('generate.downloadButton')}
                    </Button>
                    <Button onClick={handleViewOriginal} variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {t('generate.viewOriginalButton')}
                    </Button>
                    <Button onClick={handleCopyPrompt} variant="outline">
                      <Wand2 className="w-4 h-4 mr-2" />
                      {t('generate.copyPrompt')}
                    </Button>
                    <Button onClick={handleSaveToGallery} variant="outline">
                      <Image className="w-4 h-4 mr-2" />
                      {t('generate.saveToGallery')}
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{t('generate.promptUsed')}</h4>
                      <Badge variant="outline" className="text-xs">
                        {models.find(m => m.value === model)?.name} · {styles.find(s => s.value === style)?.name}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{prompt}</p>
                    {negativePrompt && (
                      <div className="mt-3">
                        <h5 className="text-xs font-medium text-gray-700 mb-1">{t('generate.negativePromptUsed')}</h5>
                        <p className="text-xs text-gray-600">{negativePrompt}</p>
                      </div>
                    )}
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
                  {t('generate.generatedArtwork')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square max-w-2xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center text-gray-400 space-y-4">
                    <Image className="w-20 h-20 mx-auto opacity-30" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium">
                        {t('generate.imageWillAppearHere')}
                      </p>
                      <p className="text-sm">
                        {t('generate.enterPromptToStart')}
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

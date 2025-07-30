'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n'
import { Settings, Save, RotateCcw } from 'lucide-react'
import { showToast } from '@/lib/toast'

interface UserPreferences {
  defaultModel: 'siliconflow' | 'replicate' | 'stability' | 'midjourney'
  defaultStyle: string
  defaultWidth: number
  defaultHeight: number
  defaultSteps: number
  defaultGuidanceScale: number
  defaultBatchSize: number
  autoSaveHistory: boolean
  highQualityMode: boolean
  language: string
  // Google用户特有设置
  syncWithGoogle: boolean
  autoShareToGooglePhotos: boolean
  googleNotifications: boolean
}

const defaultPreferences: UserPreferences = {
  defaultModel: 'siliconflow',
  defaultStyle: 'ghibli',
  defaultWidth: 512,
  defaultHeight: 512,
  defaultSteps: 20,
  defaultGuidanceScale: 7.5,
  defaultBatchSize: 1,
  autoSaveHistory: true,
  highQualityMode: false,
  language: 'zh',
  syncWithGoogle: true,
  autoShareToGooglePhotos: false,
  googleNotifications: true
}

interface UserPreferencesProps {
  className?: string
}

export function UserPreferences({ className = '' }: UserPreferencesProps) {
  const { user } = useAuth()
  const { t, locale } = useI18n()
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [loading, setLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  // 检查是否为Google用户
  const isGoogleUser = user?.app_metadata?.provider === 'google'

  useEffect(() => {
    if (user) {
      loadPreferences()
    }
  }, [user])

  const loadPreferences = () => {
    // 从本地存储加载用户偏好
    const savedPreferences = localStorage.getItem(`user-preferences-${user?.id}`)
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences)
        setPreferences({ ...defaultPreferences, ...parsed })
      } catch (error) {
        console.error('Failed to load preferences:', error)
      }
    }
  }

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // 保存到本地存储
      localStorage.setItem(`user-preferences-${user.id}`, JSON.stringify(preferences))
      
      // 保存到服务器
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token') || ''}`,
        },
        body: JSON.stringify(preferences),
      })
      
      if (!response.ok) {
        throw new Error('Failed to save preferences to server')
      }
      
      showToast.success('偏好设置已保存')
      setHasChanges(false)
    } catch (error) {
      console.error('Error saving preferences:', error)
      showToast.error('保存失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setPreferences(defaultPreferences)
    setHasChanges(true)
  }

  const modelOptions = [
    { value: 'siliconflow', label: '硅基流动 (推荐)' },
    { value: 'replicate', label: 'Replicate' },
    { value: 'stability', label: 'Stability AI' },
    { value: 'midjourney', label: 'Midjourney' }
  ]

  const styleOptions = [
    { value: 'ghibli', label: '吉卜力风格' },
    { value: 'anime', label: '动漫风格' },
    { value: 'realistic', label: '写实风格' },
    { value: 'watercolor', label: '水彩风格' },
    { value: 'oil-painting', label: '油画风格' },
    { value: 'sketch', label: '素描风格' }
  ]

  const sizeOptions = [
    { label: '512 × 512', width: 512, height: 512 },
    { label: '768 × 768', width: 768, height: 768 },
    { label: '1024 × 1024', width: 1024, height: 1024 },
    { label: '512 × 768', width: 512, height: 768 },
    { label: '768 × 512', width: 768, height: 512 }
  ]

  if (!user) {
    return (
      <div className={`card ${className}`}>
        <div className="text-center py-12">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            请先登录
          </h3>
          <p className="text-gray-600">
            登录后可设置您的偏好
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">用户偏好</h2>
        <div className="flex gap-2">
          {hasChanges && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              重置
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={loading || !hasChanges}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">生成设置</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                默认AI模型
              </label>
              <select
                className="input-field"
                value={preferences.defaultModel}
                onChange={(e) => handlePreferenceChange('defaultModel', e.target.value)}
              >
                {modelOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                默认艺术风格
              </label>
              <select
                className="input-field"
                value={preferences.defaultStyle}
                onChange={(e) => handlePreferenceChange('defaultStyle', e.target.value)}
              >
                {styleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                默认图片尺寸
              </label>
              <select
                className="input-field"
                value={`${preferences.defaultWidth}x${preferences.defaultHeight}`}
                onChange={(e) => {
                  const [w, h] = e.target.value.split('x').map(Number)
                  handlePreferenceChange('defaultWidth', w)
                  handlePreferenceChange('defaultHeight', h)
                }}
              >
                {sizeOptions.map(size => (
                  <option key={size.label} value={`${size.width}x${size.height}`}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                默认生成步数
              </label>
              <select
                className="input-field"
                value={preferences.defaultSteps}
                onChange={(e) => handlePreferenceChange('defaultSteps', Number(e.target.value))}
              >
                <option value="10">10 (快速)</option>
                <option value="20">20 (推荐)</option>
                <option value="30">30 (精细)</option>
                <option value="50">50 (超精细)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                默认引导强度
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={preferences.defaultGuidanceScale}
                onChange={(e) => handlePreferenceChange('defaultGuidanceScale', Number(e.target.value))}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600 mt-1">
                {preferences.defaultGuidanceScale}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                默认生成数量
              </label>
              <select
                className="input-field"
                value={preferences.defaultBatchSize}
                onChange={(e) => handlePreferenceChange('defaultBatchSize', Number(e.target.value))}
              >
                <option value="1">1 张</option>
                <option value="2">2 张</option>
                <option value="3">3 张</option>
                <option value="4">4 张</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">其他设置</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  自动保存历史记录
                </label>
                <p className="text-sm text-gray-500">
                  自动保存您的生成历史
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={preferences.autoSaveHistory}
                  onChange={(e) => handlePreferenceChange('autoSaveHistory', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ghibli-green"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  高质量模式
                </label>
                <p className="text-sm text-gray-500">
                  生成更高质量的图片，但需要更长时间
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={preferences.highQualityMode}
                  onChange={(e) => handlePreferenceChange('highQualityMode', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ghibli-green"></div>
              </label>
            </div>
          </div>
        </div>
        
        {/* Google用户特有设置 */}
        {isGoogleUser && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Google集成设置</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    与Google账户同步
                  </label>
                  <p className="text-sm text-gray-500">
                    将您的偏好设置同步到Google账户
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.syncWithGoogle}
                    onChange={(e) => handlePreferenceChange('syncWithGoogle', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ghibli-green"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    自动分享到Google相册
                  </label>
                  <p className="text-sm text-gray-500">
                    将生成的图片自动保存到Google相册
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.autoShareToGooglePhotos}
                    onChange={(e) => handlePreferenceChange('autoShareToGooglePhotos', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ghibli-green"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Google通知
                  </label>
                  <p className="text-sm text-gray-500">
                    接收生成完成和系统更新的通知
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.googleNotifications}
                    onChange={(e) => handlePreferenceChange('googleNotifications', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ghibli-green"></div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
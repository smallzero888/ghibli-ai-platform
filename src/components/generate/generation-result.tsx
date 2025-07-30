'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { GenerationTask } from '@/types'
import { Download, Share2, RefreshCw, ExternalLink, Eye } from 'lucide-react'
import { downloadImage } from '@/lib/utils'
import { showToast } from '@/lib/toast'
import { cn } from '@/lib/utils'

interface GenerationResultProps {
  task: GenerationTask | null
}

export function GenerationResult({ task }: GenerationResultProps) {
  const [currentTask, setCurrentTask] = useState<GenerationTask | null>(task)
  const [polling, setPolling] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isViewing, setIsViewing] = useState(false)

  useEffect(() => {
    setCurrentTask(task)
    if (task && task.status === 'processing') {
      setPolling(true)
    }
  }, [task])

  useEffect(() => {
    if (!currentTask || !polling || currentTask.status !== 'processing') {
      setPolling(false)
      return
    }

    const pollTask = async () => {
      try {
        const response = await apiClient.getGenerationTask(currentTask.id)
        if (response.data) {
          setCurrentTask(response.data)
          if (response.data.status !== 'processing') {
            setPolling(false)
          }
        }
      } catch (error) {
        console.error('轮询任务状态失败:', error)
        setPolling(false)
      }
    }

    const interval = setInterval(pollTask, 3000)
    return () => clearInterval(interval)
  }, [currentTask, polling])

  const handleDownload = async () => {
    if (!currentTask?.result_url) return
    
    setIsDownloading(true)
    try {
      await downloadImage(currentTask.result_url, `ghibli-ai-${currentTask.id}.png`)
      showToast.success('图片下载成功！')
    } catch (error) {
      console.error('下载失败:', error)
      showToast.error('下载失败，请重试')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleViewOriginal = () => {
    if (!currentTask?.result_url) return
    window.open(currentTask.result_url, '_blank')
  }

  const handleShare = async () => {
    if (!currentTask?.result_url) return
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: '我的AI生成作品',
          text: currentTask.prompt,
          url: currentTask.result_url,
        })
      } else {
        // 复制链接到剪贴板
        await navigator.clipboard.writeText(currentTask.result_url)
        showToast.success('链接已复制到剪贴板')
      }
    } catch (error) {
      console.error('分享失败:', error)
      showToast.error('分享失败，请重试')
    }
  }

  const handlePreview = () => {
    if (!currentTask?.result_url) return
    setIsViewing(true)
  }

  if (!currentTask) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            等待生成
          </h3>
          <p className="text-gray-600">
            填写左侧表单开始创作您的艺术作品
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">生成结果</h2>
      
      {currentTask.status === 'processing' && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-ghibli-green/10 rounded-full mb-4">
            <RefreshCw className="w-8 h-8 text-ghibli-green animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            正在生成中...
          </h3>
          <p className="text-gray-600 mb-4">
            AI正在根据您的描述创作图片，请稍候
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-ghibli-green h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      )}

      {currentTask.status === 'completed' && currentTask.result_url && (
        <div className="space-y-4">
          {/* 图片预览区域 */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={currentTask.result_url}
              alt={currentTask.prompt}
              fill
              className="object-cover cursor-pointer"
              onClick={handlePreview}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            
            {/* 图片悬停时的操作提示 */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
              <div className="text-white text-center">
                <Eye className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">点击查看大图</p>
              </div>
            </div>
          </div>
          
          {/* 操作按钮组 */}
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleViewOriginal} variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              查看原图
            </Button>
            <Button onClick={handleDownload} disabled={isDownloading}>
              <Download className={cn(
                "w-4 h-4 mr-2",
                isDownloading && "animate-pulse"
              )} />
              {isDownloading ? '下载中...' : '下载图片'}
            </Button>
          </div>
          
          <Button onClick={handleShare} variant="outline" className="w-full">
            <Share2 className="w-4 h-4 mr-2" />
            分享作品
          </Button>
          
          {/* 提示词信息 */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">提示词</h4>
              <p className="text-sm text-gray-600">{currentTask.prompt}</p>
            </div>
          </div>
        </div>
      )}

      {currentTask.status === 'failed' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-red-600 text-2xl">✕</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            生成失败
          </h3>
          <p className="text-gray-600 mb-4">
            {currentTask.error_message || '生成过程中出现了错误，请重试'}
          </p>
          <Button variant="outline">
            重新生成
          </Button>
        </div>
      )}

      {/* 图片预览模态框 */}
      {isViewing && currentTask?.result_url && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsViewing(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={currentTask.result_url} 
              alt={currentTask.prompt}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
              onClick={() => setIsViewing(false)}
            >
              ✕
            </button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              <Button onClick={handleDownload} size="sm">
                <Download className="w-4 h-4 mr-2" />
                下载
              </Button>
              <Button onClick={handleViewOriginal} variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                新窗口打开
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

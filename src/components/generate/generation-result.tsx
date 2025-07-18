'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { GenerationTask } from '@/types'
import { Download, Share2, RefreshCw } from 'lucide-react'
import { downloadImage } from '@/lib/utils'
import { showToast } from '@/lib/toast'

interface GenerationResultProps {
  task: GenerationTask | null
}

export function GenerationResult({ task }: GenerationResultProps) {
  const [currentTask, setCurrentTask] = useState<GenerationTask | null>(task)
  const [polling, setPolling] = useState(false)

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

  const handleDownload = () => {
    if (currentTask?.result_url) {
      downloadImage(currentTask.result_url, `ghibli-ai-${currentTask.id}.png`)
    }
  }

  const handleShare = async () => {
    if (currentTask?.result_url) {
      try {
        await navigator.share({
          title: '我的AI生成作品',
          text: currentTask.prompt,
          url: currentTask.result_url,
        })
      } catch (error) {
        // 如果不支持原生分享，复制链接到剪贴板
        navigator.clipboard.writeText(currentTask.result_url)
        alert('链接已复制到剪贴板')
      }
    }
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
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={currentTask.result_url}
              alt={currentTask.prompt}
              fill
              className="object-cover"
            />
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">提示词</h4>
              <p className="text-sm text-gray-600">{currentTask.prompt}</p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleDownload} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                下载
              </Button>
              <Button variant="outline" onClick={handleShare} className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                分享
              </Button>
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
    </div>
  )
}

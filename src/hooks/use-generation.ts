'use client'

import { useState, useCallback } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { GenerationRequest, GenerationTask } from '@/types'

export function useGeneration() {
  const [currentTask, setCurrentTask] = useState<GenerationTask | null>(null)

  // 创建生成任务
  const createTaskMutation = useMutation({
    mutationFn: (request: GenerationRequest) => apiClient.createGenerationTask(request),
    onSuccess: (response) => {
      if (response.data) {
        setCurrentTask(response.data)
      }
    },
  })

  // 查询任务状态
  const { data: taskStatus, refetch: refetchTask } = useQuery({
    queryKey: ['generation-task', currentTask?.id],
    queryFn: () => currentTask ? apiClient.getGenerationTask(currentTask.id) : null,
    enabled: !!currentTask && currentTask.status === 'processing',
    refetchInterval: 3000, // 每3秒轮询一次
  })

  // 获取可用模型
  const { data: availableModels } = useQuery({
    queryKey: ['available-models'],
    queryFn: () => apiClient.getAvailableModels(),
  })

  const generateImage = useCallback(async (request: GenerationRequest) => {
    return createTaskMutation.mutateAsync(request)
  }, [createTaskMutation])

  return {
    currentTask: taskStatus?.data || currentTask,
    generateImage,
    availableModels: availableModels?.data || [],
    isGenerating: createTaskMutation.isPending,
    error: createTaskMutation.error,
    refetchTask,
  }
}
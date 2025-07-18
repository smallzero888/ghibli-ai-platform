'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { GenerationTask, GenerationRequest } from '@/types'

interface GenerationState {
  // 当前生成任务
  currentTask: GenerationTask | null
  
  // 生成历史
  history: GenerationTask[]
  
  // 表单数据
  formData: Partial<GenerationRequest>
  
  // 生成进度
  progress: number
  
  // 错误信息
  error: string | null
  
  // WebSocket连接状态
  isConnected: boolean
  
  // Actions
  startGeneration: (params: GenerationRequest) => void
  updateProgress: (progress: number) => void
  completeGeneration: (result: GenerationTask) => void
  failGeneration: (error: string) => void
  cancelGeneration: () => void
  retryGeneration: () => void
  saveFormData: (data: Partial<GenerationRequest>) => void
  clearHistory: () => void
  setCurrentTask: (task: GenerationTask | null) => void
  setError: (error: string | null) => void
  setConnected: (connected: boolean) => void
}

export const useGenerateStore = create<GenerationState>()(
  persist(
    (set, get) => ({
      currentTask: null,
      history: [],
      formData: {
        prompt: '',
        negative_prompt: '',
        ai_model: 'siliconflow',
        width: 512,
        height: 512,
        steps: 20,
        guidance_scale: 7.5,
      },
      progress: 0,
      error: null,
      isConnected: false,

      startGeneration: (params: GenerationRequest) => {
        const task: GenerationTask = {
          id: crypto.randomUUID(),
          user_id: 'current_user', // 实际应从auth store获取
          prompt: params.prompt,
          ai_model: params.ai_model,
          status: 'pending',
          created_at: new Date().toISOString(),
        }
        
        set({ 
          currentTask: task,
          progress: 0,
          error: null 
        })
        
        // 添加到历史记录
        const { history } = get()
        set({ 
          history: [task, ...history.slice(0, 49)] // 保留最近50条记录
        })
      },

      updateProgress: (progress: number) => {
        set({ progress: Math.min(100, Math.max(0, progress)) })
        
        // 更新当前任务状态
        const { currentTask } = get()
        if (currentTask && currentTask.status === 'pending') {
          set({
            currentTask: {
              ...currentTask,
              status: 'processing'
            }
          })
        }
      },

      completeGeneration: (result: GenerationTask) => {
        set({ 
          currentTask: result,
          progress: 100,
          error: null 
        })
        
        // 更新历史记录
        const { history } = get()
        const updatedHistory = history.map(task => 
          task.id === result.id ? result : task
        )
        set({ history: updatedHistory })
      },

      failGeneration: (error: string) => {
        const { currentTask } = get()
        if (currentTask) {
          const failedTask = {
            ...currentTask,
            status: 'failed' as const,
            error_message: error,
            completed_at: new Date().toISOString(),
          }
          
          set({ 
            currentTask: failedTask,
            error,
            progress: 0 
          })
          
          // 更新历史记录
          const { history } = get()
          const updatedHistory = history.map(task => 
            task.id === failedTask.id ? failedTask : task
          )
          set({ history: updatedHistory })
        }
      },

      cancelGeneration: () => {
        const { currentTask } = get()
        if (currentTask) {
          const cancelledTask = {
            ...currentTask,
            status: 'failed' as const,
            error_message: '用户取消生成',
            completed_at: new Date().toISOString(),
          }
          
          set({ 
            currentTask: null,
            progress: 0,
            error: null 
          })
          
          // 更新历史记录
          const { history } = get()
          const updatedHistory = history.map(task => 
            task.id === cancelledTask.id ? cancelledTask : task
          )
          set({ history: updatedHistory })
        }
      },

      retryGeneration: () => {
        const { currentTask, formData } = get()
        if (currentTask && formData.prompt) {
          get().startGeneration(formData as GenerationRequest)
        }
      },

      saveFormData: (data: Partial<GenerationRequest>) => {
        set((state) => ({
          formData: { ...state.formData, ...data }
        }))
      },

      clearHistory: () => {
        set({ history: [] })
      },

      setCurrentTask: (task: GenerationTask | null) => {
        set({ currentTask: task })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      setConnected: (connected: boolean) => {
        set({ isConnected: connected })
      },
    }),
    {
      name: 'generation-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        history: state.history.slice(0, 10), // 只持久化最近10条记录
        formData: state.formData,
      }),
    }
  )
)
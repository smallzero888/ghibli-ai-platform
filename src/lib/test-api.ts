import { ApiResponse, GenerationRequest, GenerationTask } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

class TestApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      const contentType = response.headers.get('content-type')
      let data: any
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      if (!response.ok) {
        const errorMessage = typeof data === 'string' ? data : data?.error || data?.message || 'API request failed'
        throw new Error(errorMessage)
      }

      return { data, message: data?.message }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Network error occurred')
    }
  }

  // 测试图片生成 - 无需认证
  async createGenerationTask(request: { prompt: string; width?: number; height?: number }): Promise<ApiResponse<any>> {
    return this.request('/test/test-generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt: request.prompt,
        width: request.width || 512,
        height: request.height || 512,
      }),
    })
  }

  async getAvailableModels(): Promise<ApiResponse<any>> {
    return this.request('/test/test-models')
  }
}

export const testApiClient = new TestApiClient()

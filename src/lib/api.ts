import { ApiResponse, GenerationRequest, GenerationTask, Image, PaginatedResponse } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

class ApiClient {
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

  // Generation endpoints
  async createGenerationTask(request: GenerationRequest): Promise<ApiResponse<GenerationTask>> {
    return this.request('/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async getGenerationTask(taskId: string): Promise<ApiResponse<GenerationTask>> {
    return this.request(`/generate/${taskId}`)
  }

  async getAvailableModels(): Promise<ApiResponse<string[]>> {
    return this.request('/generate/models')
  }

  // Images endpoints
  async getUserImages(page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<Image>>> {
    return this.request(`/images?page=${page}&limit=${limit}`)
  }

  async getPublicImages(page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<Image>>> {
    return this.request(`/images/public?page=${page}&limit=${limit}`)
  }

  async getImage(imageId: string): Promise<ApiResponse<Image>> {
    return this.request(`/images/${imageId}`)
  }

  async deleteImage(imageId: string): Promise<ApiResponse<void>> {
    return this.request(`/images/${imageId}`, {
      method: 'DELETE',
    })
  }

  async updateImage(imageId: string, updates: Partial<Image>): Promise<ApiResponse<Image>> {
    return this.request(`/images/${imageId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async shareImage(imageId: string): Promise<ApiResponse<{ share_url: string }>> {
    return this.request(`/images/${imageId}/share`, {
      method: 'POST',
    })
  }
}

export const apiClient = new ApiClient()

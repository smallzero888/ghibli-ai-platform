export interface User {
  id: string
  email: string
  username?: string
  full_name?: string
  avatar_url?: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Image {
  id: string
  user_id: string
  prompt: string
  negative_prompt?: string
  ai_model: string
  image_url: string
  thumbnail_url?: string
  width?: number
  height?: number
  generation_params?: Record<string, any>
  status: 'completed' | 'failed' | 'processing'
  is_public: boolean
  created_at: string
}

export interface GenerationTask {
  id: string
  user_id: string
  prompt: string
  ai_model: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  external_task_id?: string
  result_url?: string
  error_message?: string
  created_at: string
  completed_at?: string
}

export interface GenerationRequest {
  prompt: string
  negative_prompt?: string
  ai_model: 'siliconflow' | 'replicate' | 'stability' | 'midjourney'
  model?: string
  style?: string
  width?: number
  height?: number
  steps?: number
  guidance_scale?: number
  seed?: number
  batch_size?: number
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  has_next: boolean
  has_prev: boolean
}
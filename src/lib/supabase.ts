import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// 获取环境变量
const getEnvVar = (name: string): string => {
  if (typeof window === 'undefined') {
    // 服务端
    return process.env[name] || ''
  }
  // 客户端
  return process.env[name] || ''
}

// 获取Supabase配置
const getSupabaseConfig = () => {
  const url = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
  const key = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  
  if (!url || !key) {
    console.error('Supabase configuration missing:', { url: !!url, key: !!key })
    // 使用正确的生产环境URL
    return {
      url: 'https://wqzjtjcrjvgspalihvqw.supabase.co',
      key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indxemp0amNyanZnc3BhbGlodnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MjExMzksImV4cCI6MjA2ODI5NzEzOX0.7IAQq5J4OyqFqZNEO0yL2w7NWVUvQYTvqZrXNYs8IlU'
    }
  }
  
  return { url, key }
}

// 创建客户端的函数，用于组件内部使用
export const createClient = () => {
  const config = getSupabaseConfig()
  return createSupabaseClient(config.url, config.key)
}

// 服务端使用的客户端（具有管理员权限）
export const getSupabaseAdmin = () => {
  if (typeof window !== 'undefined') {
    return null
  }
  
  const url = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
  const serviceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
  
  if (!url || !serviceKey) {
    console.error('Supabase admin configuration missing:', { url: !!url, serviceKey: !!serviceKey })
    return createSupabaseClient(
      'https://wqzjtjcrjvgspalihvqw.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indxemp0amNyanZnc3BhbGlodnF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjcyMTEzOSwiZXhwIjoyMDY4Mjk3MTM5fQ.wTgyHIkyKc7og_CnQa8WHiQ1_JAf8mqJxFspjkwLMyk',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  }
  
  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// 兼容旧代码的导出
export const supabase = typeof window !== 'undefined' ? createClient() : null
export const supabaseAdmin = getSupabaseAdmin()

// 数据库类型定义
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      images: {
        Row: {
          id: string
          user_id: string
          prompt: string
          negative_prompt: string | null
          ai_model: string
          image_url: string
          thumbnail_url: string | null
          width: number | null
          height: number | null
          generation_params: any | null
          status: string
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt: string
          negative_prompt?: string | null
          ai_model: string
          image_url: string
          thumbnail_url?: string | null
          width?: number | null
          height?: number | null
          generation_params?: any | null
          status?: string
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt?: string
          negative_prompt?: string | null
          ai_model?: string
          image_url?: string
          thumbnail_url?: string | null
          width?: number | null
          height?: number | null
          generation_params?: any | null
          status?: string
          is_public?: boolean
          created_at?: string
        }
      }
      generation_tasks: {
        Row: {
          id: string
          user_id: string
          prompt: string
          ai_model: string
          status: string
          external_task_id: string | null
          result_url: string | null
          error_message: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          prompt: string
          ai_model: string
          status?: string
          external_task_id?: string | null
          result_url?: string | null
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          prompt?: string
          ai_model?: string
          status?: string
          external_task_id?: string | null
          result_url?: string | null
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
    }
  }
}

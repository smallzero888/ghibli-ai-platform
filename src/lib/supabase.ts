import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// 创建客户端的函数，用于组件内部使用
export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// 服务端使用的客户端（具有管理员权限）
// 注意：这个只能在服务端使用，不能在客户端使用
export const supabaseAdmin = typeof window === 'undefined' 
  ? createSupabaseClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null

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

'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User, Session } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  credits: number
  subscription_tier: 'free' | 'pro' | 'enterprise'
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username?: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  refreshSession: () => Promise<void>
  updateCredits: (amount: number) => void
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: true,
      credits: 10, // 免费用户初始积分
      subscription_tier: 'free',

      signIn: async (email: string, password: string) => {
        const supabase = createClient()
        set({ loading: true })
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          
          if (error) throw error
          
          set({ 
            user: data.user,
            session: data.session,
            loading: false 
          })
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      signUp: async (email: string, password: string, username?: string) => {
        const supabase = createClient()
        set({ loading: true })
        
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username: username || email.split('@')[0],
              }
            }
          })
          
          if (error) throw error
          
          set({ 
            user: data.user,
            session: data.session,
            loading: false 
          })
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      signOut: async () => {
        const supabase = createClient()
        set({ loading: true })
        
        try {
          const { error } = await supabase.auth.signOut()
          if (error) throw error
          
          set({ 
            user: null,
            session: null,
            loading: false,
            credits: 0,
            subscription_tier: 'free'
          })
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      updateProfile: async (data: Partial<User>) => {
        const supabase = createClient()
        const { user } = get()
        
        if (!user) throw new Error('用户未登录')
        
        try {
          const { data: updatedUser, error } = await supabase.auth.updateUser({
            data: data
          })
          
          if (error) throw error
          
          set({ user: updatedUser.user })
        } catch (error) {
          throw error
        }
      },

      refreshSession: async () => {
        const supabase = createClient()
        
        try {
          const { data, error } = await supabase.auth.refreshSession()
          if (error) throw error
          
          set({ 
            user: data.user,
            session: data.session 
          })
        } catch (error) {
          console.error('刷新会话失败:', error)
        }
      },

      updateCredits: (amount: number) => {
        set((state) => ({ 
          credits: Math.max(0, state.credits + amount) 
        }))
      },

      setUser: (user: User | null) => set({ user }),
      setSession: (session: Session | null) => set({ session }),
      setLoading: (loading: boolean) => set({ loading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        credits: state.credits,
        subscription_tier: state.subscription_tier,
      }),
    }
  )
)
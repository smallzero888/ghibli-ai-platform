'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { showToast } from '@/lib/toast'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
    showToast.error('页面出现错误，请刷新重试')
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-ghibli-cream flex items-center justify-center p-4">
            <div className="text-center">
              <div className="w-24 h-24 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                页面出现错误
              </h1>
              <p className="text-gray-600 mb-4">
                很抱歉，页面加载时出现了问题
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                刷新页面
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

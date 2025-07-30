'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { testBackendConnection, testGenerateImage, testGetModels } from '@/lib/test-backend'

export default function TestPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (test: string, result: any) => {
    setResults(prev => [...prev, { test, result, timestamp: new Date().toISOString() }])
  }

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(true)
    try {
      const result = await testFn()
      addResult(testName, result)
    } catch (error) {
      addResult(testName, { success: false, error: error instanceof Error ? error.message : 'Unknown error' })
    }
    setLoading(false)
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">系统测试页面</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Button 
              onClick={() => runTest('Backend Connection', testBackendConnection)}
              disabled={loading}
              className="w-full"
            >
              测试后端连接
            </Button>
            
            <Button 
              onClick={() => runTest('Get Models', testGetModels)}
              disabled={loading}
              className="w-full"
            >
              获取模型列表
            </Button>
            
            <Button 
              onClick={() => runTest('Generate Image', () => testGenerateImage("a cute totoro in forest"))}
              disabled={loading}
              className="w-full"
            >
              测试图片生成
            </Button>
          </div>

          <div className="flex gap-4 mb-8">
            <Button 
              onClick={() => {
                runTest('Backend Connection', testBackendConnection)
                setTimeout(() => runTest('Get Models', testGetModels), 1000)
                setTimeout(() => runTest('Generate Image', () => testGenerateImage("a cute totoro in forest")), 2000)
              }}
              disabled={loading}
              variant="outline"
            >
              运行所有测试
            </Button>
            
            <Button 
              onClick={clearResults}
              variant="outline"
            >
              清空结果
            </Button>
          </div>

          <div className="space-y-4">
            {results.map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{result.test}</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      result.result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {result.result.success ? '✅ 成功' : '❌ 失败'}
                    </span>
                  </CardTitle>
                  <p className="text-sm text-gray-500">{result.timestamp}</p>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(result.result, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>

          {results.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">点击上方按钮开始测试</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
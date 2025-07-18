'use client'

import { Zap, Shield, Palette, Download } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: '快速生成',
    description: '使用先进的AI模型，几秒钟内生成高质量的吉卜力风格图片',
  },
  {
    icon: Palette,
    title: '多种风格',
    description: '支持多种吉卜力风格，从经典到现代，满足您的创意需求',
  },
  {
    icon: Shield,
    title: '安全可靠',
    description: '所有图片都经过安全处理，保护您的隐私和创作权益',
  },
  {
    icon: Download,
    title: '免费下载',
    description: '生成的图片可以免费下载，支持高清格式，无水印限制',
  },
]

export function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            为什么选择我们
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            专业的AI技术，为您带来最佳的吉卜力风格创作体验
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card text-center">
              <div className="w-16 h-16 bg-ghibli-green/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <feature.icon className="w-8 h-8 text-ghibli-green" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

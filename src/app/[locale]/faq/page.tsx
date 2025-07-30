'use client'

import { useState } from 'react'
import { useI18n } from '@/hooks/use-i18n'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'

export default function FAQPage() {
  const { locale } = useI18n()
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const faqs = [
    {
      question: locale === 'zh' ? '什么是吉卜力AI图片生成器？' : 'What is Ghibli AI Image Generator?',
      answer: locale === 'zh'
        ? '吉卜力AI图片生成器是一个专门生成吉卜力工作室风格图片的AI工具。您只需输入文字描述，AI就能为您创作出具有吉卜力动画特色的精美图片。'
        : 'Ghibli AI Image Generator is an AI tool specifically designed to create Studio Ghibli-style images. Simply input a text description, and AI will create beautiful images with the distinctive Ghibli animation style.'
    },
    {
      question: locale === 'zh' ? '如何开始使用？' : 'How do I get started?',
      answer: locale === 'zh'
        ? '1. 点击"开始创作"按钮\n2. 在文本框中输入您想要的图片描述\n3. 选择合适的参数设置\n4. 点击"生成"按钮\n5. 等待AI为您创作图片'
        : '1. Click the "Start Creating" button\n2. Enter your image description in the text box\n3. Choose appropriate parameter settings\n4. Click the "Generate" button\n5. Wait for AI to create your image'
    },
    {
      question: locale === 'zh' ? '生成一张图片需要多长时间？' : 'How long does it take to generate an image?',
      answer: locale === 'zh'
        ? '通常需要10-30秒，具体时间取决于图片复杂度、服务器负载和您选择的质量设置。高质量图片可能需要更长时间。'
        : 'Usually takes 10-30 seconds, depending on image complexity, server load, and your chosen quality settings. Higher quality images may take longer.'
    },
    {
      question: locale === 'zh' ? '免费版有什么限制？' : 'What are the limitations of the free version?',
      answer: locale === 'zh'
        ? '免费版每月可生成50张图片，输出标准画质，仅限个人使用。如需更多生成次数、高清画质或商业使用，请升级到专业版。'
        : 'The free version allows 50 generations per month with standard quality output for personal use only. For more generations, HD quality, or commercial use, please upgrade to Pro.'
    },
    {
      question: locale === 'zh' ? '生成的图片可以商用吗？' : 'Can I use generated images commercially?',
      answer: locale === 'zh'
        ? '免费版生成的图片仅供个人使用。专业版和企业版用户可以将生成的图片用于商业用途，您拥有完整的使用权。'
        : 'Images generated with the free version are for personal use only. Pro and Enterprise users can use generated images commercially and own full usage rights.'
    },
    {
      question: locale === 'zh' ? '支持哪些图片格式和尺寸？' : 'What image formats and sizes are supported?',
      answer: locale === 'zh'
        ? '我们支持PNG、JPG和WebP格式。图片尺寸包括正方形(1:1)、横向(16:9)、纵向(9:16)等多种比例，最高可输出4K分辨率。'
        : 'We support PNG, JPG, and WebP formats. Image sizes include square (1:1), landscape (16:9), portrait (9:16) and other ratios, with up to 4K resolution output.'
    },
    {
      question: locale === 'zh' ? '如何提高生成图片的质量？' : 'How can I improve the quality of generated images?',
      answer: locale === 'zh'
        ? '1. 使用详细具体的描述词\n2. 避免模糊或矛盾的描述\n3. 选择合适的风格参数\n4. 使用高质量设置\n5. 尝试不同的提示词组合'
        : '1. Use detailed and specific descriptions\n2. Avoid vague or contradictory descriptions\n3. Choose appropriate style parameters\n4. Use high-quality settings\n5. Try different prompt combinations'
    },
    {
      question: locale === 'zh' ? '可以上传自己的图片进行风格转换吗？' : 'Can I upload my own images for style conversion?',
      answer: locale === 'zh'
        ? '目前我们专注于文本到图片的生成功能。图片到图片的风格转换功能正在开发中，敬请期待后续更新。'
        : 'Currently we focus on text-to-image generation. Image-to-image style conversion is in development and will be available in future updates.'
    },
    {
      question: locale === 'zh' ? '忘记密码怎么办？' : 'What if I forget my password?',
      answer: locale === 'zh'
        ? '在登录页面点击"忘记密码"链接，输入您的邮箱地址，我们会发送重置密码的链接到您的邮箱。'
        : 'Click the "Forgot Password" link on the login page, enter your email address, and we\'ll send a password reset link to your email.'
    },
    {
      question: locale === 'zh' ? '如何联系客服？' : 'How do I contact customer support?',
      answer: locale === 'zh'
        ? '您可以通过以下方式联系我们：\n• 邮箱：support@ghibli-ai.com\n• 在线客服：工作日 9:00-18:00\n• 社区论坛：获取其他用户帮助'
        : 'You can contact us through:\n• Email: support@ghibli-ai.com\n• Live chat: Weekdays 9:00-18:00\n• Community forum: Get help from other users'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-ghibli-cream via-ghibli-green/10 to-ghibli-blue/10">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-ghibli-green-100 rounded-full mb-6">
            <HelpCircle className="w-8 h-8 text-ghibli-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {locale === 'zh' ? '常见问题' : 'Frequently Asked Questions'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {locale === 'zh'
              ? '找到您需要的答案，如果还有其他问题，请随时联系我们的客服团队'
              : 'Find the answers you need. If you have other questions, feel free to contact our support team'}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => toggleItem(index)}
              >
                <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                {openItems.includes(index) ? (
                  <ChevronUp className="w-5 h-5 text-ghibli-green-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>

              {openItems.includes(index) && (
                <div className="px-6 pb-4">
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {locale === 'zh' ? '还有其他问题？' : 'Still have questions?'}
            </h2>
            <p className="text-gray-600 mb-6">
              {locale === 'zh'
                ? '我们的客服团队随时为您提供帮助'
                : 'Our support team is here to help you'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@ghibli-ai.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-ghibli-green-600 text-white font-medium rounded-lg hover:bg-ghibli-green-700 transition-colors"
              >
                {locale === 'zh' ? '发送邮件' : 'Send Email'}
              </a>
              <a
                href={`/${locale}/contact`}
                className="inline-flex items-center justify-center px-6 py-3 border border-ghibli-green-600 text-ghibli-green-600 font-medium rounded-lg hover:bg-ghibli-green-50 transition-colors"
              >
                {locale === 'zh' ? '联系我们' : 'Contact Us'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
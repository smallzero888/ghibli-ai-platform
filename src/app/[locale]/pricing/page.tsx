'use client'

import { useI18n } from '@/hooks/use-i18n'
import { Button } from '@/components/ui/button'
import { Check, Star } from 'lucide-react'

export default function PricingPage() {
  const { t, locale } = useI18n()

  const plans = [
    {
      name: locale === 'zh' ? '免费版' : 'Free',
      price: locale === 'zh' ? '¥0' : '$0',
      period: locale === 'zh' ? '永久免费' : 'Forever',
      description: locale === 'zh' ? '适合个人用户体验' : 'Perfect for personal use',
      features: [
        locale === 'zh' ? '每月 50 次生成' : '50 generations per month',
        locale === 'zh' ? '标准画质输出' : 'Standard quality output',
        locale === 'zh' ? '基础吉卜力风格' : 'Basic Ghibli styles',
        locale === 'zh' ? '社区支持' : 'Community support',
        locale === 'zh' ? '个人使用许可' : 'Personal use license'
      ],
      buttonText: locale === 'zh' ? '开始使用' : 'Get Started',
      popular: false
    },
    {
      name: locale === 'zh' ? '专业版' : 'Pro',
      price: locale === 'zh' ? '¥69' : '$9.99',
      period: locale === 'zh' ? '每月' : 'per month',
      description: locale === 'zh' ? '适合创作者和设计师' : 'Perfect for creators and designers',
      features: [
        locale === 'zh' ? '每月 500 次生成' : '500 generations per month',
        locale === 'zh' ? '高清画质输出' : 'High quality output',
        locale === 'zh' ? '所有吉卜力风格' : 'All Ghibli styles',
        locale === 'zh' ? '优先处理队列' : 'Priority processing',
        locale === 'zh' ? '商业使用许可' : 'Commercial use license',
        locale === 'zh' ? '邮件技术支持' : 'Email support'
      ],
      buttonText: locale === 'zh' ? '升级到专业版' : 'Upgrade to Pro',
      popular: true
    },
    {
      name: locale === 'zh' ? '企业版' : 'Enterprise',
      price: locale === 'zh' ? '¥299' : '$39.99',
      period: locale === 'zh' ? '每月' : 'per month',
      description: locale === 'zh' ? '适合团队和企业' : 'Perfect for teams and businesses',
      features: [
        locale === 'zh' ? '无限次生成' : 'Unlimited generations',
        locale === 'zh' ? '超高清画质输出' : 'Ultra HD quality output',
        locale === 'zh' ? '定制风格训练' : 'Custom style training',
        locale === 'zh' ? '专属处理服务器' : 'Dedicated processing',
        locale === 'zh' ? '完整商业许可' : 'Full commercial license',
        locale === 'zh' ? 'API 接口访问' : 'API access',
        locale === 'zh' ? '专属客户经理' : 'Dedicated account manager'
      ],
      buttonText: locale === 'zh' ? '联系销售' : 'Contact Sales',
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-ghibli-cream via-ghibli-green/10 to-ghibli-blue/10">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {locale === 'zh' ? '选择适合您的方案' : 'Choose Your Perfect Plan'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {locale === 'zh' 
              ? '从免费体验到专业创作，我们为每个用户提供最适合的AI图片生成方案' 
              : 'From free exploration to professional creation, we have the perfect AI image generation plan for everyone'}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                plan.popular 
                  ? 'border-ghibli-green-400 ring-4 ring-ghibli-green-100' 
                  : 'border-gray-200 hover:border-ghibli-green-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-ghibli-green-400 to-ghibli-blue-400 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {locale === 'zh' ? '最受欢迎' : 'Most Popular'}
                  </div>
                </div>
              )}

              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-ghibli-green-600">{plan.price}</span>
                    <span className="text-gray-500 ml-2">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-ghibli-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'bg-gradient-to-r from-ghibli-green-500 to-ghibli-blue-500 hover:from-ghibli-green-600 hover:to-ghibli-blue-600'
                      : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  size="lg"
                >
                  {plan.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {locale === 'zh' ? '常见问题' : 'Frequently Asked Questions'}
          </h2>
          <div className="max-w-3xl mx-auto text-left space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                {locale === 'zh' ? '可以随时取消订阅吗？' : 'Can I cancel my subscription anytime?'}
              </h3>
              <p className="text-gray-600">
                {locale === 'zh' 
                  ? '是的，您可以随时取消订阅，不收取任何取消费用。取消后您仍可使用到当前计费周期结束。'
                  : 'Yes, you can cancel your subscription at any time with no cancellation fees. You\'ll continue to have access until the end of your current billing period.'}
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                {locale === 'zh' ? '生成的图片版权归谁所有？' : 'Who owns the generated images?'}
              </h3>
              <p className="text-gray-600">
                {locale === 'zh' 
                  ? '您拥有所有生成图片的完整版权。专业版和企业版用户可以将图片用于商业用途。'
                  : 'You own full rights to all generated images. Pro and Enterprise users can use images for commercial purposes.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
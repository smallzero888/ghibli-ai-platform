'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// 简单的单选按钮组组件
const RadioGroup = ({ value, onValueChange, children }: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode
}) => (
  <div onChange={(e) => {
    const target = e.target as HTMLInputElement
    if (target.type === 'radio') {
      onValueChange(target.value)
    }
  }}>
    {children}
  </div>
)

const RadioGroupItem = ({ value, id, className }: {
  value: string;
  id: string;
  className?: string
}) => (
  <input type="radio" name="payment-method" value={value} id={id} className={className} />
)

const Label = ({ htmlFor, children, className }: {
  htmlFor?: string;
  children: React.ReactNode;
  className?: string
}) => (
  <label htmlFor={htmlFor} className={className}>
    {children}
  </label>
)
import { CreditCard, Smartphone, Shield, Check } from 'lucide-react'
import { useI18n } from '@/hooks/use-i18n'

interface PaymentMethodSelectorProps {
  planId: string
  planName: string
  planPrice: string
  onSuccess?: () => void
}

interface PaymentMethod {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  features: string[]
  popular?: boolean
}

export function PaymentMethodSelector({ 
  planId, 
  planName, 
  planPrice, 
  onSuccess 
}: PaymentMethodSelectorProps) {
  const { t, locale } = useI18n()
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('stripe')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'stripe',
      name: 'Stripe',
      description: locale === 'zh' ? '安全可靠的国际支付解决方案' : 'Secure and reliable international payment solution',
      icon: <CreditCard className="w-6 h-6" />,
      features: [
        locale === 'zh' ? '支持信用卡和借记卡' : 'Supports credit and debit cards',
        locale === 'zh' ? '银行级安全加密' : 'Bank-level security encryption',
        locale === 'zh' ? '全球支付网络' : 'Global payment network'
      ],
      popular: true
    },
    {
      id: 'creem',
      name: 'Creem',
      description: locale === 'zh' ? '便捷的移动支付解决方案' : 'Convenient mobile payment solution',
      icon: <Smartphone className="w-6 h-6" />,
      features: [
        locale === 'zh' ? '支持多种移动支付方式' : 'Supports multiple mobile payment methods',
        locale === 'zh' ? '快速到账' : 'Fast settlement',
        locale === 'zh' ? '简单易用' : 'Simple and easy to use'
      ]
    }
  ]

  const handlePayment = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      // 获取用户ID
      const userId = localStorage.getItem('user_id')
      if (!userId) {
        throw new Error('User not authenticated')
      }

      // 调用支付API
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod: selectedPaymentMethod,
          planId,
          userId
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // 支付成功
        if (onSuccess) {
          onSuccess()
        }
        
        // 显示成功消息
        alert(t('subscription.paymentSuccess'))
      } else {
        throw new Error(data.error || 'Payment failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed'
      setError(errorMessage)
      console.error('Payment error:', errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {t('subscription.selectPaymentMethod')}
        </h3>
        <p className="text-sm text-gray-600">
          {t('subscription.selectPaymentMethodDesc')}
        </p>
      </div>

      <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <div key={method.id}>
              <RadioGroupItem
                value={method.id}
                id={method.id}
                className="peer sr-only"
              />
              <Label
                htmlFor={method.id}
                className={`cursor-pointer block rounded-lg border p-4 transition-all duration-200 ${
                  selectedPaymentMethod === method.id
                    ? 'border-ghibli-green bg-ghibli-green/5 ring-2 ring-ghibli-green/20'
                    : 'border-gray-200 hover:border-ghibli-green/50 hover:bg-ghibli-green/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    selectedPaymentMethod === method.id
                      ? 'bg-ghibli-green text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{method.name}</h4>
                      {method.popular && (
                        <Badge className="bg-ghibli-gold text-white text-xs">
                          {t('subscription.popular')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                    <ul className="space-y-1">
                      {method.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedPaymentMethod === method.id
                      ? 'border-ghibli-green bg-ghibli-green text-white'
                      : 'border-gray-300'
                  }`}>
                    {selectedPaymentMethod === method.id && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>

      <Card className="bg-gradient-to-r from-ghibli-green-50 to-ghibli-blue-50 border-ghibli-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-ghibli-green-700">
            <Shield className="w-5 h-5" />
            {t('subscription.paymentSecurity')}
          </CardTitle>
          <CardDescription>
            {t('subscription.paymentSecurityDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{planName}</p>
              <p className="text-sm text-gray-600">{planPrice}</p>
            </div>
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="bg-ghibli-green hover:bg-ghibli-green-600"
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin mr-2">⚪</span>
                  {t('subscription.processingPayment')}
                </>
              ) : (
                t('subscription.completePayment')
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
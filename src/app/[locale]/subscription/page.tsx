'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { showToast } from '@/lib/toast'
import {
  Crown,
  CreditCard,
  Download,
  Calendar,
  Check,
  Star,
  Zap,
  AlertCircle,
  TrendingUp,
  Settings,
  X
} from 'lucide-react'
import { useI18n } from '@/hooks/use-i18n'
import { PaymentMethodSelector } from '@/components/payment/payment-method-selector'

interface Subscription {
  id: string
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'cancelled' | 'expired'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}

interface Payment {
  id: string
  amount: number
  currency: string
  status: 'succeeded' | 'failed' | 'pending'
  date: string
  invoiceUrl?: string
}

interface Usage {
  generationsUsed: number
  generationsLimit: number
  storageUsed: number
  storageLimit: number
  apiCallsUsed: number
  apiCallsLimit: number
}

export default function SubscriptionPage() {
  const { user } = useAuth()
  const { t, locale } = useI18n()
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [usage, setUsage] = useState<Usage>({
    generationsUsed: 0,
    generationsLimit: 50,
    storageUsed: 0,
    storageLimit: 1024, // 1GB
    apiCallsUsed: 0,
    apiCallsLimit: 1000
  })
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'enterprise'>('pro')

  useEffect(() => {
    if (user) {
      loadSubscriptionData()
    }
  }, [user])

  const loadSubscriptionData = async () => {
    setLoading(true)
    try {
      // 这里应该调用API获取订阅数据
      // const subscriptionData = await fetchSubscription()
      // const paymentsData = await fetchPayments()
      // const usageData = await fetchUsage()
      
      // 模拟数据
      setSubscription({
        id: 'sub_123456',
        plan: 'pro',
        status: 'active',
        currentPeriodStart: '2023-06-01T00:00:00Z',
        currentPeriodEnd: '2023-07-01T00:00:00Z',
        cancelAtPeriodEnd: false
      })
      
      setPayments([
        {
          id: 'pay_123456',
          amount: 9.99,
          currency: 'USD',
          status: 'succeeded',
          date: '2023-06-01T00:00:00Z',
          invoiceUrl: '#'
        }
      ])
      
      setUsage({
        generationsUsed: 25,
        generationsLimit: 500,
        storageUsed: 256,
        storageLimit: 1024,
        apiCallsUsed: 120,
        apiCallsLimit: 1000
      })
    } catch (error) {
      console.error('加载订阅数据失败:', error)
      showToast.error(t('subscription.loadError'))
    } finally {
      setLoading(false)
    }
  }

  const handleUpgradePlan = (plan: 'pro' | 'enterprise') => {
    setSelectedPlan(plan)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    showToast.success(t('subscription.upgradeSuccess'))
    loadSubscriptionData()
  }

  const handleCancelSubscription = async () => {
    if (!confirm(t('subscription.cancelConfirm'))) {
      return
    }
    
    setLoading(true)
    try {
      // 这里应该调用API取消订阅
      // await cancelSubscription()
      
      showToast.success(t('subscription.cancelSuccess'))
      loadSubscriptionData()
    } catch (error) {
      console.error('取消订阅失败:', error)
      showToast.error(t('subscription.cancelError'))
    } finally {
      setLoading(false)
    }
  }

  const handleReactivateSubscription = async () => {
    setLoading(true)
    try {
      // 这里应该调用API重新激活订阅
      // await reactivateSubscription()
      
      showToast.success(t('subscription.reactivateSuccess'))
      loadSubscriptionData()
    } catch (error) {
      console.error('重新激活订阅失败:', error)
      showToast.error(t('subscription.reactivateError'))
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadInvoice = async (paymentId: string) => {
    try {
      // 这里应该调用API下载发票
      // const invoiceUrl = await getInvoiceUrl(paymentId)
      // window.open(invoiceUrl, '_blank')
      
      showToast.success(t('subscription.invoiceDownloadStart'))
    } catch (error) {
      console.error('下载发票失败:', error)
      showToast.error(t('subscription.invoiceDownloadError'))
    }
  }

  const getPlanInfo = (plan: string) => {
    switch (plan) {
      case 'free':
        return {
          name: locale === 'zh' ? '免费版' : 'Free',
          price: locale === 'zh' ? '¥0' : '$0',
          color: 'bg-gray-100 text-gray-800',
          features: [
            locale === 'zh' ? '每月 50 次生成' : '50 generations per month',
            locale === 'zh' ? '标准画质输出' : 'Standard quality output',
            locale === 'zh' ? '基础吉卜力风格' : 'Basic Ghibli styles'
          ]
        }
      case 'pro':
        return {
          name: locale === 'zh' ? '专业版' : 'Pro',
          price: locale === 'zh' ? '¥69' : '$9.99',
          color: 'bg-blue-100 text-blue-800',
          features: [
            locale === 'zh' ? '每月 500 次生成' : '500 generations per month',
            locale === 'zh' ? '高清画质输出' : 'High quality output',
            locale === 'zh' ? '所有吉卜力风格' : 'All Ghibli styles',
            locale === 'zh' ? '优先处理队列' : 'Priority processing',
            locale === 'zh' ? '商业使用许可' : 'Commercial use license'
          ]
        }
      case 'enterprise':
        return {
          name: locale === 'zh' ? '企业版' : 'Enterprise',
          price: locale === 'zh' ? '¥299' : '$39.99',
          color: 'bg-purple-100 text-purple-800',
          features: [
            locale === 'zh' ? '无限次生成' : 'Unlimited generations',
            locale === 'zh' ? '超高清画质输出' : 'Ultra HD quality output',
            locale === 'zh' ? '定制风格训练' : 'Custom style training',
            locale === 'zh' ? '专属处理服务器' : 'Dedicated processing',
            locale === 'zh' ? 'API 接口访问' : 'API access'
          ]
        }
      default:
        return {
          name: plan,
          price: '',
          color: 'bg-gray-100 text-gray-800',
          features: []
        }
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-ghibli-cream flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Crown className="w-12 h-12 text-ghibli-green mx-auto mb-4" />
            <CardTitle className="text-2xl">{t('subscription.loginRequired')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {t('subscription.loginDesc')}
            </p>
            <Button onClick={() => window.location.href = `/${locale}/login`} className="w-full">
              {t('subscription.goLogin')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentPlanInfo = subscription ? getPlanInfo(subscription.plan) : getPlanInfo('free')
  const usagePercentage = {
    generations: Math.round((usage.generationsUsed / usage.generationsLimit) * 100),
    storage: Math.round((usage.storageUsed / usage.storageLimit) * 100),
    apiCalls: Math.round((usage.apiCallsUsed / usage.apiCallsLimit) * 100)
  }

  return (
    <div className="min-h-screen bg-ghibli-cream">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('subscription.title')}
          </h1>
          <p className="text-gray-600">
            {t('subscription.subtitle')}
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">{t('subscription.overviewTab')}</TabsTrigger>
            <TabsTrigger value="usage">{t('subscription.usageTab')}</TabsTrigger>
            <TabsTrigger value="billing">{t('subscription.billingTab')}</TabsTrigger>
            <TabsTrigger value="plans">{t('subscription.plansTab')}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current Plan */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    {t('subscription.currentPlan')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {subscription ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">{currentPlanInfo.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-2xl font-bold">{currentPlanInfo.price}</span>
                            <span className="text-gray-500">/{t('subscription.month')}</span>
                            <Badge className={currentPlanInfo.color}>
                              {subscription.status === 'active' ? t('subscription.active') : 
                               subscription.status === 'cancelled' ? t('subscription.cancelled') : 
                               t('subscription.expired')}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {t('subscription.nextBillingDate')}:
                          </p>
                          <p className="font-medium">
                            {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {subscription.cancelAtPeriodEnd && (
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                          <p className="text-sm text-yellow-800">
                            {t('subscription.willCancelAtPeriodEnd')}
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <h4 className="font-medium">{t('subscription.planFeatures')}:</h4>
                        <ul className="space-y-1">
                          {currentPlanInfo.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <Check className="w-4 h-4 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-3 pt-4">
                        {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                          <Button 
                            variant="outline" 
                            onClick={handleCancelSubscription}
                            disabled={loading}
                          >
                            {t('subscription.cancelSubscription')}
                          </Button>
                        )}
                        {subscription.cancelAtPeriodEnd && (
                          <Button 
                            onClick={handleReactivateSubscription}
                            disabled={loading}
                          >
                            {t('subscription.reactivateSubscription')}
                          </Button>
                        )}
                        <Button 
                          variant="outline"
                          onClick={() => window.location.href = `/${locale}/settings`}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          {t('subscription.manageSettings')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">{t('subscription.noActiveSubscription')}</p>
                      <Button onClick={() => window.location.href = `/${locale}/pricing`}>
                        {t('subscription.viewPlans')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Usage Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    {t('subscription.usageSummary')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t('subscription.generations')}</span>
                      <span>{usage.generationsUsed}/{usage.generationsLimit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-ghibli-green h-2 rounded-full" 
                        style={{ width: `${usagePercentage.generations}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t('subscription.storage')}</span>
                      <span>{usage.storageUsed}MB/{usage.storageLimit}MB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-ghibli-blue h-2 rounded-full" 
                        style={{ width: `${usagePercentage.storage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t('subscription.apiCalls')}</span>
                      <span>{usage.apiCallsUsed}/{usage.apiCallsLimit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-ghibli-gold h-2 rounded-full" 
                        style={{ width: `${usagePercentage.apiCalls}%` }}
                      ></div>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = `/${locale}/subscription?tab=usage`}
                  >
                    {t('subscription.viewDetailedUsage')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {t('subscription.detailedUsage')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">{t('subscription.generationsUsage')}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>{t('subscription.used')}</span>
                        <span className="font-medium">{usage.generationsUsed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('subscription.limit')}</span>
                        <span className="font-medium">{usage.generationsLimit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('subscription.remaining')}</span>
                        <span className="font-medium text-ghibli-green">
                          {usage.generationsLimit - usage.generationsUsed}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-ghibli-green h-3 rounded-full" 
                        style={{ width: `${usagePercentage.generations}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">{t('subscription.storageUsage')}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>{t('subscription.used')}</span>
                        <span className="font-medium">{usage.storageUsed}MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('subscription.limit')}</span>
                        <span className="font-medium">{usage.storageLimit}MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('subscription.remaining')}</span>
                        <span className="font-medium text-ghibli-blue">
                          {usage.storageLimit - usage.storageUsed}MB
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-ghibli-blue h-3 rounded-full" 
                        style={{ width: `${usagePercentage.storage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">{t('subscription.apiUsage')}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>{t('subscription.used')}</span>
                        <span className="font-medium">{usage.apiCallsUsed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('subscription.limit')}</span>
                        <span className="font-medium">{usage.apiCallsLimit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('subscription.remaining')}</span>
                        <span className="font-medium text-ghibli-gold">
                          {usage.apiCallsLimit - usage.apiCallsUsed}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-ghibli-gold h-3 rounded-full" 
                        style={{ width: `${usagePercentage.apiCalls}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  {t('subscription.billingHistory')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length > 0 ? (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {payment.currency === 'USD' ? '$' : '¥'}{payment.amount}
                            </span>
                            <Badge className={
                              payment.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                              payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {payment.status === 'succeeded' ? t('subscription.succeeded') :
                               payment.status === 'failed' ? t('subscription.failed') :
                               t('subscription.pending')}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {new Date(payment.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          {payment.invoiceUrl && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadInvoice(payment.id)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              {t('subscription.downloadInvoice')}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">{t('subscription.noBillingHistory')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(['free', 'pro', 'enterprise'] as const).map((plan) => {
                const planInfo = getPlanInfo(plan)
                const isCurrentPlan = subscription?.plan === plan
                const canUpgrade = subscription && plan !== 'free' && plan !== subscription.plan

                return (
                  <Card key={plan} className={`relative ${isCurrentPlan ? 'ring-2 ring-ghibli-green' : ''}`}>
                    {isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-ghibli-green text-white">
                          {t('subscription.currentPlan')}
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center">
                      <CardTitle className="text-xl">{planInfo.name}</CardTitle>
                      <div className="text-3xl font-bold">{planInfo.price}</div>
                      <p className="text-gray-600">/{t('subscription.month')}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {planInfo.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        className={`w-full ${isCurrentPlan ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' : ''}`}
                        disabled={isCurrentPlan || !canUpgrade}
                        onClick={() => canUpgrade && handleUpgradePlan(plan)}
                      >
                        {isCurrentPlan ? t('subscription.currentPlan') :
                         canUpgrade ? t('subscription.upgradePlan') :
                         t('subscription.downgradePlan')}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
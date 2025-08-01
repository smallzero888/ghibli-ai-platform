import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { paymentMethod, planId, userId } = await request.json()

    // 验证必需参数
    if (!paymentMethod || !planId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // 验证支付方式
    if (!['stripe', 'creem'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      )
    }

    // 验证计划ID
    const validPlans = ['free', 'pro', 'enterprise']
    if (!validPlans.includes(planId)) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      )
    }

    // 根据支付方式处理支付
    if (paymentMethod === 'stripe') {
      // Stripe支付处理
      return await handleStripePayment(planId, userId)
    } else if (paymentMethod === 'creem') {
      // Creem支付处理
      return await handleCreemPayment(planId, userId)
    }

    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Payment API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleStripePayment(planId: string, userId: string) {
  try {
    // 获取计划信息
    const planInfo = getPlanInfo(planId)
    
    // 这里应该调用Stripe API创建支付会话
    // 由于是模拟，我们直接返回成功响应
    const paymentIntent = {
      id: `pi_${Date.now()}`,
      amount: planInfo.amount,
      currency: planInfo.currency,
      status: 'succeeded',
      client_secret: `pi_${Date.now()}_secret_${Date.now()}`
    }

    // 更新用户订阅信息
    await updateUserSubscription(userId, {
      planId,
      paymentMethod: 'stripe',
      paymentIntentId: paymentIntent.id,
      status: 'active'
    })

    return NextResponse.json({
      success: true,
      paymentMethod: 'stripe',
      paymentIntent,
      message: 'Payment successful'
    })
  } catch (error) {
    console.error('Stripe payment error:', error)
    return NextResponse.json(
      { error: 'Stripe payment failed' },
      { status: 500 }
    )
  }
}

async function handleCreemPayment(planId: string, userId: string) {
  try {
    // 获取计划信息
    const planInfo = getPlanInfo(planId)
    
    // 这里应该调用Creem API创建支付订单
    // 由于是模拟，我们直接返回成功响应
    const paymentOrder = {
      id: `co_${Date.now()}`,
      amount: planInfo.amount,
      currency: planInfo.currency,
      status: 'paid',
      transaction_id: `txn_${Date.now()}`
    }

    // 更新用户订阅信息
    await updateUserSubscription(userId, {
      planId,
      paymentMethod: 'creem',
      paymentOrderId: paymentOrder.id,
      status: 'active'
    })

    return NextResponse.json({
      success: true,
      paymentMethod: 'creem',
      paymentOrder,
      message: 'Payment successful'
    })
  } catch (error) {
    console.error('Creem payment error:', error)
    return NextResponse.json(
      { error: 'Creem payment failed' },
      { status: 500 }
    )
  }
}

function getPlanInfo(planId: string) {
  const plans = {
    free: {
      amount: 0,
      currency: 'usd',
      name: 'Free'
    },
    pro: {
      amount: 999, // $9.99 in cents
      currency: 'usd',
      name: 'Pro'
    },
    enterprise: {
      amount: 3999, // $39.99 in cents
      currency: 'usd',
      name: 'Enterprise'
    }
  }

  return plans[planId as keyof typeof plans] || plans.free
}

async function updateUserSubscription(userId: string, subscriptionData: any) {
  try {
    // 检查用户是否已有订阅
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (existingSubscription) {
      // 更新现有订阅
      const { error } = await supabase
        .from('subscriptions')
        .update({
          ...subscriptionData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscription.id)

      if (error) throw error
    } else {
      // 创建新订阅
      const { error } = await supabase
        .from('subscriptions')
        .insert([
          {
            user_id: userId,
            ...subscriptionData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])

      if (error) throw error
    }

    return true
  } catch (error) {
    console.error('Error updating user subscription:', error)
    throw error
  }
}
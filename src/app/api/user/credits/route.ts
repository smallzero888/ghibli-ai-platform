import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // 获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 从数据库获取用户积分信息
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('credits, subscription_type, generation_count')
      .eq('id', user.id)
      .single()

    if (fetchError) {
      console.error('Error fetching user credits:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch user credits' },
        { status: 500 }
      )
    }

    // 计算剩余生成次数
    const getCreditsLimit = (subscriptionType: string) => {
      switch (subscriptionType) {
        case 'free': return 10
        case 'pro': return 100
        case 'enterprise': return 1000
        default: return 10
      }
    }

    const creditsLimit = getCreditsLimit(userData.subscription_type || 'free')
    const remainingCredits = creditsLimit - (userData.generation_count || 0)

    return NextResponse.json({
      credits: userData.credits || 0,
      subscription_type: userData.subscription_type || 'free',
      generation_count: userData.generation_count || 0,
      credits_limit: creditsLimit,
      remaining_credits: remainingCredits,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { amount, reason } = await request.json()
    
    if (typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    
    // 获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 先获取当前用户积分
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (fetchError) {
      console.error('Error fetching current user credits:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch current user credits' },
        { status: 500 }
      )
    }

    // 更新用户积分
    const newCredits = (currentUser.credits || 0) + amount
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        credits: newCredits,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating user credits:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user credits' },
        { status: 500 }
      )
    }

    // 记录积分变更历史
    const { error: historyError } = await supabase
      .from('credit_history')
      .insert([
        {
          user_id: user.id,
          amount: amount,
          reason: reason || 'Manual adjustment',
          created_at: new Date().toISOString()
        }
      ])

    if (historyError) {
      console.error('Error recording credit history:', historyError)
      // 不影响主要功能，只记录错误
    }

    return NextResponse.json({
      success: true,
      credits: updatedUser.credits,
      message: amount > 0 ? '积分已增加' : '积分已扣除'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { id, email, full_name, avatar_url, provider } = await request.json()
    
    if (!id || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    
    // 检查用户是否已存在于数据库中
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    let user = existingUser

    // 如果用户不存在，创建新用户
    if (!existingUser) {
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id,
            email,
            username: email.split('@')[0],
            full_name: full_name || null,
            avatar_url: avatar_url || null,
            subscription_type: 'free',
            generation_count: 0,
          }
        ])
        .select()
        .single()

      if (insertError) {
        console.error('Error creating user:', insertError)
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        )
      }

      user = newUser
    } else {
      // 如果用户已存在，更新用户信息
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          full_name: full_name || existingUser.full_name,
          avatar_url: avatar_url || existingUser.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating user:', updateError)
        return NextResponse.json(
          { error: 'Failed to update user' },
          { status: 500 }
        )
      }

      user = updatedUser
    }

    // 返回用户数据，包括积分和订阅类型
    return NextResponse.json({
      success: true,
      user,
      credits: 10, // 新用户默认积分
      subscription_tier: user.subscription_type || 'free',
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
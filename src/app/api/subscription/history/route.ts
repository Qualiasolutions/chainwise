// Subscription History API Route
// GET /api/subscription/history - Get user's subscription history

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id, tier, credits, monthly_credits')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get subscription history
    const { data: subscriptions, error: subError } = await supabase
      .from('subscription_history')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (subError) {
      console.error('Subscription history fetch error:', subError)
    }

    // Get current subscription (most recent active)
    const currentSubscription = subscriptions?.find(sub => sub.status === 'active') || null

    // Format subscription data
    const formattedSubscriptions = (subscriptions || []).map(sub => ({
      id: sub.id,
      tier: sub.tier,
      status: sub.status,
      created_at: sub.created_at,
      current_period_start: sub.current_period_start,
      current_period_end: sub.current_period_end,
      stripe_subscription_id: sub.stripe_subscription_id,
      price: sub.tier === 'pro' ? 12.99 : sub.tier === 'elite' ? 24.99 : 0
    }))

    // Format current subscription
    const formattedCurrent = currentSubscription ? {
      plan: currentSubscription.tier,
      status: currentSubscription.status,
      price: currentSubscription.tier === 'pro' ? 12.99 : currentSubscription.tier === 'elite' ? 24.99 : 0,
      next_billing: currentSubscription.current_period_end,
      payment_method: null // TODO: Integrate with Stripe for payment method details
    } : null

    return NextResponse.json({
      subscriptions: formattedSubscriptions,
      current: formattedCurrent,
      profile: {
        tier: profile.tier,
        credits: profile.credits,
        monthly_credits: profile.monthly_credits
      },
      success: true
    })

  } catch (error) {
    console.error('Subscription history API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
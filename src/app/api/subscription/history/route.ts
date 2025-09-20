// Subscription History API Route
// GET /api/subscription/history - Get user's subscription history and current billing info

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile using MCP helper
    const profile = await mcpSupabase.getUserByAuthId(session.user.id)

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get payment methods for the user
    const paymentMethods = await mcpSupabase.getUserPaymentMethods(profile.id)
    const defaultPaymentMethod = paymentMethods.find(pm => pm.is_default) || paymentMethods[0] || null

    // For now, we'll use the user's current tier as their "current subscription"
    // In the future, this could be expanded with a proper subscription_history table
    const currentSubscription = {
      plan: profile.tier,
      status: 'active',
      price: profile.tier === 'pro' ? 12.99 : profile.tier === 'elite' ? 24.99 : 0,
      next_billing: profile.tier !== 'free' ?
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] :
        null,
      payment_method: defaultPaymentMethod ? {
        brand: defaultPaymentMethod.brand,
        last4: defaultPaymentMethod.last4,
        exp_month: defaultPaymentMethod.exp_month,
        exp_year: defaultPaymentMethod.exp_year
      } : null
    }

    // Mock subscription history based on user's current tier
    // In a real implementation, this would come from a subscription_history table
    const subscriptionHistory = [{
      id: 'current',
      tier: profile.tier,
      status: 'active',
      created_at: profile.created_at,
      current_period_start: profile.created_at,
      current_period_end: profile.tier !== 'free' ?
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() :
        null,
      stripe_subscription_id: null,
      price: profile.tier === 'pro' ? 12.99 : profile.tier === 'elite' ? 24.99 : 0
    }]

    return NextResponse.json({
      subscriptions: subscriptionHistory,
      current: currentSubscription,
      profile: {
        tier: profile.tier,
        credits: profile.credits,
        monthly_credits: profile.monthly_credits
      },
      payment_methods: paymentMethods,
      success: true
    })

  } catch (error: any) {
    console.error('Subscription history API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
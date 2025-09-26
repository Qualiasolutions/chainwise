// Subscription Upgrade API Route
// POST /api/subscription/upgrade - Handle subscription tier upgrades

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'

// Plan configurations
const PLAN_CONFIGS = {
  pro: {
    tier: 'pro',
    monthly_credits: 50,
    price: 12.99
  },
  elite: {
    tier: 'elite',
    monthly_credits: 100,
    price: 24.99
  }
} as const

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile from profiles table
    const { data: profile } = await supabase
      .from('users')
      .select('id, tier, credits, monthly_credits')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { planId, tier, credits } = body

    if (!planId || !tier) {
      return NextResponse.json({
        error: 'Plan ID and tier are required'
      }, { status: 400 })
    }

    const planConfig = PLAN_CONFIGS[planId as keyof typeof PLAN_CONFIGS]
    if (!planConfig) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 })
    }

    // Check if user is already on this tier or higher
    const tierHierarchy = { free: 0, pro: 1, elite: 2 }
    const currentTierLevel = tierHierarchy[profile.tier as keyof typeof tierHierarchy] || 0
    const newTierLevel = tierHierarchy[tier as keyof typeof tierHierarchy] || 0

    if (currentTierLevel >= newTierLevel) {
      return NextResponse.json({
        error: 'You are already on this tier or higher'
      }, { status: 400 })
    }

    // Calculate new credits (current credits + new monthly allocation)
    const newCredits = (profile.credits || 0) + planConfig.monthly_credits

    // Update user profile with new tier and credits
    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update({
        tier: planConfig.tier,
        credits: newCredits,
        monthly_credits: planConfig.monthly_credits,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)
      .select()
      .single()

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
    }

    // Create subscription history record
    try {
      await supabase
        .from('subscription_history')
        .insert({
          user_id: profile.id,
          tier: planConfig.tier,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        })
    } catch (error) {
      console.warn('Failed to create subscription history:', error)
      // Non-blocking error
    }

    // Record credit transaction for the upgrade bonus
    try {
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: profile.id,
          transaction_type: 'addition',
          amount: planConfig.monthly_credits,
          description: `${planConfig.tier.toUpperCase()} subscription upgrade - monthly credits`
        })
    } catch (error) {
      console.warn('Failed to record credit transaction:', error)
      // Non-blocking error
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: `Successfully upgraded to ${planConfig.tier.toUpperCase()}`,
      newCredits: newCredits,
      tier: planConfig.tier
    })

  } catch (error) {
    console.error('Subscription upgrade API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
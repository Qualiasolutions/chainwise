// Subscription Cancellation API Route
// POST /api/settings/subscription/cancel - Cancel user's subscription

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'

export async function POST(request: NextRequest) {
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

    const { cancellation_reason, feedback } = await request.json()

    // Check if user has an active subscription
    if (profile.tier === 'free') {
      return NextResponse.json(
        { error: 'No active subscription to cancel' },
        { status: 400 }
      )
    }

    // Get current subscription details for logging
    const currentTier = profile.tier
    const currentCredits = profile.credits

    try {
      // Update user to free tier
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          tier: 'free',
          monthly_credits: 5, // Free tier gets 5 credits
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (updateError) {
        throw updateError
      }

      // Log the subscription cancellation
      await supabase.rpc('log_user_activity', {
        user_uuid: profile.id,
        activity_type: 'subscription_cancelled',
        activity_description: `Subscription cancelled (${currentTier} → free)`,
        activity_metadata: {
          previous_tier: currentTier,
          new_tier: 'free',
          cancellation_reason: cancellation_reason || 'Not specified',
          feedback: feedback || null,
          cancelled_at: new Date().toISOString(),
          credits_at_cancellation: currentCredits
        }
      })

      // In a real implementation, this would also:
      // 1. Cancel the Stripe subscription
      // 2. Send cancellation confirmation email
      // 3. Schedule data retention according to policy

      // TODO: Integrate with Stripe to cancel actual subscription
      // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
      // await stripe.subscriptions.update(stripeSubscriptionId, {
      //   cancel_at_period_end: true
      // })

      return NextResponse.json({
        message: 'Subscription cancelled successfully',
        cancellation_details: {
          previous_tier: currentTier,
          new_tier: 'free',
          cancelled_at: new Date().toISOString(),
          access_until: null, // In real implementation, this would be end of billing period
          remaining_credits: currentCredits,
          new_monthly_credits: 5
        },
        next_steps: [
          'Your account has been downgraded to the free tier',
          'You can continue using ChainWise with limited features',
          'Your existing credits will remain available',
          'You can resubscribe at any time from the billing page'
        ],
        success: true
      })

    } catch (cancellationError: any) {
      console.error('Subscription cancellation error:', cancellationError)

      // Log the failed cancellation
      await supabase.rpc('log_user_activity', {
        user_uuid: profile.id,
        activity_type: 'subscription_cancel_failed',
        activity_description: 'Subscription cancellation failed',
        activity_metadata: {
          error: cancellationError.message,
          attempted_at: new Date().toISOString()
        }
      })

      return NextResponse.json(
        { error: 'Failed to cancel subscription: ' + cancellationError.message },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Subscription cancellation API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to get cancellation information and policy
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

    if (profile.tier === 'free') {
      return NextResponse.json(
        { error: 'No active subscription to cancel' },
        { status: 400 }
      )
    }

    // Calculate what the user will lose/keep
    const currentBenefits = getTierBenefits(profile.tier)
    const freeBenefits = getTierBenefits('free')

    return NextResponse.json({
      current_subscription: {
        tier: profile.tier,
        monthly_credits: profile.monthly_credits,
        current_credits: profile.credits,
        benefits: currentBenefits
      },
      after_cancellation: {
        tier: 'free',
        monthly_credits: 5,
        benefits: freeBenefits,
        data_retention: 'All your data will be preserved'
      },
      cancellation_policy: {
        immediate_downgrade: true,
        credit_retention: 'Existing credits will remain available',
        data_retention: 'All portfolios and chat history preserved',
        resubscription: 'You can resubscribe at any time',
        refund_policy: 'No refunds for partial months'
      },
      cancellation_reasons: [
        'Too expensive',
        'Not using enough features',
        'Found alternative solution',
        'Temporary financial constraints',
        'Technical issues',
        'Other'
      ],
      success: true
    })

  } catch (error: any) {
    console.error('Cancellation info error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to get tier benefits
function getTierBenefits(tier: string): string[] {
  switch (tier) {
    case 'pro':
      return [
        'Unlimited AI questions',
        'Advanced portfolio analysis',
        'Priority support',
        'API access',
        'Weekly reports'
      ]
    case 'elite':
      return [
        'Everything in PRO',
        'Trading signals',
        'Custom AI training',
        '1-on-1 sessions',
        'Real-time alerts',
        'Advanced analytics'
      ]
    default:
      return [
        '5 AI questions per month',
        'Basic portfolio tracking',
        'Community access',
        'Limited features'
      ]
  }
}
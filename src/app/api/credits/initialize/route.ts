import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TIER_PERMISSIONS, type SubscriptionTier } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, credits_balance, subscription_tier, last_credit_refresh')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const tier = (userData.subscription_tier || 'free') as SubscriptionTier
    const permissions = TIER_PERMISSIONS[tier]
    const monthlyCredits = permissions.creditsPerMonth

    // Check if user needs credit refresh (monthly)
    const now = new Date()
    const lastRefresh = userData.last_credit_refresh ? new Date(userData.last_credit_refresh) : null
    const needsRefresh = !lastRefresh || 
      (now.getTime() - lastRefresh.getTime()) > (30 * 24 * 60 * 60 * 1000) // 30 days

    let newBalance = userData.credits_balance || 0

    // If user has no credits or needs monthly refresh, give them credits
    if (newBalance === 0 || needsRefresh) {
      newBalance = Math.max(newBalance, monthlyCredits) // Ensure they have at least monthly credits

      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          credits_balance: newBalance,
          last_credit_refresh: now.toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        return NextResponse.json({ error: 'Failed to initialize credits' }, { status: 500 })
      }

      // Log the credit grant
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'granted',
          amount: newBalance - (userData.credits_balance || 0),
          feature_used: 'monthly_refresh',
          description: `Monthly credit refresh for ${tier} tier`,
          metadata: {
            tier,
            monthly_credits: monthlyCredits,
            previous_balance: userData.credits_balance || 0
          }
        })
    }

    return NextResponse.json({
      balance: newBalance,
      tier,
      monthly_credits: monthlyCredits,
      refreshed: newBalance > (userData.credits_balance || 0)
    })
  } catch (error) {
    console.error('Error initializing credits:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

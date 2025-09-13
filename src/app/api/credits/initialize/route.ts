import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TIER_PERMISSIONS, type SubscriptionTier } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Auth error in credits/initialize:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data, create if doesn't exist
    let { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, credits_balance, subscription_tier, last_credit_refresh')
      .eq('id', user.id)
      .single()

    // If user doesn't exist, create them
    if (userError && userError.code === 'PGRST116') {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email || 'unknown@example.com',
          credits_balance: 3,
          subscription_tier: 'free',
          total_points: 0,
          last_credit_refresh: new Date().toISOString()
        })
        .select('id, credits_balance, subscription_tier, last_credit_refresh')
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json({ error: 'Failed to initialize user' }, { status: 500 })
      }

      userData = newUser
    } else if (userError) {
      console.error('Database error in credits/initialize:', userError)
      // Return a default response instead of failing
      return NextResponse.json({
        balance: 3,
        tier: 'free',
        monthly_credits: 3,
        refreshed: false
      })
    }

    if (!userData) {
      return NextResponse.json({ error: 'User initialization failed' }, { status: 500 })
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
        console.error('Error updating credits:', updateError)
        // Continue anyway, don't fail the request
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
    // Return a default response instead of failing
    return NextResponse.json({
      balance: 3,
      tier: 'free',
      monthly_credits: 3,
      refreshed: false
    })
  }
}

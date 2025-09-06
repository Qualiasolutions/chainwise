import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleAPIError, handleAuthError, createSuccessResponse } from '@/lib/api-error-handler'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    const authErrorResponse = handleAuthError(authError, user)
    if (authErrorResponse) return authErrorResponse

    let { data: userData, error } = await supabase
      .from('users')
      .select('credits_balance, subscription_tier, total_points')
      .eq('id', user.id)
      .single()

    // If user doesn't exist, create them
    if (error && error.code === 'PGRST116') {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email || 'unknown@example.com',
          credits_balance: 100,
          subscription_tier: 'free'
        })
        .select('credits_balance, subscription_tier, total_points')
        .single()

      if (createError) {
        throw createError
      }

      userData = newUser
    } else if (error) {
      throw error
    }

    if (!userData) {
      return NextResponse.json(
        { error: 'User initialization failed', code: 'INITIALIZATION_FAILED' },
        { status: 500 }
      )
    }

    return createSuccessResponse({
      balance: userData.credits_balance,
      tier: userData.subscription_tier,
      points: userData.total_points,
    })
  } catch (error) {
    return handleAPIError(error, 'credits/balance')
  }
}
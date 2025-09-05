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

    const { data: userData, error } = await supabase
      .from('users')
      .select('credits_balance, subscription_tier, total_points')
      .eq('id', user.id)
      .single()

    if (error) {
      throw error
    }

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
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
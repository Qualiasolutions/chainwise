import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { 
  handleAPIError, 
  handleAuthError, 
  createSuccessResponse 
} from '@/lib/api-error-handler'

const spendCreditsSchema = z.object({
  amount: z.number().int().positive(),
  featureUsed: z.string(),
  description: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    const authErrorResponse = handleAuthError(authError, user)
    if (authErrorResponse) return authErrorResponse

    const body = await request.json()
    const { amount, featureUsed, description } = spendCreditsSchema.parse(body)

    // Use Supabase transaction-like approach with RPC
    const { data, error } = await supabase.rpc('spend_credits', {
      user_id: user.id,
      credit_amount: amount,
      feature_name: featureUsed,
      transaction_description: description || `Used ${amount} credits for ${featureUsed}`
    })

    if (error) {
      throw error
    }

    return createSuccessResponse({
      newBalance: data.new_balance,
      creditsSpent: amount,
      featureUsed
    })
  } catch (error) {
    return handleAPIError(error, 'credits/spend')
  }
}
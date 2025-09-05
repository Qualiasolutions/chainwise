import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const spendCreditsSchema = z.object({
  amount: z.number().int().positive(),
  featureUsed: z.string(),
  description: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
      console.error('Error spending credits:', error)
      if (error.message.includes('insufficient_credits')) {
        return NextResponse.json({ 
          error: `Insufficient credits: required ${amount}` 
        }, { status: 402 })
      }
      return NextResponse.json({ error: 'Failed to spend credits' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      newBalance: data.new_balance,
    })
  } catch (error) {
    console.error('Error spending credits:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: error.errors 
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Failed to spend credits' }, { status: 500 })
  }
}
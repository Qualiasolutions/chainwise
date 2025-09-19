// Credit Transactions API Route
// GET /api/credits/transactions - Get user's credit transaction history

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
      .select('id')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get credit transactions
    const { data: transactions, error: transError } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (transError) {
      console.error('Credit transactions fetch error:', transError)
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }

    // Format transactions for UI
    const formattedTransactions = (transactions || []).map(transaction => ({
      id: transaction.id,
      date: transaction.created_at,
      amount: Math.abs(transaction.amount),
      type: transaction.transaction_type,
      description: transaction.description,
      ai_persona: transaction.ai_persona,
      session_id: transaction.session_id,
      status: transaction.amount > 0 ? 'credit' : 'debit'
    }))

    // Get summary statistics
    const totalSpent = formattedTransactions
      .filter(t => t.status === 'debit')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalEarned = formattedTransactions
      .filter(t => t.status === 'credit')
      .reduce((sum, t) => sum + t.amount, 0)

    return NextResponse.json({
      transactions: formattedTransactions,
      summary: {
        total_spent: totalSpent,
        total_earned: totalEarned,
        net_credits: totalEarned - totalSpent
      },
      pagination: {
        limit,
        offset,
        total: transactions?.length || 0
      },
      success: true
    })

  } catch (error) {
    console.error('Credit transactions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
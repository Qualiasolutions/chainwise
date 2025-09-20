// Credit Transactions API Route
// GET /api/credits/transactions - Get user's credit transaction history

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

    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    // Get credit transactions using MCP helper
    const transactions = await mcpSupabase.getCreditTransactions(profile.id, limit)

    // Format transactions for UI
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      date: transaction.created_at,
      amount: Math.abs(transaction.amount),
      type: transaction.type,
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
        net_credits: totalEarned - totalSpent,
        current_balance: profile.credits
      },
      pagination: {
        limit,
        total: formattedTransactions.length
      },
      success: true
    })

  } catch (error: any) {
    console.error('Credit transactions API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
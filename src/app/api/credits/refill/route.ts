// Credit Refill API Route
// POST /api/credits/refill - Refill user credits (admin or subscription based)

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

    const body = await request.json()
    const { amount, refillType = 'refill' } = body

    // Validate input
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (!['refill', 'bonus', 'monthly_reset'].includes(refillType)) {
      return NextResponse.json({ error: 'Invalid refill type' }, { status: 400 })
    }

    // For now, allow self-refills for testing
    // In production, this would be restricted to admin users or subscription services
    const success = await mcpSupabase.refillUserCredits(
      profile.id,
      amount,
      refillType
    )

    if (!success) {
      return NextResponse.json({ error: 'Failed to refill credits' }, { status: 500 })
    }

    // Get updated profile
    const updatedProfile = await mcpSupabase.getUserByAuthId(session.user.id)

    return NextResponse.json({
      success: true,
      message: `Successfully added ${amount} credits`,
      credits: updatedProfile?.credits || 0,
      refillType
    })

  } catch (error: any) {
    console.error('Credit refill API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
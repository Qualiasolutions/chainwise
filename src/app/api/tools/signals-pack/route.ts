// Signals Pack API Route
// POST /api/tools/signals-pack - Generate signals pack analysis
// GET /api/tools/signals-pack - Get user's signals packs

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'

interface SignalsPackRequest {
  packName: string
  targetAssets: string[]
  signalTypes: string[]
  timeframes: string[]
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

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

    const body: SignalsPackRequest = await request.json()
    const {
      packName,
      targetAssets,
      signalTypes,
      timeframes
    } = body

    if (!packName || !targetAssets || targetAssets.length === 0) {
      return NextResponse.json({
        error: 'Pack name and target assets are required'
      }, { status: 400 })
    }

    // Check if user has sufficient credits
    const creditCost = 5 // Signals Pack costs 5 credits (most comprehensive tool)
    if (profile.credits < creditCost) {
      return NextResponse.json({
        error: 'Insufficient credits',
        credits_required: creditCost,
        credits_available: profile.credits
      }, { status: 402 })
    }

    console.log(`Generating signals pack for user: ${profile.id}`)
    console.log(`Pack: ${packName}, Assets: ${targetAssets.join(', ')}`)

    // Generate signals pack using database function
    const { data: packData, error: packError } = await supabase
      .rpc('generate_signal_pack', {
        p_user_id: profile.id,
        p_pack_name: packName,
        p_target_assets: targetAssets,
        p_signal_types: signalTypes || ['technical', 'sentiment', 'onchain'],
        p_timeframes: timeframes || ['4h', '1d']
      })

    if (packError) {
      console.error('Signals pack generation error:', packError)
      return NextResponse.json({
        error: 'Failed to generate signals pack'
      }, { status: 500 })
    }

    const pack = packData[0]
    if (!pack) {
      return NextResponse.json({
        error: 'No pack data generated'
      }, { status: 500 })
    }

    // Deduct credits and record transaction
    const creditSuccess = await mcpSupabase.recordCreditUsage(
      profile.id,
      creditCost,
      `Signals Pack: ${packName}`,
      'signals_pack',
      pack.pack_id
    )

    if (!creditSuccess) {
      console.warn('Credit usage recording failed, but continuing with pack')
    }

    // Update user credits
    try {
      await mcpSupabase.updateUser(profile.id, {
        credits: profile.credits - creditCost
      })
    } catch (error) {
      console.error('Failed to update user credits:', error)
      return NextResponse.json({ error: 'Failed to process credits' }, { status: 500 })
    }

    console.log(`Signals pack generated successfully. Credits used: ${creditCost}`)

    return NextResponse.json({
      success: true,
      packId: pack.pack_id,
      signalAnalysis: pack.signal_analysis,
      technicalSignals: pack.technical_signals,
      sentimentSignals: pack.sentiment_signals,
      onchainSignals: pack.onchain_signals,
      compositeScore: pack.composite_score,
      tradingPlan: pack.trading_plan,
      riskManagement: pack.risk_management,
      creditsRemaining: profile.credits - creditCost,
      creditsUsed: creditCost
    })

  } catch (error: any) {
    console.error('Signals pack API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const profile = await mcpSupabase.getUserByAuthId(session.user.id)

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get user's signals packs
    const { data: packs, error } = await supabase
      .rpc('get_user_signal_packs', {
        p_user_id: profile.id
      })

    if (error) {
      console.error('Failed to fetch signals packs:', error)
      return NextResponse.json({
        error: 'Failed to fetch packs'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      packs: packs || [],
      userTier: profile.tier,
      creditsRemaining: profile.credits,
      creditCost: 5
    })

  } catch (error) {
    console.error('Signals pack GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
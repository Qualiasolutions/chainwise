// AI Whale Copy Signals API Route
// POST /api/tools/whale-copy - Generate whale copy signal
// GET /api/tools/whale-copy - Get whale analytics and signals

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'
import { CREDIT_COSTS } from '@/lib/openai/personas'

interface WhaleCopyRequest {
  whaleAddress: string
  cryptocurrency: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

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

    const body: WhaleCopyRequest = await request.json()
    const { whaleAddress, cryptocurrency = 'bitcoin' } = body

    if (!whaleAddress) {
      return NextResponse.json({
        error: 'Whale address is required'
      }, { status: 400 })
    }

    // Determine credit cost
    const creditCost = CREDIT_COSTS.whale_copy_signals // 25 credits

    // Check if user has enough credits
    if (profile.credits < creditCost) {
      return NextResponse.json({
        error: `Insufficient credits. Whale copy signal requires ${creditCost} credits.`
      }, { status: 402 })
    }

    // Check tier access (Elite tier required)
    const tierHierarchy = { free: 0, pro: 1, elite: 2 }
    const userTierLevel = tierHierarchy[profile.tier as keyof typeof tierHierarchy] || 0

    if (userTierLevel < 2) {
      return NextResponse.json({
        error: 'Whale copy signals require Elite tier'
      }, { status: 403 })
    }


    // Generate whale copy signal using database function
    const { data: signalData, error: signalError } = await supabase
      .rpc('generate_whale_copy_signal', {
        p_user_id: profile.id,
        p_whale_address: whaleAddress,
        p_cryptocurrency: cryptocurrency
      })

    if (signalError) {
      console.error('Whale copy signal generation error:', signalError)
      return NextResponse.json({
        error: 'Failed to generate whale copy signal'
      }, { status: 500 })
    }

    const signal = signalData[0]
    if (!signal) {
      return NextResponse.json({
        error: 'No signal data generated'
      }, { status: 500 })
    }

    // Deduct credits and record transaction
    const creditSuccess = await mcpSupabase.recordCreditUsage(
      profile.id,
      creditCost,
      `Whale Copy Signal (${whaleAddress.substring(0, 10)}...)`,
      'whale_copy_signal',
      signal.signal_id
    )

    if (!creditSuccess) {
      console.warn('Credit usage recording failed, but continuing with signal')
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

    // Enhance signal data with additional metadata
    const enhancedSignal = {
      signalId: signal.signal_id,
      signalData: signal.signal_data,
      whaleData: signal.whale_data,
      creditsUsed: signal.credits_charged,
      generatedAt: new Date().toISOString(),
      requestedBy: profile.email,
      userTier: profile.tier,
      metadata: {
        whaleAddress,
        cryptocurrency,
        signalType: 'whale_copy',
        generationTimestamp: new Date().toISOString()
      }
    }


    return NextResponse.json({
      success: true,
      signal: enhancedSignal,
      creditsRemaining: profile.credits - creditCost,
      creditsUsed: creditCost
    })

  } catch (error) {
    console.error('Whale copy API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

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

    // Get top whales analytics
    const { data: topWhales, error: whalesError } = await supabase
      .from('whale_analytics')
      .select(`
        whale_address,
        whale_name,
        blockchain,
        total_balance_usd,
        success_rate,
        avg_roi,
        influence_score,
        copy_worthiness,
        specialty_tokens,
        last_significant_move
      `)
      .order('copy_worthiness', { ascending: false })
      .limit(20)

    if (whalesError) {
      console.error('Failed to fetch whale analytics:', whalesError)
    }

    // Get recent whale movements
    const { data: recentMovements, error: movementsError } = await supabase
      .from('whale_movements')
      .select(`
        id,
        whale_address,
        whale_tag,
        blockchain,
        movement_type,
        cryptocurrency,
        symbol,
        amount_usd,
        price_at_movement,
        movement_significance,
        detected_at
      `)
      .order('detected_at', { ascending: false })
      .limit(15)

    if (movementsError) {
      console.error('Failed to fetch whale movements:', movementsError)
    }

    // Get user's whale copy signals
    const { data: userSignals, error: signalsError } = await supabase
      .from('whale_copy_signals')
      .select(`
        id,
        whale_address,
        signal_type,
        cryptocurrency,
        symbol,
        signal_strength,
        whale_action,
        copy_recommendation,
        entry_price,
        suggested_amount_usd,
        confidence_score,
        whale_track_record,
        signal_reasoning,
        expires_at,
        created_at,
        status
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10)

    if (signalsError) {
      console.error('Failed to fetch user whale copy signals:', signalsError)
    }

    // Get whale copy strategies
    const { data: strategies, error: strategiesError } = await supabase
      .from('whale_copy_strategies')
      .select(`
        id,
        strategy_name,
        description,
        success_rate,
        avg_roi,
        risk_level,
        min_whale_balance
      `)
      .eq('is_active', true)
      .order('success_rate', { ascending: false })

    if (strategiesError) {
      console.error('Failed to fetch whale copy strategies:', strategiesError)
    }

    return NextResponse.json({
      success: true,
      topWhales: topWhales || [],
      recentMovements: recentMovements || [],
      userSignals: userSignals || [],
      strategies: strategies || [],
      userTier: profile.tier,
      creditsRemaining: profile.credits,
      creditCost: CREDIT_COSTS.whale_copy_signals
    })

  } catch (error) {
    console.error('Whale copy GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
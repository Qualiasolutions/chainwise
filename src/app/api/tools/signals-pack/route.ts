// ChainWise Signals Pack API Route
// POST /api/tools/signals-pack - Generate new signal pack
// GET /api/tools/signals-pack - Get user's signal packs and subscriptions

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'
import { CREDIT_COSTS } from '@/lib/openai/personas'

interface SignalPackRequest {
  packType: 'daily' | 'weekly' | 'flash' | 'premium'
  marketTheme?: 'bullish' | 'bearish' | 'neutral' | 'volatility'
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

    // Get user profile
    const profile = await mcpSupabase.getUserByAuthId(session.user.id)

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const body: SignalPackRequest = await request.json()
    const { packType, marketTheme = 'neutral' } = body

    if (!packType || !['daily', 'weekly', 'flash', 'premium'].includes(packType)) {
      return NextResponse.json({
        error: 'Invalid pack type. Must be daily, weekly, flash, or premium'
      }, { status: 400 })
    }

    // Determine credit cost based on pack type
    const creditCostMap = {
      daily: CREDIT_COSTS.signals_daily_pack,
      weekly: CREDIT_COSTS.signals_weekly_pack,
      flash: CREDIT_COSTS.signals_flash_pack,
      premium: CREDIT_COSTS.signals_premium_pack
    }

    const creditCost = creditCostMap[packType]

    // Check if user has enough credits
    if (profile.credits < creditCost) {
      return NextResponse.json({
        error: `Insufficient credits. ${packType} signal pack requires ${creditCost} credits.`
      }, { status: 402 })
    }

    // Check tier access
    const tierHierarchy = { free: 0, pro: 1, elite: 2 }
    const userTierLevel = tierHierarchy[profile.tier as keyof typeof tierHierarchy] || 0

    // Tier restrictions
    if (packType === 'daily' && userTierLevel < 1) {
      return NextResponse.json({
        error: 'Daily signal packs require Pro tier or higher'
      }, { status: 403 })
    }

    if (packType === 'weekly' && userTierLevel < 1) {
      return NextResponse.json({
        error: 'Weekly signal packs require Pro tier or higher'
      }, { status: 403 })
    }

    if ((packType === 'flash' || packType === 'premium') && userTierLevel < 2) {
      return NextResponse.json({
        error: `${packType} signal packs require Elite tier`
      }, { status: 403 })
    }

    console.log(`Generating ${packType} signal pack for user: ${profile.id}`)

    // Generate the signal pack using database function
    const { data: packData, error: packError } = await supabase
      .rpc('generate_signal_pack', {
        p_user_id: profile.id,
        p_pack_type: packType,
        p_market_theme: marketTheme
      })

    if (packError) {
      console.error('Signal pack generation error:', packError)
      return NextResponse.json({
        error: 'Failed to generate signal pack'
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
      `${packType.charAt(0).toUpperCase() + packType.slice(1)} Signal Pack`,
      'signal_pack',
      pack.pack_id
    )

    if (!creditSuccess) {
      console.warn('Credit usage recording failed, but continuing with pack generation')
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

    // Enhance pack data with additional metadata
    const enhancedPack = {
      packId: pack.pack_id,
      packType,
      marketTheme,
      signalsGenerated: pack.signals_generated,
      totalSignals: pack.total_signals,
      creditsUsed: pack.credits_charged,
      generatedAt: new Date().toISOString(),
      requestedBy: profile.email,
      userTier: profile.tier,
      metadata: {
        packType,
        marketTheme,
        totalSignals: pack.total_signals,
        creditsCharged: pack.credits_charged,
        generationTimestamp: new Date().toISOString()
      }
    }

    console.log(`Signal pack generated successfully. Credits used: ${creditCost}`)

    return NextResponse.json({
      success: true,
      pack: enhancedPack,
      creditsRemaining: profile.credits - creditCost,
      creditsUsed: creditCost
    })

  } catch (error) {
    console.error('Signals pack API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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

    // Get user's signal pack access
    const { data: userPacks, error: packsError } = await supabase
      .from('user_signal_access')
      .select(`
        id,
        access_granted_at,
        credits_used,
        access_expires_at,
        usage_stats,
        signal_pack:signal_pack_id (
          id,
          pack_name,
          pack_type,
          description,
          total_signals,
          pack_price_credits,
          tier_requirement,
          market_theme,
          success_rate_target,
          risk_profile,
          pack_status,
          created_at,
          valid_until
        )
      `)
      .eq('user_id', profile.id)
      .order('access_granted_at', { ascending: false })
      .limit(20)

    if (packsError) {
      console.error('Failed to fetch user signal packs:', packsError)
      return NextResponse.json({
        error: 'Failed to fetch signal packs'
      }, { status: 500 })
    }

    // Get available signal packs (active packs)
    const { data: availablePacks, error: availableError } = await supabase
      .from('signal_packs')
      .select(`
        id,
        pack_name,
        pack_type,
        description,
        total_signals,
        pack_price_credits,
        tier_requirement,
        market_theme,
        success_rate_target,
        risk_profile,
        created_at,
        valid_until
      `)
      .eq('pack_status', 'active')
      .gte('valid_until', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(10)

    if (availableError) {
      console.error('Failed to fetch available signal packs:', availableError)
    }

    // Get user's subscriptions
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('signal_subscriptions')
      .select(`
        id,
        subscription_type,
        is_active,
        auto_renewal,
        credits_per_pack,
        last_pack_received,
        total_packs_received,
        subscription_start,
        subscription_end,
        created_at
      `)
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })

    if (subscriptionsError) {
      console.error('Failed to fetch subscriptions:', subscriptionsError)
    }

    // Get signal templates for reference
    const { data: templates, error: templatesError } = await supabase
      .from('signal_templates')
      .select(`
        signal_type,
        template_name,
        description,
        success_rate,
        risk_level,
        target_audience
      `)
      .eq('is_active', true)
      .order('success_rate', { ascending: false })

    if (templatesError) {
      console.error('Failed to fetch signal templates:', templatesError)
    }

    // Get recent signals from user's packs
    const userPackIds = userPacks?.map(pack => pack.signal_pack?.id).filter(Boolean) || []
    let recentSignals = []

    if (userPackIds.length > 0) {
      const { data: signals, error: signalsError } = await supabase
        .from('trading_signals')
        .select(`
          id,
          signal_type,
          cryptocurrency,
          symbol,
          signal_strength,
          entry_price,
          target_price,
          stop_loss,
          timeframe,
          confidence_score,
          risk_reward_ratio,
          signal_description,
          signal_reasoning,
          expires_at,
          created_at,
          status
        `)
        .in('signal_pack_id', userPackIds)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(15)

      if (!signalsError) {
        recentSignals = signals || []
      }
    }

    return NextResponse.json({
      success: true,
      userPacks: userPacks || [],
      availablePacks: availablePacks || [],
      subscriptions: subscriptions || [],
      recentSignals,
      templates: templates || [],
      userTier: profile.tier,
      creditsRemaining: profile.credits,
      creditCosts: {
        daily: CREDIT_COSTS.signals_daily_pack,
        weekly: CREDIT_COSTS.signals_weekly_pack,
        flash: CREDIT_COSTS.signals_flash_pack,
        premium: CREDIT_COSTS.signals_premium_pack
      }
    })

  } catch (error) {
    console.error('Signals pack GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
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

    const { action } = await request.json()

    if (action === 'evaluate_performance') {
      // Evaluate signal performance
      const { data: evaluationData, error: evaluationError } = await supabase
        .rpc('evaluate_signal_performance')

      if (evaluationError) {
        console.error('Signal evaluation error:', evaluationError)
        return NextResponse.json({
          error: 'Failed to evaluate signals'
        }, { status: 500 })
      }

      // Get user's performance stats
      const { data: performanceData, error: performanceError } = await supabase
        .rpc('get_user_signal_performance', {
          p_user_id: profile.id
        })

      if (performanceError) {
        console.error('User performance stats error:', performanceError)
      }

      const evaluation = evaluationData?.[0] || {
        signals_evaluated: 0,
        successful_signals: 0,
        failed_signals: 0,
        avg_performance: 0
      }

      const performance = performanceData?.[0] || {
        total_packs: 0,
        active_signals: 0,
        completed_signals: 0,
        overall_success_rate: 0,
        total_credits_spent: 0,
        average_pack_performance: 0
      }

      console.log(`Signal evaluation complete: ${evaluation.signals_evaluated} signals processed`)

      return NextResponse.json({
        success: true,
        evaluation,
        userPerformance: performance,
        message: 'Signal performance evaluation completed'
      })

    } else {
      return NextResponse.json({
        error: 'Invalid action. Supported actions: evaluate_performance'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Signals pack PATCH API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
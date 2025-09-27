// Altcoin Detector API Route
// POST /api/tools/altcoin-detector - Generate altcoin detection
// GET /api/tools/altcoin-detector - Get user's altcoin detections

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'

interface AltcoinDetectionRequest {
  detectionName: string
  marketCapRange: 'micro_cap' | 'small_cap' | 'mid_cap' | 'low_cap_all'
  sectorFilter?: string[]
  riskTolerance: 'conservative' | 'moderate' | 'aggressive' | 'degen'
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

    const body: AltcoinDetectionRequest = await request.json()
    const {
      detectionName,
      marketCapRange,
      sectorFilter,
      riskTolerance
    } = body

    if (!detectionName || !marketCapRange || !riskTolerance) {
      return NextResponse.json({
        error: 'Detection name, market cap range, and risk tolerance are required'
      }, { status: 400 })
    }

    // Check if user has sufficient credits
    const creditCost = 4 // Altcoin Detector costs 4 credits
    if (profile.credits < creditCost) {
      return NextResponse.json({
        error: 'Insufficient credits',
        credits_required: creditCost,
        credits_available: profile.credits
      }, { status: 402 })
    }


    // Generate altcoin detection using database function
    const { data: detectionData, error: detectionError } = await supabase
      .rpc('generate_altcoin_detection', {
        p_user_id: profile.id,
        p_detection_name: detectionName,
        p_market_cap_range: marketCapRange,
        p_sector_filter: sectorFilter || [],
        p_risk_tolerance: riskTolerance
      })

    if (detectionError) {
      console.error('Altcoin detection generation error:', detectionError)
      return NextResponse.json({
        error: 'Failed to generate altcoin detection'
      }, { status: 500 })
    }

    const detection = detectionData[0]
    if (!detection) {
      return NextResponse.json({
        error: 'No detection data generated'
      }, { status: 500 })
    }

    // Deduct credits and record transaction
    const creditSuccess = await mcpSupabase.recordCreditUsage(
      profile.id,
      creditCost,
      `Altcoin Detection: ${detectionName}`,
      'altcoin_detection',
      detection.detection_id
    )

    if (!creditSuccess) {
      console.warn('Credit usage recording failed, but continuing with detection')
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


    return NextResponse.json({
      success: true,
      detectionId: detection.detection_id,
      gemAnalysis: detection.gem_analysis,
      discoveredGems: detection.discovered_gems,
      riskAssessment: detection.risk_assessment,
      timingAnalysis: detection.timing_analysis,
      portfolioFit: detection.portfolio_fit,
      actionPlan: detection.action_plan,
      creditsRemaining: profile.credits - creditCost,
      creditsUsed: creditCost
    })

  } catch (error: any) {
    console.error('Altcoin detector API error:', error)
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

    // Get user's altcoin detections
    const { data: detections, error } = await supabase
      .rpc('get_user_altcoin_detections', {
        p_user_id: profile.id
      })

    if (error) {
      console.error('Failed to fetch altcoin detections:', error)
      return NextResponse.json({
        error: 'Failed to fetch detections'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      detections: detections || [],
      userTier: profile.tier,
      creditsRemaining: profile.credits,
      creditCost: 4
    })

  } catch (error) {
    console.error('Altcoin detector GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
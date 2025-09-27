// Narrative Deep Scans API Route
// POST /api/tools/narrative-scanner - Generate narrative scan
// GET /api/tools/narrative-scanner - Get user's narrative scans

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'
import { CREDIT_COSTS } from '@/lib/openai/personas'

// Helper function to get user's portfolio holdings for contextual analysis
async function getUserPortfolioContext(supabase: any, userId: string) {
  try {
    const { data: portfolios } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1)

    if (!portfolios || portfolios.length === 0) {
      return { holdings: [], portfolioSymbols: [] }
    }

    const { data: holdings } = await supabase
      .from('portfolio_holdings')
      .select('symbol, name, amount, current_price')
      .eq('portfolio_id', portfolios[0].id)

    const portfolioSymbols = holdings?.map(h => h.symbol.toUpperCase()) || []

    return {
      holdings: holdings || [],
      portfolioSymbols,
      hasPortfolio: holdings && holdings.length > 0
    }
  } catch (error) {
    console.warn('Failed to get portfolio context:', error)
    return { holdings: [], portfolioSymbols: [] }
  }
}

interface NarrativeScanRequest {
  scanName: string
  scanType: 'market_wide' | 'sector_specific' | 'social_momentum' | 'news_driven' | 'whale_narrative'
  targetSectors?: string[]
  timeframe: '24h' | '7d' | '30d' | '90d'
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

    const body: NarrativeScanRequest = await request.json()
    const { scanName, scanType, targetSectors, timeframe } = body

    if (!scanName || !scanType || !timeframe) {
      return NextResponse.json({
        error: 'Scan name, type, and timeframe are required'
      }, { status: 400 })
    }

    // Validate scan type
    const validScanTypes = ['market_wide', 'sector_specific', 'social_momentum', 'news_driven', 'whale_narrative']
    if (!validScanTypes.includes(scanType)) {
      return NextResponse.json({
        error: 'Invalid scan type'
      }, { status: 400 })
    }

    // Determine credit cost
    const creditCost = 4 // Narrative Scanner costs 4 credits

    // Check if user has enough credits
    if (profile.credits < creditCost) {
      return NextResponse.json({
        error: `Insufficient credits. Narrative Deep Scan requires ${creditCost} credits.`
      }, { status: 402 })
    }

    // Check tier access (Pro+ required for narrative scans)
    const tierHierarchy = { free: 0, pro: 1, elite: 2 }
    const userTierLevel = tierHierarchy[profile.tier as keyof typeof tierHierarchy] || 0

    if (userTierLevel < 1) {
      return NextResponse.json({
        error: 'Narrative Deep Scans require Pro tier or higher'
      }, { status: 403 })
    }


    // Generate the narrative scan using our database function
    const { data: scanData, error: scanError } = await supabase
      .rpc('generate_narrative_scan', {
        p_user_id: profile.id,
        p_scan_name: scanName,
        p_scan_type: scanType,
        p_target_sectors: targetSectors || [],
        p_timeframe: timeframe
      })

    if (scanError) {
      console.error('Narrative scan generation error:', scanError)
      return NextResponse.json({
        error: 'Failed to generate narrative scan'
      }, { status: 500 })
    }

    const scan = scanData[0]
    if (!scan) {
      return NextResponse.json({
        error: 'No scan data generated'
      }, { status: 500 })
    }

    // Deduct credits and record transaction
    const creditSuccess = await mcpSupabase.recordCreditUsage(
      profile.id,
      creditCost,
      `Narrative Deep Scan (${scanType}, ${timePeriod})`,
      'narrative_scan',
      scan.scan_id
    )

    if (!creditSuccess) {
      console.warn('Credit usage recording failed, but continuing with scan')
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
      scanId: scan.scan_id,
      narrativeAnalysis: scan.narrative_analysis,
      trendingNarratives: scan.trending_narratives,
      sentimentAnalysis: scan.sentiment_analysis,
      opportunityMatrix: scan.opportunity_matrix,
      riskFactors: scan.risk_factors,
      actionableInsights: scan.actionable_insights,
      creditsRemaining: profile.credits - creditCost,
      creditsUsed: creditCost
    })

  } catch (error) {
    console.error('Narrative scanner API error:', error)
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

    // Get user's narrative scans using our database function
    const { data: scans, error } = await supabase
      .rpc('get_user_narrative_scans', {
        p_user_id: profile.id
      })

    if (error) {
      console.error('Failed to fetch narrative scans:', error)
      return NextResponse.json({
        error: 'Failed to fetch scans'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      scans: scans || [],
      userTier: profile.tier,
      creditsRemaining: profile.credits,
      creditCost: 4
    })

  } catch (error) {
    console.error('Narrative scanner GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


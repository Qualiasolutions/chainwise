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
  scanType: 'comprehensive' | 'targeted' | 'trending'
  targetKeywords?: string[]
  timePeriod: '1h' | '6h' | '24h' | '7d'
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

    const body: NarrativeScanRequest = await request.json()
    const { scanName, scanType, targetKeywords, timePeriod } = body

    if (!scanName || !scanType || !timePeriod) {
      return NextResponse.json({
        error: 'Scan name, type, and time period are required'
      }, { status: 400 })
    }

    // Validate scan type
    const validScanTypes = ['comprehensive', 'targeted', 'trending']
    if (!validScanTypes.includes(scanType)) {
      return NextResponse.json({
        error: 'Invalid scan type'
      }, { status: 400 })
    }

    // Determine credit cost
    const creditCost = CREDIT_COSTS.narrative_deep_scan // 40 credits

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

    console.log(`Generating narrative scan for user: ${profile.id}`)
    console.log(`Scan: ${scanName}, Type: ${scanType}, Period: ${timePeriod}`)

    // Get user's portfolio context for enhanced scanning
    const portfolioContext = await getUserPortfolioContext(supabase, profile.id)

    // Combine target keywords with portfolio symbols for enhanced relevance
    const enhancedKeywords = [
      ...(targetKeywords || []),
      ...portfolioContext.portfolioSymbols
    ].filter((keyword, index, array) => array.indexOf(keyword) === index) // Remove duplicates

    // Generate the narrative scan using database function with portfolio context
    const { data: scanData, error: scanError } = await supabase
      .rpc('generate_narrative_scan', {
        p_user_id: profile.id,
        p_scan_name: scanName,
        p_scan_type: scanType,
        p_target_keywords: enhancedKeywords.length > 0 ? enhancedKeywords : null,
        p_time_period: timePeriod
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

    // Enhance scan data with additional metadata including portfolio context
    const enhancedScan = {
      ...scan.scan_results,
      metadata: {
        scanId: scan.scan_id,
        creditsUsed: creditCost,
        generatedAt: new Date().toISOString(),
        requestedBy: profile.email,
        scanType,
        timePeriod,
        targetKeywords: targetKeywords || [],
        portfolioSymbols: portfolioContext.portfolioSymbols,
        portfolioContextApplied: portfolioContext.hasPortfolio,
        userTier: profile.tier
      },
      portfolioInsights: portfolioContext.hasPortfolio ? {
        relevantHoldings: portfolioContext.holdings.filter(h =>
          enhancedKeywords.includes(h.symbol.toUpperCase())
        ),
        totalHoldingsScanned: portfolioContext.holdings.length,
        portfolioRelevanceScore: Math.round(
          (portfolioContext.portfolioSymbols.length / Math.max(enhancedKeywords.length, 1)) * 100
        )
      } : null
    }

    console.log(`Narrative scan generated successfully. Credits used: ${creditCost}`)

    return NextResponse.json({
      success: true,
      scan: enhancedScan,
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

    // Get user's narrative scans
    const { data: scans, error } = await supabase
      .from('narrative_scans')
      .select(`
        id,
        scan_name,
        scan_type,
        target_keywords,
        time_period,
        scan_results,
        narrative_summary,
        confidence_score,
        credits_used,
        created_at
      `)
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Failed to fetch narrative scans:', error)
      return NextResponse.json({
        error: 'Failed to fetch scans'
      }, { status: 500 })
    }

    // Get current narrative trends for suggestions
    const { data: trends, error: trendsError } = await supabase
      .from('narrative_trends')
      .select(`
        trend_keyword,
        trend_category,
        social_volume,
        sentiment_score,
        volume_change_24h,
        sentiment_change_24h,
        related_tokens
      `)
      .gte('detected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('social_volume', { ascending: false })
      .limit(20)

    if (trendsError) {
      console.error('Failed to fetch narrative trends:', trendsError)
    }

    // Get available narrative keywords for targeting
    const { data: keywords, error: keywordsError } = await supabase
      .from('narrative_keywords')
      .select('keyword, category, description, related_tokens')
      .eq('is_active', true)
      .order('tracking_priority', { ascending: false })

    if (keywordsError) {
      console.error('Failed to fetch narrative keywords:', keywordsError)
    }

    return NextResponse.json({
      success: true,
      scans: scans || [],
      trends: trends || [],
      keywords: keywords || [],
      userTier: profile.tier,
      creditsRemaining: profile.credits,
      creditCost: CREDIT_COSTS.narrative_deep_scan
    })

  } catch (error) {
    console.error('Narrative scanner GET API error:', error)
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

    const { tokenSymbol } = await request.json()

    if (!tokenSymbol) {
      return NextResponse.json({
        error: 'Token symbol is required'
      }, { status: 400 })
    }

    // Get token-specific narrative insights
    const { data: insightsData, error: insightsError } = await supabase
      .rpc('get_token_narrative_insights', {
        p_token_symbol: tokenSymbol.toLowerCase()
      })

    if (insightsError) {
      console.error('Token narrative insights error:', insightsError)
      return NextResponse.json({
        error: 'Failed to get token insights'
      }, { status: 500 })
    }

    const insights = insightsData[0]
    if (!insights) {
      return NextResponse.json({
        error: 'No insights available for this token'
      }, { status: 404 })
    }

    // Analyze current narrative trends
    const { data: trendsData, error: trendsError } = await supabase
      .rpc('analyze_narrative_trends')

    if (trendsError) {
      console.error('Narrative trends analysis error:', trendsError)
    }

    const trendsAnalysis = trendsData?.[0] || {
      trends_updated: 0,
      new_keywords_detected: 0,
      narrative_shifts_detected: 0
    }

    return NextResponse.json({
      success: true,
      tokenSymbol: tokenSymbol.toUpperCase(),
      narrativeThemes: insights.narrative_themes,
      sentimentAnalysis: insights.sentiment_analysis,
      socialMetrics: insights.social_metrics,
      riskFactors: insights.risk_factors,
      trendsAnalysis,
      analysisTimestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Narrative scanner PATCH API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
// Altcoin Early Detector API Route
// POST /api/tools/altcoin-detector - Generate altcoin scan
// GET /api/tools/altcoin-detector - Get user's scans and discovered tokens

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'
import { CREDIT_COSTS } from '@/lib/openai/personas'

interface AltcoinScanRequest {
  scanName: string
  criteriaConfig: {
    max_market_cap?: number
    min_volume_24h?: number
    min_holders?: number
    max_age_days?: number
    max_risk_score?: number
    min_gem_score?: number
    blockchain?: string[]
  }
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

    const body: AltcoinScanRequest = await request.json()
    const { scanName, criteriaConfig } = body

    if (!scanName || !criteriaConfig) {
      return NextResponse.json({
        error: 'Scan name and criteria configuration are required'
      }, { status: 400 })
    }

    // Determine credit cost
    const creditCost = CREDIT_COSTS.altcoin_detector // 5 credits

    // Check if user has enough credits
    if (profile.credits < creditCost) {
      return NextResponse.json({
        error: `Insufficient credits. Altcoin scan requires ${creditCost} credits.`
      }, { status: 402 })
    }

    // Check tier access (Free tier gets basic access, Pro+ gets advanced)
    const tierHierarchy = { free: 0, pro: 1, elite: 2 }
    const userTierLevel = tierHierarchy[profile.tier as keyof typeof tierHierarchy] || 0

    // Free tier limitations
    if (userTierLevel === 0) {
      // Limit scan parameters for free tier
      criteriaConfig.max_market_cap = Math.min(criteriaConfig.max_market_cap || 1000000, 1000000)
      criteriaConfig.max_age_days = Math.min(criteriaConfig.max_age_days || 30, 30)
    }

    console.log(`Generating altcoin scan for user: ${profile.id}`)
    console.log(`Scan: ${scanName}, Criteria:`, criteriaConfig)

    // Generate the altcoin scan using database function
    const { data: scanData, error: scanError } = await supabase
      .rpc('generate_altcoin_scan', {
        p_user_id: profile.id,
        p_scan_name: scanName,
        p_criteria_config: criteriaConfig
      })

    if (scanError) {
      console.error('Altcoin scan generation error:', scanError)
      return NextResponse.json({
        error: 'Failed to generate altcoin scan'
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
      `Altcoin Early Detector Scan`,
      'altcoin_scan',
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

    // Enhance scan data with additional metadata
    const enhancedScan = {
      scanId: scan.scan_id,
      discoveredTokens: scan.discovered_tokens,
      totalDiscovered: scan.total_discovered,
      creditsUsed: creditCost,
      generatedAt: new Date().toISOString(),
      requestedBy: profile.email,
      criteriaConfig,
      userTier: profile.tier,
      metadata: {
        scanName,
        totalTokensFound: scan.total_discovered,
        criteriaApplied: criteriaConfig,
        scanTimestamp: new Date().toISOString()
      }
    }

    console.log(`Altcoin scan generated successfully. Credits used: ${creditCost}`)

    return NextResponse.json({
      success: true,
      scan: enhancedScan,
      creditsRemaining: profile.credits - creditCost,
      creditsUsed: creditCost
    })

  } catch (error) {
    console.error('Altcoin detector API error:', error)
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

    // Get user's altcoin scans
    const { data: scans, error } = await supabase
      .from('altcoin_scans')
      .select(`
        id,
        scan_name,
        scan_criteria,
        discovered_tokens,
        total_discovered,
        scan_summary,
        credits_used,
        created_at
      `)
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Failed to fetch altcoin scans:', error)
      return NextResponse.json({
        error: 'Failed to fetch scans'
      }, { status: 500 })
    }

    // Get recently discovered altcoins for suggestions
    const { data: recentDiscoveries, error: discoveriesError } = await supabase
      .from('discovered_altcoins')
      .select(`
        id,
        token_symbol,
        token_name,
        contract_address,
        blockchain,
        market_cap,
        price_usd,
        volume_24h,
        holders_count,
        age_days,
        risk_score,
        gem_score,
        discovery_timestamp
      `)
      .eq('is_active', true)
      .order('gem_score', { ascending: false })
      .limit(10)

    if (discoveriesError) {
      console.error('Failed to fetch recent discoveries:', discoveriesError)
    }

    // Get available detection criteria
    const { data: criteria, error: criteriaError } = await supabase
      .from('detection_criteria')
      .select('criteria_name, description, criteria_config, success_rate')
      .eq('is_active', true)
      .order('success_rate', { ascending: false })

    if (criteriaError) {
      console.error('Failed to fetch detection criteria:', criteriaError)
    }

    // Get user's watchlist
    const { data: watchlist, error: watchlistError } = await supabase
      .from('altcoin_watchlist')
      .select(`
        id,
        added_at,
        notes,
        target_price,
        stop_loss,
        altcoin:altcoin_id (
          id,
          token_symbol,
          token_name,
          contract_address,
          blockchain,
          market_cap,
          price_usd,
          gem_score,
          risk_score
        )
      `)
      .eq('user_id', profile.id)
      .order('added_at', { ascending: false })

    if (watchlistError) {
      console.error('Failed to fetch watchlist:', watchlistError)
    }

    return NextResponse.json({
      success: true,
      scans: scans || [],
      recentDiscoveries: recentDiscoveries || [],
      criteria: criteria || [],
      watchlist: watchlist || [],
      userTier: profile.tier,
      creditsRemaining: profile.credits,
      creditCost: CREDIT_COSTS.altcoin_detector
    })

  } catch (error) {
    console.error('Altcoin detector GET API error:', error)
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

    const { action } = await request.json()

    if (action === 'update_market_data') {
      // Update altcoin market data
      const { data: updateData, error: updateError } = await supabase
        .rpc('update_altcoin_market_data')

      if (updateError) {
        console.error('Market data update error:', updateError)
        return NextResponse.json({
          error: 'Failed to update market data'
        }, { status: 500 })
      }

      // Get trending opportunities
      const { data: trendsData, error: trendsError } = await supabase
        .rpc('get_trending_altcoin_opportunities')

      if (trendsError) {
        console.error('Trending opportunities error:', trendsError)
      }

      const update = updateData?.[0] || {
        updated_tokens: 0,
        price_changes_detected: 0,
        new_opportunities: 0
      }

      console.log(`Market data update complete: ${update.updated_tokens} tokens updated`)

      return NextResponse.json({
        success: true,
        updateSummary: update,
        trendingOpportunities: trendsData || [],
        lastUpdated: new Date().toISOString(),
        message: 'Market data refresh completed successfully'
      })

    } else if (action === 'get_opportunities') {
      // Get trending opportunities only
      const { data: opportunitiesData, error: opportunitiesError } = await supabase
        .rpc('get_trending_altcoin_opportunities')

      if (opportunitiesError) {
        console.error('Opportunities fetch error:', opportunitiesError)
        return NextResponse.json({
          error: 'Failed to fetch opportunities'
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        opportunities: opportunitiesData || [],
        totalOpportunities: opportunitiesData?.length || 0,
        generatedAt: new Date().toISOString()
      })

    } else {
      return NextResponse.json({
        error: 'Invalid action. Supported actions: update_market_data, get_opportunities'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Altcoin detector PATCH API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
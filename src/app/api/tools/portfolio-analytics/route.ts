// Advanced Portfolio Analytics API Route
// POST /api/tools/portfolio-analytics - Generate portfolio analytics
// GET /api/tools/portfolio-analytics - Get user's analytics history

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'

interface AnalyticsRequest {
  portfolioAllocations: Array<{
    symbol: string
    name: string
    percentage: number
    amount: number
  }>
  confidenceLevel?: number
  timeHorizonDays?: number
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

    const body: AnalyticsRequest = await request.json()
    const { portfolioAllocations, confidenceLevel = 0.95, timeHorizonDays = 30 } = body

    if (!portfolioAllocations || portfolioAllocations.length === 0) {
      return NextResponse.json({
        error: 'Portfolio allocations are required'
      }, { status: 400 })
    }

    // Validate allocations
    const totalPercentage = portfolioAllocations.reduce((sum, allocation) => sum + allocation.percentage, 0)
    if (Math.abs(totalPercentage - 100) > 1) {
      return NextResponse.json({
        error: 'Portfolio allocations must sum to 100%'
      }, { status: 400 })
    }

    // Determine credit cost
    const creditCost = 6 // Advanced analytics costs 6 credits

    // Check if user has enough credits
    if (profile.credits < creditCost) {
      return NextResponse.json({
        error: `Insufficient credits. Portfolio analytics requires ${creditCost} credits.`
      }, { status: 402 })
    }

    // Check tier access (Pro+ required for advanced analytics)
    const tierHierarchy = { free: 0, pro: 1, elite: 2 }
    const userTierLevel = tierHierarchy[profile.tier as keyof typeof tierHierarchy] || 0

    if (userTierLevel < 1) {
      return NextResponse.json({
        error: 'Advanced portfolio analytics require Pro tier or higher'
      }, { status: 403 })
    }

    console.log(`Generating portfolio analytics for user: ${profile.id}`)
    console.log(`Portfolio: ${portfolioAllocations.length} assets, Confidence: ${confidenceLevel}`)

    // Generate portfolio analytics using database function
    const { data: analyticsData, error: analyticsError } = await supabase
      .rpc('calculate_portfolio_analytics', {
        p_user_id: profile.id,
        p_portfolio_allocations: JSON.stringify(portfolioAllocations),
        p_confidence_level: confidenceLevel,
        p_time_horizon_days: timeHorizonDays
      })

    if (analyticsError) {
      console.error('Portfolio analytics generation error:', analyticsError)
      return NextResponse.json({
        error: 'Failed to generate portfolio analytics'
      }, { status: 500 })
    }

    const analytics = analyticsData[0]
    if (!analytics) {
      return NextResponse.json({
        error: 'No analytics data generated'
      }, { status: 500 })
    }

    // Deduct credits and record transaction
    const creditSuccess = await mcpSupabase.recordCreditUsage(
      profile.id,
      creditCost,
      'Advanced Portfolio Analytics',
      'portfolio_analytics',
      analytics.analytics_id
    )

    if (!creditSuccess) {
      console.warn('Credit usage recording failed, but continuing with analytics')
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

    // Enhance analytics data with additional metadata
    const enhancedAnalytics = {
      analyticsId: analytics.analytics_id,
      portfolioAllocations,
      riskMetrics: analytics.risk_metrics,
      performanceMetrics: analytics.performance_metrics,
      correlationAnalysis: analytics.correlation_analysis,
      scenarioAnalysis: analytics.scenario_analysis,
      confidenceLevel,
      timeHorizonDays,
      creditsUsed: creditCost,
      generatedAt: new Date().toISOString(),
      requestedBy: profile.email,
      userTier: profile.tier,
      metadata: {
        portfolioSize: portfolioAllocations.length,
        analysisDepth: 'comprehensive',
        riskAdjustedMetrics: true,
        stressTestingIncluded: true,
        monteCarloSimulation: true
      }
    }

    console.log(`Portfolio analytics generated successfully. Credits used: ${creditCost}`)

    return NextResponse.json({
      success: true,
      analytics: enhancedAnalytics,
      creditsRemaining: profile.credits - creditCost,
      creditsUsed: creditCost
    })

  } catch (error) {
    console.error('Portfolio analytics API error:', error)
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

    // Get user's portfolio analytics history
    const { data: analyticsHistory, error } = await supabase
      .rpc('get_user_portfolio_analytics', {
        p_user_id: profile.id
      })

    if (error) {
      console.error('Failed to fetch portfolio analytics:', error)
      return NextResponse.json({
        error: 'Failed to fetch analytics history'
      }, { status: 500 })
    }

    // Get analytics templates and examples
    const analyticsGuide = {
      riskMetrics: {
        var: {
          description: 'Value at Risk - Maximum expected loss at given confidence level',
          interpretation: 'Lower (more negative) values indicate higher risk',
          ranges: {
            low: 'VaR > -15%',
            medium: 'VaR between -15% and -30%',
            high: 'VaR < -30%'
          }
        },
        sharpeRatio: {
          description: 'Risk-adjusted return measure (return per unit of risk)',
          interpretation: 'Higher values indicate better risk-adjusted performance',
          ranges: {
            excellent: '> 2.0',
            good: '1.0 - 2.0',
            acceptable: '0.5 - 1.0',
            poor: '< 0.5'
          }
        },
        maxDrawdown: {
          description: 'Maximum peak-to-trough decline',
          interpretation: 'Lower values indicate better downside protection',
          ranges: {
            low: '< 20%',
            medium: '20% - 40%',
            high: '> 40%'
          }
        }
      },
      performanceMetrics: {
        expectedReturn: {
          description: 'Annualized expected return based on historical data and projections',
          cryptoRanges: {
            conservative: '8% - 15%',
            moderate: '15% - 30%',
            aggressive: '30% - 60%'
          }
        },
        volatility: {
          description: 'Measure of price variability (standard deviation of returns)',
          cryptoRanges: {
            low: '< 40%',
            medium: '40% - 80%',
            high: '> 80%'
          }
        }
      },
      scenarioAnalysis: {
        description: 'Impact of various market scenarios on portfolio performance',
        scenarios: [
          'Bear Market (2022-style crash)',
          'Flash Crash (sudden market drop)',
          'Regulatory Crackdown',
          'DeFi Protocol Failures'
        ]
      }
    }

    return NextResponse.json({
      success: true,
      analyticsHistory: analyticsHistory || [],
      analyticsGuide,
      userTier: profile.tier,
      creditsRemaining: profile.credits,
      creditCost: 6,
      totalAnalytics: analyticsHistory?.length || 0
    })

  } catch (error) {
    console.error('Portfolio analytics GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
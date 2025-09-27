// Scam Detector API Route
// POST /api/tools/scam-detector - Analyze project for scam indicators
// GET /api/tools/scam-detector - Get user's scam analysis reports

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'

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
      return { holdings: [], portfolioSymbols: [], hasPortfolio: false }
    }

    const { data: holdings } = await supabase
      .from('portfolio_holdings')
      .select('symbol, name, amount, current_price, purchase_price')
      .eq('portfolio_id', portfolios[0].id)

    const portfolioSymbols = holdings?.map(h => h.symbol.toUpperCase()) || []

    return {
      holdings: holdings || [],
      portfolioSymbols,
      hasPortfolio: holdings && holdings.length > 0
    }
  } catch (error) {
    console.warn('Failed to get portfolio context:', error)
    return { holdings: [], portfolioSymbols: [], hasPortfolio: false }
  }
}

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
    const {
      analysisName,
      coinSymbol,
      coinName,
      contractAddress,
      websiteUrl,
      socialLinks = {}
    } = body

    if (!analysisName || (!coinSymbol && !contractAddress && !websiteUrl)) {
      return NextResponse.json({
        error: 'Analysis name is required and at least one of coinSymbol, contractAddress, or websiteUrl must be provided'
      }, { status: 400 })
    }

    // Check if user has sufficient credits
    const creditCost = 5 // Scam Detector costs 5 credits (most expensive due to complexity)
    if (profile.credits < creditCost) {
      return NextResponse.json({
        error: 'Insufficient credits',
        credits_required: creditCost,
        credits_available: profile.credits
      }, { status: 402 })
    }

    try {

      // Get user's portfolio context for enhanced analysis
      const portfolioContext = await getUserPortfolioContext(supabase, profile.id)

      // Generate comprehensive scam analysis using database function
      const { data: analysisData, error: analysisError } = await supabase
        .rpc('generate_scam_analysis', {
          p_user_id: profile.id,
          p_analysis_name: analysisName,
          p_coin_symbol: coinSymbol || null,
          p_coin_name: coinName || null,
          p_contract_address: contractAddress || null,
          p_website_url: websiteUrl || null,
          p_social_links: socialLinks
        })

      if (analysisError) {
        console.error('Scam analysis generation error:', analysisError)
        return NextResponse.json({
          error: 'Failed to generate scam analysis'
        }, { status: 500 })
      }

      const analysis = analysisData[0]
      if (!analysis) {
        return NextResponse.json({
          error: 'No analysis data generated'
        }, { status: 500 })
      }

      // Deduct credits and record transaction
      const creditSuccess = await mcpSupabase.recordCreditUsage(
        profile.id,
        creditCost,
        `Scam Analysis: ${analysisName}`,
        'scam_analysis',
        analysis.analysis_id
      )

      if (!creditSuccess) {
        console.warn('Credit usage recording failed, but continuing with analysis')
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

      // Enhance analysis data with portfolio context
      const enhancedAnalysis = {
        analysisId: analysis.analysis_id,
        riskScore: analysis.risk_score,
        riskLevel: analysis.risk_level,
        analysisResults: analysis.analysis_results,
        warningFlags: analysis.warning_flags,
        overallAssessment: analysis.overall_assessment,
        creditsUsed: analysis.credits_charged,
        portfolioInsights: portfolioContext.hasPortfolio ? {
          isInPortfolio: portfolioContext.portfolioSymbols.includes((coinSymbol || '').toUpperCase()),
          portfolioRisk: portfolioContext.portfolioSymbols.includes((coinSymbol || '').toUpperCase()) ?
            'HIGH - This asset is already in your portfolio!' :
            'Analysis for potential new investment',
          recommendation: portfolioContext.portfolioSymbols.includes((coinSymbol || '').toUpperCase()) ?
            'Consider reviewing your existing position based on this analysis' :
            'Use this analysis to inform your investment decision'
        } : {
          isInPortfolio: false,
          portfolioRisk: 'No existing portfolio found',
          recommendation: 'Complete analysis for potential investment'
        },
        generatedAt: new Date().toISOString()
      }


      return NextResponse.json({
        success: true,
        analysis: enhancedAnalysis,
        creditsRemaining: profile.credits - creditCost,
        creditsUsed: creditCost
      })

    } catch (error: any) {
      console.error('Scam Detector error:', error)
      return NextResponse.json({
        error: 'Failed to generate scam analysis',
        details: error.message
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Scam Detector API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
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

    // Get user's scam analysis reports
    const { data: analyses, error } = await supabase
      .rpc('get_user_scam_analyses', {
        p_user_id: profile.id
      })

    if (error) {
      console.error('Failed to fetch scam analyses:', error)
      return NextResponse.json({
        error: 'Failed to fetch scam analyses'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      analyses: analyses || [],
      userTier: profile.tier,
      creditsRemaining: profile.credits,
      creditCost: 5
    })

  } catch (error) {
    console.error('Scam Detector GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
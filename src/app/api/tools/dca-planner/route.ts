// DCA Planner API Route
// POST /api/tools/dca-planner - Generate DCA plan
// GET /api/tools/dca-planner - Get user's DCA plans

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
      return { holdings: [], portfolioSymbols: [], hasExistingHoldings: false }
    }

    const { data: holdings } = await supabase
      .from('portfolio_holdings')
      .select('symbol, name, amount, current_price, purchase_price')
      .eq('portfolio_id', portfolios[0].id)

    const portfolioSymbols = holdings?.map(h => h.symbol.toUpperCase()) || []

    return {
      holdings: holdings || [],
      portfolioSymbols,
      hasExistingHoldings: holdings && holdings.length > 0
    }
  } catch (error) {
    console.warn('Failed to get portfolio context:', error)
    return { holdings: [], portfolioSymbols: [], hasExistingHoldings: false }
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
      planName,
      coinSymbol,
      coinName,
      totalInvestment,
      investmentFrequency = 'weekly',
      investmentPeriodMonths = 12,
      startDate
    } = body

    if (!planName || !coinSymbol || !totalInvestment || totalInvestment < 100) {
      return NextResponse.json({
        error: 'Invalid input: planName, coinSymbol, and totalInvestment (min $100) are required'
      }, { status: 400 })
    }

    // Validate investment frequency
    if (!['daily', 'weekly', 'biweekly', 'monthly'].includes(investmentFrequency)) {
      return NextResponse.json({
        error: 'Invalid investment frequency. Must be daily, weekly, biweekly, or monthly'
      }, { status: 400 })
    }

    // Validate investment period
    if (investmentPeriodMonths < 1 || investmentPeriodMonths > 60) {
      return NextResponse.json({
        error: 'Investment period must be between 1 and 60 months'
      }, { status: 400 })
    }

    // Check if user has sufficient credits
    const creditCost = 3 // DCA Planner costs 3 credits
    if (profile.credits < creditCost) {
      return NextResponse.json({
        error: 'Insufficient credits',
        credits_required: creditCost,
        credits_available: profile.credits
      }, { status: 402 })
    }

    try {

      // Get user's portfolio context for enhanced DCA planning
      const portfolioContext = await getUserPortfolioContext(supabase, profile.id)

      // Generate comprehensive DCA plan using database function
      const { data: planData, error: planError } = await supabase
        .rpc('generate_dca_plan', {
          p_user_id: profile.id,
          p_plan_name: planName,
          p_coin_symbol: coinSymbol,
          p_coin_name: coinName || coinSymbol,
          p_total_investment_amount: totalInvestment,
          p_investment_frequency: investmentFrequency,
          p_investment_period_months: investmentPeriodMonths,
          p_start_date: startDate ? new Date(startDate).toISOString().split('T')[0] : null
        })

      if (planError) {
        console.error('DCA plan generation error:', planError)
        return NextResponse.json({
          error: 'Failed to generate DCA plan'
        }, { status: 500 })
      }

      const plan = planData[0]
      if (!plan) {
        return NextResponse.json({
          error: 'No plan data generated'
        }, { status: 500 })
      }

      // Deduct credits and record transaction
      const creditSuccess = await mcpSupabase.recordCreditUsage(
        profile.id,
        creditCost,
        `DCA Plan: ${planName}`,
        'dca_plan',
        plan.plan_id
      )

      if (!creditSuccess) {
        console.warn('Credit usage recording failed, but continuing with plan')
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

      // Enhance plan data with portfolio context
      const enhancedPlan = {
        planId: plan.plan_id,
        planAnalysis: plan.plan_analysis,
        historicalAnalysis: plan.historical_analysis,
        projectedReturns: plan.projected_returns,
        riskAnalysis: plan.risk_analysis,
        creditsUsed: plan.credits_charged,
        portfolioInsights: portfolioContext.hasExistingHoldings ? {
          existingHolding: portfolioContext.portfolioSymbols.includes(coinSymbol.toUpperCase()),
          portfolioAllocation: portfolioContext.holdings.find(h =>
            h.symbol.toUpperCase() === coinSymbol.toUpperCase()
          ),
          diversificationBenefit: !portfolioContext.portfolioSymbols.includes(coinSymbol.toUpperCase()),
          recommendedAdjustment: portfolioContext.portfolioSymbols.includes(coinSymbol.toUpperCase()) ?
            'Consider adjusting DCA amount based on existing position size' :
            'DCA will add new asset to portfolio for better diversification'
        } : {
          isFirstInvestment: true,
          recommendedAdjustment: 'DCA is excellent strategy for first crypto investment'
        },
        generatedAt: new Date().toISOString()
      }


      return NextResponse.json({
        success: true,
        plan: enhancedPlan,
        creditsRemaining: profile.credits - creditCost,
        creditsUsed: creditCost
      })

    } catch (error: any) {
      console.error('DCA Planner error:', error)
      return NextResponse.json({
        error: 'Failed to generate DCA plan',
        details: error.message
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('DCA Planner API error:', error)
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

    // Get user's DCA plans
    const { data: plans, error } = await supabase
      .rpc('get_user_dca_plans', {
        p_user_id: profile.id
      })

    if (error) {
      console.error('Failed to fetch DCA plans:', error)
      return NextResponse.json({
        error: 'Failed to fetch DCA plans'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      plans: plans || [],
      userTier: profile.tier,
      creditsRemaining: profile.credits,
      creditCost: 3
    })

  } catch (error) {
    console.error('DCA Planner GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
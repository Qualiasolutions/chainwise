// Portfolio Allocator API Route
// POST /api/tools/portfolio-allocator - Generate portfolio allocation

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'
import { OpenAIService } from '@/lib/openai/service'

// Helper function to get user's existing portfolio for contextual analysis
async function getExistingPortfolioContext(supabase: any, userId: string) {
  try {
    const { data: portfolios } = await supabase
      .from('portfolios')
      .select('id, name, description')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (!portfolios || portfolios.length === 0) {
      return { hasExistingPortfolio: false, portfolios: [], totalValue: 0 }
    }

    // Get holdings for all portfolios
    let allHoldings: any[] = []
    let totalValue = 0

    for (const portfolio of portfolios) {
      const { data: holdings } = await supabase
        .from('portfolio_holdings')
        .select('symbol, name, amount, current_price, purchase_price')
        .eq('portfolio_id', portfolio.id)

      if (holdings) {
        allHoldings = [...allHoldings, ...holdings.map(h => ({ ...h, portfolioName: portfolio.name }))]
        totalValue += holdings.reduce((sum, h) => sum + (h.amount * (h.current_price || h.purchase_price)), 0)
      }
    }

    return {
      hasExistingPortfolio: allHoldings.length > 0,
      portfolios,
      allHoldings,
      totalValue,
      uniqueSymbols: [...new Set(allHoldings.map(h => h.symbol.toUpperCase()))]
    }
  } catch (error) {
    console.warn('Failed to get existing portfolio context:', error)
    return { hasExistingPortfolio: false, portfolios: [], totalValue: 0 }
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

    // Get user profile using MCP helper
    const profile = await mcpSupabase.getUserByAuthId(session.user.id)

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      totalAmount,
      riskTolerance,
      investmentHorizon,
      goals,
      preferences
    } = body

    if (!totalAmount || totalAmount < 100) {
      return NextResponse.json({
        error: 'Invalid input: totalAmount (min $100) is required'
      }, { status: 400 })
    }

    // Check if user has sufficient credits
    const creditCost = 3 // Portfolio Allocator costs 3 credits
    if (profile.credits < creditCost) {
      return NextResponse.json({
        error: 'Insufficient credits',
        credits_required: creditCost,
        credits_available: profile.credits
      }, { status: 402 })
    }

    try {
      // Get existing portfolio context for enhanced allocation
      const portfolioContext = await getExistingPortfolioContext(supabase, profile.id)

      // Generate AI-powered portfolio allocation using optimized Lyra prompts with portfolio context
      if (portfolioContext.hasExistingPortfolio) {
      }

      const aiAnalysis = await OpenAIService.generatePremiumToolResponse(
        'portfolio_allocator',
        {
          totalAmount,
          riskTolerance,
          investmentHorizon,
          goals,
          preferences,
          existingPortfolio: portfolioContext.hasExistingPortfolio ? {
            holdings: portfolioContext.allHoldings,
            totalValue: portfolioContext.totalValue,
            symbols: portfolioContext.uniqueSymbols,
            portfolioCount: portfolioContext.portfolios.length
          } : null
        },
        profile.tier,
        800 // Max tokens for detailed analysis
      )

      // Generate portfolio allocation using enhanced database function
      const { data: allocationData, error: allocationError } = await supabase
        .rpc('generate_portfolio_allocation', {
          p_user_id: profile.id,
          p_allocation_name: `Portfolio Allocation ${new Date().toISOString().split('T')[0]}`,
          p_portfolio_size: totalAmount,
          p_risk_tolerance: riskTolerance,
          p_investment_timeframe: investmentHorizon,
          p_strategy_type: 'balanced'
        })

      if (allocationError) {
        console.error('Portfolio allocation generation error:', allocationError)
        return NextResponse.json({
          error: 'Failed to generate portfolio allocation'
        }, { status: 500 })
      }

      const allocation = allocationData[0]
      if (!allocation) {
        return NextResponse.json({
          error: 'No allocation data generated'
        }, { status: 500 })
      }

      // Deduct credits and record transaction
      const creditSuccess = await mcpSupabase.recordCreditUsage(
        profile.id,
        creditCost,
        `Portfolio Allocation: $${totalAmount}`,
        'portfolio_allocation',
        allocation.allocation_id
      )

      if (!creditSuccess) {
        console.warn('Credit usage recording failed, but continuing with allocation')
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
        allocationId: allocation.allocation_id,
        allocationAnalysis: allocation.allocation_analysis,
        recommendedAllocation: allocation.recommended_allocation,
        rebalancingPlan: allocation.rebalancing_plan,
        riskAnalysis: allocation.risk_analysis,
        performanceProjections: allocation.performance_projections,
        actionItems: allocation.action_items,
        creditsRemaining: profile.credits - creditCost,
        creditsUsed: creditCost
      })

    } catch (error: any) {
      console.error('Portfolio Allocator error:', error)
      return NextResponse.json({
        error: 'Failed to generate portfolio allocation',
        details: error.message
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Portfolio Allocator API error:', error)
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

    // Get user's portfolio allocation history
    const { data: allocationsData, error: allocationsError } = await supabase
      .rpc('get_user_portfolio_allocations', {
        p_user_id: profile.id
      })

    if (allocationsError) {
      console.error('Failed to fetch portfolio allocations:', allocationsError)
      return NextResponse.json({
        error: 'Failed to fetch allocation history'
      }, { status: 500 })
    }

    // Get allocation templates for different risk tolerances
    const allocationTemplates = {
      conservative: {
        description: 'Low-risk portfolio focused on established cryptocurrencies',
        expectedReturn: '8-12%',
        riskScore: 3,
        volatility: 'Low to Medium',
        sampleAssets: ['BTC', 'ETH', 'USDC']
      },
      moderate: {
        description: 'Balanced portfolio with mix of established and emerging assets',
        expectedReturn: '15-25%',
        riskScore: 6,
        volatility: 'Medium',
        sampleAssets: ['BTC', 'ETH', 'SOL', 'ADA', 'USDC']
      },
      aggressive: {
        description: 'High-growth portfolio with significant altcoin exposure',
        expectedReturn: '25-50%',
        riskScore: 9,
        volatility: 'High',
        sampleAssets: ['BTC', 'ETH', 'SOL', 'AVAX', 'DOT', 'MATIC']
      }
    }

    return NextResponse.json({
      success: true,
      allocations: allocationsData || [],
      allocationTemplates,
      userTier: profile.tier,
      creditsRemaining: profile.credits,
      creditCost: 3,
      totalAllocations: allocationsData?.length || 0
    })

  } catch (error: any) {
    console.error('Portfolio Allocator GET API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}
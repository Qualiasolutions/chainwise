// Portfolio Allocator API Route
// POST /api/tools/portfolio-allocator - Generate portfolio allocation

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'
import { OpenAIService } from '@/lib/openai/service'

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
    const creditCost = 4 // Portfolio Allocator costs 4 credits
    if (profile.credits < creditCost) {
      return NextResponse.json({
        error: 'Insufficient credits',
        credits_required: creditCost,
        credits_available: profile.credits
      }, { status: 402 })
    }

    try {
      // Generate AI-powered portfolio allocation using optimized Lyra prompts
      console.log(`🚀 Generating AI portfolio allocation for $${totalAmount} with ${riskTolerance} risk tolerance`)

      const aiAnalysis = await OpenAIService.generatePremiumToolResponse(
        'portfolio_allocator',
        {
          totalAmount,
          riskTolerance,
          investmentHorizon,
          goals,
          preferences
        },
        profile.tier,
        800 // Max tokens for detailed analysis
      )

      // Generate portfolio allocation using enhanced database function
      const cookieStore = await cookies()
      const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

      const { data: allocationData, error: allocationError } = await supabase
        .rpc('generate_portfolio_allocation', {
          p_user_id: profile.id,
          p_total_amount: totalAmount,
          p_risk_tolerance: riskTolerance,
          p_investment_horizon: investmentHorizon,
          p_goals: goals || null,
          p_preferences: preferences || {}
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

      // Combine database allocation with AI analysis
      const enhancedAnalysis = {
        allocations: allocation.allocations,
        analysisResults: allocation.analysis_results,
        totalAmount,
        riskTolerance,
        investmentHorizon,
        goals,
        preferences,
        allocationId: allocation.allocation_id,
        creditsCharged: allocation.credits_charged,
        aiAnalysis, // Include the detailed AI analysis from OpenAI
        enhanced: true, // Flag indicating AI enhancement
        lyraOptimized: true, // Indicates Lyra optimization
        generatedAt: new Date().toISOString()
      }

      // Deduct credits using MCP helper
      await mcpSupabase.deductCredits(profile.id, creditCost, 'Portfolio Allocator', {
        totalAmount,
        riskTolerance,
        investmentHorizon,
        allocationsCount: mockAllocation.allocations.length
      })

      // Log the usage
      await mcpSupabase.logCreditTransaction(profile.id, creditCost, 'debit', 'Portfolio Allocator usage')

      const updatedProfile = await mcpSupabase.getUserById(profile.id)

      return NextResponse.json({
        success: true,
        analysis: enhancedAnalysis,
        credits_remaining: updatedProfile?.credits || 0,
        credits_used: creditCost,
        ai_powered: true,
        lyra_optimized: true, // Indicates Lyra optimization
        message: `AI-enhanced portfolio allocation generated for $${totalAmount} with ${riskTolerance} risk tolerance using live market data.`
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
      creditCost: 4,
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
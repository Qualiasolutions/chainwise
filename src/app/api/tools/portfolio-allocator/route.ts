// AI Smart Portfolio Allocator API Route
// POST /api/tools/portfolio-allocator - Generate portfolio allocation recommendations

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { OpenAIService } from '@/lib/openai/service'
import { CREDIT_COSTS } from '@/lib/openai/personas'

interface AllocationRequest {
  totalAmount: number
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  investmentHorizon: 'short' | 'medium' | 'long'
  goals: string
  currentAllocation?: {
    symbol: string
    percentage: number
    currentValue: number
  }[]
  preferences?: {
    includeAltcoins: boolean
    includeDeFi: boolean
    maxSingleAsset: number
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

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id, tier, credits')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const body = await request.json() as AllocationRequest
    const { totalAmount, riskTolerance, investmentHorizon, goals, currentAllocation, preferences } = body

    // Validate input
    if (!totalAmount || !riskTolerance || !investmentHorizon) {
      return NextResponse.json({
        error: 'Missing required fields'
      }, { status: 400 })
    }

    const creditCost = CREDIT_COSTS.portfolio_analysis

    // Check if user has enough credits
    if (profile.credits < creditCost) {
      return NextResponse.json({
        error: `Insufficient credits. This feature requires ${creditCost} credits.`,
        required_credits: creditCost,
        user_credits: profile.credits
      }, { status: 402 })
    }

    // Create AI prompt for portfolio allocation
    const allocationPrompt = `
    Create a comprehensive portfolio allocation strategy for:

    Portfolio Details:
    - Total Investment: $${totalAmount}
    - Risk Tolerance: ${riskTolerance}
    - Investment Horizon: ${investmentHorizon}
    - Goals: ${goals}
    ${currentAllocation ? `\n    Current Allocation:\n${currentAllocation.map(a => `    - ${a.symbol}: ${a.percentage}% ($${a.currentValue})`).join('\n')}` : ''}

    Preferences:
    - Include Altcoins: ${preferences?.includeAltcoins ? 'Yes' : 'No'}
    - Include DeFi: ${preferences?.includeDeFi ? 'Yes' : 'No'}
    - Max Single Asset: ${preferences?.maxSingleAsset || 50}%

    Please provide:
    1. Recommended allocation percentages for major cryptocurrencies (BTC, ETH, etc.)
    2. Suggested altcoins based on risk tolerance and preferences
    3. Rebalancing strategy and timeline
    4. Risk management recommendations
    5. Market condition considerations
    6. Dollar amounts for each allocation based on total investment

    Format as JSON with detailed recommendations and reasoning.`

    // Generate AI analysis using Professor persona for educational analysis
    const aiAnalysis = await OpenAIService.generateChatResponse({
      persona: 'professor',
      message: allocationPrompt,
      maxTokens: 1200,
      temperature: 0.4
    })

    // Parse AI response and create structured allocation
    let allocationData
    try {
      // Try to extract JSON from AI response
      const jsonMatch = aiAnalysis.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        allocationData = JSON.parse(jsonMatch[0])
      } else {
        // Create structured fallback allocation
        allocationData = createFallbackAllocation(totalAmount, riskTolerance, investmentHorizon)
        allocationData.ai_analysis = aiAnalysis
      }
    } catch (parseError) {
      // Create fallback allocation
      allocationData = createFallbackAllocation(totalAmount, riskTolerance, investmentHorizon)
      allocationData.ai_analysis = aiAnalysis
    }

    // Calculate risk and diversification scores
    const analysisMetrics = calculateAnalysisMetrics(allocationData, riskTolerance)

    // Save portfolio analysis to database
    const { data: portfolioAnalysis, error: saveError } = await supabase
      .from('portfolio_analyses')
      .insert({
        user_id: profile.id,
        portfolio_id: null, // Generic analysis, not tied to specific portfolio
        analysis_type: 'allocation',
        recommendations: allocationData,
        risk_score: analysisMetrics.riskScore,
        diversification_score: analysisMetrics.diversificationScore,
        market_conditions: {
          risk_tolerance: riskTolerance,
          investment_horizon: investmentHorizon,
          total_amount: totalAmount
        },
        credits_used: creditCost
      })
      .select()
      .single()

    if (saveError) {
      console.error('Portfolio analysis save error:', saveError)
      return NextResponse.json({ error: 'Failed to save portfolio analysis' }, { status: 500 })
    }

    // Deduct credits
    const { error: creditError } = await supabase
      .from('users')
      .update({ credits: profile.credits - creditCost })
      .eq('id', profile.id)

    if (creditError) {
      console.error('Credit deduction error:', creditError)
    }

    // Record credit transaction
    await supabase
      .from('credit_transactions')
      .insert({
        user_id: profile.id,
        transaction_type: 'spend',
        amount: -creditCost,
        description: `Portfolio allocation analysis generated`,
        ai_persona: 'professor'
      })

    // Record feature usage
    await supabase
      .from('feature_usage')
      .insert({
        user_id: profile.id,
        feature_type: 'premium',
        feature_name: 'portfolio_allocator',
        credits_used: creditCost,
        success: true,
        metadata: {
          total_amount: totalAmount,
          risk_tolerance: riskTolerance,
          investment_horizon: investmentHorizon
        }
      })

    return NextResponse.json({
      success: true,
      analysis: portfolioAnalysis,
      credits_remaining: profile.credits - creditCost,
      credits_used: creditCost,
      ai_analysis: aiAnalysis
    })

  } catch (error) {
    console.error('Portfolio Allocator API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function createFallbackAllocation(totalAmount: number, riskTolerance: string, investmentHorizon: string) {
  const allocations = {
    conservative: {
      BTC: 60,
      ETH: 30,
      USDC: 10,
      altcoins: 0
    },
    moderate: {
      BTC: 45,
      ETH: 35,
      ADA: 8,
      DOT: 7,
      USDC: 5
    },
    aggressive: {
      BTC: 30,
      ETH: 25,
      SOL: 15,
      AVAX: 10,
      MATIC: 8,
      LINK: 7,
      USDC: 5
    }
  }

  const selectedAllocation = allocations[riskTolerance as keyof typeof allocations] || allocations.moderate

  return {
    allocation: Object.entries(selectedAllocation).map(([symbol, percentage]) => ({
      symbol,
      percentage,
      amount: (totalAmount * percentage) / 100,
      reasoning: `${percentage}% allocation to ${symbol} based on ${riskTolerance} risk profile`
    })),
    rebalancing_strategy: {
      frequency: investmentHorizon === 'short' ? 'monthly' : investmentHorizon === 'medium' ? 'quarterly' : 'semi-annually',
      threshold: riskTolerance === 'conservative' ? 5 : riskTolerance === 'moderate' ? 10 : 15
    },
    risk_management: {
      stop_loss_level: riskTolerance === 'conservative' ? 15 : riskTolerance === 'moderate' ? 20 : 25,
      portfolio_correlation: 'Diversified across different blockchain ecosystems',
      emergency_exit: 'Systematic liquidation plan for major market downturns'
    }
  }
}

function calculateAnalysisMetrics(allocationData: any, riskTolerance: string) {
  // Calculate risk score (1-100) based on allocation and risk tolerance
  const riskScore = riskTolerance === 'conservative' ? 25 : riskTolerance === 'moderate' ? 50 : 75

  // Calculate diversification score based on number of assets and allocation spread
  const allocations = allocationData.allocation || []
  const diversificationScore = Math.min(100, (allocations.length * 15) + 10)

  return {
    riskScore,
    diversificationScore
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
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get user's portfolio analyses
    const { data: analyses, error } = await supabase
      .from('portfolio_analyses')
      .select('*')
      .eq('user_id', profile.id)
      .eq('analysis_type', 'allocation')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Portfolio analyses fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch portfolio analyses' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      analyses: analyses || []
    })

  } catch (error) {
    console.error('Portfolio Analyses GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
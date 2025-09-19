// AI Smart DCA & Exit Planner API Route
// POST /api/tools/dca-planner - Generate DCA and exit strategy plans

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { OpenAIService } from '@/lib/openai/service'
import { CREDIT_COSTS } from '@/lib/openai/personas'

interface DCARequest {
  coinSymbol: string
  coinName: string
  totalInvestment: number
  frequency: 'weekly' | 'monthly'
  durationWeeks: number
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  currentPrice: number
  goals: string
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

    const body = await request.json() as DCARequest
    const { coinSymbol, coinName, totalInvestment, frequency, durationWeeks, riskTolerance, currentPrice, goals } = body

    // Validate input
    if (!coinSymbol || !totalInvestment || !frequency || !durationWeeks || !riskTolerance) {
      return NextResponse.json({
        error: 'Missing required fields'
      }, { status: 400 })
    }

    const creditCost = CREDIT_COSTS.dca_plan

    // Check if user has enough credits
    if (profile.credits < creditCost) {
      return NextResponse.json({
        error: `Insufficient credits. This feature requires ${creditCost} credits.`,
        required_credits: creditCost,
        user_credits: profile.credits
      }, { status: 402 })
    }

    // Create AI prompt for DCA analysis
    const dcaPrompt = `
    Create a detailed DCA (Dollar-Cost Averaging) and Exit Strategy plan for:

    Investment Details:
    - Coin: ${coinName} (${coinSymbol})
    - Total Investment: $${totalInvestment}
    - Frequency: ${frequency}
    - Duration: ${durationWeeks} weeks
    - Risk Tolerance: ${riskTolerance}
    - Current Price: $${currentPrice}
    - Goals: ${goals}

    Please provide:
    1. Optimized DCA Schedule (amount per ${frequency} purchase)
    2. Market timing considerations
    3. Risk management strategies
    4. Exit strategy with multiple profit-taking levels
    5. Stop-loss recommendations
    6. Portfolio allocation suggestions

    Format as JSON with clear actionable recommendations.`

    // Generate AI analysis
    const aiAnalysis = await OpenAIService.generateChatResponse({
      persona: 'trader', // Use trader for professional investment advice
      message: dcaPrompt,
      maxTokens: 1000,
      temperature: 0.3 // Lower temperature for more consistent financial advice
    })

    // Parse AI response and create structured plan
    let planData
    try {
      // Try to extract JSON from AI response
      const jsonMatch = aiAnalysis.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        planData = JSON.parse(jsonMatch[0])
      } else {
        // If no JSON found, create structured data from text response
        planData = {
          dca_schedule: {
            amount_per_period: totalInvestment / (frequency === 'weekly' ? durationWeeks : durationWeeks / 4),
            frequency: frequency,
            total_periods: frequency === 'weekly' ? durationWeeks : Math.ceil(durationWeeks / 4)
          },
          risk_management: aiAnalysis.substring(0, 500),
          exit_strategy: {
            profit_levels: [
              { percentage: 25, sell_amount: '20%' },
              { percentage: 50, sell_amount: '30%' },
              { percentage: 100, sell_amount: '25%' }
            ]
          },
          analysis: aiAnalysis
        }
      }
    } catch (parseError) {
      // Fallback structured plan
      planData = {
        dca_schedule: {
          amount_per_period: totalInvestment / (frequency === 'weekly' ? durationWeeks : durationWeeks / 4),
          frequency: frequency,
          total_periods: frequency === 'weekly' ? durationWeeks : Math.ceil(durationWeeks / 4),
          risk_adjusted_timing: riskTolerance === 'aggressive' ? 'Buy on dips' : 'Regular intervals'
        },
        exit_strategy: {
          profit_levels: [
            { percentage: 20, sell_amount: '15%', note: 'First profit taking' },
            { percentage: 50, sell_amount: '25%', note: 'Major profit taking' },
            { percentage: 100, sell_amount: '30%', note: 'Substantial gains' }
          ],
          stop_loss: riskTolerance === 'conservative' ? -15 : riskTolerance === 'moderate' ? -20 : -25
        },
        risk_management: {
          portfolio_allocation: riskTolerance === 'conservative' ? '5-10%' : riskTolerance === 'moderate' ? '10-20%' : '20-30%',
          rebalancing_frequency: frequency,
          emergency_exit_conditions: 'Major market crash or fundamental issues'
        },
        ai_analysis: aiAnalysis
      }
    }

    // Calculate exit strategy based on current price and risk tolerance
    const exitStrategy = {
      target_levels: [
        {
          price: currentPrice * 1.2,
          action: 'Sell 15%',
          reason: 'First profit taking - secure initial gains'
        },
        {
          price: currentPrice * 1.5,
          action: 'Sell 25%',
          reason: 'Major profit taking - substantial gains achieved'
        },
        {
          price: currentPrice * 2.0,
          action: 'Sell 30%',
          reason: 'Major milestone - secure significant profits'
        }
      ],
      stop_loss: {
        price: currentPrice * (riskTolerance === 'conservative' ? 0.85 : riskTolerance === 'moderate' ? 0.8 : 0.75),
        action: 'Consider exit or reduce position',
        reason: 'Risk management - protect capital'
      }
    }

    // Save DCA plan to database
    const { data: dcaPlan, error: saveError } = await supabase
      .from('dca_plans')
      .insert({
        user_id: profile.id,
        coin_symbol: coinSymbol,
        total_investment: totalInvestment,
        frequency: frequency,
        duration_weeks: durationWeeks,
        risk_tolerance: riskTolerance,
        plan_data: planData,
        exit_strategy: exitStrategy
      })
      .select()
      .single()

    if (saveError) {
      console.error('DCA plan save error:', saveError)
      return NextResponse.json({ error: 'Failed to save DCA plan' }, { status: 500 })
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
        description: `DCA Plan generated for ${coinName}`,
        ai_persona: 'trader'
      })

    // Record feature usage
    await supabase
      .from('feature_usage')
      .insert({
        user_id: profile.id,
        feature_type: 'premium',
        feature_name: 'dca_planner',
        credits_used: creditCost,
        success: true,
        metadata: {
          coin_symbol: coinSymbol,
          investment_amount: totalInvestment,
          risk_tolerance: riskTolerance
        }
      })

    return NextResponse.json({
      success: true,
      plan: dcaPlan,
      credits_remaining: profile.credits - creditCost,
      credits_used: creditCost,
      ai_analysis: aiAnalysis
    })

  } catch (error) {
    console.error('DCA Planner API error:', error)
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
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get user's DCA plans
    const { data: dcaPlans, error } = await supabase
      .from('dca_plans')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('DCA plans fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch DCA plans' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      plans: dcaPlans || []
    })

  } catch (error) {
    console.error('DCA Plans GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
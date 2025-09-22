// DCA Planner API Route
// POST /api/tools/dca-planner - Generate DCA plan

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'

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
      coinSymbol,
      coinName,
      totalInvestment,
      frequency,
      durationWeeks,
      riskTolerance,
      currentPrice,
      goals
    } = body

    if (!coinSymbol || !coinName || !totalInvestment || totalInvestment < 100) {
      return NextResponse.json({
        error: 'Invalid input: coinSymbol, coinName, and totalInvestment (min $100) are required'
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
      // TODO: Integrate with OpenAI API for actual DCA plan generation
      // For now, return a mock response
      const mockPlan = {
        coinSymbol,
        coinName,
        strategy: {
          totalInvestment,
          frequency,
          durationWeeks,
          investmentPerPeriod: frequency === 'weekly'
            ? totalInvestment / durationWeeks
            : totalInvestment / (durationWeeks / 4),
          estimatedEndDate: new Date(Date.now() + durationWeeks * 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        riskAnalysis: {
          riskTolerance,
          volatilityScore: riskTolerance === 'conservative' ? 3 : riskTolerance === 'moderate' ? 6 : 9,
          recommendations: [
            'Start with smaller amounts to test the strategy',
            'Monitor market conditions regularly',
            'Consider adjusting frequency during high volatility'
          ]
        },
        projectedOutcomes: {
          bestCase: totalInvestment * 1.5,
          expectedCase: totalInvestment * 1.2,
          worstCase: totalInvestment * 0.8
        }
      }

      // Deduct credits using MCP helper
      await mcpSupabase.deductCredits(profile.id, creditCost, 'DCA Planner', {
        coinSymbol,
        totalInvestment,
        frequency,
        durationWeeks
      })

      // Log the usage
      await mcpSupabase.logCreditTransaction(profile.id, creditCost, 'debit', 'DCA Planner usage')

      const updatedProfile = await mcpSupabase.getUserById(profile.id)

      return NextResponse.json({
        success: true,
        plan: mockPlan,
        credits_remaining: updatedProfile?.credits || 0,
        credits_used: creditCost,
        ai_analysis: `Generated DCA plan for ${coinSymbol} with ${frequency} investments over ${durationWeeks} weeks. Total investment: $${totalInvestment}.`
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
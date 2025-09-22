// Portfolio Allocator API Route
// POST /api/tools/portfolio-allocator - Generate portfolio allocation

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
      // TODO: Integrate with OpenAI API for actual portfolio allocation
      // For now, return a mock response based on risk tolerance
      let mockAllocation: any = {}

      if (riskTolerance === 'conservative') {
        mockAllocation = {
          allocations: [
            { symbol: 'BTC', name: 'Bitcoin', percentage: 60, amount: totalAmount * 0.6 },
            { symbol: 'ETH', name: 'Ethereum', percentage: 25, amount: totalAmount * 0.25 },
            { symbol: 'USDC', name: 'USD Coin', percentage: 15, amount: totalAmount * 0.15 }
          ],
          riskScore: 3,
          expectedReturn: '8-12%',
          volatility: 'Low to Medium'
        }
      } else if (riskTolerance === 'moderate') {
        mockAllocation = {
          allocations: [
            { symbol: 'BTC', name: 'Bitcoin', percentage: 40, amount: totalAmount * 0.4 },
            { symbol: 'ETH', name: 'Ethereum', percentage: 30, amount: totalAmount * 0.3 },
            { symbol: 'SOL', name: 'Solana', percentage: 15, amount: totalAmount * 0.15 },
            { symbol: 'ADA', name: 'Cardano', percentage: 10, amount: totalAmount * 0.1 },
            { symbol: 'USDC', name: 'USD Coin', percentage: 5, amount: totalAmount * 0.05 }
          ],
          riskScore: 6,
          expectedReturn: '15-25%',
          volatility: 'Medium'
        }
      } else { // aggressive
        mockAllocation = {
          allocations: [
            { symbol: 'BTC', name: 'Bitcoin', percentage: 30, amount: totalAmount * 0.3 },
            { symbol: 'ETH', name: 'Ethereum', percentage: 25, amount: totalAmount * 0.25 },
            { symbol: 'SOL', name: 'Solana', percentage: 15, amount: totalAmount * 0.15 },
            { symbol: 'AVAX', name: 'Avalanche', percentage: 10, amount: totalAmount * 0.1 },
            { symbol: 'DOT', name: 'Polkadot', percentage: 10, amount: totalAmount * 0.1 },
            { symbol: 'MATIC', name: 'Polygon', percentage: 10, amount: totalAmount * 0.1 }
          ],
          riskScore: 9,
          expectedReturn: '25-50%',
          volatility: 'High'
        }
      }

      const mockAnalysis = {
        ...mockAllocation,
        totalAmount,
        riskTolerance,
        investmentHorizon,
        diversificationScore: mockAllocation.allocations.length * 20,
        rebalanceRecommendation: investmentHorizon === 'short' ? 'Monthly' : investmentHorizon === 'medium' ? 'Quarterly' : 'Semi-annually',
        keyInsights: [
          `Allocation optimized for ${riskTolerance} risk tolerance`,
          `Diversified across ${mockAllocation.allocations.length} assets`,
          `Suitable for ${investmentHorizon}-term investment horizon`,
          preferences?.includeAltcoins ? 'Includes alternative cryptocurrencies' : 'Focus on established cryptocurrencies'
        ]
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
        analysis: mockAnalysis,
        credits_remaining: updatedProfile?.credits || 0,
        credits_used: creditCost,
        ai_analysis: `Generated portfolio allocation for $${totalAmount} with ${riskTolerance} risk tolerance across ${mockAllocation.allocations.length} assets.`
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
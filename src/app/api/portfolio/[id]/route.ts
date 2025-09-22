// Individual Portfolio API Routes
// GET /api/portfolio/[id] - Get specific portfolio with holdings
// PUT /api/portfolio/[id] - Update portfolio
// DELETE /api/portfolio/[id] - Delete portfolio

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const portfolioId = (await params).id

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // TODO: Replace with MCP query for better performance
    // const portfolioData = await useMCPQuery(
    //   'SELECT p.*, ph.* FROM portfolios p LEFT JOIN portfolio_holdings ph ON p.id = ph.portfolio_id WHERE p.id = $1 AND p.user_id = $2',
    //   [portfolioId, profile.id]
    // )

    // Get portfolio with holdings
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        portfolio_holdings (
          id,
          symbol,
          name,
          amount,
          purchase_price,
          purchase_date,
          current_price,
          created_at,
          updated_at
        )
      `)
      .eq('id', portfolioId)
      .eq('user_id', profile.id)
      .single()

    if (error || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Calculate detailed portfolio metrics
    const holdings = portfolio.portfolio_holdings || []

    const portfolioMetrics = {
      totalValue: 0,
      totalInvested: 0,
      totalPnL: 0,
      totalPnLPercentage: 0,
      dayChange: 0,
      dayChangePercentage: 0,
      holdingsCount: holdings.length,
      bestPerformer: null,
      worstPerformer: null,
      allocation: []
    }

    if (holdings.length > 0) {
      let bestPnL = -Infinity
      let worstPnL = Infinity

      const holdingsWithMetrics = holdings.map(holding => {
        const currentPrice = holding.current_price || holding.purchase_price
        const value = holding.amount * currentPrice
        const invested = holding.amount * holding.purchase_price
        const pnl = value - invested
        const pnlPercentage = invested > 0 ? (pnl / invested) * 100 : 0

        portfolioMetrics.totalValue += value
        portfolioMetrics.totalInvested += invested

        if (pnlPercentage > bestPnL) {
          bestPnL = pnlPercentage
          portfolioMetrics.bestPerformer = {
            symbol: holding.symbol,
            pnlPercentage
          }
        }

        if (pnlPercentage < worstPnL) {
          worstPnL = pnlPercentage
          portfolioMetrics.worstPerformer = {
            symbol: holding.symbol,
            pnlPercentage
          }
        }

        return {
          ...holding,
          currentValue: value,
          totalPnL: pnl,
          pnlPercentage,
          allocation: 0 // Will be calculated after total value is known
        }
      })

      // Calculate allocations
      const holdingsWithAllocations = holdingsWithMetrics.map(holding => ({
        ...holding,
        allocation: portfolioMetrics.totalValue > 0
          ? (holding.currentValue / portfolioMetrics.totalValue) * 100
          : 0
      }))

      portfolioMetrics.totalPnL = portfolioMetrics.totalValue - portfolioMetrics.totalInvested
      portfolioMetrics.totalPnLPercentage = portfolioMetrics.totalInvested > 0
        ? (portfolioMetrics.totalPnL / portfolioMetrics.totalInvested) * 100
        : 0

      portfolioMetrics.allocation = holdingsWithAllocations.map(holding => ({
        symbol: holding.symbol,
        name: holding.name,
        allocation: holding.allocation,
        value: holding.currentValue
      }))

      // Return portfolio with enriched holdings
      return NextResponse.json({
        portfolio: {
          ...portfolio,
          portfolio_holdings: holdingsWithAllocations,
          metrics: portfolioMetrics
        },
        success: true
      })
    }

    return NextResponse.json({
      portfolio: {
        ...portfolio,
        metrics: portfolioMetrics
      },
      success: true
    })

  } catch (error) {
    console.error('Portfolio fetch API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const portfolioId = (await params).id

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Portfolio name is required' }, { status: 400 })
    }

    // TODO: Replace with MCP query
    const { data: updatedPortfolio, error } = await supabase
      .from('portfolios')
      .update({
        name: name.trim(),
        description: description?.trim() || null
      })
      .eq('id', portfolioId)
      .eq('user_id', profile.id)
      .select()
      .single()

    if (error || !updatedPortfolio) {
      return NextResponse.json({ error: 'Portfolio not found or update failed' }, { status: 404 })
    }

    return NextResponse.json({
      portfolio: updatedPortfolio,
      success: true
    })

  } catch (error) {
    console.error('Portfolio update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const portfolioId = (await params).id

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Check if this is the user's only portfolio
    const { data: userPortfolios } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', profile.id)

    if (userPortfolios && userPortfolios.length === 1) {
      return NextResponse.json({
        error: 'Cannot delete your only portfolio. Create another portfolio first.'
      }, { status: 400 })
    }

    // TODO: Replace with MCP query
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', portfolioId)
      .eq('user_id', profile.id)

    if (error) {
      console.error('Portfolio deletion error:', error)
      return NextResponse.json({ error: 'Failed to delete portfolio' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Portfolio deleted successfully'
    })

  } catch (error) {
    console.error('Portfolio deletion API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
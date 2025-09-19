// Portfolio Management API Routes
// GET /api/portfolio - Get user portfolios
// POST /api/portfolio - Create new portfolio

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to get user ID
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // TODO: Replace with MCP query
    // const portfolios = await useMCPQuery(
    //   'SELECT * FROM portfolios WHERE user_id = $1 ORDER BY is_default DESC, created_at ASC',
    //   [profile.id]
    // )

    // For now, using direct supabase call - this will be replaced with MCP
    const { data: portfolios, error } = await supabase
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
          current_price
        )
      `)
      .eq('user_id', profile.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Portfolio fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch portfolios' }, { status: 500 })
    }

    // Calculate portfolio metrics for each portfolio
    const portfoliosWithMetrics = portfolios.map(portfolio => {
      const holdings = portfolio.portfolio_holdings || []

      const totalValue = holdings.reduce((sum, holding) => {
        const currentPrice = holding.current_price || holding.purchase_price
        return sum + (holding.amount * currentPrice)
      }, 0)

      const totalInvested = holdings.reduce((sum, holding) => {
        return sum + (holding.amount * holding.purchase_price)
      }, 0)

      const totalPnL = totalValue - totalInvested
      const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

      return {
        ...portfolio,
        metrics: {
          totalValue,
          totalInvested,
          totalPnL,
          totalPnLPercentage,
          holdingsCount: holdings.length
        }
      }
    })

    return NextResponse.json({
      portfolios: portfoliosWithMetrics,
      success: true
    })

  } catch (error) {
    console.error('Portfolio API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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
      .select('id, tier')
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

    // Check portfolio limits based on tier
    const { data: existingPortfolios } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', profile.id)

    const portfolioLimits = {
      free: 1,
      pro: 3,
      elite: 10
    }

    const userLimit = portfolioLimits[profile.tier as keyof typeof portfolioLimits] || 1

    if (existingPortfolios && existingPortfolios.length >= userLimit) {
      return NextResponse.json({
        error: `Portfolio limit reached. ${profile.tier} tier allows ${userLimit} portfolio(s).`
      }, { status: 400 })
    }

    // TODO: Replace with MCP query
    // const newPortfolio = await useMCPQuery(
    //   'INSERT INTO portfolios (user_id, name, description) VALUES ($1, $2, $3) RETURNING *',
    //   [profile.id, name.trim(), description?.trim() || null]
    // )

    // For now, using direct supabase call
    const { data: newPortfolio, error } = await supabase
      .from('portfolios')
      .insert({
        user_id: profile.id,
        name: name.trim(),
        description: description?.trim() || null,
        is_default: existingPortfolios?.length === 0 // First portfolio is default
      })
      .select()
      .single()

    if (error) {
      console.error('Portfolio creation error:', error)
      return NextResponse.json({ error: 'Failed to create portfolio' }, { status: 500 })
    }

    return NextResponse.json({
      portfolio: newPortfolio,
      success: true
    })

  } catch (error) {
    console.error('Portfolio creation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
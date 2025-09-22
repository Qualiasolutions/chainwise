// Portfolio Management API Routes
// GET /api/portfolio - Get user portfolios
// POST /api/portfolio - Create new portfolio

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/types'
import { cryptoAPI } from '@/lib/crypto-api'
export async function GET(request: NextRequest) {
  try {
    // Get auth_id from query parameters or headers
    const url = new URL(request.url)
    const authId = url.searchParams.get('auth_id')

    if (!authId) {
      return NextResponse.json({ error: 'Missing auth_id parameter' }, { status: 400 })
    }

    // Use service role client to bypass RLS for administrative operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Get user profile to get user ID
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', authId)
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

    // Get all unique crypto symbols from all portfolios for live price fetching
    const allHoldings = portfolios.flatMap(p => p.portfolio_holdings || [])
    const uniqueSymbols = [...new Set(allHoldings.map(h => h.symbol.toLowerCase()))]

    // Fetch live prices for all holdings at once
    let livePrices: Record<string, Record<string, number>> = {}
    try {
      if (uniqueSymbols.length > 0) {
        // Map symbol to CoinGecko ID (this is a simplified mapping - in production you'd have a proper symbol->id mapping)
        const symbolToId: Record<string, string> = {
          'btc': 'bitcoin',
          'eth': 'ethereum',
          'bnb': 'binancecoin',
          'ada': 'cardano',
          'xrp': 'ripple',
          'sol': 'solana',
          'dot': 'polkadot',
          'doge': 'dogecoin',
          'matic': 'polygon',
          'avax': 'avalanche-2',
          'link': 'chainlink',
          'uni': 'uniswap',
          // Add more mappings as needed
        }

        const coinIds = uniqueSymbols.map(symbol => symbolToId[symbol] || symbol).filter(Boolean)

        if (coinIds.length > 0) {
          livePrices = await cryptoAPI.getSimplePrice(coinIds, ['usd'])
        }
      }
    } catch (error) {
      console.warn('Failed to fetch live prices, using stored prices as fallback:', error)
    }

    // Calculate portfolio metrics for each portfolio with live prices
    const portfoliosWithMetrics = await Promise.all(portfolios.map(async portfolio => {
      const holdings = portfolio.portfolio_holdings || []

      const totalValue = holdings.reduce((sum, holding) => {
        const symbol = holding.symbol.toLowerCase()
        const symbolToId: Record<string, string> = {
          'btc': 'bitcoin',
          'eth': 'ethereum',
          'bnb': 'binancecoin',
          'ada': 'cardano',
          'xrp': 'ripple',
          'sol': 'solana',
          'dot': 'polkadot',
          'doge': 'dogecoin',
          'matic': 'polygon',
          'avax': 'avalanche-2',
          'link': 'chainlink',
          'uni': 'uniswap',
        }

        const coinId = symbolToId[symbol] || symbol
        const livePrice = livePrices[coinId]?.usd
        const currentPrice = livePrice || holding.current_price || holding.purchase_price

        return sum + (holding.amount * currentPrice)
      }, 0)

      const totalInvested = holdings.reduce((sum, holding) => {
        return sum + (holding.amount * holding.purchase_price)
      }, 0)

      const totalPnL = totalValue - totalInvested
      const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

      // Update holdings with live prices in database (async, don't wait for it)
      holdings.forEach(async holding => {
        const symbol = holding.symbol.toLowerCase()
        const symbolToId: Record<string, string> = {
          'btc': 'bitcoin',
          'eth': 'ethereum',
          'bnb': 'binancecoin',
          'ada': 'cardano',
          'xrp': 'ripple',
          'sol': 'solana',
          'dot': 'polkadot',
          'doge': 'dogecoin',
          'matic': 'polygon',
          'avax': 'avalanche-2',
          'link': 'chainlink',
          'uni': 'uniswap',
        }

        const coinId = symbolToId[symbol] || symbol
        const livePrice = livePrices[coinId]?.usd

        if (livePrice && livePrice !== holding.current_price) {
          try {
            await supabase
              .from('portfolio_holdings')
              .update({
                current_price: livePrice,
                updated_at: new Date().toISOString()
              })
              .eq('id', holding.id)
          } catch (error) {
            console.warn(`Failed to update price for holding ${holding.id}:`, error)
          }
        }
      })

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
    }))

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
    const body = await request.json()
    const { name, description, authId } = body

    if (!authId) {
      return NextResponse.json({ error: 'Missing authId' }, { status: 400 })
    }

    // Use service role client to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id, tier')
      .eq('auth_id', authId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

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
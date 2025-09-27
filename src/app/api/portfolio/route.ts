// Portfolio Management API Routes with MCP Integration
// GET /api/portfolio - Get user portfolios with proper error handling
// POST /api/portfolio - Create new portfolio

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { cryptoAPI } from '@/lib/crypto-api'
import { MCPSupabaseClient } from '@/lib/supabase/mcp-helpers'

const mcpClient = new MCPSupabaseClient()

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError) {
      return NextResponse.json({ error: 'Authentication error', details: authError.message }, { status: 401 })
    }

    if (!session) {
      return NextResponse.json({ error: 'No active session' }, { status: 401 })
    }

    // Get user profile from profiles table (portfolios reference profiles, not users)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, auth_id, email, tier, credits')
      .eq('auth_id', session.user.id)
      .single()


    if (profileError) {
      console.error('❌ Profile fetch error:', profileError)

      // If profile doesn't exist, try to create one
      if (profileError.code === 'PGRST116') {
        console.log('🔨 Creating new profile for user:', session.user.id)

        try {
          const newProfileData = {
            auth_id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || null,
            bio: null,
            location: null,
            website: null,
            avatar_url: session.user.user_metadata?.avatar_url || null,
            tier: 'free',
            credits: 3,
            monthly_credits: 3
          }

          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert(newProfileData)
            .select('id, auth_id, email, tier, credits')
            .single()

          if (createError) {
            console.error('❌ Profile creation error:', createError)
            return NextResponse.json({
              error: 'Failed to create user profile',
              details: createError.message
            }, { status: 500 })
          }

          console.log('✅ Profile created:', createdProfile.id)

          // Return empty portfolios for new user
          return NextResponse.json({
            portfolios: [],
            success: true,
            message: 'New user profile created'
          })
        } catch (createError: any) {
          console.error('❌ Profile creation failed:', createError)
          return NextResponse.json({
            error: 'Failed to create user profile',
            details: createError.message
          }, { status: 500 })
        }
      }

      return NextResponse.json({
        error: 'User profile error',
        details: profileError.message
      }, { status: 404 })
    }

    if (!profile) {
      console.log('❌ Profile not found after successful query')
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    console.log('📊 Fetching portfolios for user:', profile.id)

    // Use MCP client to get portfolios
    try {
      const portfolios = await mcpClient.getUserPortfolios(profile.id)
      console.log('📈 Portfolios fetched via MCP:', portfolios.length)

      // Get all unique crypto symbols for live price fetching
      const allHoldings = portfolios.flatMap(p => p.portfolio_holdings || [])
      const uniqueSymbols = [...new Set(allHoldings.map(h => h.symbol.toLowerCase()))]
      console.log('🪙 Unique crypto symbols found:', uniqueSymbols)

      // Fetch live prices for all holdings
      let livePrices: Record<string, Record<string, number>> = {}
      try {
        if (uniqueSymbols.length > 0) {
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
            'ltc': 'litecoin',
            'atom': 'cosmos',
            'algo': 'algorand'
          }

          const coinIds = uniqueSymbols.map(symbol => symbolToId[symbol] || symbol).filter(Boolean)
          console.log('🔄 Fetching live prices for coins:', coinIds)

          if (coinIds.length > 0) {
            livePrices = await cryptoAPI.getSimplePrice(coinIds, ['usd'])
            console.log('💰 Live prices fetched:', Object.keys(livePrices).length)
          }
        }
      } catch (priceError) {
        console.warn('⚠️ Failed to fetch live prices, using stored prices:', priceError)
      }

      // Calculate portfolio metrics with live prices
      const portfoliosWithMetrics = await Promise.all(portfolios.map(async portfolio => {
        const holdings = portfolio.portfolio_holdings || []
        console.log(`📊 Processing portfolio "${portfolio.name}" with ${holdings.length} holdings`)

        let totalValue = 0
        let totalInvested = 0

        // Calculate values for each holding
        const enrichedHoldings = holdings.map(holding => {
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
            'ltc': 'litecoin',
            'atom': 'cosmos',
            'algo': 'algorand'
          }

          const coinId = symbolToId[symbol] || symbol
          const livePrice = livePrices[coinId]?.usd
          const currentPrice = livePrice || holding.current_price || holding.purchase_price

          const holdingValue = holding.amount * currentPrice
          const investedValue = holding.amount * holding.purchase_price

          totalValue += holdingValue
          totalInvested += investedValue

          return {
            ...holding,
            current_price: currentPrice,
            market_value: holdingValue,
            invested_value: investedValue,
            pnl: holdingValue - investedValue,
            pnl_percentage: investedValue > 0 ? ((holdingValue - investedValue) / investedValue) * 100 : 0
          }
        })

        const totalPnL = totalValue - totalInvested
        const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

        console.log(`💎 Portfolio "${portfolio.name}" metrics:`, {
          totalValue: totalValue.toFixed(2),
          totalInvested: totalInvested.toFixed(2),
          totalPnL: totalPnL.toFixed(2),
          totalPnLPercentage: totalPnLPercentage.toFixed(2)
        })

        // Update current prices in database (async, don't wait)
        enrichedHoldings.forEach(async holding => {
          if (holding.current_price !== holding.purchase_price) {
            try {
              await mcpClient.updatePortfolioHolding(holding.id, {
                current_price: holding.current_price,
                updated_at: new Date().toISOString()
              })
            } catch (updateError) {
              console.warn(`⚠️ Failed to update price for holding ${holding.id}:`, updateError)
            }
          }
        })

        return {
          ...portfolio,
          portfolio_holdings: enrichedHoldings,
          metrics: {
            totalValue,
            totalInvested,
            totalPnL,
            totalPnLPercentage,
            holdingsCount: holdings.length
          }
        }
      }))

      console.log('✅ Portfolio data processing complete')

      return NextResponse.json({
        portfolios: portfoliosWithMetrics,
        success: true,
        debug: {
          profileId: profile.id,
          portfolioCount: portfolios.length,
          totalHoldings: allHoldings.length,
          livePricesCount: Object.keys(livePrices).length
        }
      })

    } catch (mcpError: any) {
      console.error('❌ MCP Portfolio fetch error:', mcpError)

      // Fallback to direct Supabase query if MCP fails
      console.log('🔄 Falling back to direct Supabase query')

      const { data: portfolios, error: directError } = await supabase
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

      if (directError) {
        console.error('❌ Direct Supabase query failed:', directError)
        return NextResponse.json({
          error: 'Failed to fetch portfolios',
          details: directError.message
        }, { status: 500 })
      }

      console.log('✅ Direct Supabase fallback successful:', portfolios?.length || 0)

      // Return portfolios with basic metrics (without live prices for now)
      const portfoliosWithBasicMetrics = (portfolios || []).map(portfolio => {
        const holdings = portfolio.portfolio_holdings || []
        const totalInvested = holdings.reduce((sum, h) => sum + (h.amount * h.purchase_price), 0)
        const totalValue = holdings.reduce((sum, h) => sum + (h.amount * (h.current_price || h.purchase_price)), 0)
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
        portfolios: portfoliosWithBasicMetrics,
        success: true,
        fallback: true,
        message: 'Using direct Supabase fallback'
      })
    }

  } catch (error: any) {
    console.error('❌ Portfolio API critical error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('🔍 Portfolio API POST request started')

  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    console.log('🔐 Auth session check:', { hasSession: !!session })

    if (authError || !session) {
      console.error('❌ Authentication failed:', authError?.message)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id, tier')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      console.error('❌ Profile not found for user:', session.user.id)
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, description } = body
    console.log('📝 Creating portfolio:', { name, description, profileId: profile.id })

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Portfolio name is required' }, { status: 400 })
    }

    // Check portfolio limits based on tier
    const existingPortfolios = await mcpClient.getUserPortfolios(profile.id)
    console.log('📊 Existing portfolios count:', existingPortfolios.length)

    const portfolioLimits = {
      free: 1,
      pro: 3,
      elite: 10
    }

    const userLimit = portfolioLimits[profile.tier as keyof typeof portfolioLimits] || 1

    if (existingPortfolios.length >= userLimit) {
      console.log('❌ Portfolio limit reached:', { count: existingPortfolios.length, limit: userLimit })
      return NextResponse.json({
        error: `Portfolio limit reached. ${profile.tier} tier allows ${userLimit} portfolio(s).`
      }, { status: 400 })
    }

    // Create new portfolio using MCP
    try {
      const newPortfolio = await mcpClient.createPortfolio({
        user_id: profile.id,
        name: name.trim(),
        description: description?.trim() || null,
        is_default: existingPortfolios.length === 0 // First portfolio is default
      })

      console.log('✅ Portfolio created successfully:', newPortfolio.id)

      return NextResponse.json({
        portfolio: newPortfolio,
        success: true
      })

    } catch (mcpError: any) {
      console.error('❌ MCP Portfolio creation error:', mcpError)

      // Fallback to direct Supabase
      const { data: newPortfolio, error: directError } = await supabase
        .from('portfolios')
        .insert({
          user_id: profile.id,
          name: name.trim(),
          description: description?.trim() || null,
          is_default: existingPortfolios.length === 0
        })
        .select()
        .single()

      if (directError) {
        console.error('❌ Direct portfolio creation failed:', directError)
        return NextResponse.json({
          error: 'Failed to create portfolio',
          details: directError.message
        }, { status: 500 })
      }

      console.log('✅ Portfolio created via fallback:', newPortfolio.id)
      return NextResponse.json({
        portfolio: newPortfolio,
        success: true,
        fallback: true
      })
    }

  } catch (error: any) {
    console.error('❌ Portfolio creation API critical error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    )
  }
}
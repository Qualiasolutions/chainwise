// Portfolio Holdings API Routes
// GET /api/portfolio/[id]/holdings - Get portfolio holdings
// POST /api/portfolio/[id]/holdings - Add new holding

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { cryptoAPI } from '@/lib/crypto-api'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
    const portfolioId = (await params).id

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Verify portfolio ownership
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id, user_id')
      .eq('id', portfolioId)
      .eq('user_id', profile.id)
      .single()

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Get portfolio holdings
    const { data: holdings, error: holdingsError } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('portfolio_id', portfolioId)

    if (holdingsError) {
      console.error('Holdings fetch error:', holdingsError)
      return NextResponse.json({ error: 'Failed to fetch holdings' }, { status: 500 })
    }

    // Enrich holdings with current prices and calculations
    const enrichedHoldings = await Promise.all(
      (holdings || []).map(async (holding) => {
        try {
          // Map common symbols to CoinGecko IDs
          const symbolToIdMap: Record<string, string> = {
            'btc': 'bitcoin',
            'eth': 'ethereum',
            'bnb': 'binancecoin',
            'ada': 'cardano',
            'sol': 'solana',
            'dot': 'polkadot',
            'avax': 'avalanche-2',
            'matic': 'matic-network',
            'link': 'chainlink',
            'uni': 'uniswap',
            'ltc': 'litecoin',
            'bch': 'bitcoin-cash',
            'xlm': 'stellar',
            'vet': 'vechain',
            'trx': 'tron',
            'etc': 'ethereum-classic',
            'ftt': 'ftx-token',
            'near': 'near',
            'algo': 'algorand',
            'mana': 'decentraland',
            'sand': 'the-sandbox',
            'axs': 'axie-infinity',
            'cro': 'crypto-com-chain',
            'lrc': 'loopring',
            'grt': 'the-graph',
            'chz': 'chiliz',
            'bat': 'basic-attention-token'
          }

          const coinId = symbolToIdMap[holding.symbol.toLowerCase()] || holding.symbol.toLowerCase()

          // Get current price from CoinGecko API
          const cryptoData = await cryptoAPI.getCrypto(coinId)
          const currentPrice = cryptoData?.current_price || holding.purchase_price

          const currentValue = holding.amount * currentPrice
          const totalPnL = currentValue - (holding.amount * holding.purchase_price)
          const pnlPercentage = holding.purchase_price > 0
            ? (totalPnL / (holding.amount * holding.purchase_price)) * 100
            : 0

          return {
            ...holding,
            current_price: currentPrice,
            currentValue,
            totalPnL,
            pnlPercentage,
            image: cryptoData?.image || null
          }
        } catch (error) {
          // If API fails, use stored price or purchase price
          console.warn(`Failed to get current price for ${holding.symbol}:`, error)
          const currentPrice = holding.current_price || holding.purchase_price
          const currentValue = holding.amount * currentPrice
          const totalPnL = currentValue - (holding.amount * holding.purchase_price)
          const pnlPercentage = holding.purchase_price > 0
            ? (totalPnL / (holding.amount * holding.purchase_price)) * 100
            : 0

          return {
            ...holding,
            current_price: currentPrice,
            currentValue,
            totalPnL,
            pnlPercentage,
            image: null
          }
        }
      })
    )

    return NextResponse.json({
      enrichedHoldings: enrichedHoldings,
      holdings: enrichedHoldings, // Keep both for backward compatibility
      success: true
    })

  } catch (error) {
    console.error('Holdings API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
    const portfolioId = (await params).id

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, tier')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Verify portfolio ownership
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id, user_id')
      .eq('id', portfolioId)
      .eq('user_id', profile.id)
      .single()

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    const body = await request.json()
    const { symbol, name, amount, purchasePrice, purchaseDate, coinGeckoId } = body

    // Validation
    if (!symbol || !name || !amount || !purchasePrice || !purchaseDate) {
      return NextResponse.json({
        error: 'Missing required fields: symbol, name, amount, purchasePrice, purchaseDate'
      }, { status: 400 })
    }

    if (amount <= 0 || purchasePrice <= 0) {
      return NextResponse.json({
        error: 'Amount and purchase price must be greater than 0'
      }, { status: 400 })
    }

    // Check holdings limit based on tier
    const { data: existingHoldings } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('portfolio_id', portfolioId)

    const holdingLimits = {
      free: 3,
      pro: 20,
      elite: 999999 // Unlimited
    }

    const userLimit = holdingLimits[profile.tier as keyof typeof holdingLimits] || 3

    if (existingHoldings && existingHoldings.length >= userLimit) {
      return NextResponse.json({
        error: `Holdings limit reached. ${profile.tier} tier allows ${userLimit === 999999 ? 'unlimited' : userLimit} holdings per portfolio.`
      }, { status: 400 })
    }

    // Check for duplicate symbol in this portfolio
    const existingSymbol = existingHoldings?.find(h => h.symbol.toLowerCase() === symbol.toLowerCase())

    if (existingSymbol) {
      return NextResponse.json({
        error: `${symbol.toUpperCase()} is already in this portfolio. Update the existing holding instead.`
      }, { status: 400 })
    }

    // Get current price for the crypto using CoinGecko ID if available
    let currentPrice = purchasePrice
    let cryptoImage = null
    try {
      let cryptoData
      if (coinGeckoId) {
        cryptoData = await cryptoAPI.getCrypto(coinGeckoId)
      } else {
        // Map common symbols to CoinGecko IDs
        const symbolToIdMap: Record<string, string> = {
          'btc': 'bitcoin',
          'eth': 'ethereum',
          'bnb': 'binancecoin',
          'ada': 'cardano',
          'sol': 'solana',
          'dot': 'polkadot',
          'avax': 'avalanche-2',
          'matic': 'matic-network',
          'link': 'chainlink',
          'uni': 'uniswap',
          'ltc': 'litecoin',
          'bch': 'bitcoin-cash',
          'xlm': 'stellar',
          'vet': 'vechain',
          'trx': 'tron',
          'etc': 'ethereum-classic',
          'ftt': 'ftx-token',
          'near': 'near',
          'algo': 'algorand',
          'mana': 'decentraland',
          'sand': 'the-sandbox',
          'axs': 'axie-infinity',
          'cro': 'crypto-com-chain',
          'lrc': 'loopring',
          'grt': 'the-graph',
          'chz': 'chiliz',
          'bat': 'basic-attention-token'
        }

        const coinId = symbolToIdMap[symbol.toLowerCase()] || symbol.toLowerCase()
        cryptoData = await cryptoAPI.getCrypto(coinId)
      }

      currentPrice = cryptoData?.current_price || purchasePrice
      cryptoImage = cryptoData?.image || null
    } catch (error) {
      console.warn(`Failed to get current price for ${symbol}:`, error)
    }

    // Add holding to database
    const { data: newHolding, error: createError } = await supabase
      .from('portfolio_holdings')
      .insert({
        portfolio_id: portfolioId,
        symbol: symbol.toLowerCase(),
        name: name.trim(),
        amount: parseFloat(amount),
        purchase_price: parseFloat(purchasePrice),
        purchase_date: new Date(purchaseDate).toISOString(),
        current_price: currentPrice
      })
      .select()
      .single()

    if (createError || !newHolding) {
      console.error('Holding creation error:', createError)
      return NextResponse.json({ error: 'Failed to add holding' }, { status: 500 })
    }

    // Calculate metrics for the new holding
    const currentValue = newHolding.amount * (newHolding.current_price || newHolding.purchase_price)
    const totalPnL = currentValue - (newHolding.amount * newHolding.purchase_price)
    const pnlPercentage = newHolding.purchase_price > 0
      ? (totalPnL / (newHolding.amount * newHolding.purchase_price)) * 100
      : 0

    const enrichedHolding = {
      ...newHolding,
      currentValue,
      totalPnL,
      pnlPercentage,
      image: cryptoImage
    }

    return NextResponse.json({
      holding: enrichedHolding,
      success: true
    })

  } catch (error) {
    console.error('Add holding API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
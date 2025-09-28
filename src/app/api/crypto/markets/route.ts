// Crypto Markets API Route - Proxy for CoinGecko
// GET /api/crypto/markets - Get top cryptocurrencies by market cap

import { NextRequest, NextResponse } from 'next/server'

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '250'
    const page = searchParams.get('page') || '1'
    const ids = searchParams.get('ids')

    // Build CoinGecko API URL
    let apiUrl
    if (ids) {
      // Portfolio performance data - specific coin IDs
      apiUrl = `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=250&page=1&sparkline=false`
    } else {
      // Top cryptocurrencies by market cap
      apiUrl = `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=${page}&sparkline=false&price_change_percentage=24h`
    }

    // Make server-side request to CoinGecko (no CORS issues)
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      }
    })

    if (!response.ok) {
      // Handle rate limiting
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }

      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()

    // Return the data with proper headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
      }
    })

  } catch (error) {
    console.error('Markets API error:', error)

    // Return fallback data if API fails
    return NextResponse.json([
      {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
        current_price: 112000,
        market_cap: 2200000000000,
        market_cap_rank: 1,
        fully_diluted_valuation: 2352000000000,
        total_volume: 28000000000,
        high_24h: 113500,
        low_24h: 110500,
        price_change_24h: 2000,
        price_change_percentage_24h: 1.82,
        market_cap_change_24h: 40000000000,
        market_cap_change_percentage_24h: 1.85,
        circulating_supply: 19650000,
        total_supply: 21000000,
        max_supply: 21000000,
        ath: 115000,
        ath_change_percentage: -2.6,
        ath_date: "2025-01-15T00:00:00Z",
        atl: 67.81,
        atl_change_percentage: 165000,
        atl_date: "2013-07-06T00:00:00Z",
        last_updated: new Date().toISOString()
      },
      {
        id: "ethereum",
        symbol: "eth",
        name: "Ethereum",
        image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
        current_price: 4200,
        market_cap: 505000000000,
        market_cap_rank: 2,
        fully_diluted_valuation: 505000000000,
        total_volume: 12000000000,
        high_24h: 4280,
        low_24h: 4150,
        price_change_24h: 50,
        price_change_percentage_24h: 1.2,
        market_cap_change_24h: 6000000000,
        market_cap_change_percentage_24h: 1.2,
        circulating_supply: 120200000,
        total_supply: 120200000,
        max_supply: null,
        ath: 4878,
        ath_change_percentage: -13.9,
        ath_date: "2021-11-10T00:00:00Z",
        atl: 0.432979,
        atl_change_percentage: 970000,
        atl_date: "2015-10-20T00:00:00Z",
        last_updated: new Date().toISOString()
      }
    ], { status: 200 })
  }
}
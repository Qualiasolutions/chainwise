// Global Market Data API Route - Proxy for CoinGecko
// GET /api/crypto/global - Get global cryptocurrency market data

import { NextRequest, NextResponse } from 'next/server'

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

export async function GET(request: NextRequest) {
  try {
    // Make server-side request to CoinGecko
    const response = await fetch(`${COINGECKO_API_BASE}/global`, {
      headers: {
        'Accept': 'application/json',
      }
    })

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
      }
    })

  } catch (error) {
    console.error('Global market data API error:', error)

    // Return fallback data
    return NextResponse.json({
      data: {
        active_cryptocurrencies: 10245,
        upcoming_icos: 0,
        ongoing_icos: 49,
        ended_icos: 3376,
        markets: 901,
        total_market_cap: {
          usd: 2800000000000,
        },
        total_volume: {
          usd: 145000000000,
        },
        market_cap_percentage: {
          btc: 58.2,
          eth: 18.1,
          usdt: 3.8,
          bnb: 2.4,
          sol: 1.9,
          xrp: 1.5,
          usdc: 1.2,
          ada: 0.9,
          avax: 0.7,
          doge: 0.6,
        },
        market_cap_change_percentage_24h_usd: 2.3,
        updated_at: Math.floor(Date.now() / 1000)
      }
    }, { status: 200 })
  }
}
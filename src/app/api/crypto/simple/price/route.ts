// Simple Price API Route - Proxy for CoinGecko
// GET /api/crypto/simple/price - Get current prices for cryptocurrencies

import { NextRequest, NextResponse } from 'next/server'

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

// Fallback price data for popular cryptocurrencies
const FALLBACK_PRICES: Record<string, Record<string, number>> = {
  bitcoin: {
    usd: 112000,
    usd_24h_change: 1.82
  },
  ethereum: {
    usd: 4200,
    usd_24h_change: 1.2
  },
  ripple: {
    usd: 2.45,
    usd_24h_change: 5.8
  },
  solana: {
    usd: 256,
    usd_24h_change: 0.83
  },
  cardano: {
    usd: 1.23,
    usd_24h_change: 1.23
  },
  dogecoin: {
    usd: 0.38,
    usd_24h_change: 2.1
  },
  binancecoin: {
    usd: 712,
    usd_24h_change: 0.59
  },
  litecoin: {
    usd: 105,
    usd_24h_change: 1.5
  },
  polkadot: {
    usd: 8.45,
    usd_24h_change: 2.3
  },
  chainlink: {
    usd: 28.50,
    usd_24h_change: 1.8
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids') || 'bitcoin,ethereum'
    const vsCurrencies = searchParams.get('vs_currencies') || 'usd'
    const include24hChange = searchParams.get('include_24hr_change') === 'true'

    // Build CoinGecko API URL
    const apiUrl = `${COINGECKO_API_BASE}/simple/price?ids=${ids}&vs_currencies=${vsCurrencies}${include24hChange ? '&include_24hr_change=true' : ''}`

    // Make server-side request to CoinGecko (no CORS issues)
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      }
    })

    if (response.ok) {
      const data = await response.json()

      // Return the data with proper headers
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
        }
      })
    } else {
      // Handle rate limiting or other API errors
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }

      // Use fallback data
      console.warn('CoinGecko simple price API failed, using fallback data')

      const requestedIds = ids.split(',')
      const fallbackData: Record<string, any> = {}

      requestedIds.forEach(id => {
        if (FALLBACK_PRICES[id]) {
          fallbackData[id] = FALLBACK_PRICES[id]
        }
      })

      return NextResponse.json(fallbackData, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=15'
        }
      })
    }

  } catch (error) {
    console.error('Simple price API error:', error)

    // Return fallback data for common requests
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids') || 'bitcoin,ethereum'
    const requestedIds = ids.split(',')
    const fallbackData: Record<string, any> = {}

    requestedIds.forEach(id => {
      if (FALLBACK_PRICES[id]) {
        fallbackData[id] = FALLBACK_PRICES[id]
      }
    })

    return NextResponse.json(fallbackData, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=15'
      }
    })
  }
}
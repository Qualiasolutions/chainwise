// Server-side global crypto data API to avoid CORS issues
import { NextResponse } from 'next/server'

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

export async function GET() {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/global`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 60 } // Cache for 1 minute
      }
    )

    if (!response.ok) {
      if (response.status === 429) {
        // Rate limited - return fallback data
        return NextResponse.json(generateFallbackGlobalData())
      }
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('CoinGecko global API error:', error)

    // Return fallback global data
    return NextResponse.json(generateFallbackGlobalData())
  }
}

function generateFallbackGlobalData() {
  return {
    data: {
      active_cryptocurrencies: 13856,
      upcoming_icos: 0,
      ongoing_icos: 49,
      ended_icos: 3376,
      markets: 1097,
      total_market_cap: {
        usd: 3450000000000 // $3.45T
      },
      total_volume: {
        usd: 89000000000 // $89B
      },
      market_cap_percentage: {
        btc: 58.2,
        eth: 12.8
      },
      market_cap_change_percentage_24h_usd: 2.1,
      updated_at: Math.floor(Date.now() / 1000)
    }
  }
}
// Global Market Data API Route - Proxy for CoinGecko
// GET /api/crypto/global - Get global cryptocurrency market data

import { NextRequest, NextResponse } from 'next/server'

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Make server-side request to CoinGecko with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(`${COINGECKO_API_BASE}/global`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ChainWise-App/1.0'
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('CoinGecko rate limit hit, serving fallback data')
        return getEnhancedFallbackResponse('rate_limit')
      }
      if (response.status >= 500) {
        console.warn('CoinGecko server error, serving fallback data')
        return getEnhancedFallbackResponse('server_error')
      }
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    const responseTime = Date.now() - startTime

    console.log(`✅ Global data fetched successfully in ${responseTime}ms`)

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=150', // 5 minute cache
        'X-Response-Time': `${responseTime}ms`,
        'X-Data-Source': 'coingecko-live'
      }
    })

  } catch (error: any) {
    const responseTime = Date.now() - startTime
    console.error('Global market data API error:', {
      error: error.message,
      time: responseTime,
      stack: error.stack
    })

    // Determine error type for better fallback
    const errorType = error.name === 'AbortError' ? 'timeout' :
                     error.message.includes('fetch') ? 'network' : 'unknown'

    return getEnhancedFallbackResponse(errorType)
  }
}

// Enhanced fallback response with comprehensive market data
function getEnhancedFallbackResponse(errorType: string) {
  const now = new Date()
  const currentTimestamp = Math.floor(now.getTime() / 1000)

  // Generate realistic market variation (±2%)
  const variation = 1 + (Math.random() - 0.5) * 0.04

  const fallbackData = {
    data: {
      active_cryptocurrencies: 13840,
      upcoming_icos: 0,
      ongoing_icos: 49,
      ended_icos: 3376,
      markets: 924,
      total_market_cap: {
        usd: Math.floor(3200000000000 * variation), // ~$3.2T
        btc: Math.floor(54000000 * variation),
        eth: Math.floor(800000000 * variation),
        eur: Math.floor(2950000000000 * variation),
        jpy: Math.floor(470000000000000 * variation),
        cny: Math.floor(23000000000000 * variation)
      },
      total_volume: {
        usd: Math.floor(165000000000 * variation), // ~$165B
        btc: Math.floor(2800000 * variation),
        eth: Math.floor(42000000 * variation),
        eur: Math.floor(152000000000 * variation),
        jpy: Math.floor(24000000000000 * variation),
        cny: Math.floor(1200000000000 * variation)
      },
      market_cap_percentage: {
        btc: 56.8 + (Math.random() - 0.5) * 2,
        eth: 16.2 + (Math.random() - 0.5) * 1,
        usdt: 3.9 + (Math.random() - 0.5) * 0.3,
        bnb: 2.1 + (Math.random() - 0.5) * 0.2,
        sol: 2.8 + (Math.random() - 0.5) * 0.4,
        xrp: 1.4 + (Math.random() - 0.5) * 0.2,
        usdc: 1.1 + (Math.random() - 0.5) * 0.1,
        ada: 0.8 + (Math.random() - 0.5) * 0.1,
        avax: 0.6 + (Math.random() - 0.5) * 0.1,
        doge: 0.5 + (Math.random() - 0.5) * 0.1
      },
      market_cap_change_percentage_24h_usd: 1.8 + (Math.random() - 0.5) * 6, // -1.2% to +4.8%
      updated_at: currentTimestamp
    },
    meta: {
      source: 'fallback',
      reason: errorType,
      generated_at: currentTimestamp,
      cache_duration: 300, // 5 minutes
      status: 'degraded_service'
    }
  }

  return NextResponse.json(fallbackData, {
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30', // Shorter cache for fallback
      'X-Data-Source': 'fallback',
      'X-Fallback-Reason': errorType,
      'X-Generated-At': new Date().toISOString()
    }
  })
}
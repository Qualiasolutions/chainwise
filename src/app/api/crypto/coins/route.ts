// Comprehensive Cryptocurrency List API Route
// GET /api/crypto/coins - Get all available cryptocurrencies from CoinGecko

import { NextRequest, NextResponse } from 'next/server'

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const include_platform = searchParams.get('include_platform') || 'false'
    const status = searchParams.get('status') || 'active'

    // Build CoinGecko API URL for comprehensive coins list
    const apiUrl = `${COINGECKO_API_BASE}/coins/list?include_platform=${include_platform}&status=${status}`

    // Make server-side request to CoinGecko (no CORS issues)
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ChainWise-App/1.0'
      }
    })

    if (!response.ok) {
      // Handle rate limiting
      if (response.status === 429) {
        console.warn('CoinGecko rate limit hit, returning cached fallback')
        return NextResponse.json(
          { error: 'Rate limit exceeded. Using cached data.', data: [] },
          { status: 429 }
        )
      }

      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()

    // Return the data with aggressive caching for coins list (updates rarely)
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800', // 1 hour cache
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('Coins list API error:', error)

    // Return essential coins fallback data if API fails
    const fallbackCoins = [
      { id: "bitcoin", symbol: "btc", name: "Bitcoin" },
      { id: "ethereum", symbol: "eth", name: "Ethereum" },
      { id: "binancecoin", symbol: "bnb", name: "BNB" },
      { id: "cardano", symbol: "ada", name: "Cardano" },
      { id: "ripple", symbol: "xrp", name: "XRP" },
      { id: "solana", symbol: "sol", name: "Solana" },
      { id: "polkadot", symbol: "dot", name: "Polkadot" },
      { id: "dogecoin", symbol: "doge", name: "Dogecoin" },
      { id: "polygon", symbol: "matic", name: "Polygon" },
      { id: "avalanche-2", symbol: "avax", name: "Avalanche" },
      { id: "chainlink", symbol: "link", name: "Chainlink" },
      { id: "uniswap", symbol: "uni", name: "Uniswap" },
      { id: "litecoin", symbol: "ltc", name: "Litecoin" },
      { id: "cosmos", symbol: "atom", name: "Cosmos Hub" },
      { id: "algorand", symbol: "algo", name: "Algorand" },
      { id: "near", symbol: "near", name: "NEAR Protocol" },
      { id: "fantom", symbol: "ftm", name: "Fantom" },
      { id: "terra-luna-2", symbol: "luna", name: "Terra Luna Classic" },
      { id: "apecoin", symbol: "ape", name: "ApeCoin" },
      { id: "shiba-inu", symbol: "shib", name: "Shiba Inu" }
    ]

    return NextResponse.json(fallbackCoins, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=150' // 5 min cache for fallback
      }
    })
  }
}
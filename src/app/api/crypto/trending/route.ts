// Trending Cryptos API Route - Proxy for CoinGecko
// GET /api/crypto/trending - Get trending cryptocurrencies

import { NextRequest, NextResponse } from 'next/server'

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

export async function GET(request: NextRequest) {
  try {
    // Make server-side request to CoinGecko
    const response = await fetch(`${COINGECKO_API_BASE}/search/trending`, {
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
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60'
      }
    })

  } catch (error) {
    console.error('Trending cryptos API error:', error)

    // Return fallback data
    return NextResponse.json({
      coins: [
        {
          item: {
            id: "solana",
            coin_id: 4128,
            name: "Solana",
            symbol: "SOL",
            market_cap_rank: 5,
            thumb: "https://assets.coingecko.com/coins/images/4128/thumb/solana.png",
            small: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
            large: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
            slug: "solana",
            price_btc: 0.002345,
            score: 0
          }
        },
        {
          item: {
            id: "avalanche-2",
            coin_id: 12559,
            name: "Avalanche",
            symbol: "AVAX",
            market_cap_rank: 12,
            thumb: "https://assets.coingecko.com/coins/images/12559/thumb/coin-round-red.png",
            small: "https://assets.coingecko.com/coins/images/12559/small/coin-round-red.png",
            large: "https://assets.coingecko.com/coins/images/12559/large/coin-round-red.png",
            slug: "avalanche",
            price_btc: 0.000456,
            score: 1
          }
        },
        {
          item: {
            id: "chainlink",
            coin_id: 1975,
            name: "Chainlink",
            symbol: "LINK",
            market_cap_rank: 15,
            thumb: "https://assets.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png",
            small: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
            large: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
            slug: "chainlink",
            price_btc: 0.000234,
            score: 2
          }
        }
      ],
      exchanges: []
    }, { status: 200 })
  }
}
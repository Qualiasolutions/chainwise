import { NextRequest, NextResponse } from 'next/server'
// This endpoint doesn't need authentication - it's public crypto data
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Request validation schema
const listCryptosSchema = z.object({
  limit: z.string().optional().transform(val => parseInt(val || '50')),
  offset: z.string().optional().transform(val => parseInt(val || '0')),
  search: z.string().optional(),
  category: z.string().optional()
})

// GET /api/crypto/list - Get list of cryptocurrencies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { limit, offset, search, category } = listCryptosSchema.parse(
      Object.fromEntries(searchParams)
    )

    // For now, return a static list of popular cryptocurrencies
    // In production, this would fetch from CoinGecko API
    const popularCryptos = [
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
        current_price: 45000,
        market_cap: 850000000000,
        market_cap_rank: 1,
        price_change_percentage_24h: 2.5,
        category: 'layer-1'
      },
      {
        id: 'ethereum',
        symbol: 'eth',
        name: 'Ethereum',
        image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        current_price: 2800,
        market_cap: 340000000000,
        market_cap_rank: 2,
        price_change_percentage_24h: 1.8,
        category: 'layer-1'
      },
      {
        id: 'binancecoin',
        symbol: 'bnb',
        name: 'BNB',
        image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
        current_price: 320,
        market_cap: 48000000000,
        market_cap_rank: 3,
        price_change_percentage_24h: -0.5,
        category: 'exchange-token'
      },
      {
        id: 'solana',
        symbol: 'sol',
        name: 'Solana',
        image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
        current_price: 95,
        market_cap: 42000000000,
        market_cap_rank: 4,
        price_change_percentage_24h: 3.2,
        category: 'layer-1'
      },
      {
        id: 'cardano',
        symbol: 'ada',
        name: 'Cardano',
        image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
        current_price: 0.45,
        market_cap: 16000000000,
        market_cap_rank: 5,
        price_change_percentage_24h: 1.1,
        category: 'layer-1'
      },
      {
        id: 'chainlink',
        symbol: 'link',
        name: 'Chainlink',
        image: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
        current_price: 15.5,
        market_cap: 9200000000,
        market_cap_rank: 6,
        price_change_percentage_24h: -1.2,
        category: 'oracle'
      },
      {
        id: 'polygon',
        symbol: 'matic',
        name: 'Polygon',
        image: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
        current_price: 0.85,
        market_cap: 7800000000,
        market_cap_rank: 7,
        price_change_percentage_24h: 0.8,
        category: 'layer-2'
      },
      {
        id: 'avalanche-2',
        symbol: 'avax',
        name: 'Avalanche',
        image: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
        current_price: 32,
        market_cap: 12000000000,
        market_cap_rank: 8,
        price_change_percentage_24h: 2.1,
        category: 'layer-1'
      },
      {
        id: 'uniswap',
        symbol: 'uni',
        name: 'Uniswap',
        image: 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png',
        current_price: 6.2,
        market_cap: 4700000000,
        market_cap_rank: 9,
        price_change_percentage_24h: -0.3,
        category: 'defi'
      },
      {
        id: 'the-graph',
        symbol: 'grt',
        name: 'The Graph',
        image: 'https://assets.coingecko.com/coins/images/13397/large/Graph_Token.png',
        current_price: 0.15,
        market_cap: 1400000000,
        market_cap_rank: 10,
        price_change_percentage_24h: 4.5,
        category: 'infrastructure'
      }
    ]

    let filteredCryptos = popularCryptos

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredCryptos = filteredCryptos.filter(crypto =>
        crypto.name.toLowerCase().includes(searchLower) ||
        crypto.symbol.toLowerCase().includes(searchLower)
      )
    }

    // Apply category filter
    if (category) {
      filteredCryptos = filteredCryptos.filter(crypto => crypto.category === category)
    }

    // Apply pagination
    const total = filteredCryptos.length
    const paginatedCryptos = filteredCryptos.slice(offset, offset + limit)

    return NextResponse.json({
      cryptos: paginatedCryptos,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Error fetching crypto list:', error)
    return NextResponse.json({ error: 'Failed to fetch crypto list' }, { status: 500 })
  }
}

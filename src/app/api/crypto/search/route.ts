// Crypto Search API Route
// GET /api/crypto/search - Search for cryptocurrencies

import { NextRequest, NextResponse } from 'next/server'
import { cryptoAPI } from '@/lib/crypto-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        error: 'Query parameter "q" is required and must be at least 2 characters'
      }, { status: 400 })
    }

    // Search cryptocurrencies using CoinGecko API
    const searchResults = await cryptoAPI.searchCryptos(query.trim())

    // Filter and format results for better UX
    const formattedResults = searchResults
      .filter(coin => coin.market_cap_rank && coin.market_cap_rank <= 1000) // Only top 1000 coins
      .slice(0, 20) // Limit to 20 results
      .map(coin => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.large || coin.thumb,
        market_cap_rank: coin.market_cap_rank
      }))
      .sort((a, b) => (a.market_cap_rank || 1000) - (b.market_cap_rank || 1000))

    return NextResponse.json({
      results: formattedResults,
      query: query.trim(),
      count: formattedResults.length,
      success: true
    })

  } catch (error) {
    console.error('Crypto search API error:', error)

    // Handle specific API errors
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json({
          error: 'API rate limit exceeded. Please try again in a moment.',
          results: [],
          success: false
        }, { status: 429 })
      }

      if (error.message.includes('network')) {
        return NextResponse.json({
          error: 'Network error. Please check your connection and try again.',
          results: [],
          success: false
        }, { status: 503 })
      }
    }

    return NextResponse.json({
      error: 'Failed to search cryptocurrencies. Please try again.',
      results: [],
      success: false
    }, { status: 500 })
  }
}
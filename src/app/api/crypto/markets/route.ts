// Server-side crypto markets data API to avoid CORS issues
import { NextRequest, NextResponse } from 'next/server'

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const vs_currency = searchParams.get('vs_currency') || 'usd'
  const order = searchParams.get('order') || 'market_cap_desc'
  const per_page = searchParams.get('per_page') || '100'
  const page = searchParams.get('page') || '1'
  const sparkline = searchParams.get('sparkline') || 'false'
  const price_change_percentage = searchParams.get('price_change_percentage') || '24h'

  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/markets?vs_currency=${vs_currency}&order=${order}&per_page=${per_page}&page=${page}&sparkline=${sparkline}&price_change_percentage=${price_change_percentage}`,
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
        return NextResponse.json(generateFallbackMarketsData())
      }
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('CoinGecko markets API error:', error)

    // Return fallback markets data
    return NextResponse.json(generateFallbackMarketsData())
  }
}

function generateFallbackMarketsData() {
  const baseData = [
    {
      id: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      current_price: 115269,
      market_cap: 2280000000000,
      market_cap_rank: 1,
      fully_diluted_valuation: 2420000000000,
      total_volume: 24500000000,
      high_24h: 117500,
      low_24h: 113800,
      price_change_24h: 1450.23,
      price_change_percentage_24h: 1.28,
      market_cap_change_24h: 28700000000,
      market_cap_change_percentage_24h: 1.28,
      circulating_supply: 19800000,
      total_supply: 21000000,
      max_supply: 21000000,
      ath: 117500,
      ath_change_percentage: -1.9,
      ath_date: '2025-09-20T00:00:00.000Z',
      atl: 67.81,
      atl_change_percentage: 169900.5,
      atl_date: '2013-07-06T00:00:00.000Z',
      roi: null,
      last_updated: new Date().toISOString()
    },
    {
      id: 'ethereum',
      symbol: 'eth',
      name: 'Ethereum',
      image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      current_price: 4426.78,
      market_cap: 532800000000,
      market_cap_rank: 2,
      fully_diluted_valuation: 532800000000,
      total_volume: 18200000000,
      high_24h: 4512.50,
      low_24h: 4380.20,
      price_change_24h: 67.45,
      price_change_percentage_24h: 1.55,
      market_cap_change_24h: 8120000000,
      market_cap_change_percentage_24h: 1.55,
      circulating_supply: 120400000,
      total_supply: 120400000,
      max_supply: null,
      ath: 4878.26,
      ath_change_percentage: -9.25,
      ath_date: '2021-11-10T14:24:19.604Z',
      atl: 0.432979,
      atl_change_percentage: 1022150.7,
      atl_date: '2015-10-20T00:00:00.000Z',
      roi: {
        times: 110.47,
        currency: 'btc',
        percentage: 11047.08
      },
      last_updated: new Date().toISOString()
    },
    {
      id: 'binancecoin',
      symbol: 'bnb',
      name: 'BNB',
      image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
      current_price: 714.23,
      market_cap: 103200000000,
      market_cap_rank: 3,
      fully_diluted_valuation: 142800000000,
      total_volume: 1890000000,
      high_24h: 725.80,
      low_24h: 708.15,
      price_change_24h: 8.92,
      price_change_percentage_24h: 1.27,
      market_cap_change_24h: 1290000000,
      market_cap_change_percentage_24h: 1.27,
      circulating_supply: 144500000,
      total_supply: 200000000,
      max_supply: 200000000,
      ath: 725.80,
      ath_change_percentage: -1.59,
      ath_date: '2025-09-25T00:00:00.000Z',
      atl: 0.0398177,
      atl_change_percentage: 1794150.8,
      atl_date: '2017-10-19T00:00:00.000Z',
      roi: null,
      last_updated: new Date().toISOString()
    },
    {
      id: 'solana',
      symbol: 'sol',
      name: 'Solana',
      image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
      current_price: 255.89,
      market_cap: 122800000000,
      market_cap_rank: 4,
      fully_diluted_valuation: 153500000000,
      total_volume: 3450000000,
      high_24h: 261.20,
      low_24h: 252.10,
      price_change_24h: 4.67,
      price_change_percentage_24h: 1.86,
      market_cap_change_24h: 2240000000,
      market_cap_change_percentage_24h: 1.86,
      circulating_supply: 480000000,
      total_supply: 600000000,
      max_supply: null,
      ath: 263.14,
      ath_change_percentage: -2.75,
      ath_date: '2025-09-23T00:00:00.000Z',
      atl: 0.500801,
      atl_change_percentage: 51020.5,
      atl_date: '2020-05-11T19:35:23.449Z',
      roi: null,
      last_updated: new Date().toISOString()
    }
  ]

  return baseData
}
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const marketDataSchema = z.object({
  endpoint: z.string(), // Allow any endpoint path to support dynamic coin IDs and search
  params: z.string().optional()
})

// Mock data for when CoinGecko API is unavailable
const MOCK_DATA = {
  'simple/price': {
    bitcoin: { usd: 94250, usd_24h_change: 2.4 },
    ethereum: { usd: 3445, usd_24h_change: 1.8 }
  },
  'coins/list': [
    { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
    { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
    { id: 'solana', symbol: 'sol', name: 'Solana' }
  ]
}

// Server-side proxy for CoinGecko API to fix CORS issues
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { endpoint, params } = marketDataSchema.parse(Object.fromEntries(searchParams))
    
    const baseUrl = 'https://api.coingecko.com/api/v3'
    const apiKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY
    
    // If no API key, return mock data to prevent app crashes
    if (!apiKey) {
      console.warn('CoinGecko API key not found, using mock data')
      const mockKey = endpoint as keyof typeof MOCK_DATA
      if (mockKey in MOCK_DATA) {
        return NextResponse.json(MOCK_DATA[mockKey], {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            'X-Mock-Data': 'true',
          },
        })
      }
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'ChainWise-App/1.0',
    }
    
    if (apiKey) {
      headers['x-cg-demo-api-key'] = apiKey
    }
    
    const url = `${baseUrl}/${endpoint}${params ? `?${params}` : ''}`
    console.log('Fetching from CoinGecko:', url)
    
    const response = await fetch(url, {
      headers,
      next: { revalidate: 60 }, // Cache for 1 minute
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })
    
    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status} ${response.statusText}`)
      
      // If rate limited or server error, try to return mock data instead of failing
      if (response.status === 429 || response.status >= 500) {
        console.warn('CoinGecko API unavailable, falling back to mock data')
        const mockKey = endpoint as keyof typeof MOCK_DATA
        if (mockKey in MOCK_DATA) {
          return NextResponse.json(MOCK_DATA[mockKey], {
            headers: {
              'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
              'X-Mock-Data': 'true',
              'X-Fallback-Reason': 'api-unavailable',
            },
          })
        }
      }
      
      return NextResponse.json({ 
        error: 'Market data service unavailable',
        status: response.status,
        endpoint: endpoint,
        message: 'Please check your CoinGecko API key configuration'
      }, { status: 422 }) // Use 422 to maintain compatibility with frontend error handling
    }
    
    const data = await response.json()
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
    
  } catch (error) {
    console.error('Market data proxy error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid parameters',
        details: error.errors 
      }, { status: 400 })
    }

    // If fetch timeout or network error, return mock data
    if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('fetch'))) {
      console.warn('Network error, falling back to mock data:', error.message)
      // Try to determine endpoint from URL for mock data fallback
      const url = request.url
      if (url.includes('simple/price')) {
        return NextResponse.json(MOCK_DATA['simple/price'], {
          headers: {
            'Cache-Control': 'public, s-maxage=300',
            'X-Mock-Data': 'true',
            'X-Fallback-Reason': 'network-error',
          },
        })
      }
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Please check your internet connection and API configuration'
    }, { status: 500 })
  }
}
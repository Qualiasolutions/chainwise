import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const marketDataSchema = z.object({
  endpoint: z.string(), // Allow any endpoint path to support dynamic coin IDs and search
  params: z.string().optional()
})

// Server-side proxy for CoinGecko API to fix CORS issues
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { endpoint, params } = marketDataSchema.parse(Object.fromEntries(searchParams))
    
    const baseUrl = 'https://api.coingecko.com/api/v3'
    const apiKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (apiKey) {
      headers['x-cg-demo-api-key'] = apiKey
    }
    
    const url = `${baseUrl}/${endpoint}${params ? `?${params}` : ''}`
    
    const response = await fetch(url, {
      headers,
      next: { revalidate: 60 } // Cache for 1 minute
    })
    
    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status} ${response.statusText}`)
      return NextResponse.json({ 
        error: 'Market data service unavailable',
        status: response.status 
      }, { status: response.status })
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
    
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
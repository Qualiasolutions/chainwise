import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Fetch real crypto data from CoinGecko
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h',
      {
        headers: {
          'Accept': 'application/json',
          ...(process.env.COINGECKO_API_KEY && {
            'X-CG-Demo-API-Key': process.env.COINGECKO_API_KEY
          })
        },
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform to our format
    const cryptoData = data.map((coin: any) => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change: coin.price_change_percentage_24h,
      color: getColorForSymbol(coin.symbol.toUpperCase()),
      image: coin.image,
      marketCap: coin.market_cap,
      volume: coin.total_volume
    }))

    return NextResponse.json(cryptoData)
  } catch (error) {
    console.error('Error fetching crypto data:', error)
    
    // Return empty array on error - component will handle gracefully
    return NextResponse.json([])
  }
}

function getColorForSymbol(symbol: string): string {
  const colorMap: { [key: string]: string } = {
    'BTC': 'text-orange-400',
    'ETH': 'text-blue-400',
    'SOL': 'text-purple-400',
    'ADA': 'text-green-400',
    'MATIC': 'text-indigo-400',
    'DOT': 'text-pink-400',
    'AVAX': 'text-red-400',
    'LINK': 'text-blue-500',
    'UNI': 'text-purple-500',
    'LTC': 'text-gray-400'
  }
  
  return colorMap[symbol] || 'text-yellow-400'
}

import { createClient } from '@/lib/supabase/client'

export interface MarketMover {
  id: string
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: string
  marketCap: number
  image: string
}

export interface MarketTrend {
  timestamp: string
  price: number
  volume: number
}

export interface MarketData {
  topGainers: MarketMover[]
  topLosers: MarketMover[]
  trendingCoins: MarketMover[]
  marketCap: number
  totalVolume: number
  btcDominance: number
}

class MarketDataService {
  private readonly baseUrl = typeof window !== 'undefined' ? '/api/market-data' : 'https://api.coingecko.com/api/v3'
  private readonly apiKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly cacheTimeout = 60000 // 1 minute cache

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // Only add API key for direct API calls (server-side)
    if (typeof window === 'undefined' && this.apiKey) {
      headers['x-cg-demo-api-key'] = this.apiKey
    }
    
    return headers
  }

  private async fetchWithCache(endpoint: string, cacheKey: string, params?: string) {
    const now = Date.now()
    const cached = this.cache.get(cacheKey)
    
    if (cached && (now - cached.timestamp) < this.cacheTimeout) {
      return cached.data
    }

    try {
      let url: string
      if (typeof window !== 'undefined') {
        // Client-side: use proxy
        url = `/api/market-data?endpoint=${encodeURIComponent(endpoint)}`
        if (params) {
          url += `&params=${encodeURIComponent(params)}`
        }
      } else {
        // Server-side: direct API call
        url = `https://api.coingecko.com/api/v3/${endpoint}`
        if (params) {
          url += `?${params}`
        }
      }

      const response = await fetch(url, {
        headers: this.getHeaders(),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      this.cache.set(cacheKey, { data, timestamp: now })
      return data
    } catch (error) {
      console.error(`Error fetching ${cacheKey}:`, error)
      // Return cached data if available, even if expired
      if (cached) return cached.data
      throw error
    }
  }

  async getTopMovers(limit = 10): Promise<{ gainers: MarketMover[], losers: MarketMover[] }> {
    try {
      const endpoint = 'coins/markets'
      const params = 'vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h'
      const data = await this.fetchWithCache(endpoint, 'top_movers', params)

      const processedCoins = data.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change: coin.price_change_24h || 0,
        changePercent: coin.price_change_percentage_24h || 0,
        volume: this.formatVolume(coin.total_volume || 0),
        marketCap: coin.market_cap || 0,
        image: coin.image
      }))

      // Sort by percentage change
      const sortedByChange = processedCoins.sort((a: MarketMover, b: MarketMover) => 
        Math.abs(b.changePercent) - Math.abs(a.changePercent)
      )

      const gainers = sortedByChange
        .filter((coin: MarketMover) => coin.changePercent > 0)
        .slice(0, limit)

      const losers = sortedByChange
        .filter((coin: MarketMover) => coin.changePercent < 0)
        .slice(0, limit)

      return { gainers, losers }
    } catch (error) {
      console.error('Error fetching top movers:', error)
      return { gainers: [], losers: [] }
    }
  }

  async getTrendingCoins(): Promise<MarketMover[]> {
    try {
      const trendingEndpoint = 'search/trending'
      const trending = await this.fetchWithCache(trendingEndpoint, 'trending_coins')

      // Get detailed data for trending coins
      const coinIds = trending.coins.slice(0, 5).map((coin: any) => coin.item.id).join(',')
      const detailsEndpoint = 'coins/markets'
      const detailsParams = `vs_currency=usd&ids=${coinIds}&sparkline=false&price_change_percentage=24h`
      const detailedData = await this.fetchWithCache(detailsEndpoint, `trending_details_${coinIds}`, detailsParams)

      return detailedData.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change: coin.price_change_24h || 0,
        changePercent: coin.price_change_percentage_24h || 0,
        volume: this.formatVolume(coin.total_volume || 0),
        marketCap: coin.market_cap || 0,
        image: coin.image
      }))
    } catch (error) {
      console.error('Error fetching trending coins:', error)
      return []
    }
  }

  async getGlobalMarketData(): Promise<{
    totalMarketCap: number
    totalVolume: number
    btcDominance: number
    marketCapChange: number
  }> {
    try {
      const endpoint = 'global'
      const global = await this.fetchWithCache(endpoint, 'global_market_data')

      return {
        totalMarketCap: global.data.total_market_cap.usd || 0,
        totalVolume: global.data.total_volume.usd || 0,
        btcDominance: global.data.market_cap_percentage.btc || 0,
        marketCapChange: global.data.market_cap_change_percentage_24h_usd || 0
      }
    } catch (error) {
      console.error('Error fetching global market data:', error)
      return {
        totalMarketCap: 0,
        totalVolume: 0,
        btcDominance: 0,
        marketCapChange: 0
      }
    }
  }

  async getCoinPrice(coinId: string): Promise<number> {
    try {
      const endpoint = 'simple/price'
      const params = `ids=${coinId}&vs_currencies=usd`
      const data = await this.fetchWithCache(endpoint, `price_${coinId}`, params)
      return data[coinId]?.usd || 0
    } catch (error) {
      console.error(`Error fetching price for ${coinId}:`, error)
      return 0
    }
  }

  async getMultipleCoinPrices(coinIds: string[]): Promise<Record<string, number>> {
    try {
      const ids = coinIds.join(',')
      const endpoint = 'simple/price'
      const params = `ids=${ids}&vs_currencies=usd`
      const data = await this.fetchWithCache(endpoint, `prices_${ids}`, params)
      
      const prices: Record<string, number> = {}
      for (const coinId of coinIds) {
        prices[coinId] = data[coinId]?.usd || 0
      }
      return prices
    } catch (error) {
      console.error('Error fetching multiple coin prices:', error)
      return coinIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {})
    }
  }

  private formatVolume(volume: number): string {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`
    } else if (volume >= 1e3) {
      return `$${(volume / 1e3).toFixed(2)}K`
    } else {
      return `$${volume.toFixed(2)}`
    }
  }

  // Portfolio-specific methods
  async updatePortfolioValues(userId: string): Promise<void> {
    try {
      const supabase = createClient()
      
      // Get all user portfolios with holdings
      const { data: portfolios } = await supabase
        .from('portfolios')
        .select(`
          id,
          portfolio_holdings(
            id,
            symbol,
            crypto_id,
            amount
          )
        `)
        .eq('user_id', userId)
        .is('deleted_at', null)

      if (!portfolios || portfolios.length === 0) return

      // Collect all unique coin IDs
      const coinIds = new Set<string>()
      portfolios.forEach(portfolio => {
        portfolio.portfolio_holdings?.forEach((holding: any) => {
          if (holding.crypto_id) {
            coinIds.add(holding.crypto_id)
          }
        })
      })

      if (coinIds.size === 0) return

      // Fetch current prices
      const prices = await this.getMultipleCoinPrices(Array.from(coinIds))

      // Update portfolio holdings with current values
      for (const portfolio of portfolios) {
        let totalValue = 0
        
        if (portfolio.portfolio_holdings) {
          for (const holding of portfolio.portfolio_holdings) {
            const currentPrice = prices[holding.crypto_id] || 0
            const currentValue = holding.amount * currentPrice
            totalValue += currentValue

            // Update the holding's current value
            await supabase
              .from('portfolio_holdings')
              .update({
                current_price: currentPrice,
                current_value: currentValue,
                updated_at: new Date().toISOString()
              })
              .eq('id', holding.id)
          }
        }

        // Update portfolio total value
        await supabase
          .from('portfolios')
          .update({
            total_value_usd: totalValue,
            updated_at: new Date().toISOString()
          })
          .eq('id', portfolio.id)
      }
    } catch (error) {
      console.error('Error updating portfolio values:', error)
    }
  }

  // Clear cache manually if needed
  clearCache(): void {
    this.cache.clear()
  }
}

export const marketDataService = new MarketDataService()
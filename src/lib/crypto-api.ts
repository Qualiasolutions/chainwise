// CoinGecko API integration for real-time crypto data
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

export interface CryptoData {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  fully_diluted_valuation: number
  total_volume: number
  high_24h: number
  low_24h: number
  price_change_24h: number
  price_change_percentage_24h: number
  market_cap_change_24h: number
  market_cap_change_percentage_24h: number
  circulating_supply: number
  total_supply: number
  max_supply: number
  ath: number
  ath_change_percentage: number
  ath_date: string
  atl: number
  atl_change_percentage: number
  atl_date: string
  last_updated: string
}

export interface MarketData {
  active_cryptocurrencies: number
  upcoming_icos: number
  ongoing_icos: number
  ended_icos: number
  markets: number
  total_market_cap: Record<string, number>
  total_volume: Record<string, number>
  market_cap_percentage: Record<string, number>
  market_cap_change_percentage_24h_usd: number
  updated_at: number
}

export interface ChartData {
  prices: [number, number][]
  market_caps: [number, number][]
  total_volumes: [number, number][]
}

class CryptoAPI {
  private async fetchAPI(endpoint: string): Promise<any> {
    try {
      const response = await fetch(`${COINGECKO_API_BASE}${endpoint}`, {
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async getTopCryptos(limit: number = 100): Promise<CryptoData[]> {
    return this.fetchAPI(
      `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`
    )
  }

  async getCrypto(id: string): Promise<CryptoData> {
    const data = await this.fetchAPI(
      `/coins/markets?vs_currency=usd&ids=${id}&order=market_cap_desc&per_page=1&page=1&sparkline=false&price_change_percentage=24h`
    )
    return data[0]
  }

  async getGlobalData(): Promise<MarketData> {
    const response = await this.fetchAPI('/global')
    return response.data
  }

  async getCryptoChart(id: string, days: number = 7): Promise<ChartData> {
    return this.fetchAPI(`/coins/${id}/market_chart?vs_currency=usd&days=${days}`)
  }

  async getTrendingCryptos(): Promise<any[]> {
    const response = await this.fetchAPI('/search/trending')
    return response.coins
  }

  async searchCryptos(query: string): Promise<any[]> {
    const response = await this.fetchAPI(`/search?query=${encodeURIComponent(query)}`)
    return response.coins
  }

  // Portfolio tracking methods
  async getPortfolioValue(holdings: Array<{id: string, amount: number}>): Promise<number> {
    const ids = holdings.map(h => h.id).join(',')
    const cryptos = await this.fetchAPI(
      `/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=250&page=1&sparkline=false`
    )

    return holdings.reduce((total, holding) => {
      const crypto = cryptos.find((c: CryptoData) => c.id === holding.id)
      return total + (crypto ? crypto.current_price * holding.amount : 0)
    }, 0)
  }

  // Real-time price updates
  async getSimplePrice(ids: string[], vs_currencies: string[] = ['usd']): Promise<Record<string, Record<string, number>>> {
    const idsStr = ids.join(',')
    const currenciesStr = vs_currencies.join(',')
    return this.fetchAPI(`/simple/price?ids=${idsStr}&vs_currencies=${currenciesStr}&include_24hr_change=true`)
  }

  // Get detailed coin data for individual coin pages
  async getCoinDetails(id: string): Promise<any> {
    try {
      return await this.fetchAPI(`/coins/${id}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=false`)
    } catch (error) {
      console.error(`Error fetching coin details for ${id}:`, error)
      throw error
    }
  }

  // Get portfolio performance data with individual coin breakdown
  async getPortfolioPerformanceData(holdings: Array<{id: string, amount: number, symbol: string}>, days: number = 7): Promise<any[]> {
    try {
      if (holdings.length === 0) return []

      const ids = holdings.map(h => h.id).join(',')

      // Get current prices first
      const currentData = await this.fetchAPI(
        `/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=250&page=1&sparkline=false`
      )

      // Generate time points for the chart
      const timePoints = []
      const now = new Date()
      for (let i = days; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        timePoints.push({
          time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          timestamp: date.getTime()
        })
      }

      // For each time point, calculate portfolio values
      const portfolioData = await Promise.all(
        timePoints.map(async (point, index) => {
          const dataPoint: any = {
            time: point.time,
            timestamp: point.timestamp,
            total: 0
          }

          // For each holding, calculate its value at this time point
          for (const holding of holdings) {
            const crypto = currentData.find((c: CryptoData) => c.id === holding.id)
            if (crypto) {
              // Simulate price variation for demonstration (in real app, use historical data)
              const variation = 1 + (Math.random() - 0.5) * 0.1 * (days - index) / days
              const historicalPrice = crypto.current_price * variation
              const value = historicalPrice * holding.amount

              dataPoint[holding.symbol] = value
              dataPoint.total += value
            }
          }

          return dataPoint
        })
      )

      return portfolioData
    } catch (error) {
      console.error('Error generating portfolio performance data:', error)
      // Return mock data as fallback
      return this.generateMockPortfolioData(holdings, days)
    }
  }

  // Fallback mock data generator
  private generateMockPortfolioData(holdings: Array<{id: string, amount: number, symbol: string}>, days: number): any[] {
    const timePoints = []
    const now = new Date()

    for (let i = days; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dataPoint: any = {
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: date.getTime(),
        total: 0
      }

      // Mock values for each coin
      holdings.forEach((holding, index) => {
        const baseValue = 1000 * (index + 1) // Different base values
        const variation = 1 + (Math.random() - 0.5) * 0.2
        const value = baseValue * variation
        dataPoint[holding.symbol] = value
        dataPoint.total += value
      })

      timePoints.push(dataPoint)
    }

    return timePoints
  }
}

export const cryptoAPI = new CryptoAPI()

// Mock data for development (fallback when API is rate limited)
export const mockCryptoData: CryptoData[] = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    current_price: 54750,
    market_cap: 1080000000000,
    market_cap_rank: 1,
    fully_diluted_valuation: 1150000000000,
    total_volume: 25000000000,
    high_24h: 55200,
    low_24h: 53800,
    price_change_24h: 2650,
    price_change_percentage_24h: 5.09,
    market_cap_change_24h: 52000000000,
    market_cap_change_percentage_24h: 5.06,
    circulating_supply: 19800000,
    total_supply: 21000000,
    max_supply: 21000000,
    ath: 69045,
    ath_change_percentage: -20.7,
    ath_date: '2021-11-10T14:24:11.849Z',
    atl: 67.81,
    atl_change_percentage: 80658.8,
    atl_date: '2013-07-06T00:00:00.000Z',
    last_updated: '2024-12-19T10:45:00.000Z'
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    current_price: 3420,
    market_cap: 410000000000,
    market_cap_rank: 2,
    fully_diluted_valuation: 410000000000,
    total_volume: 18000000000,
    high_24h: 3450,
    low_24h: 3290,
    price_change_24h: 125,
    price_change_percentage_24h: 3.8,
    market_cap_change_24h: 15000000000,
    market_cap_change_percentage_24h: 3.8,
    circulating_supply: 120000000,
    total_supply: 120000000,
    max_supply: null,
    ath: 4878.26,
    ath_change_percentage: -29.9,
    ath_date: '2021-11-10T14:24:19.604Z',
    atl: 0.432979,
    atl_change_percentage: 789567.2,
    atl_date: '2015-10-20T00:00:00.000Z',
    last_updated: '2024-12-19T10:45:00.000Z'
  },
  {
    id: 'binancecoin',
    symbol: 'bnb',
    name: 'BNB',
    image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    current_price: 425,
    market_cap: 65000000000,
    market_cap_rank: 3,
    fully_diluted_valuation: 65000000000,
    total_volume: 2100000000,
    high_24h: 430,
    low_24h: 415,
    price_change_24h: -5.2,
    price_change_percentage_24h: -1.2,
    market_cap_change_24h: -800000000,
    market_cap_change_percentage_24h: -1.2,
    circulating_supply: 153000000,
    total_supply: 153000000,
    max_supply: 200000000,
    ath: 686.31,
    ath_change_percentage: -38.1,
    ath_date: '2021-05-10T07:24:17.097Z',
    atl: 0.0398177,
    atl_change_percentage: 1067334.0,
    atl_date: '2017-10-19T00:00:00.000Z',
    last_updated: '2024-12-19T10:45:00.000Z'
  }
]

// Utility functions
export const formatPrice = (price: number): string => {
  if (price >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  } else if (price >= 1) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(price)
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 8,
    }).format(price)
  }
}

export const formatPercentage = (percentage: number): string => {
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`
}

export const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`
  } else {
    return `$${marketCap.toLocaleString()}`
  }
}

// Generate mock price history for charts (temporary until real chart API integration)
export const generatePriceHistory = (currentPrice: number, days: number = 30) => {
  const history = []
  let price = currentPrice * 0.9 // Start 10% lower

  for (let i = days; i >= 0; i--) {
    const change = (Math.random() - 0.5) * 0.1 // Random change between -5% and +5%
    price = price * (1 + change)

    const date = new Date()
    date.setDate(date.getDate() - i)

    history.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      price: Math.round(price * 100) / 100,
      timestamp: date
    })
  }

  // Ensure the last price matches current price
  history[history.length - 1].price = currentPrice

  return history
}
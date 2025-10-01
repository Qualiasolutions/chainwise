// CoinGecko API integration for real-time crypto data
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

// Check if running in browser or server
const isBrowser = typeof window !== 'undefined'

// Use proxy routes in browser to avoid CORS issues
const API_BASE = isBrowser ? '/api/crypto' : COINGECKO_API_BASE

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

export interface NewsArticle {
  id: string
  title: string
  description: string
  url: string
  urlToImage: string
  publishedAt: string
  source: {
    id: string
    name: string
  }
  category: string
}

export interface Exchange {
  id: string
  name: string
  year_established: number | null
  country: string | null
  description: string | null
  url: string
  image: string
  has_trading_incentive: boolean
  trust_score: number
  trust_score_rank: number
  trade_volume_24h_btc: number
  trade_volume_24h_btc_normalized: number
}

class CryptoAPI {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_DURATION = 60000 // 1 minute cache
  private requestQueue: Promise<any>[] = []
  private readonly MAX_CONCURRENT_REQUESTS = 3

  private async fetchAPI(endpoint: string): Promise<any> {
    // Check cache first
    const cacheKey = endpoint
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    // Rate limiting: wait for queue to have space
    while (this.requestQueue.length >= this.MAX_CONCURRENT_REQUESTS) {
      await Promise.race(this.requestQueue)
      this.requestQueue = this.requestQueue.filter(p => p !== Promise.race(this.requestQueue))
    }

    const requestPromise = this.makeRequest(endpoint)
    this.requestQueue.push(requestPromise)

    try {
      const data = await requestPromise

      // Cache successful response
      this.cache.set(cacheKey, { data, timestamp: Date.now() })

      return data
    } catch (error) {
      console.error('API Error:', error)
      throw error
    } finally {
      // Remove from queue
      this.requestQueue = this.requestQueue.filter(p => p !== requestPromise)
    }
  }

  private async makeRequest(endpoint: string): Promise<any> {
    try {
      // Add delay to prevent rate limiting (only for direct API calls)
      if (!isBrowser) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Use appropriate base URL based on environment
      const url = isBrowser
        ? endpoint.startsWith('/') ? endpoint : `/${endpoint}`
        : `${COINGECKO_API_BASE}${endpoint}`

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        mode: 'cors',
      })

      if (response.status === 429) {
        // Rate limited - wait with exponential backoff and retry
        const backoffTime = 2000 + Math.random() * 1000 // 2-3 seconds with jitter
        await new Promise(resolve => setTimeout(resolve, backoffTime))

        // Construct proper retry URL based on environment (FIX: Don't double the path!)
        const retryUrl = isBrowser
          ? endpoint.startsWith('/') ? endpoint : `/${endpoint}`
          : `${COINGECKO_API_BASE}${endpoint}`

        const retryResponse = await fetch(retryUrl, {
          headers: {
            'Accept': 'application/json',
          },
          mode: isBrowser ? 'cors' : undefined,
        })

        if (!retryResponse.ok) {
          throw new Error(`API request failed after retry: ${retryResponse.status}`)
        }

        const retryData = await retryResponse.json()
        // Cache successful retry
        this.cache.set(endpoint, { data: retryData, timestamp: Date.now() })
        return retryData
      }

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  async getTopCryptos(limit: number = 100): Promise<CryptoData[]> {
    try {
      const endpoint = isBrowser
        ? `/api/crypto/markets?limit=${limit}`
        : `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`

      return await this.fetchAPI(endpoint)
    } catch (error) {
      console.warn('CoinGecko API failed, using fallback data:', error)

      // Fallback data for top cryptocurrencies
      const fallbackData: CryptoData[] = [
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
          current_price: 112869,
          market_cap: 2232000000000,
          market_cap_rank: 1,
          fully_diluted_valuation: 2366000000000,
          total_volume: 28500000000,
          high_24h: 115000,
          low_24h: 110000,
          price_change_24h: 1450,
          price_change_percentage_24h: 1.3,
          market_cap_change_24h: 28600000000,
          market_cap_change_percentage_24h: 1.3,
          circulating_supply: 19780000,
          total_supply: 21000000,
          max_supply: 21000000,
          ath: 115000,
          ath_change_percentage: -1.8,
          ath_date: '2025-09-22T00:00:00.000Z',
          atl: 67.81,
          atl_change_percentage: 166358.2,
          atl_date: '2013-07-06T00:00:00.000Z',
          last_updated: '2025-09-22T11:00:00.000Z'
        },
        {
          id: 'ethereum',
          symbol: 'eth',
          name: 'Ethereum',
          image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
          current_price: 4423,
          market_cap: 532000000000,
          market_cap_rank: 2,
          fully_diluted_valuation: 532000000000,
          total_volume: 15200000000,
          high_24h: 4450,
          low_24h: 4380,
          price_change_24h: 25,
          price_change_percentage_24h: 0.57,
          market_cap_change_24h: 3000000000,
          market_cap_change_percentage_24h: 0.57,
          circulating_supply: 120300000,
          total_supply: 120300000,
          max_supply: null,
          ath: 4878.26,
          ath_change_percentage: -9.3,
          ath_date: '2021-11-10T14:24:19.604Z',
          atl: 0.432979,
          atl_change_percentage: 1021576.8,
          atl_date: '2015-10-20T00:00:00.000Z',
          last_updated: '2025-09-22T11:00:00.000Z'
        },
        {
          id: 'binancecoin',
          symbol: 'bnb',
          name: 'BNB',
          image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
          current_price: 712,
          market_cap: 102000000000,
          market_cap_rank: 3,
          fully_diluted_valuation: 102000000000,
          total_volume: 2100000000,
          high_24h: 720,
          low_24h: 705,
          price_change_24h: 4.2,
          price_change_percentage_24h: 0.59,
          market_cap_change_24h: 600000000,
          market_cap_change_percentage_24h: 0.59,
          circulating_supply: 143000000,
          total_supply: 143000000,
          max_supply: 200000000,
          ath: 787.98,
          ath_change_percentage: -9.6,
          ath_date: '2024-06-06T14:10:36.635Z',
          atl: 0.0398177,
          atl_change_percentage: 1788092.4,
          atl_date: '2017-10-19T00:00:00.000Z',
          last_updated: '2025-09-22T11:00:00.000Z'
        },
        {
          id: 'solana',
          symbol: 'sol',
          name: 'Solana',
          image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
          current_price: 256,
          market_cap: 124000000000,
          market_cap_rank: 4,
          fully_diluted_valuation: 152000000000,
          total_volume: 4800000000,
          high_24h: 262,
          low_24h: 252,
          price_change_24h: 2.1,
          price_change_percentage_24h: 0.83,
          market_cap_change_24h: 1000000000,
          market_cap_change_percentage_24h: 0.83,
          circulating_supply: 484000000,
          total_supply: 593000000,
          max_supply: null,
          ath: 263.83,
          ath_change_percentage: -3.0,
          ath_date: '2024-11-23T16:03:41.425Z',
          atl: 0.500801,
          atl_change_percentage: 51028.4,
          atl_date: '2020-05-11T19:35:23.449Z',
          last_updated: '2025-09-22T11:00:00.000Z'
        },
        {
          id: 'cardano',
          symbol: 'ada',
          name: 'Cardano',
          image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
          current_price: 1.23,
          market_cap: 43000000000,
          market_cap_rank: 5,
          fully_diluted_valuation: 55000000000,
          total_volume: 1800000000,
          high_24h: 1.26,
          low_24h: 1.20,
          price_change_24h: 0.015,
          price_change_percentage_24h: 1.23,
          market_cap_change_24h: 530000000,
          market_cap_change_percentage_24h: 1.25,
          circulating_supply: 35000000000,
          total_supply: 45000000000,
          max_supply: 45000000000,
          ath: 3.09,
          ath_change_percentage: -60.2,
          ath_date: '2021-09-02T06:00:10.474Z',
          atl: 0.01925275,
          atl_change_percentage: 6287.4,
          atl_date: '2020-03-13T02:22:55.391Z',
          last_updated: '2025-09-22T11:00:00.000Z'
        }
      ].slice(0, limit)

      return fallbackData
    }
  }

  async getCrypto(id: string): Promise<CryptoData> {
    try {
      const data = await this.fetchAPI(
        `/coins/markets?vs_currency=usd&ids=${id}&order=market_cap_desc&per_page=1&page=1&sparkline=false&price_change_percentage=24h`
      )
      return data[0]
    } catch (error) {
      console.warn(`CoinGecko API failed for ${id}, using fallback data:`, error)

      // Return fallback data for common cryptocurrencies
      const fallbackMap: Record<string, CryptoData> = {
        'bitcoin': {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
          current_price: 112869,
          market_cap: 2232000000000,
          market_cap_rank: 1,
          fully_diluted_valuation: 2366000000000,
          total_volume: 28500000000,
          high_24h: 115000,
          low_24h: 110000,
          price_change_24h: 1450,
          price_change_percentage_24h: 1.3,
          market_cap_change_24h: 28600000000,
          market_cap_change_percentage_24h: 1.3,
          circulating_supply: 19780000,
          total_supply: 21000000,
          max_supply: 21000000,
          ath: 115000,
          ath_change_percentage: -1.8,
          ath_date: '2025-09-22T00:00:00.000Z',
          atl: 67.81,
          atl_change_percentage: 166358.2,
          atl_date: '2013-07-06T00:00:00.000Z',
          last_updated: '2025-09-22T11:00:00.000Z'
        },
        'ethereum': {
          id: 'ethereum',
          symbol: 'eth',
          name: 'Ethereum',
          image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
          current_price: 4423,
          market_cap: 532000000000,
          market_cap_rank: 2,
          fully_diluted_valuation: 532000000000,
          total_volume: 15200000000,
          high_24h: 4450,
          low_24h: 4380,
          price_change_24h: 25,
          price_change_percentage_24h: 0.57,
          market_cap_change_24h: 3000000000,
          market_cap_change_percentage_24h: 0.57,
          circulating_supply: 120300000,
          total_supply: 120300000,
          max_supply: null,
          ath: 4878.26,
          ath_change_percentage: -9.3,
          ath_date: '2021-11-10T14:24:19.604Z',
          atl: 0.432979,
          atl_change_percentage: 1021576.8,
          atl_date: '2015-10-20T00:00:00.000Z',
          last_updated: '2025-09-22T11:00:00.000Z'
        }
      }

      return fallbackMap[id] || {
        id: id,
        symbol: id.substring(0, 3),
        name: id.charAt(0).toUpperCase() + id.slice(1),
        image: `https://via.placeholder.com/64x64/6366f1/ffffff?text=${id.substring(0, 2).toUpperCase()}`,
        current_price: 1,
        market_cap: 1000000,
        market_cap_rank: 999,
        fully_diluted_valuation: 1000000,
        total_volume: 100000,
        high_24h: 1.1,
        low_24h: 0.9,
        price_change_24h: 0,
        price_change_percentage_24h: 0,
        market_cap_change_24h: 0,
        market_cap_change_percentage_24h: 0,
        circulating_supply: 1000000,
        total_supply: 1000000,
        max_supply: 1000000,
        ath: 2,
        ath_change_percentage: -50,
        ath_date: '2025-01-01T00:00:00.000Z',
        atl: 0.5,
        atl_change_percentage: 100,
        atl_date: '2024-01-01T00:00:00.000Z',
        last_updated: '2025-09-22T11:00:00.000Z'
      }
    }
  }

  async getGlobalData(): Promise<MarketData> {
    const endpoint = isBrowser ? '/api/crypto/global' : '/global'
    const response = await this.fetchAPI(endpoint)
    return isBrowser ? response.data : response.data
  }

  async getCryptoChart(id: string, days: number = 7): Promise<ChartData> {
    try {
      // Use server-side API to avoid CORS issues
      if (typeof window !== 'undefined') {
        const response = await fetch(`/api/crypto/chart?id=${id}&days=${days}`)
        if (!response.ok) {
          throw new Error(`Server API request failed: ${response.status}`)
        }
        return await response.json()
      } else {
        // Server-side: use CoinGecko directly
        return await this.fetchAPI(`/coins/${id}/market_chart?vs_currency=usd&days=${days}`)
      }
    } catch (error) {
      console.warn(`Chart API failed for ${id}, generating fallback data:`, error)

      // Generate realistic fallback chart data
      return this.generateFallbackChartData(id, days)
    }
  }

  private generateFallbackChartData(coinId: string, days: number): ChartData {
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000

    // Base prices for common coins
    const basePrices: Record<string, number> = {
      bitcoin: 115000,
      ethereum: 4400,
      binancecoin: 710,
      solana: 255,
      cardano: 1.22,
      ripple: 2.85,
      dogecoin: 0.45,
      polygon: 1.15,
      chainlink: 28.5,
      litecoin: 125
    }

    const basePrice = basePrices[coinId] || 1
    const prices: [number, number][] = []
    const market_caps: [number, number][] = []
    const total_volumes: [number, number][] = []

    for (let i = days; i >= 0; i--) {
      const timestamp = now - (i * dayMs)

      // Generate realistic price variation
      const variation = 1 + (Math.random() - 0.5) * 0.15 * (i / days)
      const price = basePrice * variation

      // Approximate market cap and volume
      const marketCap = price * (coinId === 'bitcoin' ? 19800000 : 120000000)
      const volume = marketCap * (0.05 + Math.random() * 0.1)

      prices.push([timestamp, price])
      market_caps.push([timestamp, marketCap])
      total_volumes.push([timestamp, volume])
    }

    return { prices, market_caps, total_volumes }
  }

  async getTrendingCryptos(): Promise<any[]> {
    const endpoint = isBrowser ? '/api/crypto/trending' : '/search/trending'
    const response = await this.fetchAPI(endpoint)
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
    const endpoint = isBrowser
      ? `/api/crypto/simple/price?ids=${idsStr}&vs_currencies=${currenciesStr}&include_24hr_change=true`
      : `/simple/price?ids=${idsStr}&vs_currencies=${currenciesStr}&include_24hr_change=true`
    return this.fetchAPI(endpoint)
  }

  // Get detailed coin data for individual coin pages
  async getCoinDetails(id: string): Promise<any> {
    try {
      const endpoint = isBrowser
        ? `/api/crypto/coins/${id}`
        : `/coins/${id}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=false`
      return await this.fetchAPI(endpoint)
    } catch (error) {
      console.error(`Error fetching coin details for ${id}:`, error)
      throw error
    }
  }

  // Get crypto news from multiple sources
  async getCryptoNews(limit: number = 10): Promise<NewsArticle[]> {
    try {
      if (isBrowser) {
        // Use proxy route in browser
        const response = await fetch(`/api/crypto/news?limit=${limit}`)
        if (!response.ok) {
          throw new Error(`News API failed: ${response.status}`)
        }
        return await response.json()
      } else {
        // Server-side: use curated news
        const currentNews = this.generateCryptoNews()
        return currentNews.slice(0, limit)
      }
    } catch (error) {
      console.error('Error fetching crypto news:', error)
      return this.generateCryptoNews().slice(0, limit)
    }
  }

  // Generate dynamic crypto news (simulates real news feed)
  private generateCryptoNews(): NewsArticle[] {
    const newsTemplates = [
      {
        title: "Bitcoin Reaches New All-Time High Amid Institutional Adoption",
        description: "Bitcoin surged to unprecedented levels as major corporations continue to add BTC to their treasury reserves, signaling growing institutional confidence in cryptocurrency.",
        category: "Bitcoin",
        source: "CryptoDaily"
      },
      {
        title: "Ethereum 2.0 Upgrade Shows Promising Scalability Improvements",
        description: "The latest Ethereum network upgrade demonstrates significant improvements in transaction throughput and reduced gas fees, enhancing user experience.",
        category: "Ethereum",
        source: "Ethereum Foundation"
      },
      {
        title: "DeFi TVL Surpasses $100 Billion Milestone",
        description: "Total Value Locked in decentralized finance protocols reaches a historic milestone, indicating robust growth in the DeFi ecosystem.",
        category: "DeFi",
        source: "DeFi Pulse"
      },
      {
        title: "Central Bank Digital Currencies Gain Momentum Globally",
        description: "Multiple countries accelerate CBDC development programs as central banks explore digital currency implementations for improved monetary policy.",
        category: "CBDC",
        source: "Central Banking"
      },
      {
        title: "NFT Market Evolves with New Utility-Focused Projects",
        description: "The NFT landscape shifts towards utility-driven applications as creators explore innovative use cases beyond digital art collectibles.",
        category: "NFT",
        source: "NFT News"
      },
      {
        title: "Regulatory Clarity Emerges as Major Economies Define Crypto Frameworks",
        description: "Financial regulators worldwide provide clearer guidelines for cryptocurrency operations, reducing uncertainty and boosting institutional adoption.",
        category: "Regulation",
        source: "Financial Times"
      },
      {
        title: "Layer 2 Solutions Drive Blockchain Scalability Forward",
        description: "Second-layer scaling solutions demonstrate remarkable progress in transaction speed and cost reduction, addressing blockchain scalability challenges.",
        category: "Technology",
        source: "Blockchain News"
      },
      {
        title: "Stablecoin Market Cap Reaches Record High",
        description: "The combined market capitalization of stablecoins hits new records as demand for digital dollar alternatives continues to grow.",
        category: "Stablecoins",
        source: "Coin Telegraph"
      },
      {
        title: "Green Mining Initiatives Transform Crypto Energy Narrative",
        description: "Major mining operations shift to renewable energy sources, addressing environmental concerns and improving cryptocurrency's sustainability profile.",
        category: "Mining",
        source: "Green Tech Media"
      },
      {
        title: "Cross-Chain Bridge Technology Enhances Blockchain Interoperability",
        description: "Advanced bridge protocols facilitate seamless asset transfers between different blockchain networks, promoting ecosystem connectivity.",
        category: "Technology",
        source: "Crypto Research"
      }
    ]

    return newsTemplates.map((template, index) => {
      const date = new Date()
      date.setHours(date.getHours() - Math.floor(Math.random() * 24))

      return {
        id: `news-${index}-${Date.now()}`,
        title: template.title,
        description: template.description,
        url: `https://chainwise.ai/news/${template.title.toLowerCase().replace(/\s+/g, '-')}`,
        urlToImage: `https://picsum.photos/400/200?random=${index}`,
        publishedAt: date.toISOString(),
        source: {
          id: template.source.toLowerCase().replace(/\s+/g, '-'),
          name: template.source
        },
        category: template.category
      }
    })
  }

  // Get portfolio performance data with individual coin breakdown
  async getPortfolioPerformanceData(holdings: Array<{id: string, amount: number, symbol: string}>, days: number = 7): Promise<any[]> {
    try {
      if (holdings.length === 0) return []

      // Convert symbols to proper coin IDs for CoinGecko API
      const symbolToCoinId: Record<string, string> = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'ADA': 'cardano',
        'DOT': 'polkadot',
        'XRP': 'ripple',
        'LINK': 'chainlink',
        'SOL': 'solana',
        'AVAX': 'avalanche-2',
        'MATIC': 'matic-network',
        'ATOM': 'cosmos',
        'UNI': 'uniswap',
        'AAVE': 'aave',
        'ALGO': 'algorand',
        'FTM': 'fantom',
        'NEAR': 'near',
        'ONE': 'harmony'
      }

      // Map holdings to valid coin IDs, filter out unknown symbols
      const validHoldings = holdings.filter(h => symbolToCoinId[h.symbol.toUpperCase()])
      if (validHoldings.length === 0) {
        console.warn('No valid coin symbols found in holdings for API call')
        return this.generateMockPortfolioData(holdings, days)
      }

      const coinIds = validHoldings.map(h => symbolToCoinId[h.symbol.toUpperCase()]).join(',')

      // Get current prices first with error handling
      let currentData
      try {
        const endpoint = isBrowser
          ? `/api/crypto/markets?ids=${coinIds}`
          : `/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=250&page=1&sparkline=false`

        currentData = await this.fetchAPI(endpoint)
      } catch (apiError) {
        console.warn('CoinGecko API failed, using mock data:', apiError)
        return this.generateMockPortfolioData(holdings, days)
      }

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
          for (const holding of validHoldings) {
            const coinId = symbolToCoinId[holding.symbol.toUpperCase()]
            const crypto = currentData.find((c: CryptoData) => c.id === coinId)
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

  // Get comprehensive list of all available cryptocurrencies
  async getAllCoins(includePlatform: boolean = false): Promise<Array<{id: string, symbol: string, name: string}>> {
    try {
      const endpoint = isBrowser
        ? `/api/crypto/coins?include_platform=${includePlatform}&status=active`
        : `/coins/list?include_platform=${includePlatform}&status=active`

      const data = await this.fetchAPI(endpoint)
      return data || []
    } catch (error) {
      console.error('Error fetching all coins:', error)
      // Return a comprehensive fallback list
      return [
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
        { id: "algorand", symbol: "algo", name: "Algorand" }
      ]
    }
  }

  // Get live prices for multiple cryptocurrencies with optimized batching
  async getLivePrices(coinIds: string[], vsCurrency: string = 'usd'): Promise<Record<string, Record<string, number>>> {
    try {
      // Split large requests into batches to avoid URL length limits
      const BATCH_SIZE = 50
      const batches = []

      for (let i = 0; i < coinIds.length; i += BATCH_SIZE) {
        batches.push(coinIds.slice(i, i + BATCH_SIZE))
      }

      const results = await Promise.all(
        batches.map(async (batch) => {
          const ids = batch.join(',')
          const endpoint = isBrowser
            ? `/api/crypto/simple/price?ids=${ids}&vs_currencies=${vsCurrency}&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
            : `/simple/price?ids=${ids}&vs_currencies=${vsCurrency}&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`

          return await this.fetchAPI(endpoint)
        })
      )

      // Merge all batch results
      return results.reduce((acc, result) => ({ ...acc, ...result }), {})
    } catch (error) {
      console.error('Error fetching live prices:', error)
      return {}
    }
  }

  // Get comprehensive market data for all top cryptocurrencies
  async getLiveMarketData(limit: number = 250, page: number = 1): Promise<CryptoData[]> {
    try {
      const endpoint = isBrowser
        ? `/api/crypto/markets?limit=${limit}&page=${page}`
        : `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=${page}&sparkline=false&price_change_percentage=24h,7d,30d`

      const data = await this.fetchAPI(endpoint)
      return data || []
    } catch (error) {
      console.error('Error fetching live market data:', error)
      return []
    }
  }

  // Real-time price monitoring with WebSocket-like polling
  private intervalId: NodeJS.Timeout | null = null
  private subscribers: Map<string, Array<(data: any) => void>> = new Map()

  startLivePriceMonitoring(coinIds: string[], intervalMs: number = 30000) {
    if (this.intervalId) {
      this.stopLivePriceMonitoring()
    }

    const updatePrices = async () => {
      try {
        const prices = await this.getLivePrices(coinIds)

        // Notify all subscribers
        for (const [coinId, callbacks] of this.subscribers.entries()) {
          if (prices[coinId]) {
            callbacks.forEach(callback => callback(prices[coinId]))
          }
        }
      } catch (error) {
        console.error('Error in live price monitoring:', error)
      }
    }

    // Initial fetch
    updatePrices()

    // Set up interval
    this.intervalId = setInterval(updatePrices, intervalMs)
  }

  stopLivePriceMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  subscribeToPriceUpdates(coinId: string, callback: (data: any) => void) {
    if (!this.subscribers.has(coinId)) {
      this.subscribers.set(coinId, [])
    }
    this.subscribers.get(coinId)!.push(callback)
  }

  unsubscribeFromPriceUpdates(coinId: string, callback: (data: any) => void) {
    const callbacks = this.subscribers.get(coinId)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  // Get exchanges (centralized and decentralized)
  async getExchanges(perPage: number = 100): Promise<Exchange[]> {
    try {
      const endpoint = isBrowser
        ? `/api/crypto/exchanges?per_page=${perPage}`
        : `/exchanges?per_page=${perPage}`

      const data = await this.fetchAPI(endpoint)
      return data || []
    } catch (error) {
      console.error('Error fetching exchanges:', error)
      // Return fallback exchange data
      return [
        {
          id: 'binance',
          name: 'Binance',
          year_established: 2017,
          country: 'Cayman Islands',
          description: 'Binance is a global cryptocurrency exchange',
          url: 'https://www.binance.com',
          image: 'https://assets.coingecko.com/markets/images/52/small/binance.jpg',
          has_trading_incentive: false,
          trust_score: 10,
          trust_score_rank: 1,
          trade_volume_24h_btc: 65000,
          trade_volume_24h_btc_normalized: 65000
        },
        {
          id: 'coinbase-exchange',
          name: 'Coinbase Exchange',
          year_established: 2012,
          country: 'United States',
          description: 'Coinbase is a secure platform to buy, sell, and manage crypto',
          url: 'https://www.coinbase.com',
          image: 'https://assets.coingecko.com/markets/images/23/small/Coinbase.jpg',
          has_trading_incentive: false,
          trust_score: 10,
          trust_score_rank: 2,
          trade_volume_24h_btc: 45000,
          trade_volume_24h_btc_normalized: 45000
        }
      ]
    }
  }

  // Advanced search with fuzzy matching
  async searchCryptos(query: string, limit: number = 20): Promise<any[]> {
    try {
      const endpoint = isBrowser
        ? `/api/crypto/search?q=${encodeURIComponent(query)}&limit=${limit}`
        : `/search?query=${encodeURIComponent(query)}`

      const data = await this.fetchAPI(endpoint)
      return data?.coins || []
    } catch (error) {
      console.error('Error searching cryptos:', error)
      return []
    }
  }

  // Bulk data optimization - get essential data for dashboard
  async getDashboardData(): Promise<{
    topCoins: CryptoData[]
    globalData: MarketData
    trending: any[]
    totalMarketCap: number
    btcDominance: number
  }> {
    try {
      const [topCoins, globalData, trending] = await Promise.all([
        this.getLiveMarketData(50), // Top 50 coins
        this.getGlobalData(),
        this.getTrendingCryptos()
      ])

      return {
        topCoins,
        globalData,
        trending,
        totalMarketCap: globalData?.total_market_cap?.usd || 0,
        btcDominance: globalData?.market_cap_percentage?.btc || 0
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      return {
        topCoins: [],
        globalData: {} as MarketData,
        trending: [],
        totalMarketCap: 0,
        btcDominance: 0
      }
    }
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
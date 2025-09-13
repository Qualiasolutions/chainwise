import { CryptoData, MarketStats } from '@/types'
import { logger } from '@/lib/enhanced-logger'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

interface ServiceMetrics {
  totalRequests: number
  cacheHits: number
  cacheMisses: number
  averageResponseTime: number
  errorCount: number
  lastError?: string
}

class OptimizedCryptoService {
  private cache = new Map<string, CacheEntry<any>>()
  private pendingRequests = new Map<string, Promise<any>>()
  private baseUrl = typeof window !== 'undefined' ? '/api/market-data' : 'https://api.coingecko.com/api/v3'
  
  // Performance metrics
  private metrics: ServiceMetrics = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageResponseTime: 0,
    errorCount: 0
  }

  // Cache configuration
  private readonly cacheConfig = {
    topCryptos: 60 * 1000, // 1 minute
    cryptoById: 300 * 1000, // 5 minutes
    searchResults: 60 * 1000, // 1 minute
    marketStats: 120 * 1000, // 2 minutes
    prices: 30 * 1000, // 30 seconds
    priceHistory: 600 * 1000 // 10 minutes
  }

  private updateMetrics(responseTime: number, fromCache: boolean, error?: Error) {
    this.metrics.totalRequests++
    
    if (fromCache) {
      this.metrics.cacheHits++
    } else {
      this.metrics.cacheMisses++
    }

    if (error) {
      this.metrics.errorCount++
      this.metrics.lastError = error.message
    }

    // Update average response time
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime) / 
      this.metrics.totalRequests
  }

  private getCacheKey(endpoint: string, params?: string): string {
    return `${endpoint}${params ? `?${params}` : ''}`
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (entry && Date.now() < entry.expiresAt) {
      logger.debug('Cache hit', { key, age: Date.now() - entry.timestamp })
      return entry.data
    }
    
    if (entry) {
      this.cache.delete(key) // Remove expired entry
      logger.debug('Cache miss - expired', { key, age: Date.now() - entry.timestamp })
    }
    
    return null
  }

  private setCache<T>(key: string, data: T, ttl: number): void {
    const now = Date.now()
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl
    }
    
    this.cache.set(key, entry)
    logger.debug('Cache set', { key, ttl, expiresAt: new Date(entry.expiresAt).toISOString() })

    // Cleanup old entries periodically
    if (this.cache.size > 100) {
      this.cleanupCache()
    }
  }

  private cleanupCache(): void {
    const now = Date.now()
    let cleaned = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (now >= entry.expiresAt) {
        this.cache.delete(key)
        cleaned++
      }
    }
    
    if (cleaned > 0) {
      logger.info('Cache cleanup completed', { cleaned, remaining: this.cache.size })
    }
  }

  private async fetchWithProxy(endpoint: string, params?: string): Promise<any> {
    const cacheKey = this.getCacheKey(endpoint, params)
    const startTime = performance.now()

    // Check cache first
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      this.updateMetrics(performance.now() - startTime, true)
      return cached
    }

    // Check for pending request to avoid duplicate calls
    if (this.pendingRequests.has(cacheKey)) {
      logger.debug('Request deduplication', { endpoint, params })
      return this.pendingRequests.get(cacheKey)!
    }

    const requestPromise = this.executeRequest(endpoint, params, startTime, cacheKey)
    this.pendingRequests.set(cacheKey, requestPromise)

    try {
      const result = await requestPromise
      return result
    } finally {
      this.pendingRequests.delete(cacheKey)
    }
  }

  private async executeRequest(endpoint: string, params: string | undefined, startTime: number, cacheKey: string): Promise<any> {
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

      logger.debug('API request', { url, endpoint, params })

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const responseTime = performance.now() - startTime

      // Cache the result
      const ttl = this.getTTLForEndpoint(endpoint)
      this.setCache(cacheKey, data, ttl)

      this.updateMetrics(responseTime, false)
      
      logger.info('API request successful', {
        endpoint,
        responseTime: `${responseTime.toFixed(2)}ms`,
        cacheKey,
        ttl: `${ttl / 1000}s`
      })

      return data
    } catch (error: any) {
      const responseTime = performance.now() - startTime
      this.updateMetrics(responseTime, false, error)
      
      logger.error('API request failed', error, {
        endpoint,
        params,
        responseTime: `${responseTime.toFixed(2)}ms`,
        cacheKey
      })
      
      throw error
    }
  }

  private getTTLForEndpoint(endpoint: string): number {
    if (endpoint.includes('markets')) return this.cacheConfig.topCryptos
    if (endpoint.includes('search')) return this.cacheConfig.searchResults
    if (endpoint.includes('global')) return this.cacheConfig.marketStats
    if (endpoint.includes('simple/price')) return this.cacheConfig.prices
    if (endpoint.includes('market_chart')) return this.cacheConfig.priceHistory
    if (endpoint.includes('coins/')) return this.cacheConfig.cryptoById
    
    return 60 * 1000 // Default 1 minute
  }

  // Public API methods with performance optimizations
  async getTopCryptos(limit = 20): Promise<CryptoData[]> {
    return logger.measureAsync(`getTopCryptos(${limit})`, async () => {
      const params = `vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=24h`
      return this.fetchWithProxy('coins/markets', params)
    })
  }

  async getCryptoById(id: string): Promise<CryptoData | null> {
    return logger.measureAsync(`getCryptoById(${id})`, async () => {
      const params = 'localization=false&tickers=false&market_data=true&community_data=false&developer_data=false'
      const data = await this.fetchWithProxy(`coins/${id}`, params)
      
      if (!data) return null

      return {
        id: data.id,
        symbol: data.symbol,
        name: data.name,
        image: data.image?.large || data.image,
        current_price: data.market_data?.current_price?.usd || 0,
        market_cap: data.market_data?.market_cap?.usd || 0,
        market_cap_rank: data.market_cap_rank || 0,
        price_change_percentage_24h: data.market_data?.price_change_percentage_24h || 0,
        total_volume: data.market_data?.total_volume?.usd || 0,
        high_24h: data.market_data?.high_24h?.usd || 0,
        low_24h: data.market_data?.low_24h?.usd || 0,
      }
    })
  }

  async searchCrypto(query: string): Promise<CryptoData[]> {
    return logger.measureAsync(`searchCrypto(${query})`, async () => {
      if (!query.trim()) return []

      const searchData = await this.fetchWithProxy('search', `query=${encodeURIComponent(query)}`)
      const coinIds = searchData.coins?.slice(0, 10).map((coin: any) => coin.id) || []
      
      if (coinIds.length === 0) return []
      
      const params = `vs_currency=usd&ids=${coinIds.join(',')}&order=market_cap_desc&sparkline=false`
      return this.fetchWithProxy('coins/markets', params)
    })
  }

  async getMarketStats(): Promise<MarketStats | null> {
    return logger.measureAsync('getMarketStats', async () => {
      const [globalData, topCryptos] = await Promise.all([
        this.fetchWithProxy('global'),
        this.getTopCryptos(100)
      ])

      const topGainers = [...topCryptos]
        .sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))
        .slice(0, 5)
      
      const topLosers = [...topCryptos]
        .sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0))
        .slice(0, 5)

      return {
        totalMarketCap: globalData.data?.total_market_cap?.usd || 0,
        totalVolume: globalData.data?.total_volume?.usd || 0,
        marketCapChangePercentage24h: globalData.data?.market_cap_change_percentage_24h_usd || 0,
        bitcoinDominance: globalData.data?.market_cap_percentage?.btc || 0,
        topGainers,
        topLosers
      }
    })
  }

  async getCurrentPrice(cryptoId: string): Promise<number | null> {
    return logger.measureAsync(`getCurrentPrice(${cryptoId})`, async () => {
      const params = `ids=${cryptoId}&vs_currencies=usd&include_24hr_change=true`
      const data = await this.fetchWithProxy('simple/price', params)
      
      return data[cryptoId]?.usd || null
    })
  }

  async getCurrentPrices(cryptoIds: string[]): Promise<Record<string, { price: number; change24h: number }>> {
    return logger.measureAsync(`getCurrentPrices(${cryptoIds.length} coins)`, async () => {
      if (cryptoIds.length === 0) return {}
      
      const params = `ids=${cryptoIds.join(',')}&vs_currencies=usd&include_24hr_change=true`
      const data = await this.fetchWithProxy('simple/price', params)
      
      const result: Record<string, { price: number; change24h: number }> = {}
      for (const [id, cryptoData] of Object.entries(data as Record<string, any>)) {
        result[id] = {
          price: cryptoData.usd || 0,
          change24h: cryptoData.usd_24h_change || 0
        }
      }
      
      return result
    })
  }

  async getMultipleCryptos(cryptoIds: string[]): Promise<CryptoData[]> {
    return logger.measureAsync(`getMultipleCryptos(${cryptoIds.length} coins)`, async () => {
      if (cryptoIds.length === 0) return []
      
      const params = `vs_currency=usd&ids=${cryptoIds.join(',')}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`
      return this.fetchWithProxy('coins/markets', params)
    })
  }

  async getPriceHistory(coinId: string, days: number = 7): Promise<Array<{ time: string; price: number }>> {
    return logger.measureAsync(`getPriceHistory(${coinId}, ${days}d)`, async () => {
      const params = `vs_currency=usd&days=${days}`
      const data = await this.fetchWithProxy(`coins/${coinId}/market_chart`, params)

      return data.prices?.map(([timestamp, price]: [number, number]) => ({
        time: new Date(timestamp).toLocaleDateString(),
        price
      })) || []
    })
  }

  // Performance and diagnostics methods
  getMetrics(): ServiceMetrics {
    return { ...this.metrics }
  }

  getCacheStats() {
    const now = Date.now()
    let validEntries = 0
    let expiredEntries = 0
    let totalSize = 0

    for (const [key, entry] of this.cache.entries()) {
      totalSize += JSON.stringify(entry.data).length
      if (now < entry.expiresAt) {
        validEntries++
      } else {
        expiredEntries++
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      hitRate: this.metrics.totalRequests > 0 ? 
        (this.metrics.cacheHits / this.metrics.totalRequests * 100).toFixed(2) + '%' : '0%',
      estimatedSizeKB: Math.round(totalSize / 1024)
    }
  }

  clearCache(): void {
    const size = this.cache.size
    this.cache.clear()
    this.pendingRequests.clear()
    logger.info('Cache cleared', { entriesRemoved: size })
  }

  // Batch operations for better performance
  async batchGetPrices(cryptoIds: string[], batchSize: number = 250): Promise<Record<string, number>> {
    const batches = []
    for (let i = 0; i < cryptoIds.length; i += batchSize) {
      batches.push(cryptoIds.slice(i, i + batchSize))
    }

    const results = await Promise.allSettled(
      batches.map(batch => this.getCurrentPrices(batch))
    )

    const prices: Record<string, number> = {}
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        Object.entries(result.value).forEach(([id, data]) => {
          prices[id] = data.price
        })
      }
    })

    return prices
  }

  // Preload common data
  async preloadCommonData(): Promise<void> {
    logger.info('Preloading common crypto data')
    
    try {
      await Promise.allSettled([
        this.getTopCryptos(50),
        this.getMarketStats(),
        this.getCurrentPrices(['bitcoin', 'ethereum', 'binancecoin', 'solana', 'cardano'])
      ])
      
      logger.info('Common crypto data preloaded successfully')
    } catch (error) {
      logger.warn('Failed to preload some crypto data', error as Error)
    }
  }
}

// Export singleton instance
export const optimizedCryptoService = new OptimizedCryptoService()

// Legacy compatibility
export const CryptoService = optimizedCryptoService
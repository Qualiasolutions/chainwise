'use client'

import { createClient } from '@/lib/supabase/client'
import { CryptoService } from '@/lib/crypto-service'

export interface PriceUpdate {
  cryptoId: string
  symbol: string
  currentPrice: number
  priceChange24h: number
  marketCap: number
  volume24h: number
  lastUpdated: number
}

export interface PortfolioUpdate {
  portfolioId: string
  totalValue: number
  totalCost: number
  profitLoss: number
  profitLossPercentage: number
  dayChange: number
  dayChangePercentage: number
  lastUpdated: number
}

export class RealTimePortfolioService {
  private static instance: RealTimePortfolioService
  private eventEmitter: EventTarget
  private updateInterval: NodeJS.Timeout | null = null
  private priceCache: Map<string, PriceUpdate> = new Map()
  private lastUpdate: number = 0
  private subscribers: Set<string> = new Set()

  private constructor() {
    this.eventEmitter = new EventTarget()
  }

  static getInstance(): RealTimePortfolioService {
    if (!RealTimePortfolioService.instance) {
      RealTimePortfolioService.instance = new RealTimePortfolioService()
    }
    return RealTimePortfolioService.instance
  }

  /**
   * Subscribe to portfolio updates
   */
  subscribe(portfolioId: string, callback: (update: PortfolioUpdate) => void): () => void {
    this.subscribers.add(portfolioId)
    
    const eventHandler = (event: CustomEvent<PortfolioUpdate>) => {
      if (event.detail.portfolioId === portfolioId) {
        callback(event.detail)
      }
    }

    this.eventEmitter.addEventListener('portfolio-update', eventHandler as EventListener)
    
    // Start real-time updates if this is the first subscriber
    if (this.subscribers.size === 1) {
      this.startRealTimeUpdates()
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(portfolioId)
      this.eventEmitter.removeEventListener('portfolio-update', eventHandler as EventListener)
      
      // Stop updates if no more subscribers
      if (this.subscribers.size === 0) {
        this.stopRealTimeUpdates()
      }
    }
  }

  /**
   * Subscribe to price updates for specific cryptocurrencies
   */
  subscribeToPrices(cryptoIds: string[], callback: (updates: PriceUpdate[]) => void): () => void {
    const eventHandler = (event: CustomEvent<PriceUpdate[]>) => {
      const relevantUpdates = event.detail.filter(update => 
        cryptoIds.includes(update.cryptoId)
      )
      if (relevantUpdates.length > 0) {
        callback(relevantUpdates)
      }
    }

    this.eventEmitter.addEventListener('price-update', eventHandler as EventListener)
    
    return () => {
      this.eventEmitter.removeEventListener('price-update', eventHandler as EventListener)
    }
  }

  /**
   * Start real-time updates
   */
  private startRealTimeUpdates() {
    if (this.updateInterval) {
      return
    }

    // Update every 30 seconds
    this.updateInterval = setInterval(async () => {
      await this.fetchLatestPrices()
      await this.updatePortfolios()
    }, 30000)

    // Initial update
    this.fetchLatestPrices()
  }

  /**
   * Stop real-time updates
   */
  private stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  /**
   * Fetch latest prices for all tracked cryptocurrencies
   */
  private async fetchLatestPrices() {
    try {
      const supabase = createClient()
      
      // Get all unique crypto IDs from all portfolios
      const { data: holdings } = await supabase
        .from('portfolio_holdings')
        .select('crypto_id, symbol')
        .not('crypto_id', 'is', null)

      if (!holdings || holdings.length === 0) {
        return
      }

      const cryptoIds = [...new Set(holdings.map(h => h.crypto_id))]
      
      // Fetch current prices
      const priceData = await CryptoService.getCurrentPrices(cryptoIds)
      const cryptoData = await CryptoService.getMultipleCryptos(cryptoIds)
      
      const updates: PriceUpdate[] = cryptoData.map(crypto => ({
        cryptoId: crypto.id,
        symbol: crypto.symbol.toUpperCase(),
        currentPrice: priceData[crypto.id]?.price || crypto.current_price,
        priceChange24h: priceData[crypto.id]?.change24h || crypto.price_change_percentage_24h || 0,
        marketCap: crypto.market_cap || 0,
        volume24h: crypto.total_volume || 0,
        lastUpdated: Date.now()
      }))

      // Update cache
      updates.forEach(update => {
        this.priceCache.set(update.cryptoId, update)
      })

      this.lastUpdate = Date.now()

      // Emit price update event
      this.eventEmitter.dispatchEvent(
        new CustomEvent('price-update', { detail: updates })
      )

    } catch (error) {
      console.error('Error fetching latest prices:', error)
    }
  }

  /**
   * Update all subscribed portfolios
   */
  private async updatePortfolios() {
    const supabase = createClient()
    
    try {
      // Get all portfolios with holdings for subscribed portfolio IDs
      for (const portfolioId of this.subscribers) {
        const { data: portfolio } = await supabase
          .from('portfolios')
          .select(`
            *,
            portfolio_holdings (*)
          `)
          .eq('id', portfolioId)
          .single()

        if (!portfolio || !portfolio.portfolio_holdings) {
          continue
        }

        // Calculate updated portfolio values
        const portfolioUpdate = await this.calculatePortfolioUpdate(portfolio)
        
        if (portfolioUpdate) {
          // Emit portfolio update event
          this.eventEmitter.dispatchEvent(
            new CustomEvent('portfolio-update', { detail: portfolioUpdate })
          )
        }
      }
    } catch (error) {
      console.error('Error updating portfolios:', error)
    }
  }

  /**
   * Calculate portfolio update based on latest prices
   */
  private async calculatePortfolioUpdate(portfolio: any): Promise<PortfolioUpdate | null> {
    try {
      let totalValue = 0
      let totalCost = 0
      let dayChangeValue = 0

      for (const holding of portfolio.portfolio_holdings) {
        const priceData = this.priceCache.get(holding.crypto_id)
        
        if (!priceData) {
          // Use existing values if no price data available
          totalValue += parseFloat(holding.current_value_usd || holding.market_value_usd || '0')
          totalCost += parseFloat(holding.amount) * parseFloat(holding.average_purchase_price_usd || holding.cost_basis_usd || '0')
          continue
        }

        const amount = parseFloat(holding.amount)
        const currentValue = amount * priceData.currentPrice
        const costBasis = amount * parseFloat(holding.average_purchase_price_usd || holding.cost_basis_usd || '0')
        
        totalValue += currentValue
        totalCost += costBasis
        
        // Calculate day change contribution
        const dayChangePercent = priceData.priceChange24h / 100
        dayChangeValue += currentValue * dayChangePercent
      }

      const profitLoss = totalValue - totalCost
      const profitLossPercentage = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0
      const dayChangePercentage = totalValue > 0 ? (dayChangeValue / totalValue) * 100 : 0

      return {
        portfolioId: portfolio.id,
        totalValue,
        totalCost,
        profitLoss,
        profitLossPercentage,
        dayChange: dayChangeValue,
        dayChangePercentage,
        lastUpdated: Date.now()
      }
    } catch (error) {
      console.error('Error calculating portfolio update:', error)
      return null
    }
  }

  /**
   * Get cached price data
   */
  getCachedPrices(): PriceUpdate[] {
    return Array.from(this.priceCache.values())
  }

  /**
   * Get last update timestamp
   */
  getLastUpdateTime(): number {
    return this.lastUpdate
  }

  /**
   * Force refresh prices
   */
  async forceRefresh(): Promise<void> {
    await this.fetchLatestPrices()
    await this.updatePortfolios()
  }

  /**
   * Get real-time status
   */
  isActive(): boolean {
    return this.updateInterval !== null
  }

  /**
   * Get subscriber count
   */
  getSubscriberCount(): number {
    return this.subscribers.size
  }
}

// Export singleton instance
export const realTimePortfolioService = RealTimePortfolioService.getInstance()
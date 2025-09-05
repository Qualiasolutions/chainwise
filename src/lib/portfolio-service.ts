import { createClient } from '@/lib/supabase/server'
import { CryptoService } from '@/lib/crypto-service'

export interface PortfolioStats {
  totalValue: number
  totalCost: number
  profitLoss: number
  profitLossPercentage: number
  topPerformer: {
    symbol: string
    profitLossPercentage: number
  } | null
  worstPerformer: {
    symbol: string
    profitLossPercentage: number
  } | null
  assetAllocation: Array<{
    symbol: string
    percentage: number
    value: number
  }>
}

export interface PriceUpdate {
  cryptoId: string
  symbol: string
  currentPrice: number
  priceChange24h: number
}

export class PortfolioService {
  /**
   * Update portfolio values with latest prices from CoinGecko
   */
  static async updatePortfolioValues(portfolioId: string): Promise<PortfolioStats> {
    const supabase = createClient()
    
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        portfolio_holdings (
          *
        )
      `)
      .eq('id', portfolioId)
      .is('deleted_at', null)
      .single()

    if (error || !portfolio) {
      throw new Error('Portfolio not found')
    }

    if (!portfolio.portfolio_holdings || portfolio.portfolio_holdings.length === 0) {
      return {
        totalValue: 0,
        totalCost: 0,
        profitLoss: 0,
        profitLossPercentage: 0,
        topPerformer: null,
        worstPerformer: null,
        assetAllocation: []
      }
    }

    // Get current prices for all holdings
    const cryptoIds = portfolio.portfolio_holdings.map(h => h.crypto_id)
    const priceUpdates = await this.getCurrentPrices(cryptoIds)

    // Update each holding with current prices
    const updatedHoldings = await Promise.all(
      portfolio.portfolio_holdings.map(async (holding) => {
        const priceUpdate = priceUpdates.find(p => p.cryptoId === holding.crypto_id)
        
        if (!priceUpdate) {
          return holding // Keep existing data if no price update available
        }

        const currentValue = parseFloat(holding.amount) * priceUpdate.currentPrice
        const costBasis = parseFloat(holding.amount) * parseFloat(holding.average_purchase_price_usd)
        const profitLoss = currentValue - costBasis
        const profitLossPercentage = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0

        // Update holding in database
        const { data: updatedHolding, error: updateError } = await supabase
          .from('portfolio_holdings')
          .update({
            current_price_usd: priceUpdate.currentPrice.toString(),
            current_value_usd: currentValue.toString(),
            profit_loss_usd: profitLoss.toString(),
            profit_loss_percentage: profitLossPercentage.toString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', holding.id)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating holding:', updateError)
          return holding
        }

        return {
          ...holding,
          current_price_usd: priceUpdate.currentPrice.toString(),
          current_value_usd: currentValue.toString(),
          profit_loss_usd: profitLoss.toString(),
          profit_loss_percentage: profitLossPercentage.toString()
        }
      })
    )

    // Calculate portfolio totals
    const totalValue = updatedHoldings.reduce((sum, h) => sum + parseFloat(h.current_value_usd || '0'), 0)
    const totalCost = updatedHoldings.reduce((sum, h) => 
      sum + (parseFloat(h.amount) * parseFloat(h.average_purchase_price_usd)), 0)
    const profitLoss = totalValue - totalCost
    const profitLossPercentage = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0

    // Update portfolio totals
    await supabase
      .from('portfolios')
      .update({
        total_value_usd: totalValue.toString(),
        total_cost_usd: totalCost.toString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', portfolioId)

    // Calculate performance stats
    const holdingsWithPerformance = updatedHoldings
      .filter(h => parseFloat(h.profit_loss_percentage || '0') !== 0)
      .sort((a, b) => parseFloat(b.profit_loss_percentage || '0') - parseFloat(a.profit_loss_percentage || '0'))

    const topPerformer = holdingsWithPerformance.length > 0 ? {
      symbol: holdingsWithPerformance[0].symbol,
      profitLossPercentage: parseFloat(holdingsWithPerformance[0].profit_loss_percentage || '0')
    } : null

    const worstPerformer = holdingsWithPerformance.length > 0 ? {
      symbol: holdingsWithPerformance[holdingsWithPerformance.length - 1].symbol,
      profitLossPercentage: parseFloat(holdingsWithPerformance[holdingsWithPerformance.length - 1].profit_loss_percentage || '0')
    } : null

    // Calculate asset allocation
    const assetAllocation = updatedHoldings.map(holding => ({
      symbol: holding.symbol,
      percentage: totalValue > 0 ? (parseFloat(holding.current_value_usd || '0') / totalValue) * 100 : 0,
      value: parseFloat(holding.current_value_usd || '0')
    })).sort((a, b) => b.percentage - a.percentage)

    return {
      totalValue,
      totalCost,
      profitLoss,
      profitLossPercentage,
      topPerformer,
      worstPerformer,
      assetAllocation
    }
  }

  /**
   * Get current prices for multiple cryptocurrencies
   */
  static async getCurrentPrices(cryptoIds: string[]): Promise<PriceUpdate[]> {
    try {
      const priceData = await CryptoService.getCurrentPrices(cryptoIds)
      const cryptoData = await CryptoService.getMultipleCryptos(cryptoIds)
      
      return cryptoData.map(crypto => ({
        cryptoId: crypto.id,
        symbol: crypto.symbol.toUpperCase(),
        currentPrice: priceData[crypto.id]?.price || crypto.current_price,
        priceChange24h: priceData[crypto.id]?.change24h || crypto.price_change_percentage_24h || 0
      }))
    } catch (error) {
      console.error('Error fetching current prices:', error)
      return []
    }
  }

  /**
   * Update all portfolios for a user
   */
  static async updateUserPortfolios(userId: string): Promise<void> {
    const supabase = createClient()
    const { data: portfolios, error } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', userId)
      .is('deleted_at', null)

    if (error || !portfolios) {
      throw new Error(`Failed to fetch portfolios: ${error?.message || 'Unknown error'}`)
    }

    await Promise.all(
      portfolios.map(portfolio => this.updatePortfolioValues(portfolio.id))
    )
  }

  /**
   * Get portfolio performance over time
   */
  static async getPortfolioPerformance(portfolioId: string, days: number = 30) {
    // This would typically require historical data storage
    // For now, we'll return current snapshot
    const supabase = createClient()
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        portfolio_holdings (*)
      `)
      .eq('id', portfolioId)
      .is('deleted_at', null)
      .single()

    if (error || !portfolio) {
      throw new Error('Portfolio not found')
    }

    // Return current values (in production, you'd want historical snapshots)
    return {
      date: new Date(),
      totalValue: portfolio.totalValueUsd.toNumber(),
      totalCost: portfolio.totalCostUsd.toNumber(),
      profitLoss: portfolio.totalValueUsd.toNumber() - portfolio.totalCostUsd.toNumber()
    }
  }

  /**
   * Calculate advanced portfolio risk metrics
   */
  static calculateRiskMetrics(holdings: any[]): {
    concentration: number // How concentrated the portfolio is (0-100)
    volatility: number // Portfolio volatility estimate
    diversification: number // Number of different assets
    sharpeRatio: number // Risk-adjusted return
    maxDrawdown: number // Maximum drawdown
    valueAtRisk: number // 95% VaR estimate
    beta: number // Market beta
    correlationMatrix: number[][] // Asset correlations
  } {
    if (holdings.length === 0) {
      return {
        concentration: 0,
        volatility: 0,
        diversification: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        valueAtRisk: 0,
        beta: 1,
        correlationMatrix: []
      }
    }

    const totalValue = holdings.reduce((sum, h) => sum + h.currentValueUsd.toNumber(), 0)

    // Calculate concentration (Herfindahl-Hirschman Index)
    const hhi = holdings.reduce((sum, h) => {
      const weight = h.currentValueUsd.toNumber() / totalValue
      return sum + (weight * weight)
    }, 0)
    const concentration = hhi * 100 // 0-100 scale

    // Calculate weights
    const weights = holdings.map(h => h.currentValueUsd.toNumber() / totalValue)

    // Calculate portfolio volatility (simplified)
    const volatility = this.calculatePortfolioVolatility(holdings, weights)

    // Calculate Sharpe ratio (simplified - assuming 3% risk-free rate)
    const riskFreeRate = 0.03
    const portfolioReturn = this.calculatePortfolioReturn(holdings, weights)
    const sharpeRatio = portfolioReturn > 0 ? (portfolioReturn - riskFreeRate) / (volatility / 100) : 0

    // Calculate maximum drawdown (simplified)
    const maxDrawdown = this.calculateMaxDrawdown(holdings)

    // Calculate Value at Risk (simplified 95% VaR)
    const valueAtRisk = this.calculateValueAtRisk(holdings, totalValue)

    // Calculate beta (simplified - assuming market correlation)
    const beta = this.calculatePortfolioBeta(holdings, weights)

    // Calculate correlation matrix
    const correlationMatrix = this.calculateCorrelationMatrix(holdings)

    return {
      concentration,
      volatility,
      diversification: holdings.length,
      sharpeRatio,
      maxDrawdown,
      valueAtRisk,
      beta,
      correlationMatrix
    }
  }

  /**
   * Calculate portfolio volatility
   */
  private static calculatePortfolioVolatility(holdings: any[], weights: number[]): number {
    if (holdings.length === 0) return 0

    // Simplified volatility calculation using 24h changes
    const volatilities = holdings.map(h => {
      // Use profit/loss percentage as a proxy for volatility
      const change = h.profitLossPercentage?.toNumber() || 0
      return Math.abs(change) // Daily volatility proxy
    })

    // Portfolio volatility = sqrt(w1²σ1² + w2²σ2² + 2w1w2σ1σ2ρ12)
    // Simplified version assuming low correlation
    let portfolioVolatility = 0
    for (let i = 0; i < holdings.length; i++) {
      portfolioVolatility += weights[i] * weights[i] * volatilities[i] * volatilities[i]
    }

    return Math.sqrt(portfolioVolatility) * 100 // Convert to percentage
  }

  /**
   * Calculate portfolio return
   */
  private static calculatePortfolioReturn(holdings: any[], weights: number[]): number {
    if (holdings.length === 0) return 0

    let totalReturn = 0
    for (let i = 0; i < holdings.length; i++) {
      const holdingReturn = holdings[i].profitLossPercentage?.toNumber() || 0
      totalReturn += weights[i] * (holdingReturn / 100)
    }

    return totalReturn
  }

  /**
   * Calculate maximum drawdown
   */
  private static calculateMaxDrawdown(holdings: any[]): number {
    // Simplified max drawdown calculation
    const returns = holdings.map(h => h.profitLossPercentage?.toNumber() || 0)
    const maxDrawdown = Math.min(...returns)
    return Math.abs(maxDrawdown)
  }

  /**
   * Calculate Value at Risk (95% confidence)
   */
  private static calculateValueAtRisk(holdings: any[], totalValue: number): number {
    if (holdings.length === 0) return 0

    // Simplified VaR calculation using historical simulation approach
    const dailyReturns = holdings.map(h => h.profitLossPercentage?.toNumber() || 0)
    const portfolioDailyReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length

    // Assume 95% confidence level, multiply by 1.645 (z-score)
    const var95 = Math.abs(portfolioDailyReturn) * 1.645

    return (var95 / 100) * totalValue // Convert to dollar amount
  }

  /**
   * Calculate portfolio beta
   */
  private static calculatePortfolioBeta(holdings: any[], weights: number[]): number {
    if (holdings.length === 0) return 1

    // Simplified beta calculation assuming market correlation
    // In production, this would use historical market data
    const marketBeta = 1.0 // S&P 500 proxy
    const assetBetas = holdings.map(h => {
      // Simplified: use volatility as beta proxy
      const volatility = Math.abs(h.profitLossPercentage?.toNumber() || 0)
      return volatility > 20 ? 1.5 : volatility > 10 ? 1.2 : 0.8
    })

    let portfolioBeta = 0
    for (let i = 0; i < holdings.length; i++) {
      portfolioBeta += weights[i] * assetBetas[i]
    }

    return portfolioBeta
  }

  /**
   * Calculate correlation matrix between assets
   */
  private static calculateCorrelationMatrix(holdings: any[]): number[][] {
    const n = holdings.length
    const matrix = Array(n).fill(0).map(() => Array(n).fill(0))

    // Simplified correlation calculation
    // In production, this would use historical price data
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 1.0 // Perfect correlation with itself
        } else {
          // Simplified: assume 0.3 correlation between different assets
          matrix[i][j] = 0.3
        }
      }
    }

    return matrix
  }

  /**
   * Generate portfolio rebalancing suggestions
   */
  static generateRebalancingSuggestions(holdings: any[], targetAllocation?: Record<string, number>) {
    if (holdings.length === 0) return []

    const totalValue = holdings.reduce((sum, h) => sum + h.currentValueUsd.toNumber(), 0)
    const suggestions = []

    // If no target allocation provided, suggest equal weighting for top holdings
    if (!targetAllocation) {
      const topHoldings = holdings
        .sort((a, b) => b.currentValueUsd.toNumber() - a.currentValueUsd.toNumber())
        .slice(0, Math.min(5, holdings.length))
      
      const targetWeight = 1 / topHoldings.length
      
      for (const holding of topHoldings) {
        const currentWeight = holding.currentValueUsd.toNumber() / totalValue
        const difference = targetWeight - currentWeight
        
        if (Math.abs(difference) > 0.05) { // 5% threshold
          suggestions.push({
            symbol: holding.symbol,
            action: difference > 0 ? 'buy' : 'sell',
            currentAllocation: currentWeight * 100,
            targetAllocation: targetWeight * 100,
            suggestedAmount: Math.abs(difference * totalValue)
          })
        }
      }
    }

    return suggestions
  }
}
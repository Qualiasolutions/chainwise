import { createClient } from '@/lib/supabase/server'

export interface PortfolioAnalytics {
  diversification: {
    herfindahlIndex: number
    effectiveNumberOfAssets: number
    concentrationRisk: 'low' | 'medium' | 'high'
    topHoldingsPercentage: number
  }
  riskMetrics: {
    volatility: number
    sharpeRatio: number
    beta: number
    valueAtRisk95: number
    maxDrawdown: number
    correlationScore: number
  }
  performance: {
    totalReturn: number
    annualizedReturn: number
    bestPeriodReturn: number
    worstPeriodReturn: number
    winRate: number
    averageWin: number
    averageLoss: number
  }
  allocation: {
    assetAllocation: Array<{
      symbol: string
      percentage: number
      value: number
      riskCategory: 'low' | 'medium' | 'high'
    }>
    sectorAllocation?: Array<{
      sector: string
      percentage: number
      value: number
    }>
    marketCapAllocation: {
      largeCap: number
      midCap: number
      smallCap: number
    }
  }
  trends: {
    performanceHistory: Array<{
      date: string
      totalValue: number
      profitLoss: number
      profitLossPercentage: number
    }>
    holdingChanges: Array<{
      date: string
      action: 'buy' | 'sell'
      symbol: string
      amount: number
      price: number
    }>
  }
  recommendations: Array<{
    type: 'rebalance' | 'risk_reduction' | 'diversification' | 'profit_taking'
    priority: 'low' | 'medium' | 'high'
    title: string
    description: string
    action: string
    estimatedImpact: string
  }>
}

export class PortfolioAnalyticsService {
  /**
   * Generate comprehensive portfolio analytics
   */
  static async generateAnalytics(portfolioId: string): Promise<PortfolioAnalytics> {
    const supabase = createClient()

    // Fetch portfolio with holdings
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        portfolio_holdings (*)
      `)
      .eq('id', portfolioId)
      .single()

    if (error || !portfolio) {
      throw new Error('Portfolio not found')
    }

    const holdings = portfolio.portfolio_holdings || []

    if (holdings.length === 0) {
      return this.getEmptyAnalytics()
    }

    // Calculate total portfolio value
    const totalValue = holdings.reduce((sum, h) => 
      sum + parseFloat(h.current_value_usd || h.market_value_usd || '0'), 0)

    // Generate analytics sections
    const diversification = this.calculateDiversification(holdings, totalValue)
    const riskMetrics = this.calculateRiskMetrics(holdings, totalValue)
    const performance = await this.calculatePerformance(holdings, portfolioId)
    const allocation = this.calculateAllocation(holdings, totalValue)
    const trends = await this.calculateTrends(portfolioId)
    const recommendations = this.generateRecommendations(
      holdings, 
      diversification, 
      riskMetrics, 
      performance
    )

    return {
      diversification,
      riskMetrics,
      performance,
      allocation,
      trends,
      recommendations
    }
  }

  /**
   * Calculate diversification metrics
   */
  private static calculateDiversification(holdings: any[], totalValue: number) {
    const weights = holdings.map(h => 
      parseFloat(h.current_value_usd || h.market_value_usd || '0') / totalValue
    )

    // Herfindahl-Hirschman Index
    const hhi = weights.reduce((sum, weight) => sum + weight * weight, 0)
    
    // Effective number of assets (1/HHI)
    const effectiveNumberOfAssets = 1 / hhi

    // Concentration risk assessment
    const topHoldingsPercentage = weights
      .sort((a, b) => b - a)
      .slice(0, 3)
      .reduce((sum, weight) => sum + weight, 0) * 100

    let concentrationRisk: 'low' | 'medium' | 'high'
    if (topHoldingsPercentage > 60) concentrationRisk = 'high'
    else if (topHoldingsPercentage > 30) concentrationRisk = 'medium'
    else concentrationRisk = 'low'

    return {
      herfindahlIndex: hhi,
      effectiveNumberOfAssets,
      concentrationRisk,
      topHoldingsPercentage
    }
  }

  /**
   * Calculate risk metrics
   */
  private static calculateRiskMetrics(holdings: any[], totalValue: number) {
    const returns = holdings.map(h => {
      const profitLoss = parseFloat(h.profit_loss_percentage || '0')
      return profitLoss / 100
    })

    const weights = holdings.map(h => 
      parseFloat(h.current_value_usd || h.market_value_usd || '0') / totalValue
    )

    // Portfolio volatility (simplified)
    const portfolioReturn = returns.reduce((sum, ret, i) => sum + ret * weights[i], 0)
    const variance = returns.reduce((sum, ret, i) => {
      const diff = ret - portfolioReturn
      return sum + weights[i] * diff * diff
    }, 0)
    const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100 // Annualized

    // Sharpe ratio (assuming 3% risk-free rate)
    const riskFreeRate = 0.03
    const excessReturn = portfolioReturn - riskFreeRate
    const sharpeRatio = volatility > 0 ? excessReturn / (volatility / 100) : 0

    // Beta (simplified - assuming market correlation of 0.7)
    const marketCorrelation = 0.7
    const marketVolatility = 20 // Assuming 20% market volatility
    const beta = marketCorrelation * (volatility / marketVolatility)

    // Value at Risk (95% confidence)
    const var95 = Math.abs(portfolioReturn - 1.645 * (volatility / 100)) * totalValue

    // Max drawdown (simplified)
    const maxDrawdown = Math.min(...returns) * 100

    // Correlation score (simplified diversity measure)
    const correlationScore = Math.min(100, effectiveNumberOfAssets * 10)

    return {
      volatility,
      sharpeRatio,
      beta,
      valueAtRisk95: var95,
      maxDrawdown: Math.abs(maxDrawdown),
      correlationScore
    }
  }

  /**
   * Calculate performance metrics
   */
  private static async calculatePerformance(holdings: any[], portfolioId: string) {
    const totalValue = holdings.reduce((sum, h) => 
      sum + parseFloat(h.current_value_usd || h.market_value_usd || '0'), 0)
    const totalCost = holdings.reduce((sum, h) => 
      sum + parseFloat(h.amount) * parseFloat(h.average_purchase_price_usd || h.cost_basis_usd || '0'), 0)

    const totalReturn = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0

    // Simplified annualized return (would need historical data for accuracy)
    const annualizedReturn = totalReturn // Placeholder

    const returns = holdings.map(h => parseFloat(h.profit_loss_percentage || '0'))
    const positiveReturns = returns.filter(r => r > 0)
    const negativeReturns = returns.filter(r => r < 0)

    return {
      totalReturn,
      annualizedReturn,
      bestPeriodReturn: returns.length > 0 ? Math.max(...returns) : 0,
      worstPeriodReturn: returns.length > 0 ? Math.min(...returns) : 0,
      winRate: returns.length > 0 ? (positiveReturns.length / returns.length) * 100 : 0,
      averageWin: positiveReturns.length > 0 ? 
        positiveReturns.reduce((sum, r) => sum + r, 0) / positiveReturns.length : 0,
      averageLoss: negativeReturns.length > 0 ? 
        negativeReturns.reduce((sum, r) => sum + r, 0) / negativeReturns.length : 0
    }
  }

  /**
   * Calculate allocation metrics
   */
  private static calculateAllocation(holdings: any[], totalValue: number) {
    const assetAllocation = holdings.map(h => {
      const value = parseFloat(h.current_value_usd || h.market_value_usd || '0')
      const percentage = (value / totalValue) * 100
      
      // Risk categorization based on crypto type/volatility
      let riskCategory: 'low' | 'medium' | 'high' = 'medium'
      const symbol = h.symbol.toUpperCase()
      
      if (['BTC', 'ETH'].includes(symbol)) {
        riskCategory = 'low'
      } else if (percentage > 20) {
        riskCategory = 'high'
      }

      return {
        symbol: h.symbol,
        percentage,
        value,
        riskCategory
      }
    }).sort((a, b) => b.percentage - a.percentage)

    // Simplified market cap allocation (would need market cap data)
    const marketCapAllocation = {
      largeCap: 60, // Assuming major cryptos
      midCap: 30,   // Assuming mid-tier cryptos
      smallCap: 10  // Assuming small cryptos
    }

    return {
      assetAllocation,
      marketCapAllocation
    }
  }

  /**
   * Calculate trends (simplified - would need historical data)
   */
  private static async calculateTrends(portfolioId: string) {
    const supabase = createClient()

    // Get recent activity
    const { data: activities } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('entity_type', 'portfolio_holding')
      .order('created_at', { ascending: false })
      .limit(50)

    const holdingChanges = (activities || []).map(activity => ({
      date: activity.created_at,
      action: activity.action.includes('add') ? 'buy' as const : 'sell' as const,
      symbol: activity.metadata?.symbol || 'Unknown',
      amount: activity.metadata?.amount || 0,
      price: activity.metadata?.price || 0
    }))

    // Simplified performance history (would need historical snapshots)
    const performanceHistory = [{
      date: new Date().toISOString(),
      totalValue: 0, // Would be calculated from historical data
      profitLoss: 0,
      profitLossPercentage: 0
    }]

    return {
      performanceHistory,
      holdingChanges
    }
  }

  /**
   * Generate recommendations
   */
  private static generateRecommendations(
    holdings: any[], 
    diversification: any, 
    riskMetrics: any, 
    performance: any
  ): PortfolioAnalytics['recommendations'] {
    const recommendations: PortfolioAnalytics['recommendations'] = []

    // Diversification recommendations
    if (diversification.concentrationRisk === 'high') {
      recommendations.push({
        type: 'diversification',
        priority: 'high',
        title: 'High Concentration Risk',
        description: `Your top holdings represent ${diversification.topHoldingsPercentage.toFixed(1)}% of your portfolio`,
        action: 'Consider reducing position sizes in your largest holdings',
        estimatedImpact: 'Reduce portfolio volatility by 15-20%'
      })
    }

    // Risk-based recommendations
    if (riskMetrics.volatility > 50) {
      recommendations.push({
        type: 'risk_reduction',
        priority: 'medium',
        title: 'High Portfolio Volatility',
        description: `Portfolio volatility is ${riskMetrics.volatility.toFixed(1)}%, above recommended levels`,
        action: 'Consider adding more stable assets like BTC or ETH',
        estimatedImpact: 'Reduce volatility to target range of 30-40%'
      })
    }

    // Performance-based recommendations
    if (performance.totalReturn > 100) {
      recommendations.push({
        type: 'profit_taking',
        priority: 'medium',
        title: 'Strong Performance',
        description: `Portfolio is up ${performance.totalReturn.toFixed(1)}% - consider taking profits`,
        action: 'Consider rebalancing to lock in gains',
        estimatedImpact: 'Secure profits while maintaining growth potential'
      })
    }

    // Rebalancing recommendations
    const needsRebalancing = holdings.some(h => {
      const percentage = parseFloat(h.current_value_usd || '0') / holdings.reduce((sum, holding) => 
        sum + parseFloat(holding.current_value_usd || '0'), 0) * 100
      return percentage > 40
    })

    if (needsRebalancing) {
      recommendations.push({
        type: 'rebalance',
        priority: 'low',
        title: 'Portfolio Rebalancing',
        description: 'Some positions have grown significantly relative to others',
        action: 'Consider rebalancing to maintain target allocations',
        estimatedImpact: 'Optimize risk-return profile'
      })
    }

    return recommendations
  }

  /**
   * Get empty analytics for portfolios with no holdings
   */
  private static getEmptyAnalytics(): PortfolioAnalytics {
    return {
      diversification: {
        herfindahlIndex: 0,
        effectiveNumberOfAssets: 0,
        concentrationRisk: 'low',
        topHoldingsPercentage: 0
      },
      riskMetrics: {
        volatility: 0,
        sharpeRatio: 0,
        beta: 0,
        valueAtRisk95: 0,
        maxDrawdown: 0,
        correlationScore: 0
      },
      performance: {
        totalReturn: 0,
        annualizedReturn: 0,
        bestPeriodReturn: 0,
        worstPeriodReturn: 0,
        winRate: 0,
        averageWin: 0,
        averageLoss: 0
      },
      allocation: {
        assetAllocation: [],
        marketCapAllocation: {
          largeCap: 0,
          midCap: 0,
          smallCap: 0
        }
      },
      trends: {
        performanceHistory: [],
        holdingChanges: []
      },
      recommendations: []
    }
  }
}
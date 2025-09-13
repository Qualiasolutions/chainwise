import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PortfolioService } from '@/lib/portfolio-service'
import { z } from 'zod'

const advancedAnalyticsSchema = z.object({
  includeRisk: z.string().optional().transform(val => val === 'true'),
  includePerformance: z.string().optional().transform(val => val === 'true'),
  includeCorrelations: z.string().optional().transform(val => val === 'true'),
  includeBenchmarks: z.string().optional().transform(val => val === 'true'),
  timeRange: z.enum(['1d', '7d', '30d', '90d', '1y']).default('30d'),
  benchmark: z.string().optional().default('bitcoin')
})

// GET /api/portfolio/[id]/advanced-analytics - Get advanced portfolio analytics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const {
      includeRisk,
      includePerformance,
      includeCorrelations,
      includeBenchmarks,
      timeRange,
      benchmark
    } = advancedAnalyticsSchema.parse(Object.fromEntries(searchParams))

    // Verify portfolio ownership
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select(`
        *,
        portfolio_holdings (*)
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    if (portfolio.portfolio_holdings.length === 0) {
      return NextResponse.json({
        portfolioId: params.id,
        message: 'No holdings found in portfolio',
        analytics: {
          riskMetrics: {
            concentration: 0,
            volatility: 0,
            diversification: 0,
            sharpeRatio: 0,
            maxDrawdown: 0,
            valueAtRisk: 0,
            beta: 1,
            correlationMatrix: []
          },
          performanceMetrics: {},
          correlations: [],
          benchmarks: {}
        }
      })
    }

    const analytics: any = {
      portfolioId: params.id,
      timestamp: new Date(),
      portfolioInfo: {
        name: portfolio.name,
        totalValue: portfolio.totalValueUsd.toNumber(),
        totalCost: portfolio.totalCostUsd.toNumber(),
        holdingsCount: portfolio.holdings.length
      }
    }

    // Advanced Risk Metrics
    if (includeRisk) {
      const riskMetrics: any = PortfolioService.calculateRiskMetrics(portfolio.holdings)

      // Add risk assessment
      riskMetrics.riskAssessment = getRiskAssessment(riskMetrics)
      riskMetrics.recommendations = generateRiskRecommendations(riskMetrics)

      analytics.riskMetrics = riskMetrics
    }

    // Performance Metrics
    if (includePerformance) {
      analytics.performanceMetrics = {
        totalReturn: portfolio.totalValueUsd.toNumber() - portfolio.totalCostUsd.toNumber(),
        totalReturnPercentage: portfolio.totalCostUsd.toNumber() > 0
          ? ((portfolio.totalValueUsd.toNumber() - portfolio.totalCostUsd.toNumber()) / portfolio.totalCostUsd.toNumber()) * 100
          : 0,
        dailyReturns: portfolio.holdings.map(h => ({
          symbol: h.symbol,
          dailyReturn: h.profitLossPercentage?.toNumber() || 0
        })),
        bestPerformer: portfolio.holdings.reduce((best, current) => {
          const currentReturn = current.profitLossPercentage?.toNumber() || 0
          const bestReturn = best.profitLossPercentage?.toNumber() || 0
          return currentReturn > bestReturn ? current : best
        }),
        worstPerformer: portfolio.holdings.reduce((worst, current) => {
          const currentReturn = current.profitLossPercentage?.toNumber() || 0
          const worstReturn = worst.profitLossPercentage?.toNumber() || 0
          return currentReturn < worstReturn ? current : worst
        }),
        volatilityDistribution: calculateVolatilityDistribution(portfolio.holdings)
      }
    }

    // Correlation Analysis
    if (includeCorrelations && portfolio.holdings.length > 1) {
      analytics.correlations = {
        matrix: PortfolioService.calculateRiskMetrics(portfolio.holdings).correlationMatrix,
        highlyCorrelated: findHighlyCorrelatedAssets(portfolio.holdings),
        diversificationScore: calculateDiversificationScore(portfolio.holdings)
      }
    }

    // Benchmark Comparisons
    if (includeBenchmarks) {
      analytics.benchmarks = {
        benchmarkSymbol: benchmark,
        portfolioVsBenchmark: await calculateBenchmarkComparison(portfolio, benchmark, timeRange),
        percentileRanking: await calculatePercentileRanking(portfolio.holdings)
      }
    }

    // Asset Allocation Analysis
    analytics.assetAllocation = {
      byValue: portfolio.holdings.map(h => ({
        symbol: h.symbol,
        name: h.name,
        value: h.currentValueUsd?.toNumber() || 0,
        percentage: portfolio.totalValueUsd.toNumber() > 0 && h.currentValueUsd
          ? (h.currentValueUsd.toNumber() / portfolio.totalValueUsd.toNumber()) * 100
          : 0,
        cost: h.amount.toNumber() * h.averagePurchasePriceUsd.toNumber(),
        unrealizedPnL: h.profitLossUsd?.toNumber() || 0
      })),
      sectorAllocation: calculateSectorAllocation(portfolio.holdings),
      riskContribution: calculateRiskContribution(portfolio.holdings)
    }

    // Performance Attribution
    analytics.performanceAttribution = {
      topContributors: portfolio.holdings
        .map(h => ({
          symbol: h.symbol,
          contribution: h.profitLossUsd?.toNumber() || 0,
          contributionPercentage: portfolio.totalValueUsd.toNumber() > 0
            ? ((h.profitLossUsd?.toNumber() || 0) / portfolio.totalValueUsd.toNumber()) * 100
            : 0
        }))
        .sort((a, b) => b.contribution - a.contribution)
        .slice(0, 5),
      attributionByTime: await calculateAttributionByTime(portfolio, timeRange)
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error getting advanced analytics:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid query parameters',
        details: error.errors
      }, { status: 400 })
    }
    
    return NextResponse.json({
      error: 'Failed to get advanced analytics'
    }, { status: 500 })
  }
}

// Helper Functions
function getRiskAssessment(riskMetrics: any) {
  let overallRisk = 'low'
  let score = 0

  // Concentration risk
  if (riskMetrics.concentration > 70) {
    score += 3
    overallRisk = 'high'
  } else if (riskMetrics.concentration > 40) {
    score += 2
    overallRisk = 'medium'
  } else {
    score += 1
  }

  // Volatility risk
  if (riskMetrics.volatility > 50) {
    score += 3
    overallRisk = 'high'
  } else if (riskMetrics.volatility > 25) {
    score += 2
    if (overallRisk !== 'high') overallRisk = 'medium'
  } else {
    score += 1
  }

  // Diversification risk
  if (riskMetrics.diversification < 3) {
    score += 3
    overallRisk = 'high'
  } else if (riskMetrics.diversification < 5) {
    score += 2
    if (overallRisk !== 'high') overallRisk = 'medium'
  } else {
    score += 1
  }

  return {
    overallRisk,
    score: Math.round((score / 9) * 100),
    factors: {
      concentration: riskMetrics.concentration > 40 ? 'high' : riskMetrics.concentration > 20 ? 'medium' : 'low',
      volatility: riskMetrics.volatility > 25 ? 'high' : riskMetrics.volatility > 15 ? 'medium' : 'low',
      diversification: riskMetrics.diversification < 5 ? 'high' : riskMetrics.diversification < 10 ? 'medium' : 'low'
    }
  }
}

function generateRiskRecommendations(riskMetrics: any) {
  const recommendations = []

  if (riskMetrics.concentration > 60) {
    recommendations.push({
      type: 'concentration',
      priority: 'high',
      message: 'High concentration risk detected. Consider diversifying across more assets.',
      action: 'Add 2-3 new holdings to reduce concentration below 50%'
    })
  }

  if (riskMetrics.volatility > 40) {
    recommendations.push({
      type: 'volatility',
      priority: 'high',
      message: 'Portfolio shows high volatility. Consider adding stable assets.',
      action: 'Add defensive holdings like large-cap cryptocurrencies or stablecoins'
    })
  }

  if (riskMetrics.diversification < 5) {
    recommendations.push({
      type: 'diversification',
      priority: 'medium',
      message: 'Limited diversification may increase risk.',
      action: 'Aim for at least 5-7 different assets for better diversification'
    })
  }

  if (riskMetrics.sharpeRatio < 1) {
    recommendations.push({
      type: 'sharpe_ratio',
      priority: 'medium',
      message: 'Risk-adjusted returns could be improved.',
      action: 'Consider assets with better risk-reward profiles'
    })
  }

  return recommendations
}

function calculateVolatilityDistribution(holdings: any[]) {
  const volatilityBuckets = {
    low: 0,      // 0-10%
    medium: 0,   // 10-25%
    high: 0,     // 25-50%
    extreme: 0   // >50%
  }

  holdings.forEach(holding => {
    const volatility = Math.abs(holding.profitLossPercentage?.toNumber() || 0)

    if (volatility <= 10) volatilityBuckets.low++
    else if (volatility <= 25) volatilityBuckets.medium++
    else if (volatility <= 50) volatilityBuckets.high++
    else volatilityBuckets.extreme++
  })

  return volatilityBuckets
}

function findHighlyCorrelatedAssets(holdings: any[]) {
  const highlyCorrelated = []

  // Simplified correlation analysis
  for (let i = 0; i < holdings.length; i++) {
    for (let j = i + 1; j < holdings.length; j++) {
      // In production, this would use actual correlation calculations
      const correlation = 0.3 // Simplified assumption

      if (correlation > 0.7) {
        highlyCorrelated.push({
          asset1: holdings[i].symbol,
          asset2: holdings[j].symbol,
          correlation: correlation
        })
      }
    }
  }

  return highlyCorrelated
}

function calculateDiversificationScore(holdings: any[]) {
  const totalValue = holdings.reduce((sum, h) => sum + h.currentValueUsd.toNumber(), 0)
  const weights = holdings.map(h => h.currentValueUsd.toNumber() / totalValue)

  // Calculate effective number of assets (inverse of Herfindahl-Hirschman Index)
  const hhi = weights.reduce((sum, weight) => sum + (weight * weight), 0)
  const effectiveAssets = 1 / hhi

  // Score from 0-100 based on diversification
  return Math.min(100, (effectiveAssets / holdings.length) * 100)
}

async function calculateBenchmarkComparison(portfolio: any, benchmark: string, timeRange: string) {
  // Simplified benchmark comparison
  // In production, this would fetch historical data
  const portfolioReturn = portfolio.totalCostUsd.toNumber() > 0
    ? ((portfolio.totalValueUsd.toNumber() - portfolio.totalCostUsd.toNumber()) / portfolio.totalCostUsd.toNumber()) * 100
    : 0

  // Mock benchmark return based on time range
  const benchmarkReturns = {
    '1d': 2.5,
    '7d': -1.2,
    '30d': 15.8,
    '90d': 45.2,
    '1y': 120.5
  }

  const benchmarkReturn = benchmarkReturns[timeRange as keyof typeof benchmarkReturns] || 0

  return {
    portfolioReturn,
    benchmarkReturn,
    outperformance: portfolioReturn - benchmarkReturn,
    status: portfolioReturn > benchmarkReturn ? 'outperforming' :
             portfolioReturn < benchmarkReturn ? 'underperforming' : 'matching'
  }
}

async function calculatePercentileRanking(holdings: any[]) {
  // Simplified percentile calculation
  // In production, this would compare against a larger dataset
  const returns = holdings.map(h => h.profitLossPercentage?.toNumber() || 0)
  const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length

  // Mock percentile based on average return
  let percentile = 50
  if (avgReturn > 20) percentile = 80
  else if (avgReturn > 10) percentile = 65
  else if (avgReturn > 0) percentile = 55
  else if (avgReturn > -10) percentile = 35
  else percentile = 20

  return {
    percentile,
    ranking: percentile >= 75 ? 'top-quartile' :
             percentile >= 50 ? 'above-average' :
             percentile >= 25 ? 'below-average' : 'bottom-quartile'
  }
}

function calculateSectorAllocation(holdings: any[]) {
  // Simplified sector allocation based on symbol patterns
  const sectors = {
    'layer-1': ['btc', 'eth', 'ada', 'sol', 'dot'],
    'defi': ['uni', 'aave', 'comp', 'mkr', 'snx'],
    'exchange': ['bnb', 'okb', 'ht', 'cro'],
    'privacy': ['xmr', 'zec', 'dcr'],
    'other': []
  }

  const allocation = {
    'layer-1': 0,
    'defi': 0,
    'exchange': 0,
    'privacy': 0,
    'other': 0
  }

  holdings.forEach(holding => {
    const symbol = holding.symbol.toLowerCase()
    let sector = 'other'

    for (const [sectorName, symbols] of Object.entries(sectors)) {
      if ((symbols as string[]).includes(symbol as string)) {
        sector = sectorName
        break
      }
    }

    (allocation as any)[sector] += holding.currentValueUsd?.toNumber() || 0
  })

  return allocation
}

function calculateRiskContribution(holdings: any[]) {
  const totalValue = holdings.reduce((sum, h) => sum + h.currentValueUsd.toNumber(), 0)

  return holdings.map(holding => {
    const weight = holding.currentValueUsd.toNumber() / totalValue
    const volatility = Math.abs(holding.profitLossPercentage?.toNumber() || 0)
    const riskContribution = weight * volatility

    return {
      symbol: holding.symbol,
      weight: weight * 100,
      volatility,
      riskContribution
    }
  }).sort((a, b) => b.riskContribution - a.riskContribution)
}

async function calculateAttributionByTime(portfolio: any, timeRange: string) {
  // Simplified time-based attribution
  // In production, this would use historical portfolio snapshots
  const periods = {
    '1d': { contribution: 2.1, drivers: ['Bitcoin', 'Ethereum'] },
    '7d': { contribution: -1.5, drivers: ['Altcoins', 'Market sentiment'] },
    '30d': { contribution: 18.3, drivers: ['DeFi sector', 'Bitcoin ETF news'] },
    '90d': { contribution: 42.7, drivers: ['Bull market', 'Layer 1 growth'] },
    '1y': { contribution: 115.2, drivers: ['Market recovery', 'Institutional adoption'] }
  }

  return periods[timeRange as keyof typeof periods] || periods['30d']
}

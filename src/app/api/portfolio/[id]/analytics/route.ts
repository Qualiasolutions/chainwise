import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PortfolioService } from '@/lib/portfolio-service'
import { z } from 'zod'

const analyticsQuerySchema = z.object({
  days: z.string().optional().transform(val => parseInt(val || '30')),
  includeRisk: z.string().optional().transform(val => val === 'true'),
  includeRebalancing: z.string().optional().transform(val => val === 'true')
})

// GET /api/portfolio/[id]/analytics - Get portfolio analytics and P&L data
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
    const { days, includeRisk, includeRebalancing } = analyticsQuerySchema.parse(
      Object.fromEntries(searchParams)
    )

    // Verify portfolio ownership
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Get basic portfolio stats (with latest prices)
    const portfolioStats = await PortfolioService.updatePortfolioValues(params.id)

    // Build analytics response
    const analytics: any = {
      portfolioStats,
      timestamp: new Date(),
      portfolioId: params.id
    }

    // Add performance history if requested
    if (days > 0) {
      analytics.performance = await PortfolioService.getPortfolioPerformance(params.id, days)
    }

    // Add risk metrics if requested
    if (includeRisk && portfolio.holdings.length > 0) {
      analytics.riskMetrics = PortfolioService.calculateRiskMetrics(portfolio.holdings)
    }

    // Add rebalancing suggestions if requested
    if (includeRebalancing && portfolio.holdings.length > 0) {
      analytics.rebalancingSuggestions = PortfolioService.generateRebalancingSuggestions(
        portfolio.holdings
      )
    }

    // Add P&L breakdown by asset
    const plBreakdown = portfolio.holdings.map(holding => ({
      cryptoId: holding.cryptoId,
      symbol: holding.symbol,
      name: holding.name,
      amount: holding.amount.toNumber(),
      averagePrice: holding.averagePurchasePriceUsd.toNumber(),
      currentPrice: holding.currentPriceUsd?.toNumber() || 0,
      currentValue: holding.currentValueUsd?.toNumber() || 0,
      costBasis: holding.amount.toNumber() * holding.averagePurchasePriceUsd.toNumber(),
      profitLoss: holding.profitLossUsd?.toNumber() || 0,
      profitLossPercentage: holding.profitLossPercentage?.toNumber() || 0,
      allocation: portfolioStats.totalValue > 0 && holding.currentValueUsd
        ? (holding.currentValueUsd.toNumber() / portfolioStats.totalValue) * 100 
        : 0
    }))

    analytics.plBreakdown = plBreakdown

    // Add portfolio allocation visualization data
    analytics.allocationChart = portfolioStats.assetAllocation

    // Calculate additional metrics
    const totalGain = plBreakdown.filter(h => h.profitLoss > 0).length
    const totalLoss = plBreakdown.filter(h => h.profitLoss < 0).length
    const winRate = plBreakdown.length > 0 ? (totalGain / plBreakdown.length) * 100 : 0

    analytics.metrics = {
      totalAssets: plBreakdown.length,
      profitableAssets: totalGain,
      losingAssets: totalLoss,
      winRate: winRate,
      averageReturn: plBreakdown.length > 0 
        ? plBreakdown.reduce((sum, h) => sum + h.profitLossPercentage, 0) / plBreakdown.length 
        : 0
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error getting analytics:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid query parameters',
        details: error.errors
      }, { status: 400 })
    }
    
    return NextResponse.json({
      error: 'Failed to get analytics'
    }, { status: 500 })
  }
}
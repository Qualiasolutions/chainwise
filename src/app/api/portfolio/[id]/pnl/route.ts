import { NextRequest, NextResponse } from 'next/server'
// REMOVED: import { auth } from '@/auth-stub'
// REMOVED: import { prisma } from '@/lib/db'
import { z } from 'zod'

const pnlQuerySchema = z.object({
  period: z.enum(['1d', '7d', '30d', '90d', '1y']).optional().default('30d'),
  groupBy: z.enum(['day', 'week', 'month']).optional().default('day'),
  includeRealized: z.string().optional().transform(val => val === 'true')
})

// GET /api/portfolio/[id]/pnl - Get P&L tracking data
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const { period, groupBy, includeRealized } = pnlQuerySchema.parse(
      Object.fromEntries(searchParams)
    )

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

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (period) {
      case '1d':
        startDate.setDate(endDate.getDate() - 1)
        break
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
    }

    // Get current P&L snapshot
    const currentPnL = {
      totalValue: portfolio.totalValueUsd.toNumber(),
      totalCost: portfolio.totalCostUsd.toNumber(),
      totalPnL: portfolio.totalValueUsd.toNumber() - portfolio.totalCostUsd.toNumber(),
      totalPnLPercentage: portfolio.totalCostUsd.toNumber() > 0 
        ? ((portfolio.totalValueUsd.toNumber() - portfolio.totalCostUsd.toNumber()) / portfolio.totalCostUsd.toNumber()) * 100 
        : 0,
      timestamp: new Date()
    }

    // Get holdings P&L breakdown
    const holdingsPnL = portfolio.holdings.map(holding => ({
      id: holding.id,
      cryptoId: holding.cryptoId,
      symbol: holding.symbol,
      name: holding.name,
      amount: holding.amount.toNumber(),
      averagePrice: holding.averagePurchasePriceUsd.toNumber(),
      currentPrice: holding.currentPriceUsd?.toNumber() || 0,
      costBasis: holding.amount.toNumber() * holding.averagePurchasePriceUsd.toNumber(),
      currentValue: holding.currentValueUsd?.toNumber() || 0,
      unrealizedPnL: holding.profitLossUsd?.toNumber() || 0,
      unrealizedPnLPercentage: holding.profitLossPercentage?.toNumber() || 0,
      lastUpdated: holding.lastUpdated
    }))

    // Calculate P&L by category
    const profitableHoldings = holdingsPnL.filter(h => h.unrealizedPnL > 0)
    const losingHoldings = holdingsPnL.filter(h => h.unrealizedPnL < 0)
    
    const pnlSummary = {
      current: currentPnL,
      holdings: holdingsPnL,
      summary: {
        totalHoldings: holdingsPnL.length,
        profitableHoldings: profitableHoldings.length,
        losingHoldings: losingHoldings.length,
        totalProfit: profitableHoldings.reduce((sum, h) => sum + h.unrealizedPnL, 0),
        totalLoss: losingHoldings.reduce((sum, h) => sum + h.unrealizedPnL, 0),
        winRate: holdingsPnL.length > 0 ? (profitableHoldings.length / holdingsPnL.length) * 100 : 0,
        bestPerformer: holdingsPnL.sort((a, b) => b.unrealizedPnLPercentage - a.unrealizedPnLPercentage)[0] || null,
        worstPerformer: holdingsPnL.sort((a, b) => a.unrealizedPnLPercentage - b.unrealizedPnLPercentage)[0] || null
      }
    }

    // TODO: In the future, implement historical P&L tracking by storing daily snapshots
    // For now, we'll return current data with a note about historical tracking
    const response = {
      ...pnlSummary,
      period,
      groupBy,
      dateRange: {
        start: startDate,
        end: endDate
      },
      note: "Historical P&L tracking will be available once daily snapshots are implemented. Currently showing real-time unrealized P&L."
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching P&L data:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid query parameters',
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Failed to fetch P&L data' 
    }, { status: 500 })
  }
}
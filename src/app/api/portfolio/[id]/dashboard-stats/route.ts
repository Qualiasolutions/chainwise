import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PortfolioService } from '@/lib/portfolio-service'

interface DashboardStats {
  overview: {
    totalValue: number
    totalCost: number
    profitLoss: number
    profitLossPercentage: number
    dayChange: number
    dayChangePercentage: number
  }
  topHoldings: Array<{
    id: string
    symbol: string
    name: string
    amount: number
    currentPrice: number
    marketValue: number
    profitLoss: number
    profitLossPercentage: number
    allocation: number
  }>
  performanceMetrics: {
    bestPerformer: {
      symbol: string
      profitLossPercentage: number
    } | null
    worstPerformer: {
      symbol: string
      profitLossPercentage: number
    } | null
    averagePerformance: number
  }
  diversification: Array<{
    symbol: string
    allocation: number
    value: number
    risk: 'low' | 'medium' | 'high'
  }>
  recentActivity: Array<{
    action: string
    symbol: string
    timestamp: string
    value: number
  }>
}

// GET /api/portfolio/[id]/dashboard-stats - Get comprehensive portfolio dashboard stats
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify portfolio ownership
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select(`
        *,
        portfolio_holdings(*)
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('entity_type', 'portfolio_holding')
      .order('created_at', { ascending: false })
      .limit(10)

    const holdings = portfolio.portfolio_holdings || []
    
    if (holdings.length === 0) {
      // Return empty stats for portfolio with no holdings
      const emptyStats: DashboardStats = {
        overview: {
          totalValue: 0,
          totalCost: 0,
          profitLoss: 0,
          profitLossPercentage: 0,
          dayChange: 0,
          dayChangePercentage: 0
        },
        topHoldings: [],
        performanceMetrics: {
          bestPerformer: null,
          worstPerformer: null,
          averagePerformance: 0
        },
        diversification: [],
        recentActivity: recentActivity?.map(activity => ({
          action: activity.action,
          symbol: activity.metadata?.symbol || 'Unknown',
          timestamp: activity.created_at,
          value: activity.metadata?.price || 0
        })) || []
      }
      
      return NextResponse.json(emptyStats)
    }

    // Calculate overview stats
    const totalValue = holdings.reduce((sum, h) => sum + parseFloat(h.current_value_usd || h.market_value_usd || '0'), 0)
    const totalCost = holdings.reduce((sum, h) => sum + (parseFloat(h.amount) * parseFloat(h.average_purchase_price_usd || h.cost_basis_usd || '0')), 0)
    const profitLoss = totalValue - totalCost
    const profitLossPercentage = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0

    // Calculate day change (simplified - would need historical data for accurate calculation)
    const dayChange = holdings.reduce((sum, h) => {
      const currentValue = parseFloat(h.current_value_usd || h.market_value_usd || '0')
      // Estimate 24h change based on current market conditions
      return sum + (currentValue * 0.02) // Placeholder: 2% average daily volatility
    }, 0)
    const dayChangePercentage = totalValue > 0 ? (dayChange / totalValue) * 100 : 0

    // Process top holdings
    const topHoldings = holdings
      .map(h => {
        const marketValue = parseFloat(h.current_value_usd || h.market_value_usd || '0')
        const costBasis = parseFloat(h.amount) * parseFloat(h.average_purchase_price_usd || h.cost_basis_usd || '0')
        const holdingProfitLoss = marketValue - costBasis
        const holdingProfitLossPercentage = costBasis > 0 ? (holdingProfitLoss / costBasis) * 100 : 0
        
        return {
          id: h.id,
          symbol: h.symbol,
          name: h.name || h.symbol,
          amount: parseFloat(h.amount),
          currentPrice: parseFloat(h.current_price_usd || '0'),
          marketValue,
          profitLoss: holdingProfitLoss,
          profitLossPercentage: holdingProfitLossPercentage,
          allocation: totalValue > 0 ? (marketValue / totalValue) * 100 : 0
        }
      })
      .sort((a, b) => b.marketValue - a.marketValue)
      .slice(0, 10)

    // Calculate performance metrics
    const performances = topHoldings.map(h => h.profitLossPercentage)
    const bestPerformer = topHoldings.length > 0 ? 
      topHoldings.reduce((best, current) => 
        current.profitLossPercentage > (best?.profitLossPercentage || -Infinity) ? current : best
      ) : null
      
    const worstPerformer = topHoldings.length > 0 ?
      topHoldings.reduce((worst, current) => 
        current.profitLossPercentage < (worst?.profitLossPercentage || Infinity) ? current : worst
      ) : null

    const averagePerformance = performances.length > 0 ? 
      performances.reduce((sum, perf) => sum + perf, 0) / performances.length : 0

    // Calculate diversification (risk assessment based on allocation)
    const diversification = topHoldings.map(h => ({
      symbol: h.symbol,
      allocation: h.allocation,
      value: h.marketValue,
      risk: h.allocation > 40 ? 'high' : h.allocation > 20 ? 'medium' : 'low' as const
    }))

    const dashboardStats: DashboardStats = {
      overview: {
        totalValue,
        totalCost,
        profitLoss,
        profitLossPercentage,
        dayChange,
        dayChangePercentage
      },
      topHoldings,
      performanceMetrics: {
        bestPerformer: bestPerformer ? {
          symbol: bestPerformer.symbol,
          profitLossPercentage: bestPerformer.profitLossPercentage
        } : null,
        worstPerformer: worstPerformer ? {
          symbol: worstPerformer.symbol,
          profitLossPercentage: worstPerformer.profitLossPercentage
        } : null,
        averagePerformance
      },
      diversification,
      recentActivity: recentActivity?.map(activity => ({
        action: activity.action,
        symbol: activity.metadata?.symbol || 'Unknown',
        timestamp: activity.created_at,
        value: activity.metadata?.price || 0
      })) || []
    }

    return NextResponse.json(dashboardStats)

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch dashboard stats' 
    }, { status: 500 })
  }
}
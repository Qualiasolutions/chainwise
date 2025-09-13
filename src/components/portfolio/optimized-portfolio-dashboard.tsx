'use client'

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wallet, Plus, TrendingUp, TrendingDown, DollarSign,
  PieChart, AlertCircle, RefreshCw, BarChart3, Target,
  Loader2, Activity, Award
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { usePerformanceMonitor, useApiPerformanceMonitor } from '@/hooks/use-performance-monitor'
import { logger } from '@/lib/enhanced-logger'
import { securityManager } from '@/lib/security-manager'
import EnhancedErrorBoundary from '@/components/enhanced-error-boundary'
import PortfolioHoldingsTable from './portfolio-holdings-table'

interface Portfolio {
  id: string
  name: string
  description?: string
  is_default: boolean
  total_value_usd: number
  total_cost_usd: number
  last_updated: string
  created_at: string
  updated_at: string
}

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

interface OptimizedPortfolioDashboardProps {
  onCreatePortfolio: () => void
  onAddHolding: (portfolioId: string) => void
  onEditHolding?: (holding: any) => void
  onDeleteHolding?: (holdingId: string) => void
}

// Memoized components for better performance
const PerformanceCard = memo(({ 
  title, 
  value, 
  change, 
  changePercent, 
  icon: Icon,
  trend 
}: {
  title: string
  value: string
  change: string
  changePercent: string
  icon: React.ElementType
  trend: 'up' | 'down' | 'neutral'
}) => {
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden"
    >
      <Card className="h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {value}
          </div>
          <div className={`text-xs flex items-center ${trendColor}`}>
            <TrendIcon className="h-3 w-3 mr-1" />
            {change} ({changePercent})
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
})

PerformanceCard.displayName = 'PerformanceCard'

const PortfolioSelector = memo(({ 
  portfolios, 
  selectedPortfolio, 
  onSelect, 
  loading 
}: {
  portfolios: Portfolio[]
  selectedPortfolio: Portfolio | null
  onSelect: (portfolio: Portfolio) => void
  loading: boolean
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  return (
    <ScrollArea className="h-24">
      <div className="flex space-x-4 pb-4">
        {portfolios.map((portfolio) => (
          <motion.button
            key={portfolio.id}
            onClick={() => onSelect(portfolio)}
            className={`flex-shrink-0 p-3 rounded-lg border-2 transition-all ${
              selectedPortfolio?.id === portfolio.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-left">
              <div className="font-semibold text-sm">{portfolio.name}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                ${portfolio.total_value_usd.toLocaleString()}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </ScrollArea>
  )
})

PortfolioSelector.displayName = 'PortfolioSelector'

function OptimizedPortfolioDashboard({ 
  onCreatePortfolio, 
  onAddHolding,
  onEditHolding,
  onDeleteHolding
}: OptimizedPortfolioDashboardProps) {
  const { 
    startRenderMeasurement, 
    endRenderMeasurement, 
    checkRerenderReason,
    metrics 
  } = usePerformanceMonitor('OptimizedPortfolioDashboard')
  
  const { monitorApiCall } = useApiPerformanceMonitor()

  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Performance monitoring
  React.useLayoutEffect(() => {
    startRenderMeasurement()
    checkRerenderReason({ 
      portfolios: portfolios.length, 
      selectedPortfolio: selectedPortfolio?.id,
      loading,
      refreshing,
      error 
    })
    
    const timeoutId = setTimeout(endRenderMeasurement, 0)
    return () => clearTimeout(timeoutId)
  })

  // Memoized calculations
  const portfolioSummary = useMemo(() => {
    if (portfolios.length === 0) return null

    const totalValue = portfolios.reduce((sum, p) => sum + p.total_value_usd, 0)
    const totalCost = portfolios.reduce((sum, p) => sum + p.total_cost_usd, 0)
    const profitLoss = totalValue - totalCost
    const profitLossPercentage = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0

    return {
      totalValue,
      totalCost,
      profitLoss,
      profitLossPercentage,
      portfolioCount: portfolios.length
    }
  }, [portfolios])

  const loadPortfolios = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const portfolioData = await monitorApiCall(
        '/api/portfolio?includeHoldings=true',
        'GET',
        async () => {
          const response = await fetch('/api/portfolio?includeHoldings=true')
          
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to fetch portfolios')
          }
          
          return response.json()
        }
      )
      
      const portfolioList = portfolioData.portfolios || []
      setPortfolios(portfolioList)
      setLastUpdated(new Date())
      
      // Auto-select first portfolio if none selected
      if (portfolioList.length > 0 && !selectedPortfolio) {
        setSelectedPortfolio(portfolioList[0])
      }
      
      logger.info('Portfolios loaded successfully', {
        count: portfolioList.length,
        totalValue: portfolioList.reduce((sum: number, p: Portfolio) => sum + p.total_value_usd, 0)
      })
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load portfolios'
      setError(message)
      logger.error('Failed to load portfolios', error as Error)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [selectedPortfolio, monitorApiCall])

  const loadDashboardStats = useCallback(async () => {
    if (!selectedPortfolio) return
    
    try {
      const stats = await monitorApiCall(
        `/api/portfolio/${selectedPortfolio.id}/dashboard-stats`,
        'GET',
        async () => {
          const response = await fetch(`/api/portfolio/${selectedPortfolio.id}/dashboard-stats`)
          
          if (!response.ok) {
            throw new Error('Failed to fetch dashboard stats')
          }
          
          return response.json()
        }
      )
      
      setDashboardStats(stats)
      logger.debug('Dashboard stats loaded', { portfolioId: selectedPortfolio.id })
      
    } catch (error) {
      logger.error('Error loading dashboard stats', error as Error, {
        portfolioId: selectedPortfolio.id
      })
      // Don't show error toast for stats - it's supplementary data
    }
  }, [selectedPortfolio, monitorApiCall])

  const handleRefresh = useCallback(async () => {
    if (refreshing) return
    
    setRefreshing(true)
    logger.info('Refreshing portfolio data')
    
    try {
      await Promise.all([
        loadPortfolios(),
        selectedPortfolio ? loadDashboardStats() : Promise.resolve()
      ])
      
      toast.success('Portfolio data refreshed')
      setLastUpdated(new Date())
    } catch (error) {
      logger.error('Failed to refresh portfolio data', error as Error)
      toast.error('Failed to refresh portfolio data')
    } finally {
      setRefreshing(false)
    }
  }, [refreshing, loadPortfolios, selectedPortfolio, loadDashboardStats])

  const handlePortfolioSelect = useCallback((portfolio: Portfolio) => {
    if (portfolio.id !== selectedPortfolio?.id) {
      setSelectedPortfolio(portfolio)
      setDashboardStats(null) // Clear old stats immediately
      logger.info('Portfolio selected', { portfolioId: portfolio.id, name: portfolio.name })
    }
  }, [selectedPortfolio?.id])

  // Effects
  useEffect(() => {
    loadPortfolios()
  }, [loadPortfolios])

  useEffect(() => {
    if (selectedPortfolio) {
      loadDashboardStats()
    }
  }, [selectedPortfolio, loadDashboardStats])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!refreshing) {
        handleRefresh()
      }
    }, 300000) // 5 minutes

    return () => clearInterval(interval)
  }, [handleRefresh, refreshing])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your portfolios...</p>
        </div>
      </div>
    )
  }

  if (error && portfolios.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Failed to Load Portfolios
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <Button onClick={loadPortfolios} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  if (portfolios.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Portfolios Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          Create your first portfolio to start tracking your cryptocurrency investments 
          and get insights into your portfolio performance.
        </p>
        <Button onClick={onCreatePortfolio} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Create Your First Portfolio
        </Button>
      </motion.div>
    )
  }

  return (
    <EnhancedErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Portfolio Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              AI-powered insights and portfolio management
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-gray-500">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={onCreatePortfolio}>
              <Plus className="w-4 h-4 mr-2" />
              New Portfolio
            </Button>
          </div>
        </div>

        {/* Portfolio Overview */}
        {portfolioSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PerformanceCard
              title="Total Portfolio Value"
              value={`$${portfolioSummary.totalValue.toLocaleString()}`}
              change={`$${portfolioSummary.profitLoss.toLocaleString()}`}
              changePercent={`${portfolioSummary.profitLossPercentage.toFixed(2)}%`}
              icon={DollarSign}
              trend={portfolioSummary.profitLoss >= 0 ? 'up' : 'down'}
            />
            <PerformanceCard
              title="Total Invested"
              value={`$${portfolioSummary.totalCost.toLocaleString()}`}
              change="Cost Basis"
              changePercent=""
              icon={Target}
              trend="neutral"
            />
            <PerformanceCard
              title="Unrealized P/L"
              value={`$${portfolioSummary.profitLoss.toLocaleString()}`}
              change={`${portfolioSummary.profitLossPercentage.toFixed(2)}%`}
              changePercent="Return"
              icon={portfolioSummary.profitLoss >= 0 ? TrendingUp : TrendingDown}
              trend={portfolioSummary.profitLoss >= 0 ? 'up' : 'down'}
            />
            <PerformanceCard
              title="Active Portfolios"
              value={portfolioSummary.portfolioCount.toString()}
              change="Portfolios"
              changePercent=""
              icon={PieChart}
              trend="neutral"
            />
          </div>
        )}

        {/* Portfolio Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Select Portfolio
            </CardTitle>
            <CardDescription>
              Choose a portfolio to view detailed holdings and analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PortfolioSelector
              portfolios={portfolios}
              selectedPortfolio={selectedPortfolio}
              onSelect={handlePortfolioSelect}
              loading={false}
            />
          </CardContent>
        </Card>

        {/* Selected Portfolio Details */}
        {selectedPortfolio && (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedPortfolio.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Portfolio Actions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedPortfolio.name}</CardTitle>
                      <CardDescription>
                        {selectedPortfolio.description || 'No description provided'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedPortfolio.is_default && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                      <Button onClick={() => onAddHolding(selectedPortfolio.id)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Holding
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${selectedPortfolio.total_value_usd.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Current Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        ${selectedPortfolio.total_cost_usd.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Invested</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        (selectedPortfolio.total_value_usd - selectedPortfolio.total_cost_usd) >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        ${(selectedPortfolio.total_value_usd - selectedPortfolio.total_cost_usd).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Unrealized P/L</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Portfolio Holdings */}
              <PortfolioHoldingsTable
                portfolioId={selectedPortfolio.id}
                onEdit={onEditHolding}
                onDelete={onDeleteHolding}
              />

              {/* Performance Metrics */}
              {dashboardStats && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Performance Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {dashboardStats.performanceMetrics.bestPerformer && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Best Performer</span>
                          <div className="text-right">
                            <div className="font-semibold">
                              {dashboardStats.performanceMetrics.bestPerformer.symbol}
                            </div>
                            <div className="text-sm text-green-600">
                              +{dashboardStats.performanceMetrics.bestPerformer.profitLossPercentage.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {dashboardStats.performanceMetrics.worstPerformer && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Worst Performer</span>
                          <div className="text-right">
                            <div className="font-semibold">
                              {dashboardStats.performanceMetrics.worstPerformer.symbol}
                            </div>
                            <div className="text-sm text-red-600">
                              {dashboardStats.performanceMetrics.worstPerformer.profitLossPercentage.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Average Performance</span>
                        <div className={`text-sm font-semibold ${
                          dashboardStats.performanceMetrics.averagePerformance >= 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {dashboardStats.performanceMetrics.averagePerformance.toFixed(2)}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Top Holdings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dashboardStats.topHoldings.slice(0, 5).map((holding, index) => (
                          <div key={holding.id} className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-medium text-gray-600">
                                #{index + 1}
                              </div>
                              <div>
                                <div className="font-semibold">{holding.symbol}</div>
                                <div className="text-sm text-gray-600">
                                  {holding.allocation.toFixed(1)}% allocation
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">
                                ${holding.marketValue.toLocaleString()}
                              </div>
                              <div className={`text-sm ${
                                holding.profitLossPercentage >= 0 
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                              }`}>
                                {holding.profitLossPercentage >= 0 ? '+' : ''}
                                {holding.profitLossPercentage.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Performance Debug Info (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="border-dashed border-gray-300">
            <CardHeader>
              <CardTitle className="text-sm">Performance Debug</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-1">
                <div>Render Time: {metrics.renderTime.toFixed(2)}ms</div>
                <div>Rerenders: {metrics.rerenderCount}</div>
                <div>Memory: {metrics.memoryUsage ? `${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB` : 'N/A'}</div>
                <div>Last Updated: {lastUpdated?.toLocaleTimeString()}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </EnhancedErrorBoundary>
  )
}

export default memo(OptimizedPortfolioDashboard)
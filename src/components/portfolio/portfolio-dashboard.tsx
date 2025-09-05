'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import Link from 'next/link'
import { 
  Wallet, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  PieChart,
  AlertCircle,
  X,
  Search,
  RefreshCw,
  Settings,
  BarChart3,
  Target,
  BookOpen,
  Lightbulb
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercentage, cn } from '@/lib/utils'
import { PortfolioStats } from '@/lib/portfolio-service'

interface Portfolio {
  id: string
  name: string
  description?: string
  isDefault: boolean
  totalValueUsd: number
  totalCostUsd: number
  lastUpdated: string
  holdings: any[]
}

interface PortfolioAnalytics {
  portfolioStats: PortfolioStats
  plBreakdown: any[]
  allocationChart: any[]
  metrics: {
    totalAssets: number
    profitableAssets: number
    losingAssets: number
    winRate: number
    averageReturn: number
  }
  riskMetrics?: {
    concentration: number
    volatility: number
    diversification: number
  }
  rebalancingSuggestions?: any[]
}

interface PortfolioDashboardProps {
  onCreatePortfolio: () => void
  onAddHolding: (portfolioId: string) => void
}

export default function PortfolioDashboard({ 
  onCreatePortfolio, 
  onAddHolding 
}: PortfolioDashboardProps) {
  const { session, loading: authLoading } = useSupabase()
  
  // Portfolio state
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [portfolioAnalytics, setPortfolioAnalytics] = useState<PortfolioAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // UI state
  const [showAnalytics, setShowAnalytics] = useState(false)

  // Load user portfolios
  useEffect(() => {
    if (session && !authLoading) {
      loadPortfolios()
    }
  }, [session, authLoading])

  // Load selected portfolio analytics
  useEffect(() => {
    if (selectedPortfolio) {
      loadPortfolioAnalytics()
    }
  }, [selectedPortfolio])

  const loadPortfolios = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/portfolio?includeHoldings=true')
      if (!response.ok) {
        throw new Error('Failed to fetch portfolios')
      }
      
      const data = await response.json()
      setPortfolios(data.portfolios || [])
      
      // Select default portfolio or first portfolio
      const defaultPortfolio = data.portfolios.find((p: Portfolio) => p.isDefault)
      const firstPortfolio = data.portfolios[0]
      setSelectedPortfolio(defaultPortfolio || firstPortfolio || null)
      
    } catch (error) {
      console.error('Error loading portfolios:', error)
      setError(error instanceof Error ? error.message : 'Failed to load portfolios')
    } finally {
      setLoading(false)
    }
  }

  const loadPortfolioAnalytics = async () => {
    if (!selectedPortfolio) return
    
    try {
      const response = await fetch(`/api/portfolio/${selectedPortfolio.id}/analytics?includeRisk=true&includeRebalancing=true`)
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      
      const data = await response.json()
      setPortfolioAnalytics(data)
      
    } catch (error) {
      console.error('Error loading portfolio analytics:', error)
    }
  }

  const handleRefreshPortfolio = async () => {
    if (!selectedPortfolio) return
    
    try {
      setRefreshing(true)
      
      // Update portfolio values with latest prices
      const response = await fetch(`/api/portfolio/${selectedPortfolio.id}/update-values`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Failed to update portfolio values')
      }
      
      // Reload portfolios and analytics
      await loadPortfolios()
      await loadPortfolioAnalytics()
      
    } catch (error) {
      console.error('Error refreshing portfolio:', error)
      setError(error instanceof Error ? error.message : 'Failed to refresh portfolio')
    } finally {
      setRefreshing(false)
    }
  }

  const createPortfolio = async (name: string, description?: string) => {
    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create portfolio')
      }
      
      await loadPortfolios()
      setShowCreateModal(false)
      
    } catch (error) {
      console.error('Error creating portfolio:', error)
      setError(error instanceof Error ? error.message : 'Failed to create portfolio')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session && !authLoading) {
    return (
      <Card className="text-center p-8">
        <CardHeader>
          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <CardTitle>Sign In Required</CardTitle>
          <CardDescription>
            Please sign in to access your portfolio dashboard
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <CardTitle className="text-red-700 dark:text-red-400">Error Loading Portfolio</CardTitle>
          </div>
          <CardDescription className="text-red-600 dark:text-red-300">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={loadPortfolios} variant="outline" size="sm">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Portfolio Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Track your crypto investments with AI-powered insights
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleRefreshPortfolio}
            disabled={refreshing || !selectedPortfolio}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', refreshing && 'animate-spin')} />
            Refresh
          </Button>
          
          <Button onClick={onCreatePortfolio} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Portfolio
          </Button>
        </div>
      </div>

      {/* Portfolio Selector */}
      {portfolios.length > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4 overflow-x-auto">
              {portfolios.map((portfolio) => (
                <button
                  key={portfolio.id}
                  onClick={() => setSelectedPortfolio(portfolio)}
                  className={cn(
                    'flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap',
                    selectedPortfolio?.id === portfolio.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  )}
                >
                  {portfolio.name}
                  {portfolio.isDefault && (
                    <Badge variant="secondary" className="ml-2 text-xs">Default</Badge>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedPortfolio ? (
        // Empty State
        <Card className="text-center p-12">
          <CardContent>
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <CardTitle className="mb-2">No Portfolio Found</CardTitle>
            <CardDescription className="mb-6">
              Create your first portfolio to start tracking your crypto investments
            </CardDescription>
            <Button onClick={onCreatePortfolio}>
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Portfolio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Portfolio Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white">
                    <Wallet className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Value
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(selectedPortfolio.totalValueUsd)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Invested
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(selectedPortfolio.totalCostUsd)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    'p-3 bg-gradient-to-r rounded-lg text-white',
                    portfolioAnalytics && portfolioAnalytics.portfolioStats.profitLoss >= 0
                      ? 'from-green-500 to-emerald-500'
                      : 'from-red-500 to-rose-500'
                  )}>
                    {portfolioAnalytics && portfolioAnalytics.portfolioStats.profitLoss >= 0 ? (
                      <TrendingUp className="w-6 h-6" />
                    ) : (
                      <TrendingDown className="w-6 h-6" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Profit/Loss
                </p>
                <p className={cn(
                  'text-2xl font-bold',
                  portfolioAnalytics && portfolioAnalytics.portfolioStats.profitLoss >= 0
                    ? 'text-green-500'
                    : 'text-red-500'
                )}>
                  {portfolioAnalytics 
                    ? formatCurrency(portfolioAnalytics.portfolioStats.profitLoss)
                    : formatCurrency(selectedPortfolio.totalValueUsd - selectedPortfolio.totalCostUsd)
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg text-white">
                    <PieChart className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Return
                </p>
                <p className={cn(
                  'text-2xl font-bold',
                  portfolioAnalytics && portfolioAnalytics.portfolioStats.profitLossPercentage >= 0
                    ? 'text-green-500'
                    : 'text-red-500'
                )}>
                  {portfolioAnalytics 
                    ? formatPercentage(portfolioAnalytics.portfolioStats.profitLossPercentage)
                    : selectedPortfolio.totalCostUsd > 0 
                      ? formatPercentage(((selectedPortfolio.totalValueUsd - selectedPortfolio.totalCostUsd) / selectedPortfolio.totalCostUsd) * 100)
                      : '0.00%'
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button
              onClick={() => selectedPortfolio && onAddHolding(selectedPortfolio.id)}
              className="h-20 flex flex-col items-center justify-center"
              variant="outline"
              disabled={!selectedPortfolio}
            >
              <Plus className="w-6 h-6 mb-2" />
              Add Holding
            </Button>

            <Button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="h-20 flex flex-col items-center justify-center"
              variant="outline"
            >
              <BarChart3 className="w-6 h-6 mb-2" />
              Analytics
            </Button>

            <Link href={`/portfolio/${selectedPortfolio?.id}/analytics`}>
              <Button
                className="h-20 flex flex-col items-center justify-center"
                variant="outline"
              >
                <BarChart3 className="w-6 h-6 mb-2" />
                Advanced Analytics
                <Badge variant="secondary" className="text-xs mt-1">Pro</Badge>
              </Button>
            </Link>
          </div>

          {/* Analytics Section */}
          {showAnalytics && portfolioAnalytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Portfolio performance insights</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Assets</p>
                      <p className="text-2xl font-bold">{portfolioAnalytics.metrics.totalAssets}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Win Rate</p>
                      <p className="text-2xl font-bold text-green-500">
                        {formatPercentage(portfolioAnalytics.metrics.winRate)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Profitable Assets</p>
                      <p className="text-xl font-semibold text-green-500">
                        {portfolioAnalytics.metrics.profitableAssets}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Losing Assets</p>
                      <p className="text-xl font-semibold text-red-500">
                        {portfolioAnalytics.metrics.losingAssets}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Metrics */}
              {portfolioAnalytics.riskMetrics && (
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Analysis</CardTitle>
                    <CardDescription>Portfolio risk assessment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Concentration</span>
                        <span className="font-semibold">
                          {portfolioAnalytics.riskMetrics.concentration.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(portfolioAnalytics.riskMetrics.concentration, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Volatility</span>
                        <span className="font-semibold">
                          {portfolioAnalytics.riskMetrics.volatility.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(Math.abs(portfolioAnalytics.riskMetrics.volatility), 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Diversification</p>
                      <p className="text-xl font-semibold">
                        {portfolioAnalytics.riskMetrics.diversification} Assets
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Holdings Table */}
          {selectedPortfolio.holdings.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Holdings</CardTitle>
                <CardDescription>Your crypto investments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
                          Asset
                        </th>
                        <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
                          Amount
                        </th>
                        <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
                          Avg Price
                        </th>
                        <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
                          Current Price
                        </th>
                        <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
                          Value
                        </th>
                        <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
                          P&L
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPortfolio.holdings.map((holding: any) => (
                        <tr
                          key={holding.id}
                          className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="py-4 px-2">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {holding.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                                {holding.symbol}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <p className="text-gray-900 dark:text-white">
                              {parseFloat(holding.amount).toFixed(4)}
                            </p>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <p className="text-gray-900 dark:text-white">
                              {formatCurrency(parseFloat(holding.averagePurchasePriceUsd))}
                            </p>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <p className="text-gray-900 dark:text-white">
                              {formatCurrency(parseFloat(holding.currentPriceUsd))}
                            </p>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(parseFloat(holding.currentValueUsd))}
                            </p>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <div>
                              <p className={cn(
                                'font-semibold',
                                parseFloat(holding.profitLossUsd) >= 0 ? 'text-green-500' : 'text-red-500'
                              )}>
                                {formatCurrency(parseFloat(holding.profitLossUsd))}
                              </p>
                              <p className={cn(
                                'text-sm',
                                parseFloat(holding.profitLossPercentage) >= 0 ? 'text-green-500' : 'text-red-500'
                              )}>
                                {formatPercentage(parseFloat(holding.profitLossPercentage))}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="text-center p-8">
              <CardContent>
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <CardTitle className="mb-2">No Holdings Yet</CardTitle>
                <CardDescription className="mb-4">
                  Add your first crypto holding to start tracking your portfolio
                </CardDescription>
                <Button onClick={() => selectedPortfolio && onAddHolding(selectedPortfolio.id)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Holding
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
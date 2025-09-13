'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Wallet, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  PieChart,
  AlertCircle,
  RefreshCw,
  BarChart3,
  Target,
  Loader2,
  Activity,
  Award,
  TrendingDownIcon
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
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

interface PortfolioDashboardProps {
  onCreatePortfolio: () => void
  onAddHolding: (portfolioId: string) => void
  onEditHolding?: (holding: any) => void
  onDeleteHolding?: (holdingId: string) => void
}

export default function PortfolioDashboard({ 
  onCreatePortfolio, 
  onAddHolding,
  onEditHolding,
  onDeleteHolding
}: PortfolioDashboardProps) {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    loadPortfolios()
  }, [])

  useEffect(() => {
    if (selectedPortfolio) {
      loadDashboardStats()
    }
  }, [selectedPortfolio])

  const loadDashboardStats = useCallback(async () => {
    if (!selectedPortfolio) return
    
    try {
      const response = await fetch(`/api/portfolio/${selectedPortfolio.id}/dashboard-stats`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }
      
      const stats = await response.json()
      setDashboardStats(stats)
      
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
      // Don't show error toast for stats - it's supplementary data
    }
  }, [selectedPortfolio])

  const loadPortfolios = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/portfolio?includeHoldings=true')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch portfolios')
      }
      
      const data = await response.json()
      console.log('Portfolio API response:', data) // Debug log
      
      // Handle both new API format and potential direct array response
      const portfolioList = Array.isArray(data) ? data : (data.portfolios || [])
      
      setPortfolios(portfolioList)
      
      // Select default portfolio or first portfolio
      const defaultPortfolio = portfolioList.find((p: Portfolio) => p.is_default)
      const firstPortfolio = portfolioList[0]
      setSelectedPortfolio(defaultPortfolio || firstPortfolio || null)
      
    } catch (error) {
      console.error('Error loading portfolios:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load portfolios'
      setError(errorMessage)
      
      // If it's an auth error, don't show generic error message
      if (!errorMessage.includes('Unauthorized')) {
        toast.error(errorMessage)
      }
      
      // Set empty portfolios array on error to show empty state instead of loading
      setPortfolios([])
      setSelectedPortfolio(null)
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshPortfolio = async () => {
    if (!selectedPortfolio) return
    
    try {
      setRefreshing(true)
      await Promise.all([
        loadPortfolios(),
        loadDashboardStats()
      ])
      setRefreshTrigger(prev => prev + 1)
      toast.success('Portfolio refreshed successfully')
    } catch (error) {
      console.error('Error refreshing portfolio:', error)
      toast.error('Failed to refresh portfolio')
    } finally {
      setRefreshing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`
  }

  const calculateProfitLoss = (portfolio: Portfolio) => {
    return portfolio.total_value_usd - portfolio.total_cost_usd
  }

  const calculateProfitLossPercentage = (portfolio: Portfolio) => {
    if (portfolio.total_cost_usd === 0) return 0
    return ((portfolio.total_value_usd - portfolio.total_cost_usd) / portfolio.total_cost_usd) * 100
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white/70">Loading your portfolios...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-500/20 bg-red-900/20">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <CardTitle className="text-red-400">Error Loading Portfolio</CardTitle>
          </div>
          <CardDescription className="text-red-300">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button onClick={loadPortfolios} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={onCreatePortfolio} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Portfolio
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Portfolio Dashboard
          </h1>
          <p className="text-white/70 mt-1">
            Track your crypto investments with AI-powered insights
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleRefreshPortfolio}
            disabled={refreshing || !selectedPortfolio}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button 
            onClick={onCreatePortfolio} 
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Portfolio
          </Button>
        </div>
      </motion.div>

      {/* Portfolio Selector */}
      {portfolios.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardContent className="p-4">
              <ScrollArea className="w-full">
                <div className="flex items-center space-x-4">
                  {portfolios.map((portfolio) => (
                    <button
                      key={portfolio.id}
                      onClick={() => setSelectedPortfolio(portfolio)}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                        selectedPortfolio?.id === portfolio.id
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {portfolio.name}
                      {portfolio.is_default && (
                        <Badge variant="secondary" className="ml-2 text-xs">Default</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {!selectedPortfolio ? (
        // Empty State
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="text-center p-12 bg-white/10 backdrop-blur-xl border-white/20">
            <CardContent>
              <Wallet className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <CardTitle className="mb-2 text-white">No Portfolio Found</CardTitle>
              <CardDescription className="mb-6 text-white/70">
                Create your first portfolio to start tracking your crypto investments
              </CardDescription>
              <Button 
                onClick={onCreatePortfolio}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Portfolio
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Portfolio Stats */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-blue-600/20 to-blue-500/20 backdrop-blur-xl border-blue-400/30 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm font-medium">Total Value</p>
                    <p className="text-3xl font-bold mt-2">
                      {formatCurrency(dashboardStats?.overview.totalValue || selectedPortfolio.total_value_usd)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <Wallet className="h-8 w-8 text-blue-300" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-600/20 to-purple-500/20 backdrop-blur-xl border-purple-400/30 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200 text-sm font-medium">Total Invested</p>
                    <p className="text-3xl font-bold mt-2">
                      {formatCurrency(dashboardStats?.overview.totalCost || selectedPortfolio.total_cost_usd)}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-full">
                    <DollarSign className="h-8 w-8 text-purple-300" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`backdrop-blur-xl border text-white ${
              (dashboardStats?.overview.profitLoss || calculateProfitLoss(selectedPortfolio)) >= 0
                ? 'bg-gradient-to-br from-green-600/20 to-green-500/20 border-green-400/30'
                : 'bg-gradient-to-br from-red-600/20 to-red-500/20 border-red-400/30'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${
                      (dashboardStats?.overview.profitLoss || calculateProfitLoss(selectedPortfolio)) >= 0 ? 'text-green-200' : 'text-red-200'
                    }`}>
                      Profit/Loss
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {formatCurrency(dashboardStats?.overview.profitLoss || calculateProfitLoss(selectedPortfolio))}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${
                    (dashboardStats?.overview.profitLoss || calculateProfitLoss(selectedPortfolio)) >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {(dashboardStats?.overview.profitLoss || calculateProfitLoss(selectedPortfolio)) >= 0 ? (
                      <TrendingUp className="h-8 w-8 text-green-300" />
                    ) : (
                      <TrendingDown className="h-8 w-8 text-red-300" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-600/20 to-orange-500/20 backdrop-blur-xl border-orange-400/30 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-200 text-sm font-medium">Total Return</p>
                    <p className="text-3xl font-bold mt-2">
                      {formatPercentage(dashboardStats?.overview.profitLossPercentage || calculateProfitLossPercentage(selectedPortfolio))}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-500/20 rounded-full">
                    <PieChart className="h-8 w-8 text-orange-300" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-600/20 to-emerald-500/20 backdrop-blur-xl border-emerald-400/30 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-200 text-sm font-medium">24h Change</p>
                    <p className={`text-2xl font-bold mt-2 ${
                      (dashboardStats?.overview.dayChangePercentage || 0) >= 0 ? 'text-emerald-300' : 'text-red-300'
                    }`}>
                      {formatPercentage(dashboardStats?.overview.dayChangePercentage || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-500/20 rounded-full">
                    <Activity className="h-8 w-8 text-emerald-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Performance Metrics */}
          {dashboardStats?.performanceMetrics && (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="bg-gradient-to-br from-green-600/20 to-green-500/20 backdrop-blur-xl border-green-400/30 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-200 text-sm font-medium">Best Performer</p>
                      <p className="text-lg font-bold mt-1">
                        {dashboardStats.performanceMetrics.bestPerformer?.symbol || 'N/A'}
                      </p>
                      <p className="text-sm text-green-300">
                        {dashboardStats.performanceMetrics.bestPerformer 
                          ? formatPercentage(dashboardStats.performanceMetrics.bestPerformer.profitLossPercentage)
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="p-2 bg-green-500/20 rounded-full">
                      <Award className="h-6 w-6 text-green-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-600/20 to-red-500/20 backdrop-blur-xl border-red-400/30 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-200 text-sm font-medium">Worst Performer</p>
                      <p className="text-lg font-bold mt-1">
                        {dashboardStats.performanceMetrics.worstPerformer?.symbol || 'N/A'}
                      </p>
                      <p className="text-sm text-red-300">
                        {dashboardStats.performanceMetrics.worstPerformer 
                          ? formatPercentage(dashboardStats.performanceMetrics.worstPerformer.profitLossPercentage)
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="p-2 bg-red-500/20 rounded-full">
                      <TrendingDownIcon className="h-6 w-6 text-red-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-600/20 to-blue-500/20 backdrop-blur-xl border-blue-400/30 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-200 text-sm font-medium">Avg. Performance</p>
                      <p className="text-lg font-bold mt-1">
                        {formatPercentage(dashboardStats.performanceMetrics.averagePerformance)}
                      </p>
                    </div>
                    <div className="p-2 bg-blue-500/20 rounded-full">
                      <Target className="h-6 w-6 text-blue-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={() => selectedPortfolio && onAddHolding(selectedPortfolio.id)}
              className="h-20 flex flex-col items-center justify-center bg-white/10 hover:bg-white/20 border-white/20 text-white"
              variant="outline"
              disabled={!selectedPortfolio}
            >
              <Plus className="w-6 h-6 mb-2" />
              Add Holding
            </Button>

            <Button
              onClick={() => toast.info('Advanced analytics coming soon!')}
              className="h-20 flex flex-col items-center justify-center bg-white/10 hover:bg-white/20 border-white/20 text-white"
              variant="outline"
            >
              <BarChart3 className="w-6 h-6 mb-2" />
              Analytics
            </Button>

            <Button
              onClick={() => toast.info('Portfolio insights coming soon!')}
              className="h-20 flex flex-col items-center justify-center bg-white/10 hover:bg-white/20 border-white/20 text-white"
              variant="outline"
            >
              <Target className="w-6 h-6 mb-2" />
              AI Insights
              <Badge variant="secondary" className="text-xs mt-1 bg-purple-500/20 text-purple-200">Pro</Badge>
            </Button>
          </motion.div>

          {/* Portfolio Holdings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <PortfolioHoldingsTable 
              portfolioId={selectedPortfolio.id}
              onEditHolding={onEditHolding}
              onDeleteHolding={onDeleteHolding}
              refreshTrigger={refreshTrigger}
            />
          </motion.div>
        </>
      )}
    </div>
  )
}
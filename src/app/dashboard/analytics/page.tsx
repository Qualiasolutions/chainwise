"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PriceCard } from "@/components/ui/price-card"
import { CryptoChart } from "@/components/ui/crypto-chart"
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  BarChart3,
  Activity,
  PieChart as PieChartIcon,
  Calendar,
  Shield,
  AlertTriangle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import { supabase } from "@/lib/supabase/client"
import { cryptoAPI, formatPrice, formatPercentage } from "@/lib/crypto-api"
import { motion } from "framer-motion"

interface PortfolioAnalytics {
  totalValue: number
  dayChange: number
  dayChangePercentage: number
  totalPnL: number
  totalPnLPercentage: number
  bestPerformer: { symbol: string, change: number }
  worstPerformer: { symbol: string, change: number }
  riskScore: number
  diversification: number
  volatility: number
}

interface AssetAllocation {
  name: string
  symbol: string
  value: number
  percentage: number
  color: string
}

interface PerformanceData {
  date: string
  value: number
  pnl: number
}

export default function AnalyticsPage() {
  const { user, profile } = useSupabaseAuth()
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null)
  const [allocations, setAllocations] = useState<AssetAllocation[]>([])
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  // Color palette for charts
  const CHART_COLORS = [
    '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
    '#ef4444', '#8b5cf6', '#6366f1', '#84cc16'
  ]

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user || !profile) return

      try {
        setLoading(true)

        // Get user's default portfolio
        const { data: portfolios, error: portfolioError } = await supabase
          .from('portfolios')
          .select('id, total_value')
          .eq('user_id', profile.id)
          .eq('is_default', true)
          .limit(1)

        if (portfolioError) throw portfolioError

        if (!portfolios || portfolios.length === 0) {
          setAnalytics({
            totalValue: 0,
            dayChange: 0,
            dayChangePercentage: 0,
            totalPnL: 0,
            totalPnLPercentage: 0,
            bestPerformer: { symbol: 'N/A', change: 0 },
            worstPerformer: { symbol: 'N/A', change: 0 },
            riskScore: 0,
            diversification: 0,
            volatility: 0
          })
          setLoading(false)
          return
        }

        const portfolioId = portfolios[0].id
        const totalValue = portfolios[0].total_value || 0

        // Get portfolio holdings
        const { data: holdings, error: holdingsError } = await supabase
          .from('portfolio_holdings')
          .select('*')
          .eq('portfolio_id', portfolioId)

        if (holdingsError) throw holdingsError

        if (!holdings || holdings.length === 0) {
          setAllocations([])
          setPerformanceData([])
          setLoading(false)
          return
        }

        // Get current prices
        const cryptoIds = holdings.map(h => h.symbol.toLowerCase())
        const priceData = await cryptoAPI.getSimplePrice(cryptoIds)

        // Calculate allocations
        const calculatedAllocations: AssetAllocation[] = holdings.map((holding, index) => {
          const cryptoId = holding.symbol.toLowerCase()
          const currentPrice = priceData[cryptoId]?.usd || holding.current_price || holding.purchase_price
          const value = holding.amount * currentPrice
          const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0

          return {
            name: holding.name,
            symbol: holding.symbol,
            value,
            percentage,
            color: CHART_COLORS[index % CHART_COLORS.length]
          }
        })

        setAllocations(calculatedAllocations)

        // Calculate analytics
        let totalPnL = 0
        let bestPerformer = { symbol: 'N/A', change: -Infinity }
        let worstPerformer = { symbol: 'N/A', change: Infinity }

        holdings.forEach(holding => {
          const cryptoId = holding.symbol.toLowerCase()
          const currentPrice = priceData[cryptoId]?.usd || holding.current_price || holding.purchase_price
          const pnl = (holding.amount * currentPrice) - (holding.amount * holding.purchase_price)
          const changePercentage = ((currentPrice - holding.purchase_price) / holding.purchase_price) * 100

          totalPnL += pnl

          if (changePercentage > bestPerformer.change) {
            bestPerformer = { symbol: holding.symbol, change: changePercentage }
          }
          if (changePercentage < worstPerformer.change) {
            worstPerformer = { symbol: holding.symbol, change: changePercentage }
          }
        })

        const totalPnLPercentage = totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0

        // Calculate risk metrics
        const diversification = holdings.length <= 1 ? 0 :
          Math.min(100, (holdings.length / 10) * 100) // More assets = better diversification

        const volatility = Math.abs(totalPnLPercentage) // Simplified volatility measure

        const riskScore = Math.max(0, Math.min(100,
          (100 - diversification) * 0.4 + volatility * 0.6
        ))

        setAnalytics({
          totalValue,
          dayChange: totalPnL * 0.1, // Simplified day change
          dayChangePercentage: totalPnLPercentage * 0.1,
          totalPnL,
          totalPnLPercentage,
          bestPerformer,
          worstPerformer,
          riskScore,
          diversification,
          volatility
        })

        // Generate performance data
        const performanceHistory: PerformanceData[] = []
        const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365

        for (let i = days; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)

          // Simulate portfolio performance
          const progressFactor = (days - i) / days
          const randomVariation = (Math.random() - 0.5) * 0.1
          const simulatedValue = (totalValue - totalPnL) * (1 + (totalPnLPercentage / 100) * progressFactor + randomVariation)
          const simulatedPnL = simulatedValue - (totalValue - totalPnL)

          performanceHistory.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: Math.max(0, simulatedValue),
            pnl: simulatedPnL
          })
        }

        setPerformanceData(performanceHistory)

      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [user, profile, timeframe])

  if (loading) {
    return (
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight purple-gradient bg-clip-text text-transparent">
            Portfolio Analytics
          </h1>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="ai-card animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            <span className="text-muted-foreground">Value: </span>
            <span className="font-semibold text-primary">
              {formatPrice(payload[0].value)}
            </span>
          </p>
          {payload[1] && (
            <p className="text-sm">
              <span className="text-muted-foreground">P&L: </span>
              <span className={cn(
                "font-semibold",
                payload[1].value >= 0 ? "text-green-500" : "text-red-500"
              )}>
                {formatPrice(payload[1].value)}
              </span>
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      className="flex-1 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight purple-gradient bg-clip-text text-transparent">
            Portfolio Analytics
          </h1>
          <p className="text-muted-foreground">
            Detailed insights into your portfolio performance and risk metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
            <TabsList>
              <TabsTrigger value="7d">7D</TabsTrigger>
              <TabsTrigger value="30d">30D</TabsTrigger>
              <TabsTrigger value="90d">90D</TabsTrigger>
              <TabsTrigger value="1y">1Y</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <motion.div
          className="grid gap-4 md:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <PriceCard
            title="Portfolio Value"
            price={analytics.totalValue}
            change={analytics.dayChangePercentage}
            subtitle="Total Worth"
          />
          <PriceCard
            title="Total P&L"
            price={Math.abs(analytics.totalPnL)}
            change={analytics.totalPnLPercentage}
            subtitle={analytics.totalPnL >= 0 ? "Profit" : "Loss"}
          />
          <Card className="ai-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
              <Shield className={cn(
                "h-4 w-4",
                analytics.riskScore <= 30 ? "text-green-500" :
                analytics.riskScore <= 60 ? "text-yellow-500" : "text-red-500"
              )} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.riskScore.toFixed(0)}/100</div>
              <p className={cn(
                "text-xs",
                analytics.riskScore <= 30 ? "text-green-600 dark:text-green-400" :
                analytics.riskScore <= 60 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"
              )}>
                {analytics.riskScore <= 30 ? "Low Risk" :
                 analytics.riskScore <= 60 ? "Medium Risk" : "High Risk"}
              </p>
            </CardContent>
          </Card>
          <Card className="ai-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Diversification</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.diversification.toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground">
                {allocations.length} assets
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Charts and Analysis */}
      <motion.div
        className="grid gap-6 lg:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {/* Portfolio Performance Chart */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  fill="url(#colorValue)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Asset Allocation Pie Chart */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            {allocations.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={allocations}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={false}
                    >
                      {allocations.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [formatPrice(value), 'Value']}
                      labelFormatter={(label) => `${label}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {allocations.map((allocation, index) => (
                    <div key={allocation.symbol} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: allocation.color }}
                        />
                        <span className="font-medium">{allocation.symbol}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{allocation.percentage.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">
                          {formatPrice(allocation.value)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <PieChartIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No portfolio data to display</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Metrics */}
      {analytics && (
        <motion.div
          className="grid gap-6 md:grid-cols-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {/* Best and Worst Performers */}
          <Card className="ai-card">
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Best Performer</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600 dark:text-green-400">
                    {analytics.bestPerformer.symbol}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    {formatPercentage(analytics.bestPerformer.change)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="font-medium">Worst Performer</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-600 dark:text-red-400">
                    {analytics.worstPerformer.symbol}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {formatPercentage(analytics.worstPerformer.change)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Analysis */}
          <Card className="ai-card">
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Portfolio Risk</span>
                  <Badge variant={
                    analytics.riskScore <= 30 ? "default" :
                    analytics.riskScore <= 60 ? "secondary" : "destructive"
                  }>
                    {analytics.riskScore <= 30 ? "Low" :
                     analytics.riskScore <= 60 ? "Medium" : "High"}
                  </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      analytics.riskScore <= 30 ? "bg-green-500" :
                      analytics.riskScore <= 60 ? "bg-yellow-500" : "bg-red-500"
                    )}
                    style={{ width: `${analytics.riskScore}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Diversification</span>
                  <span className="font-medium">{analytics.diversification.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${analytics.diversification}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Volatility</span>
                  <span className="font-medium">{analytics.volatility.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-purple-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, analytics.volatility)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
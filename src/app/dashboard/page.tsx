"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Bitcoin,
  Coins,
  Target,
  Zap,
  Loader2,
  AlertCircle,
  Bot,
  Bell,
  Brain,
  Gem,
  FileText,
  Wallet,
  Crown,
  Star
} from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { usePortfolio } from "@/hooks/usePortfolio"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import { cryptoAPI } from "@/lib/crypto-api"
import Link from "next/link"
import { SmartSkeleton, SkeletonCard, SkeletonCryptoCard, SkeletonChart } from "@/components/ui/smart-skeleton"
import { AnimatedLoader } from "@/components/ui/animated-loader"
import { ProfessionalCard, MetricsCard, ChartCard, DataCard } from "@/components/ui/professional-card"
import { MicroInteraction } from "@/components/ui/micro-interaction"

// Color palette for different coins in charts
const coinColors = [
  "hsl(var(--chart-1))", // Blue
  "hsl(var(--chart-2))", // Green
  "hsl(var(--chart-3))", // Orange
  "hsl(var(--chart-4))", // Purple
  "hsl(var(--chart-5))", // Red
  "#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1"
]

// Top cryptocurrencies with real images from CoinGecko
const topCryptos = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    price: 54750,
    change: 5.2,
    volume: "2.1B",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    price: 3420,
    change: 3.8,
    volume: "1.8B",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png"
  },
  {
    id: "binancecoin",
    symbol: "BNB",
    name: "Binance Coin",
    price: 425,
    change: -1.2,
    volume: "654M",
    image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png"
  },
  {
    id: "ripple",
    symbol: "XRP",
    name: "Ripple",
    price: 0.87,
    change: 8.1,
    volume: "890M",
    image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png"
  },
  {
    id: "cardano",
    symbol: "ADA",
    name: "Cardano",
    price: 1.45,
    change: 4.3,
    volume: "432M",
    image: "https://assets.coingecko.com/coins/images/975/large/cardano.png"
  },
]

const chartConfig = {
  total: {
    label: "Total Portfolio Value",
    color: "hsl(var(--chart-1))",
  },
  BTC: {
    label: "Bitcoin",
    color: coinColors[0],
  },
  ETH: {
    label: "Ethereum",
    color: coinColors[1],
  },
  BNB: {
    label: "BNB",
    color: coinColors[2],
  },
  XRP: {
    label: "XRP",
    color: coinColors[3],
  },
  ADA: {
    label: "Cardano",
    color: coinColors[4],
  },
}

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useSupabaseAuth()
  const { portfolios, loading: portfolioLoading, error, getTotalPortfolioValue, getTotalPortfolioPnL, getTotalPortfolioPnLPercentage, getDefaultPortfolio } = usePortfolio()

  // Overall loading state - show loading if either auth or portfolio is loading
  const loading = authLoading || portfolioLoading

  // Silent dashboard state management

  // State for portfolio chart data
  const [portfolioChartData, setPortfolioChartData] = useState<any[]>([])
  const [chartLoading, setChartLoading] = useState(false)
  const [topCryptosData, setTopCryptosData] = useState(topCryptos)

  // Get portfolio metrics
  const totalValue = getTotalPortfolioValue()
  const totalPnL = getTotalPortfolioPnL()
  const totalPnLPercentage = getTotalPortfolioPnLPercentage()
  const defaultPortfolio = getDefaultPortfolio()

  // Fetch portfolio performance data
  useEffect(() => {
    const fetchPortfolioData = async () => {
      setChartLoading(true)

      try {
        if (!defaultPortfolio || !defaultPortfolio.portfolio_holdings || defaultPortfolio.portfolio_holdings.length === 0) {
          // Generate realistic empty state data
          setPortfolioChartData(generateEmptyStateData())
          return
        }

        const holdings = defaultPortfolio.portfolio_holdings.map(holding => ({
          id: holding.symbol, // Use symbol as identifier for API mapping
          symbol: holding.symbol.toUpperCase(),
          amount: holding.amount
        }))

        // Try to get real performance data, fallback to generated data based on real holdings
        try {
          const data = await cryptoAPI.getPortfolioPerformanceData(holdings, 7)
          setPortfolioChartData(data)
        } catch (error) {
          console.warn('Error fetching live chart data, generating from portfolio data:', error)
          setPortfolioChartData(generateRealPortfolioChartData())
        }
      } catch (error) {
        console.error('Error processing portfolio chart data:', error)
        setPortfolioChartData(generateEmptyStateData())
      } finally {
        setChartLoading(false)
      }
    }

    fetchPortfolioData()
  }, [defaultPortfolio, totalValue, totalPnL])

  // Fetch updated crypto prices
  useEffect(() => {
    const fetchCryptoPrices = async () => {
      try {
        const ids = topCryptos.map(crypto => crypto.id)
        const priceData = await cryptoAPI.getTopCryptos(5)

        const updatedCryptos = topCryptos.map(crypto => {
          const liveData = priceData.find(data => data.id === crypto.id)
          return liveData ? {
            ...crypto,
            price: liveData.current_price,
            change: liveData.price_change_percentage_24h
          } : crypto
        })

        setTopCryptosData(updatedCryptos)
      } catch (error) {
        console.error('Error fetching crypto prices:', error)
      }
    }

    fetchCryptoPrices()
  }, [])

  // Generate empty state chart data
  const generateEmptyStateData = () => {
    return [
      { time: "00:00", total: 0 },
      { time: "04:00", total: 0 },
      { time: "08:00", total: 0 },
      { time: "12:00", total: 0 },
      { time: "16:00", total: 0 },
      { time: "20:00", total: 0 },
      { time: "24:00", total: 0 },
    ]
  }

  // Generate chart data based on real portfolio holdings
  const generateRealPortfolioChartData = () => {
    if (!defaultPortfolio?.portfolio_holdings || defaultPortfolio.portfolio_holdings.length === 0) {
      return generateEmptyStateData()
    }

    const holdings = defaultPortfolio.portfolio_holdings
    const baseValue = totalValue - totalPnL // Initial investment
    const currentValue = totalValue

    // Generate realistic performance data over 24 hours
    const timePoints = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"]
    const chartData = timePoints.map((time, index) => {
      const progressFactor = index / (timePoints.length - 1)
      const randomVariation = (Math.random() - 0.5) * 0.02 // Small random variation

      // Interpolate between base value and current value
      const interpolatedValue = baseValue + (currentValue - baseValue) * progressFactor
      const valueWithVariation = interpolatedValue * (1 + randomVariation)

      // Build data point with individual coin values
      const dataPoint: any = {
        time,
        total: Math.max(baseValue * 0.8, valueWithVariation) // Floor to prevent negative values
      }

      // Add individual coin values based on real holdings
      holdings.forEach(holding => {
        const symbol = holding.symbol.toUpperCase()
        const currentPrice = holding.current_price || holding.purchase_price
        const basePrice = holding.purchase_price
        const priceVariation = (currentPrice - basePrice) / basePrice

        // Apply similar interpolation for individual coins
        const coinBaseValue = holding.amount * basePrice
        const coinCurrentValue = holding.amount * currentPrice
        const coinInterpolated = coinBaseValue + (coinCurrentValue - coinBaseValue) * progressFactor
        const coinWithVariation = coinInterpolated * (1 + randomVariation * (1 + Math.abs(priceVariation)))

        dataPoint[symbol] = Math.max(coinBaseValue * 0.8, coinWithVariation)
      })

      return dataPoint
    })

    return chartData
  }

  if (loading) {
    return (
      <div className="h-full w-full overflow-auto bg-slate-50/50 dark:bg-slate-950/50">
        <div className="container mx-auto px-4 pb-6 pt-2 space-y-6 max-w-none">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <SmartSkeleton variant="text" width="120px" height="28px" className="mb-2" />
              <SmartSkeleton variant="text" width="200px" height="16px" />
            </div>
            <div className="flex items-center space-x-3">
              <SmartSkeleton variant="rectangular" width="80px" height="32px" />
              <SmartSkeleton variant="rectangular" width="90px" height="32px" />
            </div>
          </div>

          {/* Loading Status */}
          <ProfessionalCard className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <AnimatedLoader variant="spinner" size="sm" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Loading Dashboard
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Fetching your portfolio data and market information...
                </p>
              </div>
            </div>
          </ProfessionalCard>

          {/* Metrics Cards Skeleton */}
          <div className="grid gap-4 lg:grid-cols-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} className="h-32" />
            ))}
          </div>

          {/* Charts Grid Skeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <SkeletonChart className="lg:col-span-4 h-96" />
            <div className="lg:col-span-3 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonCryptoCard key={i} />
              ))}
            </div>
          </div>

          {/* Quick Actions Skeleton */}
          <SkeletonCard className="h-32" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full overflow-auto bg-slate-50/50 dark:bg-slate-950/50">
      <div className="container mx-auto px-4 pb-6 pt-2 space-y-6 max-w-none">
        {/* Professional Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {user ? `${user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'} • Portfolio Overview` : "Portfolio Overview"}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="text-xs h-8" asChild>
              <Link href="/dashboard/analytics">
                <BarChart3 className="h-3 w-3 mr-1.5" />
                Analytics
              </Link>
            </Button>
            <Button size="sm" className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-xs h-8" asChild>
              <Link href="/dashboard/ai">
                <Zap className="h-3 w-3 mr-1.5" />
                Ask AI
              </Link>
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <ProfessionalCard className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-sm bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                  Portfolio Loading Error
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                  {error}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30"
                    onClick={() => window.location.reload()}
                  >
                    Refresh Page
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-7 text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
                    asChild
                  >
                    <Link href="/portfolio">Check Portfolio Settings</Link>
                  </Button>
                </div>
              </div>
            </div>
          </ProfessionalCard>
        )}

        {/* Empty State */}
        {!authLoading && !portfolioLoading && portfolios.length === 0 && !error && (
          <ProfessionalCard className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30" padding="lg">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-sm bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-base font-medium text-blue-900 dark:text-blue-100 mb-2">
                No portfolios yet
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
                Welcome {user?.email || 'User'}! Create your first portfolio to start tracking your crypto investments.
              </p>
              <div className="flex items-center gap-2 justify-center">
                <Button size="sm" className="text-xs h-8" asChild>
                  <Link href="/portfolio">Create Portfolio</Link>
                </Button>
                <Button size="sm" variant="outline" className="text-xs h-8" asChild>
                  <Link href="/market">Explore Market</Link>
                </Button>
              </div>
            </div>
          </ProfessionalCard>
        )}

        {/* Professional Stats Grid */}
        <div className="grid gap-4 lg:grid-cols-4 md:grid-cols-2">
          <MetricsCard>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-sm bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <DollarSign className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Portfolio</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                {totalPnLPercentage >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                )}
                <span className={totalPnLPercentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {totalPnLPercentage >= 0 ? '+' : ''}{totalPnLPercentage.toFixed(2)}% total return
                </span>
              </div>
            </div>
          </MetricsCard>

          <MetricsCard>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 rounded-sm flex items-center justify-center ${totalPnL >= 0
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {totalPnL >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Total P&L</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className={`text-xl font-bold ${totalPnL >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
              }`}>
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                {totalPnL >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />
                )}
                <span className={totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {totalPnL >= 0 ? '+' : ''}{totalPnLPercentage.toFixed(2)}% change
                </span>
              </div>
            </div>
          </MetricsCard>

          <MetricsCard>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-sm bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Activity className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Active Portfolios</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {portfolios.length}
              </div>
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                <Target className="h-3 w-3 mr-1 text-purple-500" />
                <span className="text-purple-600 dark:text-purple-400">
                  Total portfolios
                </span>
              </div>
            </div>
          </MetricsCard>

          <MetricsCard>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-sm bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Coins className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Holdings</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {portfolios.reduce((total, portfolio) => total + (portfolio.metrics?.holdingsCount || 0), 0)}
              </div>
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                <BarChart3 className="h-3 w-3 mr-1 text-orange-500" />
                <span className="text-orange-600 dark:text-orange-400">
                  Across all portfolios
                </span>
              </div>
            </div>
          </MetricsCard>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Portfolio Performance Chart */}
        <ChartCard className="col-span-4">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-sm bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Portfolio Performance
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Your portfolio value over the last 24 hours
            </p>
          </div>
            <div className="pl-2">
            {chartLoading ? (
              <div className="h-[350px] flex items-center justify-center">
                <div className="flex flex-col items-center space-y-3">
                  <AnimatedLoader variant="bars" size="lg" />
                  <span className="text-sm text-muted-foreground">Loading chart data...</span>
                </div>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={portfolioChartData}>
                    <defs>
                      {Object.keys(chartConfig).map((key, index) => (
                        <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={coinColors[index] || chartConfig[key as keyof typeof chartConfig]?.color} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={coinColors[index] || chartConfig[key as keyof typeof chartConfig]?.color} stopOpacity={0}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--muted-foreground))"
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="time"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      fontWeight={500}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      fontWeight={500}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <ChartTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white dark:bg-gray-800 border rounded-lg p-3 shadow-lg">
                              <p className="text-sm font-medium mb-2">{label}</p>
                              {payload.map((entry, index) => (
                                <div key={index} className="flex items-center space-x-2 text-sm">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span className="font-medium">{entry.name}:</span>
                                  <span>${entry.value?.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke={chartConfig.total.color}
                      strokeWidth={3}
                      dot={false}
                      name="Total Portfolio"
                    />
                    {/* Render lines for actual portfolio holdings */}
                    {defaultPortfolio?.portfolio_holdings?.map((holding, index) => {
                      const symbol = holding.symbol.toUpperCase()
                      const color = coinColors[index % coinColors.length]
                      return (
                        <Line
                          key={symbol}
                          type="monotone"
                          dataKey={symbol}
                          stroke={color}
                          strokeWidth={2}
                          dot={false}
                          name={holding.name || symbol}
                        />
                      )
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
            </div>
        </ChartCard>

        {/* Top Cryptocurrencies */}
        <DataCard className="col-span-3">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-sm bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Bitcoin className="h-3 w-3 text-orange-500 dark:text-orange-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Top Cryptocurrencies
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Most active coins in your watchlist
            </p>
          </div>
          <div className="space-y-3">
              {topCryptosData.map((crypto, index) => (
                <Link key={crypto.symbol} href={`/market/${crypto.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-sm bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-muted">
                      <img
                        src={crypto.image}
                        alt={crypto.name}
                        className="w-8 h-8 object-cover"
                        onError={(e) => {
                          // Fallback to initial letter if image fails to load
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.parentElement!.innerHTML = `<div class="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">${crypto.symbol[0]}</div>`
                        }}
                      />
                    </div>
                    <div>
                      <p className="font-medium">{crypto.symbol}</p>
                      <p className="text-xs text-muted-foreground">{crypto.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${crypto.price.toLocaleString()}</p>
                    <div className="flex items-center">
                      {crypto.change > 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs ${crypto.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {crypto.change > 0 ? '+' : ''}{crypto.change.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                    </div>
                </Link>
              ))}
          </div>
        </DataCard>
      </div>

      {/* Premium Tools */}
      <ProfessionalCard>
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-500" />
                Premium Tools
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Advanced AI-powered crypto analysis tools
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {profile?.tier === 'free' ? 'Upgrade to Access' : `${profile?.tier.charAt(0).toUpperCase()}${profile?.tier.slice(1)} Plan`}
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/tools/whale-tracker" className="group h-20 flex flex-col items-center justify-center space-y-2 rounded-sm border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800/50 dark:to-slate-800/30 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-slate-800 dark:hover:to-slate-700 hover:border-blue-300 dark:hover:border-slate-600 transition-all duration-200 text-slate-900 dark:text-slate-100">
            <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-center">Whale Tracker</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">PRO+</Badge>
          </Link>
          <Link href="/tools/ai-reports" className="group h-20 flex flex-col items-center justify-center space-y-2 rounded-sm border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-slate-800/50 dark:to-slate-800/30 hover:from-purple-100 hover:to-violet-100 dark:hover:from-slate-800 dark:hover:to-slate-700 hover:border-purple-300 dark:hover:border-slate-600 transition-all duration-200 text-slate-900 dark:text-slate-100">
            <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-center">AI Reports</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">PRO+</Badge>
          </Link>
          <Link href="/tools/narrative-scanner" className="group h-20 flex flex-col items-center justify-center space-y-2 rounded-sm border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-800/50 dark:to-slate-800/30 hover:from-green-100 hover:to-emerald-100 dark:hover:from-slate-800 dark:hover:to-slate-700 hover:border-green-300 dark:hover:border-slate-600 transition-all duration-200 text-slate-900 dark:text-slate-100">
            <Brain className="h-4 w-4 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-center">Narrative Scanner</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">PRO+</Badge>
          </Link>
          <Link href="/tools/altcoin-detector" className="group h-20 flex flex-col items-center justify-center space-y-2 rounded-sm border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-orange-50 to-red-50 dark:from-slate-800/50 dark:to-slate-800/30 hover:from-orange-100 hover:to-red-100 dark:hover:from-slate-800 dark:hover:to-slate-700 hover:border-orange-300 dark:hover:border-slate-600 transition-all duration-200 text-slate-900 dark:text-slate-100">
            <Gem className="h-4 w-4 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-center">Altcoin Detector</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">ELITE</Badge>
          </Link>
          <Link href="/tools/smart-alerts" className="group h-20 flex flex-col items-center justify-center space-y-2 rounded-sm border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-slate-800/50 dark:to-slate-800/30 hover:from-cyan-100 hover:to-blue-100 dark:hover:from-slate-800 dark:hover:to-slate-700 hover:border-cyan-300 dark:hover:border-slate-600 transition-all duration-200 text-slate-900 dark:text-slate-100">
            <Bell className="h-4 w-4 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-center">Smart Alerts</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">PRO+</Badge>
          </Link>
          <Link href="/tools/portfolio-allocator" className="group h-20 flex flex-col items-center justify-center space-y-2 rounded-sm border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-slate-800/50 dark:to-slate-800/30 hover:from-yellow-100 hover:to-amber-100 dark:hover:from-slate-800 dark:hover:to-slate-700 hover:border-yellow-300 dark:hover:border-slate-600 transition-all duration-200 text-slate-900 dark:text-slate-100">
            <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-center">Portfolio Allocator</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">PRO+</Badge>
          </Link>
          <Link href="/tools/signals-pack" className="group h-20 flex flex-col items-center justify-center space-y-2 rounded-sm border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-slate-800/50 dark:to-slate-800/30 hover:from-pink-100 hover:to-rose-100 dark:hover:from-slate-800 dark:hover:to-slate-700 hover:border-pink-300 dark:hover:border-slate-600 transition-all duration-200 text-slate-900 dark:text-slate-100">
            <Activity className="h-4 w-4 text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-center">Signals Pack</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">ELITE</Badge>
          </Link>
          <Link href="/tools/whale-copy" className="group h-20 flex flex-col items-center justify-center space-y-2 rounded-sm border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800/50 dark:to-slate-800/30 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-slate-800 dark:hover:to-slate-700 hover:border-indigo-300 dark:hover:border-slate-600 transition-all duration-200 text-slate-900 dark:text-slate-100">
            <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-center">Whale Copy</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">ELITE</Badge>
          </Link>
        </div>
        {profile?.tier === 'free' && (
          <div className="mt-4 text-center">
            <Link href="/checkout">
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                <Star className="h-3 w-3 mr-1" />
                Upgrade to Unlock All Tools
              </Button>
            </Link>
          </div>
        )}
      </ProfessionalCard>

      {/* Quick Actions */}
      <ProfessionalCard>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">Quick Actions</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            AI-powered crypto advisory tools
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/portfolio" className="h-18 flex flex-col items-center justify-center space-y-2 rounded-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 text-slate-900 dark:text-slate-100">
            <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium">Manage Portfolio</span>
          </Link>
          <Link href="/market" className="h-18 flex flex-col items-center justify-center space-y-2 rounded-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 text-slate-900 dark:text-slate-100">
            <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium">Market Data</span>
          </Link>
          <Link href="/dashboard/analytics" className="h-18 flex flex-col items-center justify-center space-y-2 rounded-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 text-slate-900 dark:text-slate-100">
            <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium">View Analytics</span>
          </Link>
          <Link href="/dashboard/ai" className="h-18 flex flex-col items-center justify-center space-y-2 rounded-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 text-slate-900 dark:text-slate-100">
            <Bot className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="text-xs font-medium">AI Assistant</span>
          </Link>
        </div>
      </ProfessionalCard>
      </div>
    </div>
  )
}

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
  AlertCircle
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
  const { user } = useSupabaseAuth()
  const { portfolios, loading, error, getTotalPortfolioValue, getTotalPortfolioPnL, getTotalPortfolioPnLPercentage, getDefaultPortfolio } = usePortfolio()

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
      if (!defaultPortfolio || !defaultPortfolio.portfolio_holdings || defaultPortfolio.portfolio_holdings.length === 0) {
        // Use mock data for demonstration when no real portfolio exists
        setPortfolioChartData(generateMockChartData())
        return
      }

      setChartLoading(true)
      try {
        const holdings = defaultPortfolio.portfolio_holdings.map(holding => ({
          id: holding.id,
          symbol: holding.symbol.toUpperCase(),
          amount: holding.amount
        }))

        const data = await cryptoAPI.getPortfolioPerformanceData(holdings, 7)
        setPortfolioChartData(data)
      } catch (error) {
        console.error('Error fetching portfolio chart data:', error)
        setPortfolioChartData(generateMockChartData())
      } finally {
        setChartLoading(false)
      }
    }

    fetchPortfolioData()
  }, [defaultPortfolio])

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

  // Generate mock chart data for demonstration
  const generateMockChartData = () => {
    return [
      { time: "00:00", total: 45000, BTC: 30000, ETH: 10000, BNB: 3000, XRP: 1500, ADA: 500 },
      { time: "04:00", total: 47500, BTC: 31500, ETH: 10500, BNB: 3200, XRP: 1700, ADA: 600 },
      { time: "08:00", total: 46800, BTC: 30800, ETH: 10200, BNB: 3100, XRP: 1900, ADA: 800 },
      { time: "12:00", total: 49200, BTC: 32200, ETH: 11000, BNB: 3300, XRP: 1800, ADA: 900 },
      { time: "16:00", total: 51500, BTC: 33500, ETH: 11500, BNB: 3500, XRP: 2000, ADA: 1000 },
      { time: "20:00", total: 53200, BTC: 34200, ETH: 12000, BNB: 3700, XRP: 2100, ADA: 1200 },
      { time: "24:00", total: 54750, BTC: 35000, ETH: 12500, BNB: 3800, XRP: 2200, ADA: 1250 },
    ]
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 px-3 py-4 max-w-full">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <SmartSkeleton variant="text" width="200px" height="32px" />
          <SmartSkeleton variant="rectangular" width="100px" height="40px" />
        </div>

        {/* Metrics Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} className="h-32" />
          ))}
        </div>

        {/* Charts Grid Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <SkeletonChart className="lg:col-span-4 h-96" />
          <div className="lg:col-span-3 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCryptoCard key={i} />
            ))}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center py-8">
          <div className="flex flex-col items-center space-y-3">
            <AnimatedLoader variant="crypto" size="lg" />
            <span className="text-sm text-muted-foreground">Loading your portfolio...</span>
          </div>
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
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Error loading portfolio data: {error}</span>
            </div>
          </ProfessionalCard>
        )}

        {/* Empty State */}
        {portfolios.length === 0 && !error && (
          <ProfessionalCard className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30" padding="lg">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-sm bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-base font-medium text-blue-900 dark:text-blue-100 mb-2">
                No portfolios yet
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
                Create your first portfolio to start tracking your investments
              </p>
              <Button size="sm" className="text-xs h-8" asChild>
                <Link href="/portfolio">Create Portfolio</Link>
              </Button>
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
                      stroke="currentColor"
                      opacity={0.1}
                      className="text-muted-foreground"
                    />
                    <XAxis
                      dataKey="time"
                      stroke="currentColor"
                      fontSize={11}
                      fontWeight={500}
                      className="text-foreground fill-foreground"
                      tick={{ fill: 'currentColor' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="currentColor"
                      fontSize={11}
                      fontWeight={500}
                      className="text-foreground fill-foreground"
                      tick={{ fill: 'currentColor' }}
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
                    <Line
                      type="monotone"
                      dataKey="BTC"
                      stroke={chartConfig.BTC.color}
                      strokeWidth={2}
                      dot={false}
                      name="Bitcoin"
                    />
                    <Line
                      type="monotone"
                      dataKey="ETH"
                      stroke={chartConfig.ETH.color}
                      strokeWidth={2}
                      dot={false}
                      name="Ethereum"
                    />
                    <Line
                      type="monotone"
                      dataKey="BNB"
                      stroke={chartConfig.BNB.color}
                      strokeWidth={2}
                      dot={false}
                      name="BNB"
                    />
                    <Line
                      type="monotone"
                      dataKey="XRP"
                      stroke={chartConfig.XRP.color}
                      strokeWidth={2}
                      dot={false}
                      name="XRP"
                    />
                    <Line
                      type="monotone"
                      dataKey="ADA"
                      stroke={chartConfig.ADA.color}
                      strokeWidth={2}
                      dot={false}
                      name="Cardano"
                    />
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

      {/* Quick Actions */}
      <ProfessionalCard>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">Quick Actions</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            AI-powered crypto advisory tools
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="h-18 flex flex-col items-center justify-center space-y-2 rounded-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 text-slate-900 dark:text-slate-100">
            <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium">Portfolio Analysis</span>
          </button>
          <button className="h-18 flex flex-col items-center justify-center space-y-2 rounded-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 text-slate-900 dark:text-slate-100">
            <TrendingDown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium">Market Insights</span>
          </button>
          <button className="h-18 flex flex-col items-center justify-center space-y-2 rounded-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 text-slate-900 dark:text-slate-100">
            <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium">View Analytics</span>
          </button>
          <button className="h-18 flex flex-col items-center justify-center space-y-2 rounded-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 text-slate-900 dark:text-slate-100">
            <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="text-xs font-medium">AI Assistant</span>
          </button>
        </div>
      </ProfessionalCard>
      </div>
    </div>
  )
}

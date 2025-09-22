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
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading your portfolio...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            {user ? `Welcome back, ${user.user_metadata?.full_name || user.email}! Here's your portfolio overview.` : "Welcome! Here's your portfolio overview."}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Link>
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
            <Link href="/dashboard/ai">
              <Zap className="h-4 w-4 mr-2" />
              Ask AI
            </Link>
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span>Error loading portfolio data: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {portfolios.length === 0 && !error && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <DollarSign className="h-12 w-12 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold">No portfolios yet</h3>
                <p className="text-sm text-muted-foreground">Create your first portfolio to start tracking your investments</p>
              </div>
              <Button asChild>
                <Link href="/portfolio">Create Portfolio</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
              {totalPnLPercentage >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {totalPnLPercentage >= 0 ? '+' : ''}{totalPnLPercentage.toFixed(2)}% total return
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -mr-16 -mt-16" />
        </Card>

        <Card className={`relative overflow-hidden border-0 ${totalPnL >= 0
          ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30'
          : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30'
        }`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            {totalPnL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnL >= 0
              ? 'text-green-700 dark:text-green-300'
              : 'text-red-700 dark:text-red-300'
            }`}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`flex items-center text-xs ${totalPnL >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
            }`}>
              {totalPnL >= 0 ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              {totalPnL >= 0 ? '+' : ''}{totalPnLPercentage.toFixed(2)}% change
            </div>
          </CardContent>
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 ${totalPnL >= 0
            ? 'bg-green-200/20'
            : 'bg-red-200/20'
          }`} />
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Portfolios</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {portfolios.length}
            </div>
            <div className="flex items-center text-xs text-purple-600 dark:text-purple-400">
              <Target className="h-3 w-3 mr-1" />
              Total portfolios
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/20 rounded-full -mr-16 -mt-16" />
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Holdings</CardTitle>
            <Coins className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {portfolios.reduce((total, portfolio) => total + (portfolio.metrics?.holdingsCount || 0), 0)}
            </div>
            <div className="flex items-center text-xs text-orange-600 dark:text-orange-400">
              <BarChart3 className="h-3 w-3 mr-1" />
              Across all portfolios
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 rounded-full -mr-16 -mt-16" />
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Portfolio Performance Chart */}
        <Card className="col-span-4 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Portfolio Performance
            </CardTitle>
            <CardDescription>
              Your portfolio value over the last 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {chartLoading ? (
              <div className="h-[350px] flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Loading chart data...</span>
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
          </CardContent>
        </Card>

        {/* Top Cryptocurrencies */}
        <Card className="col-span-3 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bitcoin className="h-5 w-5 text-orange-500" />
              Top Cryptocurrencies
            </CardTitle>
            <CardDescription>
              Most active coins in your watchlist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCryptosData.map((crypto, index) => (
                <Link key={crypto.symbol} href={`/market/${crypto.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
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
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            AI-powered crypto advisory tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <DollarSign className="h-6 w-6" />
              <span>Portfolio Analysis</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <TrendingDown className="h-6 w-6" />
              <span>Market Insights</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <BarChart3 className="h-6 w-6" />
              <span>View Analytics</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span>AI Assistant</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
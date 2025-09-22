"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/ui/data-table"
import { PriceCard } from "@/components/ui/price-card"
import { CryptoChart } from "@/components/ui/crypto-chart"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts"
import {
  Search,
  TrendingUp,
  TrendingDown,
  Star,
  Eye,
  Globe,
  DollarSign,
  BarChart3,
  Activity
} from "lucide-react"
import { cn } from "@/lib/utils"
import { cryptoAPI, CryptoData, MarketData, formatPrice, formatPercentage, formatMarketCap } from "@/lib/crypto-api"
import { ColumnDef } from "@tanstack/react-table"
import { motion } from "framer-motion"
import Link from "next/link"

interface CryptoTableRow extends CryptoData {
  watchlisted?: boolean
}

export default function MarketPage() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([])
  const [globalData, setGlobalData] = useState<MarketData | null>(null)
  const [trendingData, setTrendingData] = useState<any[]>([])
  const [marketChartData, setMarketChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('7d')

  // Fetch market data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all data in parallel
        const [cryptos, global, trending] = await Promise.all([
          cryptoAPI.getTopCryptos(100),
          cryptoAPI.getGlobalData(),
          cryptoAPI.getTrendingCryptos()
        ])

        setCryptoData(cryptos)
        setGlobalData(global)
        setTrendingData(trending)

        // Generate market chart data from top cryptocurrencies
        const chartData = cryptos.slice(0, 10).map((crypto, index) => ({
          name: crypto.symbol.toUpperCase(),
          price: crypto.current_price,
          change: crypto.price_change_percentage_24h,
          marketCap: crypto.market_cap,
          volume: crypto.total_volume,
          color: `hsl(${(index * 36) % 360}, 70%, 50%)` // Different colors for each crypto
        }))
        setMarketChartData(chartData)
      } catch (err) {
        console.error('Error fetching market data:', err)
        setError('Failed to fetch market data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchMarketData()

    // Set up auto-refresh every 60 seconds
    const interval = setInterval(fetchMarketData, 60000)
    return () => clearInterval(interval)
  }, [])

  // Toggle watchlist
  const toggleWatchlist = (cryptoId: string) => {
    setWatchlist(prev =>
      prev.includes(cryptoId)
        ? prev.filter(id => id !== cryptoId)
        : [...prev, cryptoId]
    )
  }

  // Table columns definition
  const columns: ColumnDef<CryptoTableRow>[] = [
    {
      id: "rank",
      header: "#",
      cell: ({ row }) => (
        <div className="font-medium text-sm">
          {row.original.market_cap_rank}
        </div>
      ),
      size: 60
    },
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => (
        <Link href={`/market/${row.original.id}`} className="block">
          <div className="flex items-center space-x-3 hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors cursor-pointer">
            <img
              src={row.original.image}
              alt={row.original.name}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <div className="font-medium">{row.original.name}</div>
              <div className="text-sm text-muted-foreground uppercase">
                {row.original.symbol}
              </div>
            </div>
          </div>
        </Link>
      ),
      size: 200
    },
    {
      id: "price",
      header: "Price",
      cell: ({ row }) => (
        <div className="font-medium">
          {formatPrice(row.original.current_price)}
        </div>
      )
    },
    {
      id: "change24h",
      header: "24h Change",
      cell: ({ row }) => {
        const change = row.original.price_change_percentage_24h
        const isPositive = change >= 0
        return (
          <div className={cn(
            "flex items-center space-x-1 font-medium",
            isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          )}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{formatPercentage(change)}</span>
          </div>
        )
      }
    },
    {
      id: "marketCap",
      header: "Market Cap",
      cell: ({ row }) => (
        <div className="font-medium">
          {formatMarketCap(row.original.market_cap)}
        </div>
      )
    },
    {
      id: "volume",
      header: "24h Volume",
      cell: ({ row }) => (
        <div className="font-medium text-muted-foreground">
          {formatMarketCap(row.original.total_volume)}
        </div>
      )
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleWatchlist(row.original.id)}
            className="h-8 w-8 p-0"
          >
            <Star
              className={cn(
                "h-4 w-4",
                watchlist.includes(row.original.id)
                  ? "fill-yellow-500 text-yellow-500"
                  : "text-muted-foreground"
              )}
            />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      ),
      size: 100
    }
  ]

  if (loading) {
    return (
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight purple-gradient bg-clip-text text-transparent">
            Market Overview
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

        <Card className="ai-card animate-pulse">
          <CardContent className="p-6">
            <div className="h-96 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="ai-card max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Activity className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2">Failed to Load Market Data</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredCryptoData = cryptoData.filter(crypto =>
    crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            Market Overview
          </h1>
          <p className="text-muted-foreground">
            Real-time cryptocurrency market data powered by CoinGecko
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live Data</span>
          </div>
        </div>
      </div>

      {/* Global Market Stats */}
      {globalData && (
        <motion.div
          className="grid gap-4 md:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <PriceCard
            title="Total Market Cap"
            price={globalData.total_market_cap?.usd || 0}
            change={globalData.market_cap_change_percentage_24h_usd}
            subtitle="All Cryptocurrencies"
          />
          <PriceCard
            title="24h Volume"
            price={globalData.total_volume?.usd || 0}
            subtitle="Trading Volume"
          />
          <Card className="ai-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bitcoin Dominance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {globalData.market_cap_percentage?.btc?.toFixed(1) || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Of total market cap
              </p>
            </CardContent>
          </Card>
          <Card className="ai-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cryptocurrencies</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {globalData.active_cryptocurrencies?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Tracked by CoinGecko
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Market Overview Charts */}
      <motion.div
        className="grid gap-6 lg:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        {/* Top Cryptocurrencies Price Chart */}
        <Card className="ai-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Top 10 Cryptocurrencies</CardTitle>
              <div className="flex items-center space-x-2">
                {['24h', '7d', '30d'].map((timeframe) => (
                  <Button
                    key={timeframe}
                    variant={selectedTimeframe === timeframe ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTimeframe(timeframe as any)}
                  >
                    {timeframe}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={marketChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="name"
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
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-card/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Price: </span>
                            <span className="font-semibold text-primary">
                              {formatPrice(data.price)}
                            </span>
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">24h Change: </span>
                            <span className={`font-semibold ${data.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {formatPercentage(data.change)}
                            </span>
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Market Cap: </span>
                            <span className="font-semibold">
                              {formatMarketCap(data.marketCap)}
                            </span>
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#8b5cf6"
                  fill="url(#colorGradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Market Performance Comparison */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle>24h Price Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={marketChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="name"
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
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-card/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">24h Change: </span>
                            <span className={`font-semibold ${data.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {formatPercentage(data.change)}
                            </span>
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Current Price: </span>
                            <span className="font-semibold text-primary">
                              {formatPrice(data.price)}
                            </span>
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="change"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs for different views */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Cryptocurrencies</TabsTrigger>
              <TabsTrigger value="watchlist">
                Watchlist ({watchlist.length})
              </TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cryptocurrencies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>

          <TabsContent value="all">
            <DataTable
              columns={columns}
              data={filteredCryptoData.map(crypto => ({
                ...crypto,
                watchlisted: watchlist.includes(crypto.id)
              }))}
              searchKey="name"
              searchPlaceholder="Search cryptocurrencies..."
            />
          </TabsContent>

          <TabsContent value="watchlist">
            <DataTable
              columns={columns}
              data={filteredCryptoData
                .filter(crypto => watchlist.includes(crypto.id))
                .map(crypto => ({
                  ...crypto,
                  watchlisted: true
                }))}
              searchKey="name"
              searchPlaceholder="Search watchlist..."
            />
          </TabsContent>

          <TabsContent value="trending">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trendingData.slice(0, 6).map((trending, index) => (
                <motion.div
                  key={trending.item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link href={`/market/${trending.item.id}`}>
                    <Card className="ai-card hover:shadow-lg transition-all duration-200 cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <img
                            src={trending.item.large}
                            alt={trending.item.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <div className="font-medium">{trending.item.name}</div>
                            <div className="text-sm text-muted-foreground uppercase">
                              {trending.item.symbol}
                            </div>
                          </div>
                          <Badge variant="secondary" className="ml-auto">
                            #{trending.item.market_cap_rank}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Trending #{index + 1}
                          </div>
                          <div className="flex items-center space-x-1 text-sm">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-green-500">Trending</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
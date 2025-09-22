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
  Activity,
  Newspaper,
  ExternalLink,
  Clock,
  Tag
} from "lucide-react"
import { cn } from "@/lib/utils"
import { cryptoAPI, CryptoData, MarketData, NewsArticle, formatPrice, formatPercentage, formatMarketCap } from "@/lib/crypto-api"
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
  const [newsData, setNewsData] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [newsLoading, setNewsLoading] = useState(false)
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
        const [cryptos, global, trending, news] = await Promise.all([
          cryptoAPI.getTopCryptos(100),
          cryptoAPI.getGlobalData(),
          cryptoAPI.getTrendingCryptos(),
          cryptoAPI.getCryptoNews(8)
        ])

        setCryptoData(cryptos)
        setGlobalData(global)
        setTrendingData(trending)
        setNewsData(news)

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

  // Refresh news data
  const refreshNews = async () => {
    try {
      setNewsLoading(true)
      const news = await cryptoAPI.getCryptoNews(8)
      setNewsData(news)
    } catch (error) {
      console.error('Error refreshing news:', error)
    } finally {
      setNewsLoading(false)
    }
  }

  // Auto-refresh news every 5 minutes
  useEffect(() => {
    const interval = setInterval(refreshNews, 300000) // 5 minutes
    return () => clearInterval(interval)
  }, [])

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="flex gap-6 max-w-[1600px] mx-auto">
        {/* Main Content */}
        <motion.div
          className="flex-1 space-y-6 max-w-4xl"
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

      {/* Market Analysis Charts */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Market Analysis</h2>
            <p className="text-muted-foreground">
              Visual insights into cryptocurrency market trends and performance
            </p>
          </div>
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

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Cryptocurrencies Price Chart */}
          <Card className="ai-card border-2 border-muted/20 hover:border-primary/20 transition-colors">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold">Top 10 Cryptocurrencies</CardTitle>
                  <p className="text-sm text-muted-foreground">Current market prices by rank</p>
                </div>
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={marketChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="currentColor"
                      opacity={0.1}
                      className="text-muted-foreground"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="currentColor"
                      fontSize={11}
                      fontWeight={500}
                      tickLine={false}
                      axisLine={false}
                      className="text-foreground fill-foreground"
                      tick={{ fill: 'currentColor' }}
                    />
                    <YAxis
                      stroke="currentColor"
                      fontSize={11}
                      fontWeight={500}
                      tickLine={false}
                      axisLine={false}
                      className="text-foreground fill-foreground"
                      tick={{ fill: 'currentColor' }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-background/95 backdrop-blur-sm border-2 border-primary/20 rounded-xl p-4 shadow-xl">
                              <p className="font-semibold text-lg text-foreground mb-2">{label}</p>
                              <div className="space-y-1">
                                <p className="text-sm">
                                  <span className="text-muted-foreground">Price: </span>
                                  <span className="font-bold text-primary">
                                    {formatPrice(data.price)}
                                  </span>
                                </p>
                                <p className="text-sm">
                                  <span className="text-muted-foreground">24h Change: </span>
                                  <span className={`font-bold ${data.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {formatPercentage(data.change)}
                                  </span>
                                </p>
                                <p className="text-sm">
                                  <span className="text-muted-foreground">Market Cap: </span>
                                  <span className="font-semibold text-foreground">
                                    {formatMarketCap(data.marketCap)}
                                  </span>
                                </p>
                              </div>
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
                      strokeWidth={3}
                      fill="url(#priceGradient)"
                      dot={false}
                      activeDot={{
                        r: 6,
                        stroke: "#8b5cf6",
                        strokeWidth: 2,
                        fill: "#ffffff"
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Market Performance Comparison */}
          <Card className="ai-card border-2 border-muted/20 hover:border-primary/20 transition-colors">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold">24h Price Changes</CardTitle>
                  <p className="text-sm text-muted-foreground">Percentage changes across top cryptocurrencies</p>
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={marketChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="currentColor"
                      opacity={0.1}
                      className="text-muted-foreground"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="currentColor"
                      fontSize={11}
                      fontWeight={500}
                      tickLine={false}
                      axisLine={false}
                      className="text-foreground fill-foreground"
                      tick={{ fill: 'currentColor' }}
                    />
                    <YAxis
                      stroke="currentColor"
                      fontSize={11}
                      fontWeight={500}
                      tickLine={false}
                      axisLine={false}
                      className="text-foreground fill-foreground"
                      tick={{ fill: 'currentColor' }}
                      tickFormatter={(value) => `${value.toFixed(1)}%`}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-background/95 backdrop-blur-sm border-2 border-primary/20 rounded-xl p-4 shadow-xl">
                              <p className="font-semibold text-lg text-foreground mb-2">{label}</p>
                              <div className="space-y-1">
                                <p className="text-sm">
                                  <span className="text-muted-foreground">24h Change: </span>
                                  <span className={`font-bold ${data.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {formatPercentage(data.change)}
                                  </span>
                                </p>
                                <p className="text-sm">
                                  <span className="text-muted-foreground">Current Price: </span>
                                  <span className="font-bold text-primary">
                                    {formatPrice(data.price)}
                                  </span>
                                </p>
                              </div>
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
                      strokeWidth={3}
                      dot={{
                        fill: "#10b981",
                        strokeWidth: 2,
                        r: 5,
                        stroke: "#ffffff"
                      }}
                      activeDot={{
                        r: 7,
                        stroke: "#10b981",
                        strokeWidth: 2,
                        fill: "#ffffff"
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile News Section (visible on smaller screens) */}
        <motion.div
          className="lg:hidden space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Newspaper className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Latest News</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshNews}
              disabled={newsLoading}
              className="flex items-center space-x-2"
            >
              <Newspaper className={cn("h-4 w-4", newsLoading && "animate-spin")} />
              <span className="hidden sm:inline">{newsLoading ? "Updating..." : "Refresh"}</span>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {newsData.slice(0, 4).map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
              >
                <Card
                  className="ai-card border border-muted/20 hover:border-primary/30 transition-all duration-200 cursor-pointer group"
                  onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}
                >
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      className="w-full h-32 sm:h-24 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-xs">
                        {article.category}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-2">
                      {article.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium">{article.source.name}</span>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(article.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* News Sidebar */}
      <motion.div
        className="w-80 space-y-4 hidden lg:block"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="sticky top-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Newspaper className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Crypto News</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshNews}
              disabled={newsLoading}
              className="h-8 w-8 p-0"
            >
              <Newspaper className={cn("h-4 w-4", newsLoading && "animate-spin")} />
            </Button>
          </div>

          <div className="space-y-3">
            {newsData.slice(0, 6).map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card
                  className="ai-card border border-muted/20 hover:border-primary/30 transition-all duration-200 cursor-pointer group p-3"
                  onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}
                >
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <img
                        src={article.urlToImage}
                        alt={article.title}
                        className="w-16 h-12 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto">
                        {article.category}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(article.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {newsData.length === 0 && !newsLoading && (
            <Card className="ai-card border border-muted/20 p-4">
              <div className="text-center">
                <Newspaper className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">No news available</p>
                <Button onClick={refreshNews} size="sm" disabled={newsLoading}>
                  <Newspaper className="h-3 w-3 mr-1" />
                  Load News
                </Button>
              </div>
            </Card>
          )}
        </div>
      </motion.div>
    </div>
  </div>
  );
}
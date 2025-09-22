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
import { Progress } from "@/components/ui/progress"
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
import { SmartSkeleton } from "@/components/ui/smart-skeleton"
import { AnimatedLoader } from "@/components/ui/animated-loader"
import { MicroInteraction } from "@/components/ui/micro-interaction"
import { DashboardGlassCard, GlassmorphismCard } from "@/components/ui/glassmorphism-card"

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
            <DashboardGlassCard key={i}>
              <SmartSkeleton variant="crypto-card" />
            </DashboardGlassCard>
          ))}
        </div>

        <DashboardGlassCard>
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center space-y-4">
              <AnimatedLoader variant="crypto" size="lg" />
              <span className="text-sm text-muted-foreground">Loading market data...</span>
            </div>
          </div>
        </DashboardGlassCard>
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
    <div className="h-full w-full">
      <div className="flex h-full w-full">
        {/* Main Content Area - Full Width */}
        <motion.div
          className="flex-1 px-3 py-4 space-y-4 overflow-auto max-w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Enhanced Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Market Overview
              </h1>
              <p className="text-lg text-muted-foreground">
                Real-time cryptocurrency market data powered by CoinGecko
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Live Data</span>
              </div>
              <Badge variant="outline" className="px-3 py-1">
                Last updated: {new Date().toLocaleTimeString()}
              </Badge>
            </div>
          </div>

          {/* Enhanced Global Market Stats - More Columns */}
          {globalData && (
            <motion.div
              className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 mb-6"
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
            <MicroInteraction interaction="hover" intensity="subtle">
              <DashboardGlassCard className="relative overflow-hidden group border-orange-500/20 hover:border-orange-500/40">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-foreground/80">Bitcoin Dominance</h3>
                  <MicroInteraction interaction="hover" intensity="moderate">
                    <div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                      <DollarSign className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                    </div>
                  </MicroInteraction>
                </div>
                <div className="space-y-3">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {globalData.market_cap_percentage?.btc?.toFixed(1) || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Of total market cap
                  </p>
                  <div className="mt-2">
                    <Progress value={globalData.market_cap_percentage?.btc || 0} className="h-2" />
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-transparent rounded-full -mr-16 -mt-16 group-hover:from-orange-400/20 transition-all duration-300" />
              </DashboardGlassCard>
            </MicroInteraction>
            <MicroInteraction interaction="hover" intensity="subtle">
              <DashboardGlassCard className="relative overflow-hidden group border-blue-500/20 hover:border-blue-500/40">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-foreground/80">Active Cryptocurrencies</h3>
                  <MicroInteraction interaction="hover" intensity="moderate">
                    <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                      <Globe className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    </div>
                  </MicroInteraction>
                </div>
                <div className="space-y-3">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {globalData.active_cryptocurrencies?.toLocaleString() || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tracked by CoinGecko
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    <Activity className="w-3 h-3 mr-1" />
                    Live tracking
                  </Badge>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full -mr-16 -mt-16 group-hover:from-blue-400/20 transition-all duration-300" />
              </DashboardGlassCard>
            </MicroInteraction>
            </motion.div>
          )}

          {/* Enhanced Tabs Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Tabs defaultValue="all" className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <TabsList className="w-fit">
                  <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    All Cryptocurrencies
                  </TabsTrigger>
                  <TabsTrigger value="watchlist" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Star className="w-4 h-4 mr-1" />
                    Watchlist ({watchlist.length})
                  </TabsTrigger>
                  <TabsTrigger value="trending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Trending
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search cryptocurrencies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-80 h-10 bg-background/50 border-2 border-muted focus:border-primary transition-colors"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="h-10">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Charts
                  </Button>
                </div>
              </div>

              <TabsContent value="all" className="mt-6">
                <Card className="ai-card border-2 border-muted/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-semibold">All Cryptocurrencies</CardTitle>
                      <Badge variant="secondary">
                        {filteredCryptoData.length} assets
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <DataTable
                      columns={columns}
                      data={filteredCryptoData.map(crypto => ({
                        ...crypto,
                        watchlisted: watchlist.includes(crypto.id)
                      }))}
                      searchKey="name"
                      searchPlaceholder="Search cryptocurrencies..."
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="watchlist" className="mt-6">
                <Card className="ai-card border-2 border-yellow-500/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-semibold flex items-center">
                        <Star className="w-5 h-5 mr-2 text-yellow-500" />
                        Your Watchlist
                      </CardTitle>
                      <Badge variant="secondary">
                        {watchlist.length} assets
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {watchlist.length > 0 ? (
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
                    ) : (
                      <div className="text-center py-12">
                        <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No assets in watchlist</h3>
                        <p className="text-muted-foreground mb-4">Start by adding some cryptocurrencies to track</p>
                        <Button onClick={() => setSearchQuery("")} variant="outline">
                          Browse All Assets
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trending" className="mt-6">
                <Card className="ai-card border-2 border-green-500/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-semibold flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                        Trending Now
                      </CardTitle>
                      <Badge variant="secondary">
                        Top {trendingData.slice(0, 6).length} trending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {trendingData.slice(0, 6).map((trending, index) => (
                        <motion.div
                          key={trending.item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Link href={`/market/${trending.item.id}`}>
                            <Card className="ai-card hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer group">
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className="relative">
                                    <img
                                      src={trending.item.large}
                                      alt={trending.item.name}
                                      className="w-10 h-10 rounded-full border-2 border-muted group-hover:border-primary transition-colors"
                                    />
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                      <span className="text-xs font-bold text-white">{index + 1}</span>
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-semibold group-hover:text-primary transition-colors">{trending.item.name}</div>
                                    <div className="text-sm text-muted-foreground uppercase font-medium">
                                      {trending.item.symbol}
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    #{trending.item.market_cap_rank}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-1">
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Trending #{index + 1}</span>
                                  </div>
                                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                    <Activity className="h-3 w-3" />
                                    <span>Hot</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Enhanced Market Analysis Charts */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Market Analysis</h2>
                <p className="text-lg text-muted-foreground">
                  Visual insights into cryptocurrency market trends and performance
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 bg-muted/30 rounded-lg p-1">
                  {['24h', '7d', '30d'].map((timeframe) => (
                    <Button
                      key={timeframe}
                      variant={selectedTimeframe === timeframe ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedTimeframe(timeframe as any)}
                      className={cn(
                        "h-8 transition-all duration-200",
                        selectedTimeframe === timeframe
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "hover:bg-muted/50"
                      )}
                    >
                      {timeframe}
                    </Button>
                  ))}
                </div>
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>

            <div className="grid gap-8 xl:grid-cols-2">
              {/* Enhanced Top Cryptocurrencies Price Chart */}
              <Card className="ai-card border-2 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 shadow-lg">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl font-semibold flex items-center">
                        <BarChart3 className="h-6 w-6 mr-2 text-purple-500" />
                        Top 10 Cryptocurrencies
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">Current market prices by rank</p>
                    </div>
                    <Badge variant="outline" className="bg-purple-500/10 border-purple-500/20">
                      Live Prices
                    </Badge>
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

              {/* Enhanced Market Performance Comparison */}
              <Card className="ai-card border-2 border-green-500/20 hover:border-green-500/40 transition-all duration-300 shadow-lg">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl font-semibold flex items-center">
                        <TrendingUp className="h-6 w-6 mr-2 text-green-500" />
                        24h Price Changes
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">Percentage changes across top cryptocurrencies</p>
                    </div>
                    <Badge variant="outline" className="bg-green-500/10 border-green-500/20">
                      {selectedTimeframe} Performance
                    </Badge>
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
              className="xl:hidden space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Newspaper className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Latest Crypto News</h2>
                    <p className="text-sm text-muted-foreground">Stay updated with market developments</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshNews}
                  disabled={newsLoading}
                  className="flex items-center space-x-2 h-9"
                >
                  <Newspaper className={cn("h-4 w-4", newsLoading && "animate-spin")} />
                  <span className="hidden sm:inline">{newsLoading ? "Updating..." : "Refresh"}</span>
                </Button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {newsData.slice(0, 4).map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
              >
                <Card
                  className="ai-card border-2 border-muted/20 hover:border-blue-500/40 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}
                >
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="bg-background/95 backdrop-blur-sm text-xs font-medium shadow-lg">
                        {article.category}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-3">
                      {article.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-muted-foreground">{article.source.name}</span>
                      <div className="flex items-center space-x-1 text-muted-foreground">
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
        </motion.div>

        {/* Enhanced News Sidebar */}
        <motion.div
          className="w-96 space-y-6 hidden xl:block"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="sticky top-6 space-y-6">
            <Card className="ai-card border-2 border-blue-500/20">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Newspaper className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">Crypto News</CardTitle>
                      <p className="text-xs text-muted-foreground">Latest market updates</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshNews}
                    disabled={newsLoading}
                    className="h-8 w-8 p-0 hover:bg-blue-500/10"
                  >
                    <Newspaper className={cn("h-4 w-4", newsLoading && "animate-spin")} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">

                {newsData.slice(0, 6).map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <div
                      className="group cursor-pointer p-3 rounded-lg hover:bg-muted/30 transition-all duration-200 border border-transparent hover:border-blue-500/20"
                      onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <img
                            src={article.urlToImage}
                            alt={article.title}
                            className="w-20 h-14 object-cover rounded-lg flex-shrink-0 border border-muted"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm leading-tight line-clamp-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {article.title}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs px-2 py-1 bg-muted/50">
                            {article.category}
                          </Badge>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
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
                    </div>
                  </motion.div>
                ))}

                {newsData.length === 0 && !newsLoading && (
                  <div className="text-center p-6">
                    <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">No news available</p>
                    <Button onClick={refreshNews} size="sm" disabled={newsLoading} variant="outline">
                      <Newspaper className="h-3 w-3 mr-2" />
                      Load News
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
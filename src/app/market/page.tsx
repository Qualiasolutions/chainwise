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
import { ProfessionalCard, MetricsCard, ChartCard, DataCard, TableCard } from "@/components/ui/professional-card"

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
    <div className="h-full w-full overflow-auto bg-slate-50/50 dark:bg-slate-950/50">
      <div className="container mx-auto px-4 pb-6 pt-2 space-y-6 max-w-none">
        {/* Professional Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              Market Overview
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Real-time cryptocurrency market data powered by CoinGecko
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-2 py-1 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-600 dark:text-green-400">Live Data</span>
            </div>
            <Badge variant="outline" className="text-xs px-2 py-1 rounded-sm">
              {new Date().toLocaleTimeString()}
            </Badge>
          </div>
        </div>

        {/* Professional Global Market Stats */}
        {globalData && (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <MetricsCard>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-sm bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <DollarSign className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Market Cap</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {formatMarketCap(globalData.total_market_cap?.usd || 0)}
                </div>
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                  {globalData.market_cap_change_percentage_24h_usd >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                  )}
                  <span className={globalData.market_cap_change_percentage_24h_usd >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {globalData.market_cap_change_percentage_24h_usd >= 0 ? '+' : ''}{globalData.market_cap_change_percentage_24h_usd?.toFixed(2)}% 24h
                  </span>
                </div>
              </div>
            </MetricsCard>

            <MetricsCard>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-sm bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <BarChart3 className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">24h Volume</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {formatMarketCap(globalData.total_volume?.usd || 0)}
                </div>
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                  <Activity className="h-3 w-3 mr-1 text-purple-500" />
                  <span className="text-purple-600 dark:text-purple-400">
                    Trading Volume
                  </span>
                </div>
              </div>
            </MetricsCard>

            <MetricsCard>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-sm bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <DollarSign className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Bitcoin Dominance</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {globalData.market_cap_percentage?.btc?.toFixed(1) || 0}%
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Of total market cap</div>
                  <Progress value={globalData.market_cap_percentage?.btc || 0} className="h-1" />
                </div>
              </div>
            </MetricsCard>

            <MetricsCard>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-sm bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Globe className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Active Cryptos</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {globalData.active_cryptocurrencies?.toLocaleString() || 0}
                </div>
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                  <Activity className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">
                    Tracked by CoinGecko
                  </span>
                </div>
              </div>
            </MetricsCard>
          </div>
        )}

        {/* Professional Tabs Section */}
        <div className="space-y-4">
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
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-slate-500" />
                    <Input
                      placeholder="Search cryptocurrencies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-80 h-8 text-sm rounded-sm border-slate-200 dark:border-slate-800 focus:border-slate-400 dark:focus:border-slate-600"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-xs rounded-sm">
                    <BarChart3 className="w-3 h-3 mr-1.5" />
                    Charts
                  </Button>
                </div>
              </div>

              <TabsContent value="all" className="mt-4">
                <TableCard>
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">All Cryptocurrencies</h3>
                      <Badge variant="secondary" className="text-xs rounded-sm">
                        {filteredCryptoData.length} assets
                      </Badge>
                    </div>
                  </div>
                  <DataTable
                    columns={columns}
                    data={filteredCryptoData.map(crypto => ({
                      ...crypto,
                      watchlisted: watchlist.includes(crypto.id)
                    }))}
                    searchKey="name"
                    searchPlaceholder="Search cryptocurrencies..."
                  />
                </TableCard>
              </TabsContent>

              <TabsContent value="watchlist" className="mt-4">
                <TableCard>
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Your Watchlist</h3>
                      </div>
                      <Badge variant="secondary" className="text-xs rounded-sm">
                        {watchlist.length} assets
                      </Badge>
                    </div>
                  </div>
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
                      <Star className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                      <h3 className="text-base font-medium mb-2 text-slate-900 dark:text-slate-100">No assets in watchlist</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Start by adding some cryptocurrencies to track</p>
                      <Button onClick={() => setSearchQuery("")} variant="outline" size="sm" className="text-xs h-8 rounded-sm">
                        Browse All Assets
                      </Button>
                    </div>
                  )}
                </TableCard>
              </TabsContent>

              <TabsContent value="trending" className="mt-4">
                <DataCard>
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Trending Now</h3>
                      </div>
                      <Badge variant="secondary" className="text-xs rounded-sm">
                        Top {trendingData.slice(0, 6).length} trending
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {trendingData.slice(0, 6).map((trending, index) => (
                        <Link key={trending.item.id} href={`/market/${trending.item.id}`}>
                          <div className="p-3 rounded-sm border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="relative">
                                <img
                                  src={trending.item.large}
                                  alt={trending.item.name}
                                  className="w-8 h-8 rounded-full"
                                />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-bold text-white" style={{ fontSize: '8px' }}>{index + 1}</span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{trending.item.name}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">
                                  {trending.item.symbol}
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs px-1 py-0 rounded-sm">
                                #{trending.item.market_cap_rank}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1">
                                <TrendingUp className="h-3 w-3 text-green-500" />
                                <span className="text-xs font-medium text-green-600 dark:text-green-400">Trending #{index + 1}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-xs text-slate-400">
                                <Activity className="h-2 w-2" />
                                <span>Hot</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </DataCard>
              </TabsContent>
            </Tabs>
        </div>
      </div>
    </div>
  )
}

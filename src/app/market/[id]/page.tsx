"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Star,
  ExternalLink,
  Globe,
  Twitter,
  Github,
  MessageCircle,
  Calendar,
  DollarSign,
  BarChart3,
  Activity,
  Loader2,
  AlertCircle,
  Bell
} from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { cryptoAPI, formatPrice, formatPercentage, formatMarketCap } from "@/lib/crypto-api"
import { motion } from "framer-motion"
import Link from "next/link"
import CreateAlertModal from "@/components/alerts/CreateAlertModal"

interface CoinDetails {
  id: string
  symbol: string
  name: string
  image: {
    large: string
  }
  market_cap_rank: number
  market_data: {
    current_price: {
      usd: number
    }
    market_cap: {
      usd: number
    }
    total_volume: {
      usd: number
    }
    price_change_percentage_24h: number
    price_change_percentage_7d: number
    price_change_percentage_30d: number
    high_24h: {
      usd: number
    }
    low_24h: {
      usd: number
    }
    circulating_supply: number
    total_supply: number
    max_supply: number
    ath: {
      usd: number
    }
    ath_date: {
      usd: string
    }
    atl: {
      usd: number
    }
    atl_date: {
      usd: string
    }
  }
  description: {
    en: string
  }
  links: {
    homepage: string[]
    blockchain_site: string[]
    twitter_screen_name: string
    facebook_username: string
    telegram_channel_identifier: string
    subreddit_url: string
    repos_url: {
      github: string[]
    }
  }
  community_data: {
    twitter_followers: number
    reddit_subscribers: number
    telegram_channel_user_count: number
  }
  developer_data: {
    stars: number
    forks: number
    subscribers: number
    total_issues: number
    closed_issues: number
  }
}

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--chart-1))",
  },
  volume: {
    label: "Volume",
    color: "hsl(var(--chart-2))",
  },
}

export default function CoinDetailPage() {
  const params = useParams()
  const router = useRouter()
  const coinId = params.id as string

  const [coinDetails, setCoinDetails] = useState<CoinDetails | null>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartPeriod, setChartPeriod] = useState(7)
  const [showAlertModal, setShowAlertModal] = useState(false)

  useEffect(() => {
    const fetchCoinDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch coin details
        const details = await cryptoAPI.getCoinDetails(coinId)
        setCoinDetails(details)

        // Fetch chart data
        const chart = await cryptoAPI.getCryptoChart(coinId, chartPeriod)
        const formattedChart = chart.prices.map(([timestamp, price]: [number, number]) => ({
          time: new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
          price: Math.round(price * 100) / 100,
          volume: chart.total_volumes[chart.prices.indexOf([timestamp, price])]?.[1] || 0
        }))
        setChartData(formattedChart)
      } catch (err) {
        console.error('Error fetching coin details:', err)
        setError('Failed to load coin details. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (coinId) {
      fetchCoinDetails()
    }
  }, [coinId, chartPeriod])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-lg">Loading coin details...</span>
        </div>
      </div>
    )
  }

  if (error || !coinDetails) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <AlertCircle className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2">Failed to Load Coin Details</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Button variant="outline" asChild>
                <Link href="/market">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Market
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentPrice = coinDetails.market_data.current_price.usd
  const priceChange24h = coinDetails.market_data.price_change_percentage_24h
  const isPositive = priceChange24h >= 0

  return (
    <motion.div
      className="flex-1 space-y-6 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/market">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Market
            </Link>
          </Button>
          <div className="flex items-center space-x-3">
            <img
              src={coinDetails.image.large}
              alt={coinDetails.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {coinDetails.name}
              </h1>
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground uppercase font-medium">
                  {coinDetails.symbol}
                </span>
                <Badge variant="secondary">
                  #{coinDetails.market_cap_rank}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Star className="h-4 w-4 mr-2" />
            Watchlist
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowAlertModal(true)}>
            <Bell className="h-4 w-4 mr-2" />
            Set Alert
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            Add to Portfolio
          </Button>
        </div>
      </div>

      {/* Price Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold mb-2">
                {formatPrice(currentPrice)}
              </div>
              <div className={`flex items-center space-x-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
                <span className="font-medium">
                  {formatPercentage(priceChange24h)}
                </span>
                <span className="text-muted-foreground">24h</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 text-right">
              <div>
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p className="font-semibold">
                  {formatMarketCap(coinDetails.market_data.market_cap.usd)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="font-semibold">
                  {formatMarketCap(coinDetails.market_data.total_volume.usd)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Circulating Supply</p>
                <p className="font-semibold">
                  {coinDetails.market_data.circulating_supply?.toLocaleString() || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">24h High</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(coinDetails.market_data.high_24h.usd)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">24h Low</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(coinDetails.market_data.low_24h.usd)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">All-Time High</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(coinDetails.market_data.ath.usd)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(coinDetails.market_data.ath_date.usd).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">All-Time Low</CardTitle>
                <Activity className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(coinDetails.market_data.atl.usd)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(coinDetails.market_data.atl_date.usd).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Price Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Price Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">7 Days</p>
                  <p className={`text-lg font-semibold ${coinDetails.market_data.price_change_percentage_7d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(coinDetails.market_data.price_change_percentage_7d || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">30 Days</p>
                  <p className={`text-lg font-semibold ${coinDetails.market_data.price_change_percentage_30d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(coinDetails.market_data.price_change_percentage_30d || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">24 Hours</p>
                  <p className={`text-lg font-semibold ${priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(priceChange24h)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Price Chart</CardTitle>
                <div className="flex items-center space-x-2">
                  {[7, 30, 90, 365].map((days) => (
                    <Button
                      key={days}
                      variant={chartPeriod === days ? "default" : "outline"}
                      size="sm"
                      onClick={() => setChartPeriod(days)}
                    >
                      {days}d
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                      </linearGradient>
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
                      tickFormatter={(value) => formatPrice(value)}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPrice)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About {coinDetails.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: coinDetails.description.en || "No description available."
                }}
              />
            </CardContent>
          </Card>

          {/* Community & Developer Stats */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Community</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Twitter Followers</span>
                  <span className="font-medium">
                    {coinDetails.community_data.twitter_followers?.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Reddit Subscribers</span>
                  <span className="font-medium">
                    {coinDetails.community_data.reddit_subscribers?.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Telegram Users</span>
                  <span className="font-medium">
                    {coinDetails.community_data.telegram_channel_user_count?.toLocaleString() || 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Developer Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>GitHub Stars</span>
                  <span className="font-medium">
                    {coinDetails.developer_data.stars?.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>GitHub Forks</span>
                  <span className="font-medium">
                    {coinDetails.developer_data.forks?.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Issues</span>
                  <span className="font-medium">
                    {coinDetails.developer_data.total_issues?.toLocaleString() || 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="links" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Official Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {coinDetails.links.homepage?.[0] && (
                  <a
                    href={coinDetails.links.homepage[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Official Website</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {coinDetails.links.blockchain_site?.[0] && (
                  <a
                    href={coinDetails.links.blockchain_site[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Blockchain Explorer</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {coinDetails.links.twitter_screen_name && (
                  <a
                    href={`https://twitter.com/${coinDetails.links.twitter_screen_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Twitter className="h-4 w-4" />
                    <span>Twitter</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {coinDetails.links.subreddit_url && (
                  <a
                    href={coinDetails.links.subreddit_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Reddit</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {coinDetails.links.repos_url.github?.[0] && (
                  <a
                    href={coinDetails.links.repos_url.github[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    <span>GitHub</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Alert Modal */}
      <CreateAlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        defaultSymbol={coinDetails?.symbol}
        currentPrice={currentPrice}
      />
    </motion.div>
  )
}
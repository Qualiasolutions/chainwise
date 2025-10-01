"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  Bot,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Zap,
  Target,
  Brain,
  Shield,
  Radar,
  Sparkles,
  Eye,
  Copy,
  Bell,
  Search,
  PieChart,
  Briefcase,
  ArrowRight,
  Crown,
  Lock,
  ChevronRight,
  RefreshCw
} from "lucide-react"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import { usePortfolio } from "@/hooks/usePortfolio"
import { formatPrice, formatPercentage, formatMarketCap } from "@/lib/crypto-api"
import { cn } from "@/lib/utils"
import { PortfolioMetricsGrid } from "@/components/portfolio/PortfolioMetricsGrid"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts"

interface MarketData {
  symbol: string
  name: string
  price: number
  change24h: number
  image?: string
}

interface PremiumTool {
  id: string
  name: string
  description: string
  icon: any
  credits: number
  tier: 'free' | 'pro' | 'elite'
  path: string
  color: string
  bgColor: string
}

const PREMIUM_TOOLS: PremiumTool[] = [
  {
    id: 'whale-tracker',
    name: 'Whale Tracker',
    description: 'Monitor large wallet movements and smart money',
    icon: Eye,
    credits: 5,
    tier: 'pro',
    path: '/tools/whale-tracker',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30'
  },
  {
    id: 'ai-reports',
    name: 'AI Market Reports',
    description: 'Deep market analysis with AI insights',
    icon: Brain,
    credits: 10,
    tier: 'elite',
    path: '/tools/ai-reports',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30'
  },
  {
    id: 'portfolio-allocator',
    name: 'Portfolio Allocator',
    description: 'Optimize your portfolio allocation strategy',
    icon: PieChart,
    credits: 3,
    tier: 'pro',
    path: '/tools/portfolio-allocator',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30'
  },
  {
    id: 'signals-pack',
    name: 'Trading Signals',
    description: 'Multi-indicator trading signal analysis',
    icon: Zap,
    credits: 5,
    tier: 'pro',
    path: '/tools/signals-pack',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
  },
  {
    id: 'smart-alerts',
    name: 'Smart Alerts',
    description: 'AI-powered price and event alerts',
    icon: Bell,
    credits: 2,
    tier: 'pro',
    path: '/tools/smart-alerts',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30'
  },
  {
    id: 'narrative-scanner',
    name: 'Narrative Scanner',
    description: 'Detect trending narratives and sentiment',
    icon: Radar,
    credits: 4,
    tier: 'pro',
    path: '/tools/narrative-scanner',
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30'
  },
  {
    id: 'altcoin-detector',
    name: 'Altcoin Detector',
    description: 'Find hidden gems and early opportunities',
    icon: Search,
    credits: 4,
    tier: 'pro',
    path: '/tools/altcoin-detector',
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30'
  },
  {
    id: 'whale-copy',
    name: 'Whale Copy Trading',
    description: 'Copy successful whale trading strategies',
    icon: Copy,
    credits: 8,
    tier: 'elite',
    path: '/tools/whale-copy',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30'
  }
]

export default function DashboardPage() {
  const { user, profile } = useSupabaseAuth()
  const { portfolios, loading, getTotalPortfolioValue, getTotalPortfolioPnL, getTotalPortfolioPnLPercentage, getDefaultPortfolio } = usePortfolio()
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [marketLoading, setMarketLoading] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])

  const totalValue = getTotalPortfolioValue()
  const totalPnL = getTotalPortfolioPnL()
  const totalPnLPercentage = getTotalPortfolioPnLPercentage()
  const defaultPortfolio = getDefaultPortfolio()

  // Fetch live market data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch('/api/crypto/markets?limit=6')
        if (response.ok) {
          const data = await response.json()
          const formatted = data.map((coin: any) => ({
            symbol: coin.symbol?.toUpperCase() || '',
            name: coin.name || '',
            price: coin.current_price || 0,
            change24h: coin.price_change_percentage_24h || 0,
            image: coin.image || ''
          }))
          setMarketData(formatted)
        }
      } catch (error) {
        console.error('Failed to fetch market data:', error)
      } finally {
        setMarketLoading(false)
      }
    }

    fetchMarketData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchMarketData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Generate portfolio performance chart
  useEffect(() => {
    const data = []
    const baseValue = totalValue - totalPnL

    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      const progress = i / 29
      const variation = (Math.random() - 0.5) * 0.05
      const value = baseValue * (1 + (totalPnLPercentage / 100) * progress + variation)

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.max(0, value)
      })
    }

    setChartData(data)
  }, [totalValue, totalPnL, totalPnLPercentage])

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'free':
        return <Badge variant="outline" className="text-xs">FREE</Badge>
      case 'pro':
        return <Badge className="text-xs bg-blue-500">PRO</Badge>
      case 'elite':
        return <Badge className="text-xs bg-gradient-to-r from-purple-500 to-pink-500"><Crown className="h-3 w-3 mr-1" />ELITE</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="h-full w-full overflow-auto bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-7xl">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse border-0 shadow-lg">
                <CardContent className="p-4 sm:p-6">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full overflow-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-7xl">

        {/* Enhanced Header with Live Data */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
              Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/ai">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                <Bot className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">AI Assistant</span>
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Live Market Ticker */}
        {!marketLoading && marketData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-blue-50 dark:from-slate-900 dark:to-slate-800">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between overflow-x-auto gap-3 sm:gap-6 pb-2">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                    <span className="text-xs sm:text-sm font-medium">Live Market</span>
                  </div>
                  {marketData.map((coin) => (
                    <div key={coin.symbol} className="flex items-center gap-2 flex-shrink-0">
                      {coin.image && <img src={coin.image} alt={coin.name} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full" />}
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold uppercase">{coin.symbol}</span>
                        <span className="text-xs">{formatPrice(coin.price)}</span>
                      </div>
                      <span className={cn(
                        "text-xs font-bold whitespace-nowrap",
                        coin.change24h >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      )}>
                        {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Enhanced Portfolio Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PortfolioMetricsGrid portfolioId={defaultPortfolio?.id || null} />
        </motion.div>

        {/* Premium Tools Grid - The WOW Factor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                Premium AI Tools
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Advanced tools powered by AI for professional traders
              </p>
            </div>
            <Badge variant="outline" className="hidden sm:flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {profile?.credits || 0} credits
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {PREMIUM_TOOLS.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <Link href={tool.path}>
                  <Card className="group h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 overflow-hidden relative">
                    {/* Tier Badge */}
                    <div className="absolute top-2 right-2 z-10">
                      {getTierBadge(tool.tier)}
                    </div>

                    {/* Gradient Overlay */}
                    <div className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                      tool.bgColor.replace('dark:', '')
                    )}></div>

                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-3 sm:gap-4 mb-3">
                        <div className={cn(
                          "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform",
                          tool.bgColor
                        )}>
                          <tool.icon className={cn("h-5 w-5 sm:h-6 sm:w-6", tool.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                            {tool.name}
                          </h3>
                          <div className="flex items-center gap-1 mt-1">
                            <Zap className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs text-muted-foreground">{tool.credits} credits</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {tool.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                          Launch Tool
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Analytics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
        >
          {/* Portfolio Performance Chart */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                Portfolio Performance (30D)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: any) => [formatPrice(value), 'Value']}
                      contentStyle={{ fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                  No performance data yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/portfolio">
                <Button variant="outline" className="w-full justify-between group hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all">
                  <span className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Manage Portfolio
                  </span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/dashboard/analytics">
                <Button variant="outline" className="w-full justify-between group hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all">
                  <span className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    View Analytics
                  </span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/market">
                <Button variant="outline" className="w-full justify-between group hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all">
                  <span className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Explore Markets
                  </span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/highlights">
                <Button variant="outline" className="w-full justify-between group hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Market Highlights
                  </span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs sm:text-sm text-muted-foreground pb-4"
        >
          <p className="flex items-center justify-center gap-2">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            Platform Status: All Systems Operational • {marketData.length} Markets Tracked • Real-Time Data
          </p>
        </motion.div>

      </div>
    </div>
  )
}

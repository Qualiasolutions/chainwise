"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Home,
  Wallet,
  Settings,
  LogOut,
  ChevronRight,
  Flame,
  Clock,
  TrendingUpIcon,
  Users,
  Globe,
  AlertCircle,
  CheckCircle2,
  Menu,
  X
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
  Cell,
  BarChart,
  Bar
} from "recharts"

interface MarketData {
  symbol: string
  name: string
  price: number
  change24h: number
  image?: string
  market_cap?: number
  volume?: number
}

interface TrendingCoin {
  id: string
  name: string
  symbol: string
  price: number
  change24h: number
  image: string
  sparkline?: number[]
}

interface Activity {
  id: string
  type: 'buy' | 'sell' | 'alert' | 'report'
  message: string
  time: string
  icon: any
  color: string
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
    description: 'Monitor large wallet movements',
    icon: Eye,
    credits: 5,
    tier: 'pro',
    path: '/tools/whale-tracker',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30'
  },
  {
    id: 'ai-reports',
    name: 'AI Reports',
    description: 'Deep market analysis',
    icon: Brain,
    credits: 10,
    tier: 'elite',
    path: '/tools/ai-reports',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30'
  },
  {
    id: 'portfolio-allocator',
    name: 'Allocator',
    description: 'Optimize portfolio',
    icon: PieChart,
    credits: 3,
    tier: 'pro',
    path: '/tools/portfolio-allocator',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30'
  },
  {
    id: 'signals-pack',
    name: 'Signals',
    description: 'Trading signals',
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
    description: 'AI-powered alerts',
    icon: Bell,
    credits: 2,
    tier: 'pro',
    path: '/tools/smart-alerts',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30'
  },
  {
    id: 'narrative-scanner',
    name: 'Narratives',
    description: 'Detect trends',
    icon: Radar,
    credits: 4,
    tier: 'pro',
    path: '/tools/narrative-scanner',
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30'
  },
  {
    id: 'altcoin-detector',
    name: 'Altcoins',
    description: 'Find gems',
    icon: Search,
    credits: 4,
    tier: 'pro',
    path: '/tools/altcoin-detector',
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30'
  },
  {
    id: 'whale-copy',
    name: 'Copy Trading',
    description: 'Copy whales',
    icon: Copy,
    credits: 8,
    tier: 'elite',
    path: '/tools/whale-copy',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30'
  }
]

const NAV_ITEMS = [
  { name: 'Dashboard', icon: Home, path: '/dashboard', active: true },
  { name: 'Portfolio', icon: Briefcase, path: '/portfolio', active: false },
  { name: 'Analytics', icon: BarChart3, path: '/dashboard/analytics', active: false },
  { name: 'AI Chat', icon: Bot, path: '/dashboard/ai', active: false },
  { name: 'Market', icon: Activity, path: '/market', active: false },
  { name: 'Highlights', icon: Flame, path: '/highlights', active: false },
]

export default function DashboardPage() {
  const { user, profile } = useSupabaseAuth()
  const { portfolios, loading, getTotalPortfolioValue, getTotalPortfolioPnL, getTotalPortfolioPnLPercentage, getDefaultPortfolio } = usePortfolio()

  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [trendingCoins, setTrendingCoins] = useState<TrendingCoin[]>([])
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [marketLoading, setMarketLoading] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])
  const [allocationData, setAllocationData] = useState<any[]>([])
  const [volumeData, setVolumeData] = useState<any[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const totalValue = getTotalPortfolioValue()
  const totalPnL = getTotalPortfolioPnL()
  const totalPnLPercentage = getTotalPortfolioPnLPercentage()
  const defaultPortfolio = getDefaultPortfolio()

  // Fetch live market data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const [marketsRes, trendingRes] = await Promise.all([
          fetch('/api/crypto/markets?limit=10'),
          fetch('/api/crypto/trending')
        ])

        if (marketsRes.ok) {
          const data = await marketsRes.json()
          const formatted = data.slice(0, 10).map((coin: any) => ({
            symbol: coin.symbol?.toUpperCase() || '',
            name: coin.name || '',
            price: coin.current_price || 0,
            change24h: coin.price_change_percentage_24h || 0,
            image: coin.image || '',
            market_cap: coin.market_cap || 0,
            volume: coin.total_volume || 0
          }))
          setMarketData(formatted)

          // Generate volume chart data from top coins
          const volumeChartData = data.slice(0, 6).map((coin: any) => ({
            name: coin.symbol?.toUpperCase() || '',
            volume: coin.total_volume || 0
          }))
          setVolumeData(volumeChartData)
        }

        if (trendingRes.ok) {
          const trendingData = await trendingRes.json()
          const formattedTrending = trendingData.coins?.slice(0, 5).map((item: any) => ({
            id: item.item.id,
            name: item.item.name,
            symbol: item.item.symbol?.toUpperCase(),
            price: item.item.data?.price || 0,
            change24h: item.item.data?.price_change_percentage_24h?.usd || 0,
            image: item.item.large || item.item.thumb
          })) || []
          setTrendingCoins(formattedTrending)
        }
      } catch (error) {
        console.error('Failed to fetch market data:', error)
      } finally {
        setMarketLoading(false)
      }
    }

    fetchMarketData()
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
        value: Math.max(0, value),
        pnl: value - baseValue
      })
    }
    setChartData(data)

    // Generate allocation data
    const allocations = [
      { name: 'BTC', value: totalValue * 0.4, color: '#f7931a' },
      { name: 'ETH', value: totalValue * 0.3, color: '#627eea' },
      { name: 'Altcoins', value: totalValue * 0.2, color: '#8b5cf6' },
      { name: 'Stables', value: totalValue * 0.1, color: '#10b981' }
    ]
    setAllocationData(allocations)
  }, [totalValue, totalPnL, totalPnLPercentage])

  // Generate mock activities
  useEffect(() => {
    const activities: Activity[] = [
      {
        id: '1',
        type: 'buy',
        message: 'Bought 0.5 ETH at $4,200',
        time: '2 hours ago',
        icon: TrendingUp,
        color: 'text-green-600'
      },
      {
        id: '2',
        type: 'alert',
        message: 'BTC crossed $112,000',
        time: '4 hours ago',
        icon: Bell,
        color: 'text-blue-600'
      },
      {
        id: '3',
        type: 'report',
        message: 'Weekly AI Report ready',
        time: '1 day ago',
        icon: Brain,
        color: 'text-purple-600'
      },
      {
        id: '4',
        type: 'sell',
        message: 'Sold 1000 ADA at $0.85',
        time: '2 days ago',
        icon: TrendingDown,
        color: 'text-red-600'
      }
    ]
    setRecentActivities(activities)
  }, [])

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'elite':
        return <Badge className="text-xs bg-gradient-to-r from-purple-500 to-pink-500"><Crown className="h-3 w-3 mr-1" />ELITE</Badge>
      case 'pro':
        return <Badge className="text-xs bg-blue-500">PRO</Badge>
      default:
        return <Badge variant="outline" className="text-xs">FREE</Badge>
    }
  }

  if (loading) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-6 max-w-[1920px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="animate-pulse col-span-4">
                <CardContent className="p-6">
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
    <div className="h-full w-full bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="flex h-full">

        {/* LEFT SIDEBAR - Navigation & Portfolio Summary */}
        <AnimatePresence>
          {(sidebarOpen || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="fixed lg:relative z-50 lg:z-0 w-72 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xl lg:shadow-none"
            >
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                  {/* Close button for mobile */}
                  <div className="lg:hidden flex justify-between items-center mb-4">
                    <h2 className="font-bold text-lg">Navigation</h2>
                    <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* User Profile */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-purple-500">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                          {user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="text-xs font-medium">Credits</span>
                      </div>
                      <span className="font-bold text-sm">{profile?.credits || 0}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Quick Portfolio Stats */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground">Portfolio</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Total Value</span>
                        <span className="text-sm font-bold">{formatPrice(totalValue)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">P&L</span>
                        <span className={cn(
                          "text-sm font-bold",
                          totalPnL >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        )}>
                          {totalPnL >= 0 ? '+' : ''}{formatPrice(totalPnL)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">24h Change</span>
                        <span className={cn(
                          "text-sm font-bold",
                          totalPnLPercentage >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        )}>
                          {formatPercentage(totalPnLPercentage)}
                        </span>
                      </div>
                      <Progress value={Math.abs(totalPnLPercentage)} className="h-2" />
                    </div>
                  </div>

                  <Separator />

                  {/* Navigation */}
                  <nav className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Navigation</h3>
                    {NAV_ITEMS.map((item) => (
                      <Link key={item.path} href={item.path}>
                        <Button
                          variant={item.active ? "default" : "ghost"}
                          className={cn(
                            "w-full justify-start",
                            item.active && "bg-gradient-to-r from-blue-600 to-purple-600"
                          )}
                        >
                          <item.icon className="h-4 w-4 mr-3" />
                          {item.name}
                        </Button>
                      </Link>
                    ))}
                  </nav>

                  <Separator />

                  {/* Settings & Logout */}
                  <div className="space-y-2">
                    <Link href="/settings">
                      <Button variant="ghost" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </Button>
                    </Link>
                  </div>
                </div>
              </ScrollArea>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">

            {/* Mobile Header with Menu */}
            <div className="lg:hidden mb-4 flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-bold">Dashboard</h1>
              <div className="w-10"></div>
            </div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-2">
                Trading Command Center
              </h1>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </motion.div>

            {/* Portfolio Metrics Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <PortfolioMetricsGrid portfolioId={defaultPortfolio?.id || null} />
            </motion.div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Performance Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-0 shadow-lg h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Portfolio Performance
                    </CardTitle>
                    <CardDescription>30-day trend with P&L</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
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
                          <Area type="monotone" dataKey="value" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                        No data yet
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Allocation Pie Chart */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-0 shadow-lg h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <PieChart className="h-4 w-4" />
                      Asset Allocation
                    </CardTitle>
                    <CardDescription>Current portfolio distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {allocationData.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={200}>
                          <RechartsPieChart>
                            <Pie
                              data={allocationData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              dataKey="value"
                              label={(entry) => `${entry.name} ${((entry.value / totalValue) * 100).toFixed(0)}%`}
                              labelLine={false}
                            >
                              {allocationData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => formatPrice(value)} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          {allocationData.map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-xs font-medium">{item.name}</span>
                              <span className="text-xs text-muted-foreground ml-auto">
                                {formatPrice(item.value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                        Add holdings to see allocation
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Volume Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Top 6 Coins by 24h Volume
                  </CardTitle>
                  <CardDescription>Real-time trading volume comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  {volumeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={volumeData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `$${(value / 1e9).toFixed(1)}B`} />
                        <Tooltip
                          formatter={(value: any) => [`$${(value / 1e9).toFixed(2)}B`, 'Volume']}
                          contentStyle={{ fontSize: '12px' }}
                        />
                        <Bar dataKey="volume" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                      Loading volume data...
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Premium Tools Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Premium AI Tools
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Launch advanced analysis tools
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PREMIUM_TOOLS.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                  >
                    <Link href={tool.path}>
                      <Card className="group h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
                        <div className="absolute top-2 right-2 z-10">
                          {getTierBadge(tool.tier)}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex flex-col items-center text-center gap-3">
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform",
                              tool.bgColor
                            )}>
                              <tool.icon className={cn("h-6 w-6", tool.color)} />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm mb-1">{tool.name}</h3>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {tool.description}
                              </p>
                              <div className="flex items-center justify-center gap-1">
                                <Zap className="h-3 w-3 text-yellow-500" />
                                <span className="text-xs font-medium">{tool.credits}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </div>
        </main>

        {/* RIGHT SIDEBAR - Market Feed & Activity */}
        <aside className="hidden xl:block w-80 h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6">

              {/* Live Market Feed */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                    Live Markets
                  </h3>
                  <Badge variant="outline" className="text-xs">Live</Badge>
                </div>
                <div className="space-y-2">
                  {marketData.slice(0, 8).map((coin) => (
                    <div key={coin.symbol} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {coin.image && (
                          <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold truncate">{coin.symbol}</p>
                          <p className="text-xs text-muted-foreground">{formatPrice(coin.price)}</p>
                        </div>
                      </div>
                      <div className={cn(
                        "text-xs font-bold whitespace-nowrap",
                        coin.change24h >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      )}>
                        {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Trending Coins */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    Trending
                  </h3>
                </div>
                <div className="space-y-2">
                  {trendingCoins.map((coin, index) => (
                    <div key={coin.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <span className="text-xs font-bold text-muted-foreground w-4">#{index + 1}</span>
                      <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{coin.name}</p>
                        <p className="text-xs text-muted-foreground">{coin.symbol}</p>
                      </div>
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Recent Activity */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recent Activity
                  </h3>
                </div>
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        activity.type === 'buy' && "bg-green-100 dark:bg-green-900/30",
                        activity.type === 'sell' && "bg-red-100 dark:bg-red-900/30",
                        activity.type === 'alert' && "bg-blue-100 dark:bg-blue-900/30",
                        activity.type === 'report' && "bg-purple-100 dark:bg-purple-900/30"
                      )}>
                        <activity.icon className={cn("h-4 w-4", activity.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Market Sentiment */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Market Sentiment</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Fear & Greed Index</span>
                    <Badge className="bg-green-500">68 - Greed</Badge>
                  </div>
                  <Progress value={68} className="h-2" />
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <div className="flex items-center gap-1 mb-1">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <span className="text-xs font-medium">Bullish</span>
                      </div>
                      <p className="text-lg font-bold text-green-600">62%</p>
                    </div>
                    <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                      <div className="flex items-center gap-1 mb-1">
                        <TrendingDown className="h-3 w-3 text-red-600" />
                        <span className="text-xs font-medium">Bearish</span>
                      </div>
                      <p className="text-lg font-bold text-red-600">38%</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </ScrollArea>
        </aside>

      </div>
    </div>
  )
}

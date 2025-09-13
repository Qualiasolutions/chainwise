"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useSupabase } from "@/components/providers/supabase-provider"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Bell,
  Bot,
  Zap,
  Activity,
  Target,
  RefreshCw,
  Sun,
  Moon,
  User,
  ChevronDown,
  AlertCircle,
  PieChart,
  LineChart,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Settings,
  Plus,
  Star,
  Clock,
  Shield,
  Brain,
  MessageSquare,
  Bitcoin,
  Coins,
  CreditCard,
  Gem
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { EvervaultCard, Icon } from "@/components/ui/evervault-card"
import { Button as MovingBorderButton } from "@/components/ui/moving-border"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts"
import { cn } from "@/lib/utils"
import { SparklesText } from "@/components/magicui/sparkles-text"
import { AnimatedBeam } from "@/components/magicui/animated-beam"
import { GlassmorphismCard } from "@/components/ui/glassmorphism-card"
import { Enhanced3DCard } from "@/components/ui/enhanced-3d-card"
import { ModernChartContainer } from "@/components/ui/modern-chart-container"
import { NeonButton } from "@/components/ui/neon-button"
import { marketDataService, type MarketMover } from "@/lib/market-data-service"
import { AIWiseAssistant } from "@/components/ai-wise-assistant"

// ChainWise gradient colors
const CHART_COLORS = {
  primary: "#4f46e5",
  secondary: "#8b5cf6",
  accent: "#2563eb",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  gradient: {
    primary: "url(#colorPrimary)",
    secondary: "url(#colorSecondary)"
  }
}

// Portfolio performance data - will be loaded from real data
const getEmptyPortfolioData = () => [
  { month: "Jan", value: 0, profit: 0 },
  { month: "Feb", value: 0, profit: 0 },
  { month: "Mar", value: 0, profit: 0 },
  { month: "Apr", value: 0, profit: 0 },
  { month: "May", value: 0, profit: 0 },
  { month: "Jun", value: 0, profit: 0 },
]

// No hardcoded mock data - will load real data from APIs

interface DashboardProps {
  className?: string
}

export default function UnifiedDashboard({ className }: DashboardProps) {
  const { supabase, user } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [dashboardData, setDashboardData] = useState({
    totalValue: 0,
    dailyChange: 0,
    dailyChangePercent: 0,
    portfolioCount: 0,
    totalHoldings: 0,
    credits: 0,
    subscription: "free",
    aiSessions: 0,
    alerts: 0
  })
  const [cryptoDistribution, setCryptoDistribution] = useState<Array<{name: string, value: number, percentage: number}>>([])
  const [topMovers, setTopMovers] = useState<MarketMover[]>([])
  const [trendingCoins, setTrendingCoins] = useState<MarketMover[]>([])
  const [globalMarketData, setGlobalMarketData] = useState({
    totalMarketCap: 0,
    totalVolume: 0,
    btcDominance: 0,
    marketCapChange: 0
  })
  const [hasRealData, setHasRealData] = useState(false)
  const [marketDataLoading, setMarketDataLoading] = useState(true)
  const [marketDataError, setMarketDataError] = useState<string | null>(null)

  // Refs for AnimatedBeam connections
  const containerRef = React.useRef<HTMLDivElement>(null)
  const aiCreditsRef = React.useRef<HTMLDivElement>(null)
  const aiAssistantRef = React.useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    fetchDashboardData()
    fetchMarketData()
  }, [user])

  const fetchMarketData = async () => {
    try {
      setMarketDataLoading(true)
      setMarketDataError(null)
      
      // Fetch market data with individual error handling
      const marketDataPromises = [
        marketDataService.getTopMovers(5).catch(err => ({ gainers: [], losers: [], error: err })),
        marketDataService.getTrendingCoins().catch(err => ({ data: [], error: err })),
        marketDataService.getGlobalMarketData().catch(err => ({ 
          totalMarketCap: 0, totalVolume: 0, btcDominance: 0, marketCapChange: 0, error: err 
        }))
      ]

      const [movers, trending, global] = await Promise.all(marketDataPromises)
      
      // Handle movers with fallback
      if ('error' in movers) {
        console.error("Error fetching top movers:", movers.error)
        setTopMovers([])
      } else {
        const allMovers = [...movers.gainers, ...movers.losers].slice(0, 6)
        setTopMovers(allMovers)
      }

      // Handle trending with fallback
      if ('error' in trending) {
        console.error("Error fetching trending coins:", trending.error)
        setTrendingCoins([])
      } else {
        setTrendingCoins(Array.isArray(trending) ? trending : [])
      }

      // Handle global data with fallback
      if ('error' in global) {
        console.error("Error fetching global market data:", global.error)
        // Keep existing global data
      } else {
        setGlobalMarketData(global)
      }
      
      // Update portfolio values if user is logged in (with separate error handling)
      if (user?.id) {
        try {
          await marketDataService.updatePortfolioValues(user.id)
        } catch (portfolioError) {
          console.error('Failed to update portfolio values:', portfolioError)
          // Don't fail the entire operation for portfolio update errors
        }
      }
    } catch (error) {
      console.error("Error fetching market data:", error)
      setMarketDataError(error instanceof Error ? error.message : 'Failed to load market data')
      
      // Set fallback data to prevent UI crashes
      setTopMovers([])
      setTrendingCoins([])
    } finally {
      setMarketDataLoading(false)
    }
  }

  const fetchDashboardData = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      setError(null)
      
      // Fetch user data with error handling
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("credits_balance, subscription_tier")
        .eq("id", user.id)
        .single()

      if (userError) {
        console.error('Error fetching user data:', userError)
        // Continue with defaults if user data fails
      }

      // Fetch portfolio data with holdings
      const { data: portfolios } = await supabase
        .from("portfolios")
        .select(`
          total_value_usd, 
          total_cost_usd,
          portfolio_holdings(symbol, name, current_value_usd)
        `)
        .eq("user_id", user.id)
        .is("deleted_at", null)

      // Fetch AI sessions count
      const { count: sessionCount } = await supabase
        .from("ai_chat_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      // Calculate real portfolio data
      const totalValue = portfolios?.reduce((sum, p) => sum + (parseFloat(p.total_value_usd?.toString() || '0')), 0) || 0
      const totalCost = portfolios?.reduce((sum, p) => sum + (parseFloat(p.total_cost_usd?.toString() || '0')), 0) || 0
      const dailyChange = totalValue - totalCost
      const dailyChangePercent = totalCost > 0 ? ((dailyChange / totalCost) * 100) : 0
      
      // Count total holdings across all portfolios
      const totalHoldings = portfolios?.reduce((sum, p) => sum + (p.portfolio_holdings?.length || 0), 0) || 0
      
      // Build crypto distribution from real holdings
      const holdingsMap = new Map<string, {name: string, value: number}>()
      portfolios?.forEach(p => {
        p.portfolio_holdings?.forEach((h: any) => {
          const value = parseFloat(h.current_value_usd || '0')
          if (value > 0) {
            const existing = holdingsMap.get(h.symbol) || {name: h.name, value: 0}
            holdingsMap.set(h.symbol, {name: h.name, value: existing.value + value})
          }
        })
      })
      
      const distribution = Array.from(holdingsMap.entries()).map(([symbol, data]) => ({
        name: data.name,
        value: data.value,
        percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0
      }))
      
      setCryptoDistribution(distribution)
      setHasRealData(totalValue > 0 || totalHoldings > 0)

      if (userData) {
        setDashboardData({
          totalValue,
          dailyChange,
          dailyChangePercent,
          portfolioCount: portfolios?.length || 0,
          totalHoldings,
          credits: userData.credits_balance || 0,
          subscription: userData.subscription_tier || "free",
          aiSessions: sessionCount || 0,
          alerts: 0 // Will be loaded from alerts API when implemented
        })
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={containerRef} className={cn("min-h-screen py-6 sm:py-8", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <SparklesText 
              className="text-2xl md:text-3xl font-bold"
              colors={{
                first: "#4f46e5", // ChainWise primary
                second: "#8b5cf6"  // ChainWise secondary
              }}
              sparklesCount={8}
            >
              Welcome back to ChainWise
            </SparklesText>
            <p className="text-muted-foreground mt-2">
              Your AI-powered crypto trading command center
            </p>
          </div>
          <div className="flex gap-2">
            <NeonButton variant="outline" size="default" onClick={async () => {
              await Promise.all([fetchDashboardData(), fetchMarketData()])
            }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </NeonButton>
            <AIWiseAssistant variant="button" />
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Enhanced3DCard
            variant="premium"
            depth="medium"
            glowColor="rgba(16,185,129,0.4)"
            className="p-6"
          >
            <div className="flex flex-row items-center justify-between space-y-0 pb-3">
              <h3 className="text-sm font-medium text-gray-200">Total Portfolio</h3>
              <Wallet className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">
                ${dashboardData.totalValue.toLocaleString()}
              </div>
              <div className="flex items-center">
                {dashboardData.dailyChange > 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={cn(
                  "text-xs font-medium",
                  dashboardData.dailyChange > 0 ? "text-emerald-400" : "text-red-400"
                )}>
                  {dashboardData.dailyChangePercent.toFixed(2)}% today
                </span>
              </div>
            </div>
          </Enhanced3DCard>

          <Enhanced3DCard
            ref={aiCreditsRef}
            variant="premium"
            depth="medium"
            glowColor="rgba(139,92,246,0.5)"
            className="p-6"
          >
            <div className="flex flex-row items-center justify-between space-y-0 pb-3">
              <h3 className="text-sm font-medium text-gray-200">AI Credits</h3>
              <Brain className="h-5 w-5 text-purple-400" />
            </div>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-white">{dashboardData.credits}</div>
              <div className="relative">
                <Progress 
                  value={(dashboardData.credits / 200) * 100} 
                  className="h-2 bg-gray-800/50" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full" />
              </div>
              <p className="text-xs text-gray-300">
                {dashboardData.subscription === "free" ? "3 credits/month" : 
                 dashboardData.subscription === "pro" ? "50 credits/month" : 
                 "200 credits/month"}
              </p>
            </div>
          </Enhanced3DCard>

          <Card className="border-chainwise-accent-200 dark:border-chainwise-accent-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <Bell className="h-4 w-4 text-chainwise-accent-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.alerts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                No alerts configured
              </p>
            </CardContent>
          </Card>

          <Card className="border-chainwise-warning-200 dark:border-chainwise-warning-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Sessions</CardTitle>
              <MessageSquare className="h-4 w-4 text-chainwise-warning-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.aiSessions}</div>
              <Badge variant="outline" className="mt-1">
                <Star className="h-3 w-3 mr-1" />
                {dashboardData.subscription} tier
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
              <CardDescription>Your portfolio value over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: {
                    label: "Portfolio Value",
                    color: CHART_COLORS.primary,
                  },
                  profit: {
                    label: "Profit/Loss",
                    color: CHART_COLORS.secondary,
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hasRealData ? getEmptyPortfolioData() : getEmptyPortfolioData()}>
                    <defs>
                      <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis dataKey="month" stroke="#737373" />
                    <YAxis stroke="#737373" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={CHART_COLORS.primary}
                      fillOpacity={1}
                      fill={CHART_COLORS.gradient.primary}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Asset Distribution</CardTitle>
              <CardDescription>Your crypto portfolio breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {cryptoDistribution.length > 0 ? (
                <div className="space-y-4">
                  {cryptoDistribution.map((crypto, index) => (
                  <div key={crypto.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: [
                            CHART_COLORS.primary,
                            CHART_COLORS.secondary,
                            CHART_COLORS.accent,
                            CHART_COLORS.warning,
                            CHART_COLORS.success
                          ][index]
                        }}
                      />
                      <span className="text-sm font-medium">{crypto.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        ${crypto.value.toLocaleString()}
                      </span>
                      <Badge variant="outline" className="min-w-[50px] justify-center">
                        {crypto.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <PieChart className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No portfolio data yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Add holdings to see your asset distribution</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Market Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Market Cap</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${globalMarketData.totalMarketCap > 0 ? 
                  (globalMarketData.totalMarketCap / 1e12).toFixed(2) + 'T' : 
                  'Loading...'
                }
              </div>
              <div className="flex items-center mt-1">
                {globalMarketData.marketCapChange > 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={cn(
                  "text-xs font-medium",
                  globalMarketData.marketCapChange > 0 ? "text-green-500" : "text-red-500"
                )}>
                  {globalMarketData.marketCapChange.toFixed(2)}% 24h
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${globalMarketData.totalVolume > 0 ? 
                  (globalMarketData.totalVolume / 1e9).toFixed(1) + 'B' : 
                  'Loading...'
                }
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Global trading volume
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">BTC Dominance</CardTitle>
              <Bitcoin className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {globalMarketData.btcDominance > 0 ? 
                  globalMarketData.btcDominance.toFixed(1) + '%' : 
                  'Loading...'
                }
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Bitcoin market share
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Top Movers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Market Movers</CardTitle>
            <CardDescription>Top cryptocurrencies by volume today</CardDescription>
          </CardHeader>
          <CardContent>
            {marketDataLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Loading market data...</p>
              </div>
            ) : topMovers.length > 0 ? (
              <div className="space-y-3">
                {topMovers.map((crypto) => (
                  <div
                    key={crypto.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={crypto.image} alt={crypto.name} />
                        <AvatarFallback className="bg-gradient-to-r from-chainwise-primary-600 to-chainwise-secondary-500 text-white text-xs">
                          {crypto.symbol.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{crypto.name}</p>
                        <p className="text-sm text-muted-foreground">{crypto.symbol}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">${crypto.price.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Vol: {crypto.volume}</p>
                      </div>
                      <Badge
                        variant={crypto.changePercent > 0 ? "default" : "destructive"}
                        className={cn(
                          "min-w-[70px] justify-center",
                          crypto.changePercent > 0 
                            ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" 
                            : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                        )}
                      >
                        {crypto.changePercent > 0 ? "+" : ""}{crypto.changePercent.toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No market data available</p>
                <p className="text-xs text-muted-foreground mt-1">Check your internet connection and try again</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 w-full">
          <MovingBorderButton
            borderRadius="1.75rem"
            className="bg-white dark:bg-slate-900 text-black dark:text-white border-neutral-200 dark:border-slate-800 h-20 w-full flex flex-col items-center justify-center gap-2"
            containerClassName="w-full h-20"
            borderClassName="bg-gradient-to-r from-purple-500 to-blue-500"
          >
            <Link ref={aiAssistantRef} href="/chat" className="flex flex-col items-center gap-1 w-full h-full justify-center">
              <Bot className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium">AI Assistant</span>
            </Link>
          </MovingBorderButton>
          
          <MovingBorderButton
            borderRadius="1.75rem"
            className="bg-white dark:bg-slate-900 text-black dark:text-white border-neutral-200 dark:border-slate-800 h-20 w-full flex flex-col items-center justify-center gap-2"
            containerClassName="w-full h-20"
            borderClassName="bg-gradient-to-r from-blue-500 to-purple-500"
          >
            <Link href="/portfolio" className="flex flex-col items-center gap-1 w-full h-full justify-center">
              <PieChart className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Portfolio</span>
            </Link>
          </MovingBorderButton>
          
          <MovingBorderButton
            borderRadius="1.75rem"
            className="bg-white dark:bg-slate-900 text-black dark:text-white border-neutral-200 dark:border-slate-800 h-20 w-full flex flex-col items-center justify-center gap-2"
            containerClassName="w-full h-20"
            borderClassName="bg-gradient-to-r from-green-500 to-blue-500"
          >
            <Link href="/analytics" className="flex flex-col items-center gap-1 w-full h-full justify-center">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Analytics</span>
            </Link>
          </MovingBorderButton>
          
          <MovingBorderButton
            borderRadius="1.75rem"
            className="bg-white dark:bg-slate-900 text-black dark:text-white border-neutral-200 dark:border-slate-800 h-20 w-full flex flex-col items-center justify-center gap-2"
            containerClassName="w-full h-20"
            borderClassName="bg-gradient-to-r from-yellow-500 to-orange-500"
          >
            <Link href="/marketplace" className="flex flex-col items-center gap-1 w-full h-full justify-center">
              <Gem className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-medium">Marketplace</span>
            </Link>
          </MovingBorderButton>
        </div>

        {/* AnimatedBeam connecting AI Credits to AI Assistant */}
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={aiCreditsRef}
          toRef={aiAssistantRef}
          curvature={-75}
          pathColor="rgba(139,92,246,0.1)"
          gradientStartColor="#8b5cf6"
          gradientStopColor="#4f46e5"
          delay={2}
          duration={3}
        />
      </div>
    </div>
  )
}
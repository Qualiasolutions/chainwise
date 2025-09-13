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
import { motion } from "framer-motion"
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

          <Enhanced3DCard
            variant="default"
            depth="medium"
            glowColor="rgba(37,99,235,0.4)"
            className="p-6"
          >
            <div className="flex flex-row items-center justify-between space-y-0 pb-3">
              <h3 className="text-sm font-medium text-gray-200">Active Alerts</h3>
              <Bell className="h-5 w-5 text-blue-400" />
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">{dashboardData.alerts}</div>
              <p className="text-xs text-gray-300">
                No alerts configured
              </p>
            </div>
          </Enhanced3DCard>

          <Enhanced3DCard
            variant="default"
            depth="medium"
            glowColor="rgba(245,158,11,0.4)"
            className="p-6"
          >
            <div className="flex flex-row items-center justify-between space-y-0 pb-3">
              <h3 className="text-sm font-medium text-gray-200">AI Sessions</h3>
              <MessageSquare className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">{dashboardData.aiSessions}</div>
              <Badge 
                variant="outline" 
                className="border-yellow-500/30 text-yellow-400 bg-yellow-500/10"
              >
                <Star className="h-3 w-3 mr-1" />
                {dashboardData.subscription} tier
              </Badge>
            </div>
          </Enhanced3DCard>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-7">
          <ModernChartContainer
            title="Portfolio Performance"
            description="Your portfolio value over the last 6 months"
            variant="premium"
            height="350px"
            glowIntensity="medium"
            className="col-span-4"
          >
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
              className="h-full"
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
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="rgba(255,255,255,0.6)" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.6)" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(139,92,246,0.3)',
                      borderRadius: '8px',
                      backdropFilter: 'blur(8px)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill={CHART_COLORS.gradient.primary}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ModernChartContainer>

          <ModernChartContainer
            title="Asset Distribution"
            description="Your crypto portfolio breakdown"
            variant="default"
            height="350px"
            glowIntensity="low"
            className="col-span-3"
          >
            {cryptoDistribution.length > 0 ? (
              <div className="space-y-4 h-full overflow-y-auto pr-2">
                {cryptoDistribution.map((crypto, index) => (
                  <motion.div 
                    key={crypto.name} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full shadow-lg"
                        style={{
                          backgroundColor: [
                            CHART_COLORS.primary,
                            CHART_COLORS.secondary,
                            CHART_COLORS.accent,
                            CHART_COLORS.warning,
                            CHART_COLORS.success
                          ][index],
                          boxShadow: `0 0 8px ${[
                            CHART_COLORS.primary,
                            CHART_COLORS.secondary,
                            CHART_COLORS.accent,
                            CHART_COLORS.warning,
                            CHART_COLORS.success
                          ][index]}40`
                        }}
                      />
                      <span className="text-sm font-medium text-white">{crypto.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-300">
                        ${crypto.value.toLocaleString()}
                      </span>
                      <Badge 
                        variant="outline" 
                        className="min-w-[50px] justify-center border-purple-500/30 text-purple-300 bg-purple-500/10"
                      >
                        {crypto.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 h-full flex flex-col justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <PieChart className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
                  <p className="text-sm text-gray-300">No portfolio data yet</p>
                  <p className="text-xs text-gray-400 mt-1">Add holdings to see your asset distribution</p>
                </motion.div>
              </div>
            )}
          </ModernChartContainer>
        </div>

        {/* Market Overview */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Enhanced3DCard
            variant="default"
            depth="medium"
            glowColor="rgba(34,197,94,0.3)"
            className="p-6"
          >
            <div className="flex flex-row items-center justify-between space-y-0 pb-3">
              <h3 className="text-sm font-medium text-gray-200">Total Market Cap</h3>
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">
                ${globalMarketData.totalMarketCap > 0 ? 
                  (globalMarketData.totalMarketCap / 1e12).toFixed(2) + 'T' : 
                  'Loading...'
                }
              </div>
              <div className="flex items-center">
                {globalMarketData.marketCapChange > 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={cn(
                  "text-xs font-medium",
                  globalMarketData.marketCapChange > 0 ? "text-emerald-400" : "text-red-400"
                )}>
                  {globalMarketData.marketCapChange.toFixed(2)}% 24h
                </span>
              </div>
            </div>
          </Enhanced3DCard>

          <Enhanced3DCard
            variant="default"
            depth="medium"
            glowColor="rgba(37,99,235,0.3)"
            className="p-6"
          >
            <div className="flex flex-row items-center justify-between space-y-0 pb-3">
              <h3 className="text-sm font-medium text-gray-200">24h Volume</h3>
              <BarChart3 className="h-5 w-5 text-blue-400" />
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">
                ${globalMarketData.totalVolume > 0 ? 
                  (globalMarketData.totalVolume / 1e9).toFixed(1) + 'B' : 
                  'Loading...'
                }
              </div>
              <p className="text-xs text-gray-300">
                Global trading volume
              </p>
            </div>
          </Enhanced3DCard>

          <Enhanced3DCard
            variant="default"
            depth="medium"
            glowColor="rgba(245,158,11,0.3)"
            className="p-6"
          >
            <div className="flex flex-row items-center justify-between space-y-0 pb-3">
              <h3 className="text-sm font-medium text-gray-200">BTC Dominance</h3>
              <Bitcoin className="h-5 w-5 text-orange-400" />
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">
                {globalMarketData.btcDominance > 0 ? 
                  globalMarketData.btcDominance.toFixed(1) + '%' : 
                  'Loading...'
                }
              </div>
              <p className="text-xs text-gray-300">
                Bitcoin market share
              </p>
            </div>
          </Enhanced3DCard>
        </div>

        {/* Top Movers Table */}
        <ModernChartContainer
          title="Market Movers"
          description="Top cryptocurrencies by volume today"
          variant="default"
          glowIntensity="low"
          isLoading={marketDataLoading}
          height="auto"
        >
          {topMovers.length > 0 ? (
            <div className="space-y-3">
              {topMovers.map((crypto, index) => (
                <motion.div
                  key={crypto.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-10 w-10 ring-2 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all duration-300">
                        <AvatarImage src={crypto.image} alt={crypto.name} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold">
                          {crypto.symbol.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
                    </div>
                    <div>
                      <p className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {crypto.name}
                      </p>
                      <p className="text-sm text-gray-400">{crypto.symbol?.toUpperCase() || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-semibold text-white">${crypto.price.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">Vol: {crypto.volume}</p>
                    </div>
                    <Badge
                      className={cn(
                        "min-w-[80px] justify-center font-semibold transition-all duration-300",
                        crypto.changePercent > 0 
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30" 
                          : "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
                      )}
                    >
                      {crypto.changePercent > 0 ? "+" : ""}{crypto.changePercent.toFixed(2)}%
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <TrendingUp className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
                <p className="text-sm text-gray-300">No market data available</p>
                <p className="text-xs text-gray-400 mt-1">Check your internet connection and try again</p>
              </motion.div>
            </div>
          )}
        </ModernChartContainer>

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
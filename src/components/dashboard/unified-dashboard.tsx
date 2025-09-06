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
  Sparkles,
  Brain,
  MessageSquare,
  Bitcoin,
  Coins,
  CreditCard,
  Gem
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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

// Mock data for charts
const portfolioData = [
  { month: "Jan", value: 45000, profit: 5000 },
  { month: "Feb", value: 52000, profit: 7000 },
  { month: "Mar", value: 48000, profit: -4000 },
  { month: "Apr", value: 61000, profit: 13000 },
  { month: "May", value: 75000, profit: 14000 },
  { month: "Jun", value: 82000, profit: 7000 },
]

const cryptoDistribution = [
  { name: "Bitcoin", value: 35000, percentage: 42.7 },
  { name: "Ethereum", value: 22000, percentage: 26.8 },
  { name: "Solana", value: 12000, percentage: 14.6 },
  { name: "Cardano", value: 8000, percentage: 9.8 },
  { name: "Others", value: 5000, percentage: 6.1 },
]

const topMovers = [
  { symbol: "BTC", name: "Bitcoin", price: 65432, change: 5.23, volume: "24.5B" },
  { symbol: "ETH", name: "Ethereum", price: 3456, change: -2.14, volume: "12.3B" },
  { symbol: "SOL", name: "Solana", price: 145.67, change: 8.91, volume: "2.1B" },
  { symbol: "ADA", name: "Cardano", price: 0.621, change: 3.45, volume: "456M" },
]

interface DashboardProps {
  className?: string
}

export default function UnifiedDashboard({ className }: DashboardProps) {
  const { supabase, user } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    totalValue: 82000,
    dailyChange: 3456,
    dailyChangePercent: 4.21,
    portfolioCount: 3,
    totalHoldings: 12,
    credits: 15,
    subscription: "pro",
    aiSessions: 24,
    alerts: 5
  })

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    if (!user?.id) return
    
    try {
      // Fetch user data
      const { data: userData } = await supabase
        .from("users")
        .select("credits_balance, subscription_tier")
        .eq("id", user.id)
        .single()

      // Fetch portfolio data
      const { data: portfolios } = await supabase
        .from("portfolios")
        .select("total_value_usd, total_cost_usd")
        .eq("user_id", user.id)

      // Fetch AI sessions count
      const { count: sessionCount } = await supabase
        .from("ai_chat_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      if (userData) {
        setDashboardData(prev => ({
          ...prev,
          credits: userData.credits_balance || 0,
          subscription: userData.subscription_tier || "free",
          aiSessions: sessionCount || 0
        }))
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("space-y-6 p-6", className)}>
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-chainwise-primary-600 to-chainwise-secondary-500 bg-clip-text text-transparent">
            Welcome back to ChainWise
          </h1>
          <p className="text-muted-foreground mt-1">
            Your AI-powered crypto trading command center
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-chainwise-primary-600 to-chainwise-secondary-500">
            <Plus className="h-4 w-4 mr-2" />
            New Trade
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-chainwise-primary-200 dark:border-chainwise-primary-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
            <Wallet className="h-4 w-4 text-chainwise-primary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardData.totalValue.toLocaleString()}</div>
            <div className="flex items-center mt-1">
              {dashboardData.dailyChange > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-chainwise-success-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-chainwise-error-500 mr-1" />
              )}
              <span className={cn(
                "text-xs font-medium",
                dashboardData.dailyChange > 0 ? "text-chainwise-success-500" : "text-chainwise-error-500"
              )}>
                {dashboardData.dailyChangePercent}% today
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-chainwise-secondary-200 dark:border-chainwise-secondary-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Credits</CardTitle>
            <Brain className="h-4 w-4 text-chainwise-secondary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.credits}</div>
            <Progress value={(dashboardData.credits / 50) * 100} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {50 - dashboardData.credits} credits until refill
            </p>
          </CardContent>
        </Card>

        <Card className="border-chainwise-accent-200 dark:border-chainwise-accent-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-chainwise-accent-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.alerts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              2 triggered today
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
              <Sparkles className="h-3 w-3 mr-1" />
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
                <AreaChart data={portfolioData}>
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
                      {crypto.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
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
          <div className="space-y-3">
            {topMovers.map((crypto) => (
              <div
                key={crypto.symbol}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
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
                    variant={crypto.change > 0 ? "default" : "destructive"}
                    className={cn(
                      "min-w-[70px] justify-center",
                      crypto.change > 0 
                        ? "bg-chainwise-success-500/10 text-chainwise-success-600 hover:bg-chainwise-success-500/20" 
                        : "bg-chainwise-error-500/10 text-chainwise-error-600 hover:bg-chainwise-error-500/20"
                    )}
                  >
                    {crypto.change > 0 ? "+" : ""}{crypto.change}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 hover:border-chainwise-primary-500"
          asChild
        >
          <Link href="/chat">
            <Bot className="h-6 w-6 text-chainwise-primary-600" />
            <span>AI Assistant</span>
          </Link>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 hover:border-chainwise-secondary-500"
          asChild
        >
          <Link href="/portfolio">
            <PieChart className="h-6 w-6 text-chainwise-secondary-600" />
            <span>Portfolio</span>
          </Link>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 hover:border-chainwise-accent-500"
          asChild
        >
          <Link href="/analytics">
            <BarChart3 className="h-6 w-6 text-chainwise-accent-600" />
            <span>Analytics</span>
          </Link>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 hover:border-chainwise-warning-500"
          asChild
        >
          <Link href="/marketplace">
            <Gem className="h-6 w-6 text-chainwise-warning-600" />
            <span>Marketplace</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
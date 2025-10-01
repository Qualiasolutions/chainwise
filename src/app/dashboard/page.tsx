"use client"

import { useState, useEffect } from "react"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import { usePortfolio } from "@/hooks/usePortfolio"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Wallet,
  Zap,
  Bot,
  Bell,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Crown
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { formatPrice, formatPercentage } from "@/lib/crypto-api"
import { MetricsCard } from "@/components/ui/professional-card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip
} from "recharts"

export default function DashboardPage() {
  const { user, profile } = useSupabaseAuth()
  const { portfolios, loading, getTotalPortfolioValue, getTotalPortfolioPnL, getTotalPortfolioPnLPercentage, getDefaultPortfolio } = usePortfolio()
  const [chartData, setChartData] = useState<any[]>([])

  const totalValue = getTotalPortfolioValue()
  const totalPnL = getTotalPortfolioPnL()
  const totalPnLPercentage = getTotalPortfolioPnLPercentage()
  const defaultPortfolio = getDefaultPortfolio()

  useEffect(() => {
    // Generate simple chart data
    const data = []
    const baseValue = totalValue - totalPnL

    for (let i = 0; i < 7; i++) {
      const progress = i / 6
      const value = baseValue + (totalPnL * progress)
      data.push({
        time: `Day ${i + 1}`,
        value: Math.max(0, value)
      })
    }

    setChartData(data)
  }, [totalValue, totalPnL])

  if (loading) {
    return (
      <div className="h-full w-full overflow-auto bg-slate-50/50 dark:bg-slate-950/50">
        <div className="container mx-auto px-4 py-8 space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
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
    <div className="h-full w-full overflow-auto bg-slate-50/50 dark:bg-slate-950/50">
      <motion.div
        className="container mx-auto px-4 py-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your portfolio today
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/dashboard/ai">
                <Bot className="h-4 w-4 mr-2" />
                AI Assistant
              </Link>
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricsCard>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Total Value</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {formatPrice(totalValue)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Target className="h-3 w-3 mr-1" />
                Portfolio balance
              </div>
            </div>
          </MetricsCard>

          <MetricsCard>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  totalPnL >= 0
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-red-100 dark:bg-red-900/30"
                )}>
                  {totalPnL >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <span className="text-sm font-medium text-muted-foreground">Total P&L</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className={cn(
                "text-2xl font-bold",
                totalPnL >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}>
                {totalPnL >= 0 ? '+' : ''}{formatPrice(totalPnL)}
              </div>
              <div className={cn(
                "flex items-center text-xs",
                totalPnL >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {totalPnL >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {formatPercentage(totalPnLPercentage)}
              </div>
            </div>
          </MetricsCard>

          <MetricsCard>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Portfolios</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {portfolios.length}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Activity className="h-3 w-3 mr-1" />
                Active portfolios
              </div>
            </div>
          </MetricsCard>

          <MetricsCard>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Crown className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Plan</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold capitalize">
                {profile?.tier || 'Free'}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 mr-1" />
                Current tier
              </div>
            </div>
          </MetricsCard>
        </div>

        {/* Portfolio Performance Chart */}
        {defaultPortfolio && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Portfolio Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(262.1, 83.3%, 57.8%)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(262.1, 83.3%, 57.8%)" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
                            <p className="text-sm font-semibold">{formatPrice(payload[0].value)}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(262.1, 83.3%, 57.8%)"
                    fill="url(#colorValue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/portfolio">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-4">
                  <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Portfolio</h3>
                  <p className="text-sm text-muted-foreground">Manage holdings</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/market">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-4">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Market</h3>
                  <p className="text-sm text-muted-foreground">View prices</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tools/whale-tracker">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-4">
                  <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Tools</h3>
                  <p className="text-sm text-muted-foreground">Premium features</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/alerts">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-4">
                  <Bell className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Alerts</h3>
                  <p className="text-sm text-muted-foreground">Manage notifications</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Empty State */}
        {portfolios.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <Wallet className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Portfolio Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Create your first portfolio to start tracking your cryptocurrency investments and get AI-powered insights.
              </p>
              <Button asChild>
                <Link href="/portfolio">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Create Portfolio
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}

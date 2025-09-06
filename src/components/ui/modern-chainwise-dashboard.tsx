"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useSupabase } from "@/components/providers/supabase-provider"
import { useSubscription } from "@/hooks/use-subscription"
import { CryptoService } from "@/lib/crypto-service"
import { formatCurrency, formatPercentage } from "@/lib/utils"
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
  MessageSquare
} from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface DashboardData {
  totalValue: number
  dailyChange: number
  dailyChangePercent: number
  portfolioCount: number
  activeAlerts: number
  topCryptos: Array<{
    symbol: string
    name: string
    price: number
    change: number
    positive: boolean
    image: string
  }>
  recentActivity: Array<{
    icon: React.ComponentType<any>
    title: string
    desc: string
    time: string
    color: string
  }>
  aiInsights: Array<{
    type: 'opportunity' | 'warning' | 'neutral'
    title: string
    description: string
    confidence: number
  }>
  portfolioAllocation: Array<{
    name: string
    value: number
    percentage: number
    color: string
  }>
}

export function ModernChainWiseDashboard() {
  const { theme, toggleTheme } = useTheme()
  const { session, user } = useSupabase()
  const { tier, creditBalance } = useSubscription()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      loadDashboardData()
    }
  }, [session])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load crypto data
      const cryptos = await CryptoService.getTopCryptos(6)
      
      // Load user portfolio data
      const portfolioResponse = await fetch('/api/portfolio?includeHoldings=false&limit=10')
      const portfolioData = portfolioResponse.ok ? await portfolioResponse.json() : { data: [], pagination: { total: 0 } }
      
      // Load alerts data
      const alertsResponse = await fetch('/api/alerts?active=true&limit=1')
      const alertsData = alertsResponse.ok ? await alertsResponse.json() : { pagination: { total: 0 } }
      
      // Enhanced mock data for modern dashboard
      setDashboardData({
        totalValue: 127439.82,
        dailyChange: 7821.45,
        dailyChangePercent: 6.54,
        portfolioCount: portfolioData.pagination.total || 3,
        activeAlerts: alertsData.pagination.total || 8,
        topCryptos: cryptos.slice(0, 6).map(crypto => ({
          symbol: crypto.symbol.toUpperCase(),
          name: crypto.name,
          price: crypto.current_price,
          change: crypto.price_change_percentage_24h,
          positive: crypto.price_change_percentage_24h > 0,
          image: crypto.image
        })),
        recentActivity: [
          { icon: TrendingUp, title: "AI Strategy Executed", desc: "Automated DCA into BTC position", time: "3 min ago", color: "green" },
          { icon: Bell, title: "Price Alert Triggered", desc: "ETH reached $3,750 target price", time: "8 min ago", color: "blue" },
          { icon: Brain, title: "AI Market Analysis", desc: "Bullish pattern detected in SOL", time: "15 min ago", color: "purple" },
          { icon: Wallet, title: "Portfolio Rebalanced", desc: "Auto-rebalancing completed successfully", time: "1 hour ago", color: "orange" },
          { icon: Sparkles, title: "New AI Insight", desc: "Risk assessment updated for your portfolio", time: "2 hours ago", color: "indigo" },
          { icon: Shield, title: "Security Check", desc: "Portfolio health scan completed", time: "4 hours ago", color: "emerald" }
        ],
        aiInsights: [
          { type: 'opportunity', title: 'DeFi Yield Opportunity', description: 'AAVE staking showing 12.4% APY with low risk', confidence: 87 },
          { type: 'warning', title: 'Concentration Risk', description: 'Consider diversifying BTC allocation (currently 45%)', confidence: 92 },
          { type: 'neutral', title: 'Market Sentiment', description: 'Overall crypto sentiment remains bullish', confidence: 76 }
        ],
        portfolioAllocation: [
          { name: 'Bitcoin', value: 57247.91, percentage: 44.9, color: '#f7931a' },
          { name: 'Ethereum', value: 38316.73, percentage: 30.1, color: '#627eea' },
          { name: 'Solana', value: 19115.58, percentage: 15.0, color: '#9945ff' },
          { name: 'Others', value: 12759.60, percentage: 10.0, color: '#64748b' }
        ]
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const isDark = theme === 'dark'

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ChainWise Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {user?.email?.split('@')[0] || 'Trader'}! Your AI-powered crypto command center.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadDashboardData}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Bell className="h-4 w-4" />
            <Badge variant="destructive" className="h-2 w-2 p-0"></Badge>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Portfolio Value</p>
                <p className="text-3xl font-bold mt-2">{formatCurrency(dashboardData?.totalValue || 0)}</p>
                <div className="flex items-center mt-2 gap-1">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="text-sm font-medium">+{formatCurrency(dashboardData?.dailyChange || 0)}</span>
                  <span className="text-blue-100 text-sm">({dashboardData?.dailyChangePercent.toFixed(2)}%)</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Wallet className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Portfolios</p>
                <p className="text-3xl font-bold mt-2">{dashboardData?.portfolioCount}</p>
                <p className="text-green-100 text-sm mt-2">Tracking performance</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <PieChart className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">AI Credits</p>
                <p className="text-3xl font-bold mt-2">{creditBalance}</p>
                <p className="text-purple-100 text-sm mt-2">{tier} Plan Active</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Sparkles className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Active Alerts</p>
                <p className="text-3xl font-bold mt-2">{dashboardData?.activeAlerts}</p>
                <p className="text-orange-100 text-sm mt-2">Price monitoring</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Bell className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Allocation */}
        <Card className="lg:col-span-1 shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-indigo-600" />
              Portfolio Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData?.portfolioAllocation.map((asset, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: asset.color }}
                  ></div>
                  <div>
                    <p className="font-medium text-sm">{asset.name}</p>
                    <p className="text-xs text-gray-500">{asset.percentage}%</p>
                  </div>
                </div>
                <p className="font-semibold text-sm">{formatCurrency(asset.value)}</p>
              </div>
            ))}
            <Button className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="lg:col-span-2 shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI Market Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData?.aiInsights.map((insight, i) => (
              <div key={i} className="p-4 rounded-lg border bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={insight.type === 'opportunity' ? 'default' : insight.type === 'warning' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {insight.type === 'opportunity' ? '🚀' : insight.type === 'warning' ? '⚠️' : '📊'} {insight.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500">Confidence: {insight.confidence}%</span>
                  </div>
                </div>
                <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{insight.description}</p>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              Ask AI Assistant
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Market Overview & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Cryptocurrencies */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Market Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData?.topCryptos.map((crypto, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="font-medium text-sm">{crypto.name}</p>
                      <p className="text-xs text-gray-500">{crypto.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatCurrency(crypto.price)}</p>
                    <div className="flex items-center gap-1">
                      {crypto.positive ? (
                        <ArrowUpRight className="h-3 w-3 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-500" />
                      )}
                      <span className={`text-xs ${crypto.positive ? 'text-green-500' : 'text-red-500'}`}>
                        {formatPercentage(crypto.change)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className={`p-2 rounded-full ${
                    activity.color === 'green' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                    activity.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                    activity.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' :
                    activity.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' :
                    activity.color === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' :
                    'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-gray-500 truncate">{activity.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/portfolio">
              <Button variant="outline" className="w-full h-16 flex flex-col gap-1 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span className="text-sm">View Portfolio</span>
              </Button>
            </Link>
            <Link href="/chat">
              <Button variant="outline" className="w-full h-16 flex flex-col gap-1 hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-900/20">
                <Bot className="h-5 w-5 text-purple-600" />
                <span className="text-sm">AI Assistant</span>
              </Button>
            </Link>
            <Link href="/alerts">
              <Button variant="outline" className="w-full h-16 flex flex-col gap-1 hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-900/20">
                <Bell className="h-5 w-5 text-green-600" />
                <span className="text-sm">Set Alerts</span>
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" className="w-full h-16 flex flex-col gap-1 hover:bg-gray-50 hover:border-gray-200 dark:hover:bg-gray-800">
                <Settings className="h-5 w-5 text-gray-600" />
                <span className="text-sm">Settings</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

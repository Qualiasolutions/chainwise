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
} from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"

interface DashboardData {
  totalValue: number
  dailyChange: number
  portfolioCount: number
  activeAlerts: number
  topCryptos: Array<{
    symbol: string
    name: string
    price: number
    change: number
    positive: boolean
  }>
  recentActivity: Array<{
    icon: React.ComponentType<any>
    title: string
    desc: string
    time: string
    color: string
  }>
}

export function DashboardContent() {
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
      const cryptos = await CryptoService.getTopCryptos(5)
      
      // Load user portfolio data
      const portfolioResponse = await fetch('/api/portfolio?includeHoldings=false&limit=10')
      const portfolioData = portfolioResponse.ok ? await portfolioResponse.json() : { data: [], pagination: { total: 0 } }
      
      // Load alerts data
      const alertsResponse = await fetch('/api/alerts?active=true&limit=1')
      const alertsData = alertsResponse.ok ? await alertsResponse.json() : { pagination: { total: 0 } }
      
      // Mock some data for demo
      setDashboardData({
        totalValue: 92239.41,
        dailyChange: 4521.67,
        portfolioCount: portfolioData.pagination.total,
        activeAlerts: alertsData.pagination.total,
        topCryptos: cryptos.slice(0, 5).map(crypto => ({
          symbol: crypto.symbol.toUpperCase(),
          name: crypto.name,
          price: crypto.current_price,
          change: crypto.price_change_percentage_24h,
          positive: crypto.price_change_percentage_24h > 0
        })),
        recentActivity: [
          { icon: TrendingUp, title: "Portfolio updated", desc: "BTC position increased by 5%", time: "2 min ago", color: "green" },
          { icon: Bell, title: "Price alert triggered", desc: "ETH reached $3,500 target", time: "5 min ago", color: "blue" },
          { icon: Bot, title: "AI recommendation", desc: "New trading opportunity identified", time: "10 min ago", color: "purple" },
          { icon: Wallet, title: "Portfolio rebalanced", desc: "Automatic rebalancing completed", time: "1 hour ago", color: "orange" },
          { icon: AlertCircle, title: "Market analysis", desc: "Weekly market report available", time: "2 hours ago", color: "red" },
        ]
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const isDark = theme === 'dark'

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-950 overflow-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 truncate">Crypto Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Welcome back, {user?.email?.split('@')[0] || 'Trader'}! Monitor your crypto investments.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <button 
            onClick={loadDashboardData}
            disabled={loading}
            className="relative p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Refresh dashboard data"
          >
            <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            className="relative p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </button>
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="h-3 w-3 sm:h-4 sm:w-4" />
            ) : (
              <Moon className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
          </button>
          <Link 
            href="/settings" 
            className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer"
            aria-label="User settings"
          >
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 animate-pulse">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              </div>
              <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-1 text-sm sm:text-base">Total Portfolio</h3>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(dashboardData?.totalValue || 0)}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                +{formatCurrency(dashboardData?.dailyChange || 0)} today
              </p>
            </div>
            
            <div className="p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                </div>
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              </div>
              <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-1 text-sm sm:text-base">Portfolios</h3>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{dashboardData?.portfolioCount || 0}</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">Active tracking</p>
            </div>
            
            <div className="p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <Target className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
              </div>
              <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-1 text-sm sm:text-base">Active Alerts</h3>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{dashboardData?.activeAlerts || 0}</p>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">Price monitoring</p>
            </div>

            <div className="p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
              </div>
              <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-1 text-sm sm:text-base">AI Credits</h3>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{creditBalance}</p>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">{tier} plan</p>
            </div>
          </div>
          
          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
                  <Link href="/portfolio" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium cursor-pointer">
                    View all
                  </Link>
                </div>
                <div className="space-y-4">
                  {dashboardData?.recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                      <div className={`p-2 rounded-lg ${
                        activity.color === 'green' ? 'bg-green-50 dark:bg-green-900/20' :
                        activity.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20' :
                        activity.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20' :
                        activity.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20' :
                        'bg-red-50 dark:bg-red-900/20'
                      }`}>
                        <activity.icon className={`h-4 w-4 ${
                          activity.color === 'green' ? 'text-green-600 dark:text-green-400' :
                          activity.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                          activity.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                          activity.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                          'text-red-600 dark:text-red-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {activity.desc}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Cryptos & Quick Actions */}
            <div className="space-y-4 sm:space-y-6">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 shadow-sm">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Cryptocurrencies</h3>
                <div className="space-y-4">
                  {dashboardData?.topCryptos.map((crypto, i) => (
                    <div key={i} className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">{crypto.symbol}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{crypto.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{crypto.symbol}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(crypto.price)}
                        </p>
                        <p className={`text-xs ${crypto.positive ? 'text-green-400' : 'text-red-400'}`}>
                          {formatPercentage(crypto.change)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 shadow-sm">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/portfolio" className="flex items-center justify-between py-3 px-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">View Portfolio</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 rotate-[-90deg]" />
                  </Link>
                  
                  <Link href="/chat" className="flex items-center justify-between py-3 px-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Ask AI Assistant</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 rotate-[-90deg]" />
                  </Link>
                  
                  <Link href="/alerts" className="flex items-center justify-between py-3 px-4 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Set Price Alert</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 rotate-[-90deg]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
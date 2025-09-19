"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Bitcoin,
  Coins,
  Target,
  Zap
} from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"

// Mock data for the stunning dashboard
const portfolioData = [
  { time: "00:00", value: 45000, volume: 2400 },
  { time: "04:00", value: 47500, volume: 1398 },
  { time: "08:00", value: 46800, volume: 9800 },
  { time: "12:00", value: 49200, volume: 3908 },
  { time: "16:00", value: 51500, volume: 4800 },
  { time: "20:00", value: 53200, volume: 3800 },
  { time: "24:00", value: 54750, volume: 4300 },
]

const topCryptos = [
  { symbol: "BTC", name: "Bitcoin", price: 54750, change: 5.2, volume: "2.1B" },
  { symbol: "ETH", name: "Ethereum", price: 3420, change: 3.8, volume: "1.8B" },
  { symbol: "BNB", name: "Binance Coin", price: 425, change: -1.2, volume: "654M" },
  { symbol: "XRP", name: "Ripple", price: 0.87, change: 8.1, volume: "890M" },
  { symbol: "ADA", name: "Cardano", price: 1.45, change: 4.3, volume: "432M" },
]

const chartConfig = {
  value: {
    label: "Portfolio Value",
    color: "hsl(var(--chart-1))",
  },
  volume: {
    label: "Volume",
    color: "hsl(var(--chart-2))",
  },
}

export default function DashboardPage() {
  const [totalValue, setTotalValue] = useState(54750)
  const [dailyChange, setDailyChange] = useState(5.2)

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your portfolio overview.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Zap className="h-4 w-4 mr-2" />
            Ask AI
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              ${totalValue.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{dailyChange}% from yesterday
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -mr-16 -mt-16" />
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Change</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              +$2,847
            </div>
            <div className="flex items-center text-xs text-green-600 dark:text-green-400">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +5.2% increase
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/20 rounded-full -mr-16 -mt-16" />
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              8
            </div>
            <div className="flex items-center text-xs text-purple-600 dark:text-purple-400">
              <Target className="h-3 w-3 mr-1" />
              New recommendations
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/20 rounded-full -mr-16 -mt-16" />
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Analysis</CardTitle>
            <Coins className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              Bullish
            </div>
            <div className="flex items-center text-xs text-orange-600 dark:text-orange-400">
              <BarChart3 className="h-3 w-3 mr-1" />
              AI confidence: 82%
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 rounded-full -mr-16 -mt-16" />
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Portfolio Performance Chart */}
        <Card className="col-span-4 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Portfolio Performance
            </CardTitle>
            <CardDescription>
              Your portfolio value over the last 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={portfolioData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="time"
                    className="text-xs fill-muted-foreground"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    className="text-xs fill-muted-foreground"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Cryptocurrencies */}
        <Card className="col-span-3 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bitcoin className="h-5 w-5 text-orange-500" />
              Top Cryptocurrencies
            </CardTitle>
            <CardDescription>
              Most active coins in your watchlist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCryptos.map((crypto, index) => (
                <div key={crypto.symbol} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                      {crypto.symbol[0]}
                    </div>
                    <div>
                      <p className="font-medium">{crypto.symbol}</p>
                      <p className="text-xs text-muted-foreground">{crypto.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${crypto.price.toLocaleString()}</p>
                    <div className="flex items-center">
                      {crypto.change > 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs ${crypto.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {crypto.change > 0 ? '+' : ''}{crypto.change}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            AI-powered crypto advisory tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <DollarSign className="h-6 w-6" />
              <span>Portfolio Analysis</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <TrendingDown className="h-6 w-6" />
              <span>Market Insights</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <BarChart3 className="h-6 w-6" />
              <span>View Analytics</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span>AI Assistant</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
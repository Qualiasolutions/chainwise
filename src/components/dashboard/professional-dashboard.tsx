'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Settings,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Command,
  BarChart3,
  Zap,
  Target,
  Wifi,
  WifiOff,
  ChevronDown,
  Volume2,
  VolumeX,
  Brain,
  Sparkles,
  CreditCard,
  User,
  MessageSquare,
  Activity,
  Eye,
  RefreshCw,
  Star,
  Clock,
  Shield,
  Coins,
  Bitcoin,
  Gem,
  Wallet
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'

// Types for real data integration
interface UserCredits {
  balance: number
  tier: 'free' | 'pro' | 'elite'
  points?: number
}

interface Portfolio {
  id: string
  name: string
  total_value_usd: number
  total_cost_usd: number
  profit_loss_usd: number
  profit_loss_percentage: number
  holdings_count: number
}

interface MarketData {
  btc_price: number
  eth_price: number
  btc_change_24h: number
  eth_change_24h: number
  total_market_cap: number
  market_cap_change_24h: number
}

interface ActivityItem {
  id: string
  type: 'transaction' | 'alert' | 'analysis' | 'rebalance'
  description: string
  amount?: number
  timestamp: string
  status: 'completed' | 'pending' | 'triggered'
}

const PERSONA_CONFIGS = {
  buddy: {
    id: 'buddy' as const,
    name: 'ChainWise Assistant',
    description: 'Educational guidance and crypto basics',
    icon: Sparkles,
    color: 'from-emerald-500 to-teal-600',
    creditCost: 5,
    bgColor: 'from-emerald-500/10 to-teal-500/10',
    borderColor: 'border-emerald-500/20 hover:border-emerald-500/40'
  },
  professor: {
    id: 'professor' as const,
    name: 'Market Analyst',
    description: 'Technical analysis and market insights',
    icon: Brain,
    color: 'from-blue-500 to-indigo-600',
    creditCost: 10,
    bgColor: 'from-blue-500/10 to-cyan-500/10',
    borderColor: 'border-blue-500/20 hover:border-blue-500/40'
  },
  trader: {
    id: 'trader' as const,
    name: 'Strategy Advisor',
    description: 'Advanced trading strategies and portfolio guidance',
    icon: TrendingUp,
    color: 'from-purple-500 to-pink-600',
    creditCost: 15,
    bgColor: 'from-purple-500/10 to-pink-500/10',
    borderColor: 'border-purple-500/20 hover:border-purple-500/40'
  }
}

export default function ProfessionalDashboard() {
  const router = useRouter()
  
  // State management
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null)
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load user data on component mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load user credits with error handling
      try {
        const creditsResponse = await fetch('/api/credits/balance')
        if (creditsResponse.ok) {
          const creditsData = await creditsResponse.json()
          setUserCredits(creditsData)
        }
      } catch (creditsError) {
        console.error('Credits fetch error:', creditsError)
      }

      // Load portfolios with error handling
      try {
        const portfoliosResponse = await fetch('/api/portfolio')
        if (portfoliosResponse.ok) {
          const portfoliosData = await portfoliosResponse.json()
          // Ensure portfoliosData is always an array
          const portfoliosArray = Array.isArray(portfoliosData) ? portfoliosData : []
          setPortfolios(portfoliosArray)
          if (portfoliosArray.length > 0) {
            setSelectedPortfolio(portfoliosArray[0])
          }
        }
      } catch (portfoliosError) {
        console.error('Portfolios fetch error:', portfoliosError)
        // Set empty array as fallback
        setPortfolios([])
      }

      // Load market data with better error handling and fallback
      try {
        const marketResponse = await fetch('/api/market-data?endpoint=simple/price&params=ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true')
        if (marketResponse.ok) {
          const marketDataResponse = await marketResponse.json()
          if (marketDataResponse && typeof marketDataResponse === 'object') {
            setMarketData({
              btc_price: marketDataResponse.bitcoin?.usd || 43000,
              eth_price: marketDataResponse.ethereum?.usd || 2300,
              btc_change_24h: marketDataResponse.bitcoin?.usd_24h_change || 0,
              eth_change_24h: marketDataResponse.ethereum?.usd_24h_change || 0,
              total_market_cap: 0,
              market_cap_change_24h: 0
            })
          }
        } else {
          console.error('Market data API error:', marketResponse.status, await marketResponse.text())
          // Set fallback market data to prevent UI crashes
          setMarketData({
            btc_price: 43000,
            eth_price: 2300,
            btc_change_24h: 2.1,
            eth_change_24h: 1.8,
            total_market_cap: 0,
            market_cap_change_24h: 0
          })
        }
      } catch (marketError) {
        console.error('Market data fetch error:', marketError)
        // Set fallback market data
        setMarketData({
          btc_price: 43000,
          eth_price: 2300,
          btc_change_24h: 2.1,
          eth_change_24h: 1.8,
          total_market_cap: 0,
          market_cap_change_24h: 0
        })
      }

      // Load alerts with error handling
      try {
        const alertsResponse = await fetch('/api/alerts')
        if (alertsResponse.ok) {
          const alertsData = await alertsResponse.json()
          setAlerts(Array.isArray(alertsData?.alerts) ? alertsData.alerts : [])
        }
      } catch (alertsError) {
        console.error('Alerts fetch error:', alertsError)
        setAlerts([])
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handlePersonaChat = (personaId: keyof typeof PERSONA_CONFIGS) => {
    router.push('/chat')
    // The chat interface will handle persona selection
  }

  const handleAddHolding = () => {
    router.push('/portfolio')
  }

  const handleCreateAlert = () => {
    router.push('/alerts')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading your ChainWise dashboard...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white">
      {/* Command Palette Overlay */}
      <AnimatePresence>
        {showCommandPalette && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-32"
            onClick={() => setShowCommandPalette(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-slate-900/95 backdrop-blur-xl border-slate-700/50">
                <div className="flex items-center px-4 py-3 border-b border-slate-700/50">
                  <Command className="h-5 w-5 text-purple-400 mr-3" />
                  <Input
                    placeholder="Type a command or search..."
                    className="border-0 bg-transparent text-white placeholder-slate-400 focus:ring-0"
                    autoFocus
                  />
                </div>
                <div className="p-2 max-h-96 overflow-y-auto">
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-xs text-slate-400 uppercase tracking-wide">Quick Actions</div>
                    <Button variant="ghost" className="w-full justify-start text-left text-white hover:bg-slate-800" onClick={handleAddHolding}>
                      <Plus className="h-4 w-4 mr-3" />
                      Add new position
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-left text-white hover:bg-slate-800" onClick={handleCreateAlert}>
                      <AlertTriangle className="h-4 w-4 mr-3" />
                      Set price alert
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-left text-white hover:bg-slate-800" onClick={() => handlePersonaChat('professor')}>
                      <BarChart3 className="h-4 w-4 mr-3" />
                      Get market analysis
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Status Bar */}
      <div className="h-8 bg-slate-900/50 border-b border-slate-800/50 flex items-center justify-between px-4 text-xs backdrop-blur-xl">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            {isConnected ? <Wifi className="h-3 w-3 text-emerald-400" /> : <WifiOff className="h-3 w-3 text-red-400" />}
            <span className="text-slate-400">WebSocket: {isConnected ? "Connected" : "Disconnected"}</span>
          </div>
          <div className="text-slate-400">
            Market: <span className="text-white font-mono">Live</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {marketData && (
            <>
              <div className="text-slate-400">
                BTC: <span className={cn("font-mono", marketData.btc_change_24h >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {formatCurrency(marketData.btc_price)}
                </span>
              </div>
              <div className="text-slate-400">
                ETH: <span className={cn("font-mono", marketData.eth_change_24h >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {formatCurrency(marketData.eth_price)}
                </span>
              </div>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={() => setSoundEnabled(!soundEnabled)} className="h-6 px-2">
            {soundEnabled ? (
              <Volume2 className="h-3 w-3 text-slate-400" />
            ) : (
              <VolumeX className="h-3 w-3 text-slate-400" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Header */}
      <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CW</span>
                </div>
                <h1 className="text-xl font-bold text-white">ChainWise</h1>
              </div>

              <nav className="hidden md:flex items-center space-x-1">
                <Button variant="ghost" className="text-black bg-purple-400 hover:bg-purple-300">
                  Dashboard
                </Button>
                <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800" onClick={() => router.push('/portfolio')}>
                  Portfolio
                </Button>
                <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800" onClick={() => router.push('/chat')}>
                  AI Chat
                </Button>
                <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800" onClick={() => router.push('/alerts')}>
                  Alerts
                </Button>
              </nav>
            </div>

            {/* Command Palette and User Actions */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCommandPalette(true)}
                className="hidden md:flex items-center space-x-2 bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white"
              >
                <Command className="h-4 w-4" />
                <span>Search</span>
                <kbd className="px-1.5 py-0.5 text-xs bg-slate-700 rounded">⌘K</kbd>
              </Button>

              {userCredits && (
                <div className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Credits</div>
                    <div className="text-lg font-bold text-white font-mono">{userCredits.balance}</div>
                  </div>
                  <Badge className={cn(
                    "border-0 font-bold uppercase",
                    userCredits.tier === 'elite' ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white' :
                    userCredits.tier === 'pro' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                    'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                  )}>
                    {userCredits.tier}
                  </Badge>
                </div>
              )}

              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800">
                <Bell className="h-5 w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder-user.png" alt="User" />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-600 text-white font-bold">
                        U
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-slate-900/95 backdrop-blur-xl border-slate-700/50" align="end">
                  <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-800">
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-800">
                    Workspace Layout
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-800">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <main className="container mx-auto px-6 py-6">
        {/* Modular Widget Grid */}
        <div className="grid grid-cols-12 gap-4 mb-6">
          {/* Portfolio Overview Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-12 lg:col-span-3"
          >
            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 hover:border-slate-700/50 transition-all duration-300 h-full">
              <CardHeader className="pb-3 border-b border-slate-800/50">
                <CardTitle className="text-white text-sm font-bold uppercase tracking-wide flex items-center justify-between">
                  Portfolio Overview
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => router.push('/portfolio')}>
                    <Settings className="h-3 w-3 text-slate-400" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {portfolios.length > 0 ? (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-800"
                        >
                          {selectedPortfolio?.name || 'Select Portfolio'}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full bg-slate-900/95 backdrop-blur-xl border-slate-700/50">
                        {portfolios.map((portfolio) => (
                          <DropdownMenuItem
                            key={portfolio.id}
                            onClick={() => setSelectedPortfolio(portfolio)}
                            className="text-slate-300 hover:text-white hover:bg-slate-800"
                          >
                            {portfolio.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {selectedPortfolio && (
                      <>
                        {/* Large Format Total Value */}
                        <div className="text-center space-y-2 py-4">
                          <div className="text-4xl font-bold text-white font-mono">
                            {formatCurrency(selectedPortfolio.total_value_usd)}
                          </div>
                          <div className="flex items-center justify-center space-x-2">
                            {selectedPortfolio.profit_loss_percentage >= 0 ? (
                              <TrendingUp className="h-5 w-5 text-emerald-400" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-400" />
                            )}
                            <span className={cn(
                              "font-bold font-mono text-lg",
                              selectedPortfolio.profit_loss_percentage >= 0 ? "text-emerald-400" : "text-red-400"
                            )}>
                              {selectedPortfolio.profit_loss_percentage >= 0 ? '+' : ''}
                              {selectedPortfolio.profit_loss_percentage.toFixed(1)}%
                            </span>
                            <span className="text-slate-400 text-sm">24h</span>
                          </div>
                          <div className="text-sm text-slate-400 font-mono">
                            P&L: <span className={cn(
                              selectedPortfolio.profit_loss_usd >= 0 ? "text-emerald-400" : "text-red-400"
                            )}>
                              {selectedPortfolio.profit_loss_usd >= 0 ? '+' : ''}
                              {formatCurrency(selectedPortfolio.profit_loss_usd)}
                            </span>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <div className="text-slate-400">Holdings</div>
                            <div className="text-white font-mono font-bold">{selectedPortfolio.holdings_count}</div>
                          </div>
                          <div>
                            <div className="text-slate-400">Cost Basis</div>
                            <div className="text-white font-mono font-bold">{formatCurrency(selectedPortfolio.total_cost_usd)}</div>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Wallet className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 mb-4">No portfolios yet</p>
                    <Button size="sm" onClick={handleAddHolding} className="bg-purple-500 hover:bg-purple-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Portfolio
                    </Button>
                  </div>
                )}

                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                  onClick={handleAddHolding}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Holdings
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Advanced Charting Area - Placeholder for now */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-12 lg:col-span-6"
          >
            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 hover:border-slate-700/50 transition-all duration-300 h-full">
              <CardHeader className="pb-3 border-b border-slate-800/50">
                <CardTitle className="text-white text-sm font-bold uppercase tracking-wide flex items-center justify-between">
                  Market Overview
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-slate-400">LIVE</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-64 bg-slate-950/50 rounded border border-slate-800/50 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                    <div className="text-sm text-slate-500">Market Chart</div>
                    <div className="text-xs text-slate-600">Real-time data integration</div>
                  </div>
                </div>

                {marketData && (
                  <div className="flex items-center justify-between mt-4 text-sm">
                    <div className="flex items-center space-x-4">
                      <div>
                        <span className="text-slate-400">BTC: </span>
                        <span className="text-white font-mono font-bold">{formatCurrency(marketData.btc_price)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">24h: </span>
                        <span className={cn("font-mono", marketData.btc_change_24h >= 0 ? "text-emerald-400" : "text-red-400")}>
                          {marketData.btc_change_24h >= 0 ? '+' : ''}{marketData.btc_change_24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-12 lg:col-span-3"
          >
            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 hover:border-slate-700/50 transition-all duration-300 h-full">
              <CardHeader className="pb-3 border-b border-slate-800/50">
                <CardTitle className="text-white text-sm font-bold uppercase tracking-wide">
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-2",
                          activity.type === 'transaction' ? 'bg-emerald-400' :
                          activity.type === 'alert' ? 'bg-yellow-400' :
                          activity.type === 'analysis' ? 'bg-purple-400' :
                          'bg-blue-400'
                        )}></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-white text-sm">{activity.description}</span>
                            {activity.amount && (
                              <span className="text-emerald-400 text-xs font-mono">
                                {formatCurrency(activity.amount)}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">{activity.timestamp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* AI Assistant Hub and Stats Row */}
        <div className="grid grid-cols-12 gap-4 mb-6">
          {/* AI Assistant Hub */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="col-span-12 lg:col-span-8"
          >
            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 hover:border-slate-700/50 transition-all duration-300">
              <CardHeader className="pb-3 border-b border-slate-800/50">
                <CardTitle className="text-white text-sm font-bold uppercase tracking-wide">AI Assistant Hub</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(PERSONA_CONFIGS).map(([key, persona]) => (
                    <motion.div
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      className={cn(
                        'p-4 rounded-lg bg-gradient-to-br transition-all duration-300',
                        persona.bgColor,
                        persona.borderColor,
                        'border cursor-pointer'
                      )}
                      onClick={() => handlePersonaChat(key as keyof typeof PERSONA_CONFIGS)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={cn('w-10 h-10 bg-gradient-to-r rounded-full flex items-center justify-center', persona.color)}>
                            <persona.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-white font-bold">{persona.name}</div>
                            <div className={cn(
                              'text-xs font-mono',
                              key === 'buddy' ? 'text-emerald-400' :
                              key === 'professor' ? 'text-blue-400' :
                              'text-purple-400'
                            )}>
                              {persona.creditCost} credits/query
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-300 text-xs mb-4">
                        {persona.description}
                      </p>
                      <Button
                        size="sm"
                        className={cn(
                          'w-full mt-3 transition-all duration-200',
                          `${persona.bgColor.replace('/10', '/20')} hover:${persona.bgColor.replace('/10', '/30')}`,
                          key === 'buddy' ? 'text-emerald-300 border-emerald-500/30' :
                          key === 'professor' ? 'text-blue-300 border-blue-500/30' :
                          'text-purple-300 border-purple-500/30',
                          'border'
                        )}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Start Chat
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="col-span-12 lg:col-span-4"
          >
            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 hover:border-slate-700/50 transition-all duration-300 h-full">
              <CardHeader className="pb-3 border-b border-slate-800/50">
                <CardTitle className="text-white text-sm font-bold uppercase tracking-wide">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white font-mono">{portfolios.length}</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide">Portfolios</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white font-mono">
                      {portfolios?.reduce((sum, p) => sum + (p.holdings_count || 0), 0) || 0}
                    </div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide">Holdings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white font-mono">{alerts.length}</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide">Active Alerts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-400 font-mono">
                      {userCredits?.tier?.toUpperCase() || 'FREE'}
                    </div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide">Tier Status</div>
                  </div>
                </div>

                {userCredits && (
                  <div className="pt-4 border-t border-slate-800/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-400">Credits Used This Month</span>
                      <span className="text-sm text-white font-mono">{userCredits.balance}</span>
                    </div>
                    <div className="w-full bg-slate-800/50 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((userCredits.balance / 200) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
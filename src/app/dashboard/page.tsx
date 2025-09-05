'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  Search,
  RefreshCw,
  BarChart3,
  DollarSign,
  Activity,
  PieChart,
  Crown,
  Zap,
  Star,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  Bell,
  Wallet,
  Target
} from 'lucide-react'
import { CryptoService } from '@/lib/crypto-service'
import { CryptoData, MarketStats } from '@/types'
import { formatCurrency, formatLargeNumber, formatPercentage, cn } from '@/lib/utils'
import CryptoCard from '@/components/CryptoCard'
import MarketOverview from '@/components/MarketOverview'
import { useSubscription } from '@/hooks/use-subscription'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DashboardLayout } from '@/components/dashboard-layout'

export default function DashboardPage() {
  const { session, user, loading: authLoading } = useSupabase()
  const { creditBalance } = useSubscription()

  const [cryptos, setCryptos] = useState<CryptoData[]>([])
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'market_cap' | 'price' | 'change'>('market_cap')
  const [filterBy, setFilterBy] = useState<'all' | 'gainers' | 'losers'>('all')

  // User portfolio summary
  const [portfolioSummary, setPortfolioSummary] = useState<{
    totalPortfolios: number
    totalValue: number
    totalProfitLoss: number
    activeAlerts: number
  } | null>(null)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (session && !authLoading) {
      loadUserData()
    }
  }, [session, authLoading])

  const loadData = async () => {
    setLoading(true)
    try {
      const [cryptoData, stats] = await Promise.all([
        CryptoService.getTopCryptos(50),
        CryptoService.getMarketStats(),
      ])
      setCryptos(cryptoData)
      setMarketStats(stats)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserData = async () => {
    try {
      // Load portfolio summary
      const portfolioResponse = await fetch('/api/portfolio?includeHoldings=false&limit=1')
      if (portfolioResponse.ok) {
        const portfolioData = await portfolioResponse.json()
        setPortfolioSummary({
          totalPortfolios: portfolioData.pagination.total,
          totalValue: 0, // Will calculate from holdings
          totalProfitLoss: 0,
          activeAlerts: 0
        })
      }

      // Load alerts count
      const alertsResponse = await fetch('/api/alerts?active=true&limit=1')
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json()
        setPortfolioSummary(prev => prev ? {
          ...prev,
          activeAlerts: alertsData.pagination.total
        } : null)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadData()
      return
    }
    
    setLoading(true)
    try {
      const results = await CryptoService.searchCrypto(searchTerm)
      setCryptos(results)
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedCryptos = cryptos
    .filter((crypto) => {
      if (filterBy === 'gainers') return crypto.price_change_percentage_24h > 0
      if (filterBy === 'losers') return crypto.price_change_percentage_24h < 0
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.current_price - a.current_price
        case 'change':
          return b.price_change_percentage_24h - a.price_change_percentage_24h
        default:
          return b.market_cap - a.market_cap
      }
    })

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-responsive-3xl font-bold text-gradient-primary">
            Crypto Market Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time cryptocurrency market data and analytics
          </p>
        </div>
        
        <Button
          onClick={loadData}
          disabled={loading}
          className="crypto-button-primary"
        >
          <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Subscription Status & User Overview */}
      {session && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subscription Status */}
          <Card className="lg:col-span-2 crypto-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {creditBalance?.tier === 'free' && <Star className="w-5 h-5 text-muted-foreground" />}
                  {creditBalance?.tier === 'pro' && <Zap className="w-5 h-5 text-crypto-accent" />}
                  {creditBalance?.tier === 'elite' && <Crown className="w-5 h-5 text-crypto-secondary" />}
                  <CardTitle className="text-lg">
                    {(creditBalance?.tier || 'free').charAt(0).toUpperCase() + (creditBalance?.tier || 'free').slice(1)} Plan
                  </CardTitle>
                </div>
                <Badge variant={
                  creditBalance?.tier === 'elite' ? 'default' :
                  creditBalance?.tier === 'pro' ? 'secondary' : 'outline'
                } className="animate-float">
                  {creditBalance?.tier.toUpperCase()}
                </Badge>
              </div>
              <CardDescription>
                Manage your subscription and billing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-crypto-success animate-scale-up">
                      {creditBalance?.balance || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Credits Available
                    </div>
                  </div>
                  {portfolioSummary && (
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-crypto-accent animate-scale-up">
                          {portfolioSummary.totalPortfolios}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Portfolios
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-crypto-warning animate-scale-up">
                          {portfolioSummary.activeAlerts}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Active Alerts
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Link href="/portfolio">
                    <Button variant="outline" size="sm">
                      <Wallet className="w-4 h-4 mr-2" />
                      Portfolio
                    </Button>
                  </Link>
                  <Link href="/alerts">
                    <Button variant="outline" size="sm">
                      <Bell className="w-4 h-4 mr-2" />
                      Alerts
                    </Button>
                  </Link>
                  {creditBalance?.tier !== 'elite' && (
                    <Link href="/pricing">
                      <Button size="sm">
                        <ArrowUpRight className="w-4 h-4 mr-2" />
                        Upgrade
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="crypto-card">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/portfolio">
                <Button variant="outline" className="w-full justify-start crypto-input border-crypto-primary/20 hover:border-crypto-primary/40">
                  <Wallet className="w-4 h-4 mr-2" />
                  Manage Portfolio
                </Button>
              </Link>
              <Link href="/alerts">
                <Button variant="outline" className="w-full justify-start crypto-input border-crypto-secondary/20 hover:border-crypto-secondary/40">
                  <Bell className="w-4 h-4 mr-2" />
                  Set Alerts
                </Button>
              </Link>
              <Link href="/chat">
                <Button variant="outline" className="w-full justify-start crypto-input border-crypto-accent/20 hover:border-crypto-accent/40">
                  <Target className="w-4 h-4 mr-2" />
                  AI Assistant
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline" className="w-full justify-start crypto-input">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Feature Upgrade Prompts */}
      {status === 'authenticated' && creditBalance?.tier === 'free' && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>Unlock Pro Features:</strong> Create unlimited portfolios, advanced analytics,
              and AI-powered insights with ChainWise Pro.
            </div>
            <Link href="/pricing">
              <Button size="sm" className="ml-4">
                Upgrade to Pro
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {status === 'authenticated' && creditBalance?.tier === 'pro' && (
        <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
          <Crown className="h-4 w-4 text-purple-600" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>Go Elite:</strong> Access Trader AI persona, whale tracking, social sentiment
              analysis, and monthly deep reports.
            </div>
            <Link href="/pricing">
              <Button size="sm" className="ml-4">
                Upgrade to Elite
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {marketStats && <MarketOverview stats={marketStats} />}

      <Card className="crypto-card">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search cryptocurrencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="crypto-input w-full pl-10 pr-4 py-3"
                />
              </div>
            </div>
          
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="crypto-input px-4 py-3"
              >
                <option value="market_cap">Market Cap</option>
                <option value="price">Price</option>
                <option value="change">24h Change</option>
              </select>
              
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="crypto-input px-4 py-3"
              >
                <option value="all">All Cryptos</option>
                <option value="gainers">Gainers Only</option>
                <option value="losers">Losers Only</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">
                    Rank
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">
                    Name
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-muted-foreground">
                    Price
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-muted-foreground">
                    24h Change
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-muted-foreground">
                    Market Cap
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-muted-foreground">
                    Volume (24h)
                  </th>
                </tr>
              </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="flex justify-center items-center space-x-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-crypto-primary" />
                      <span className="text-gray-600 dark:text-gray-300">Loading market data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAndSortedCryptos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-600 dark:text-gray-300">
                    No cryptocurrencies found
                  </td>
                </tr>
              ) : (
                filteredAndSortedCryptos.map((crypto) => (
                  <tr
                    key={crypto.id}
                    className="border-b border-border hover:bg-accent/50 transition-colors animate-fade-in"
                  >
                    <td className="py-4 px-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{crypto.market_cap_rank}
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-3">
                        <img
                          src={crypto.image}
                          alt={crypto.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {crypto.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                            {crypto.symbol}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(crypto.current_price)}
                      </p>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {crypto.price_change_percentage_24h >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span
                          className={cn(
                            'font-semibold',
                            crypto.price_change_percentage_24h >= 0
                              ? 'text-green-500'
                              : 'text-red-500'
                          )}
                        >
                          {formatPercentage(crypto.price_change_percentage_24h)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <p className="text-gray-900 dark:text-white">
                        ${formatLargeNumber(crypto.market_cap)}
                      </p>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <p className="text-gray-600 dark:text-gray-400">
                        ${formatLargeNumber(crypto.total_volume)}
                      </p>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {marketStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="crypto-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-crypto-success" />
                Top Gainers (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {marketStats.topGainers.map((crypto) => (
                  <CryptoCard key={crypto.id} crypto={crypto} compact />
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="crypto-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingDown className="w-5 h-5 mr-2 text-crypto-danger" />
                Top Losers (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {marketStats.topLosers.map((crypto) => (
                  <CryptoCard key={crypto.id} crypto={crypto} compact />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
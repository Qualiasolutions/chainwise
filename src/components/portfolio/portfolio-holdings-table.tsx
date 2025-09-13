'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface Holding {
  id: string
  symbol: string
  name: string
  amount: number
  currentPrice: number
  marketValue: number
  profitLoss: number
  profitLossPercentage: number
  allocation: number
  lastUpdated: string
}

interface PortfolioHoldingsTableProps {
  portfolioId: string
  onEditHolding?: (holding: Holding) => void
  onDeleteHolding?: (holdingId: string) => void
  refreshTrigger?: number
}

export default function PortfolioHoldingsTable({
  portfolioId,
  onEditHolding,
  onDeleteHolding,
  refreshTrigger = 0
}: PortfolioHoldingsTableProps) {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<keyof Holding>('marketValue')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Memoized sorted holdings
  const sortedHoldings = useMemo(() => {
    return [...holdings].sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      return 0
    })
  }, [holdings, sortBy, sortOrder])

  const loadHoldings = useCallback(async () => {
    if (!portfolioId) return

    try {
      setError(null)
      
      const response = await fetch(`/api/portfolio/${portfolioId}/dashboard-stats`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch holdings')
      }
      
      const data = await response.json()
      setHoldings(data.topHoldings || [])
      
    } catch (error) {
      console.error('Error loading holdings:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load holdings'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }, [portfolioId])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await loadHoldings()
      toast.success('Holdings refreshed successfully')
    } catch (error) {
      console.error('Error refreshing holdings:', error)
      toast.error('Failed to refresh holdings')
    } finally {
      setRefreshing(false)
    }
  }, [loadHoldings])

  const handleSort = useCallback((column: keyof Holding) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }, [sortBy])

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(amount)
  }, [])

  const formatPercentage = useCallback((percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`
  }, [])

  const formatNumber = useCallback((num: number, decimals = 6) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    }).format(num)
  }, [])

  // Load holdings on mount and when refresh trigger changes
  useEffect(() => {
    setLoading(true)
    loadHoldings().finally(() => setLoading(false))
  }, [loadHoldings, refreshTrigger])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !refreshing) {
        loadHoldings()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [loadHoldings, loading, refreshing])

  if (loading && holdings.length === 0) {
    return (
      <Card className="bg-white/10 backdrop-blur-xl border-white/20">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400 mr-3" />
            <p className="text-white/70">Loading holdings...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-red-900/20 border-red-500/20">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400 mr-3" />
            <div>
              <h3 className="text-red-400 font-medium">Error loading holdings</h3>
              <p className="text-red-300 text-sm mt-1">{error}</p>
              <Button 
                onClick={() => loadHoldings()} 
                variant="outline" 
                size="sm" 
                className="mt-3 border-red-400/40 text-red-300 hover:bg-red-500/20"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (holdings.length === 0) {
    return (
      <Card className="bg-white/10 backdrop-blur-xl border-white/20">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-purple-300" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Holdings Yet</h3>
            <p className="text-white/70 mb-4">
              Add your first cryptocurrency holding to start tracking your portfolio performance.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="bg-white/10 backdrop-blur-xl border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Portfolio Holdings</CardTitle>
              <CardDescription className="text-white/70">
                {holdings.length} {holdings.length === 1 ? 'holding' : 'holdings'} • Auto-refresh every 30s
              </CardDescription>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-white/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-white/5 border-white/10">
                  <TableHead 
                    className="text-white/70 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('symbol')}
                  >
                    Asset {sortBy === 'symbol' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="text-white/70 cursor-pointer hover:text-white transition-colors text-right"
                    onClick={() => handleSort('amount')}
                  >
                    Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="text-white/70 cursor-pointer hover:text-white transition-colors text-right"
                    onClick={() => handleSort('currentPrice')}
                  >
                    Price {sortBy === 'currentPrice' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="text-white/70 cursor-pointer hover:text-white transition-colors text-right"
                    onClick={() => handleSort('marketValue')}
                  >
                    Market Value {sortBy === 'marketValue' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="text-white/70 cursor-pointer hover:text-white transition-colors text-right"
                    onClick={() => handleSort('profitLoss')}
                  >
                    P&L {sortBy === 'profitLoss' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="text-white/70 cursor-pointer hover:text-white transition-colors text-right"
                    onClick={() => handleSort('allocation')}
                  >
                    Allocation {sortBy === 'allocation' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="text-white/70 w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedHoldings.map((holding, index) => (
                  <motion.tr
                    key={holding.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-white/5 border-white/10 transition-colors"
                  >
                    <TableCell className="font-medium text-white">
                      <div>
                        <div className="font-semibold">{holding.symbol}</div>
                        <div className="text-sm text-white/60 truncate max-w-[120px]">
                          {holding.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-white">
                      {formatNumber(holding.amount)}
                    </TableCell>
                    <TableCell className="text-right text-white">
                      {formatCurrency(holding.currentPrice)}
                    </TableCell>
                    <TableCell className="text-right text-white font-semibold">
                      {formatCurrency(holding.marketValue)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={`${holding.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        <div className="font-semibold">
                          {formatCurrency(holding.profitLoss)}
                        </div>
                        <div className="text-xs flex items-center justify-end">
                          {holding.profitLoss >= 0 ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {formatPercentage(holding.profitLossPercentage)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant="secondary" 
                        className="bg-purple-500/20 text-purple-200 border-purple-400/30"
                      >
                        {holding.allocation.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-white/10"
                          >
                            <MoreVertical className="h-4 w-4 text-white/70" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="end" 
                          className="bg-gray-900/95 border-white/20 backdrop-blur-xl"
                        >
                          <DropdownMenuItem 
                            onClick={() => onEditHolding?.(holding)}
                            className="text-white hover:bg-white/10 cursor-pointer"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Holding
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="border-white/10" />
                          <DropdownMenuItem 
                            onClick={() => onDeleteHolding?.(holding.id)}
                            className="text-red-400 hover:bg-red-500/20 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Holding
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {holdings.length > 0 && (
            <div className="mt-4 text-center">
              <p className="text-white/50 text-sm">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
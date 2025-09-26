"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  MetricsCard,
  ChartCard,
  DataCard,
  TableCard
} from "@/components/ui/professional-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/ui/data-table"
import { PriceCard } from "@/components/ui/price-card"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts"
import {
  PieChart as PieChartIcon,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit,
  DollarSign,
  Target,
  BarChart3,
  Wallet,
  ArrowUpDown,
  Trash2,
  MoreHorizontal,
  ShoppingCart,
  Minus,
  Equal,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import { supabase } from "@/lib/supabase/client"
import { cryptoAPI, formatPrice, formatPercentage, formatMarketCap } from "@/lib/crypto-api"
import { ColumnDef } from "@tanstack/react-table"
import { motion } from "framer-motion"
import { AddAssetModal } from "@/components/AddAssetModal"
import { toast } from "sonner"

interface PortfolioHolding {
  id: string
  symbol: string
  name: string
  amount: number
  purchase_price: number
  current_price: number
  purchase_date: string
  value: number
  pnl: number
  pnlPercentage: number
  allocation: number
  image?: string | null
  action_recommendation?: 'buy' | 'sell' | 'hold' | null
  recommendation_reason?: string | null
  recommendation_confidence?: number | null
}

interface PortfolioMetrics {
  totalValue: number
  totalPnL: number
  totalPnLPercentage: number
  dayChange: number
  dayChangePercentage: number
  topGainer: PortfolioHolding | null
  topLoser: PortfolioHolding | null
}

export default function PortfolioPage() {
  const { user, profile } = useSupabaseAuth()
  const [portfolioId, setPortfolioId] = useState<string | null>(null)
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([])
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null)
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [allocationData, setAllocationData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch portfolio data
  const fetchPortfolioData = useCallback(async () => {
    if (!user || !profile) return

    try {
      setLoading(true)
      setError(null)

      // Get user's default portfolio
      const { data: portfolios, error: portfolioError } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', profile.id)
        .eq('is_default', true)
        .limit(1)

      if (portfolioError) throw portfolioError

      if (!portfolios || portfolios.length === 0) {
        // Create default portfolio if none exists
        const { data: newPortfolio, error: createError } = await supabase
          .from('portfolios')
          .insert({
            user_id: profile.id,
            name: 'My Portfolio',
            description: 'Default portfolio',
            is_default: true
          })
          .select('id')
          .single()

        if (createError) throw createError
        portfolios.push(newPortfolio)
      }

      const currentPortfolioId = portfolios[0].id
      setPortfolioId(currentPortfolioId)

      // Use new API endpoint for better performance and features
      const response = await fetch(`/api/portfolio/${currentPortfolioId}/holdings`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch holdings')
      }

      const { enrichedHoldings } = data

      if (!enrichedHoldings || enrichedHoldings.length === 0) {
        setHoldings([])
        setMetrics({
          totalValue: 0,
          totalPnL: 0,
          totalPnLPercentage: 0,
          dayChange: 0,
          dayChangePercentage: 0,
          topGainer: null,
          topLoser: null
        })
        setLoading(false)
        return
      }

      // Convert API response to UI format
      const processedHoldings: PortfolioHolding[] = enrichedHoldings.map((holding: any) => ({
        id: holding.id,
        symbol: holding.symbol.toUpperCase(),
        name: holding.name,
        amount: holding.amount,
        purchase_price: holding.purchase_price,
        current_price: holding.current_price,
        purchase_date: holding.purchase_date,
        value: holding.currentValue,
        pnl: holding.totalPnL,
        pnlPercentage: holding.pnlPercentage,
        allocation: 0, // Will be calculated below
        image: holding.image,
        action_recommendation: holding.action_recommendation || null,
        recommendation_reason: holding.recommendation_reason || null,
        recommendation_confidence: holding.recommendation_confidence || null
      }))

      // Calculate allocations
      const totalValue = processedHoldings.reduce((sum, holding) => sum + holding.value, 0)
      processedHoldings.forEach(holding => {
        holding.allocation = totalValue > 0 ? (holding.value / totalValue) * 100 : 0
      })

      // Calculate portfolio metrics
      const totalPnL = processedHoldings.reduce((sum, holding) => sum + holding.pnl, 0)
      const totalPnLPercentage = totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0

      const topGainer = processedHoldings.reduce((max, holding) =>
        holding.pnlPercentage > (max?.pnlPercentage || -Infinity) ? holding : max,
        null as PortfolioHolding | null
      )

      const topLoser = processedHoldings.reduce((min, holding) =>
        holding.pnlPercentage < (min?.pnlPercentage || Infinity) ? holding : min,
        null as PortfolioHolding | null
      )

      setHoldings(processedHoldings)
      setMetrics({
        totalValue,
        totalPnL,
        totalPnLPercentage,
        dayChange: 0, // TODO: Calculate from price history
        dayChangePercentage: 0,
        topGainer,
        topLoser
      })

      // Generate performance chart data (simulated for now)
      const performanceHistory = []
      for (let i = 29; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)

        // Simulate portfolio value over time
        const baseValue = totalValue - totalPnL
        const progressFactor = (29 - i) / 29
        const variation = (Math.random() - 0.5) * 0.1
        const simulatedValue = baseValue * (1 + (totalPnLPercentage / 100) * progressFactor + variation)

        performanceHistory.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: Math.max(0, simulatedValue),
          pnl: simulatedValue - baseValue
        })
      }
      setPerformanceData(performanceHistory)

      // Generate allocation chart data
      const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#84cc16', '#f97316']
      const allocationChartData = processedHoldings.map((holding, index) => ({
        name: holding.symbol,
        value: holding.value,
        percentage: holding.allocation,
        color: COLORS[index % COLORS.length]
      }))
      setAllocationData(allocationChartData)

    } catch (err) {
      console.error('Error fetching portfolio data:', err)
      setError('Failed to fetch portfolio data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [user?.id, profile?.id]) // Only depend on stable IDs, not whole objects

  useEffect(() => {
    fetchPortfolioData()
  }, [fetchPortfolioData])

  // Add holding function with optimistic updates
  const handleAddHolding = useCallback(async (newHoldingData?: any) => {
    if (!portfolioId) return

    // If no data provided, just refresh (legacy support)
    if (!newHoldingData) {
      fetchPortfolioData()
      return
    }

    try {
      // Create optimistic holding for immediate UI update
      const optimisticHolding: PortfolioHolding = {
        id: `temp-${Date.now()}`,
        symbol: newHoldingData.symbol.toUpperCase(),
        name: newHoldingData.name,
        amount: newHoldingData.amount,
        purchase_price: newHoldingData.purchasePrice,
        current_price: newHoldingData.purchasePrice, // Use purchase price as placeholder
        purchase_date: newHoldingData.purchaseDate,
        value: newHoldingData.amount * newHoldingData.purchasePrice,
        pnl: 0, // Initially no P&L
        pnlPercentage: 0,
        allocation: 0, // Will be recalculated
        image: null // Will be fetched in background
      }

      // Optimistically update the UI
      const updatedHoldings = [...holdings, optimisticHolding]

      // Recalculate allocations for all holdings
      const totalValue = updatedHoldings.reduce((sum, holding) => sum + holding.value, 0)
      updatedHoldings.forEach(holding => {
        holding.allocation = totalValue > 0 ? (holding.value / totalValue) * 100 : 0
      })

      setHoldings(updatedHoldings)

      // Update metrics optimistically
      if (metrics) {
        const newTotalValue = metrics.totalValue + optimisticHolding.value
        setMetrics({
          ...metrics,
          totalValue: newTotalValue
        })
      }

      // Show immediate success feedback
      toast.success(`${optimisticHolding.symbol} added to your portfolio!`)

      // Fetch fresh data in the background to get real current prices
      setTimeout(() => {
        fetchPortfolioData()
      }, 1000)

    } catch (error: any) {
      console.error('Error adding holding:', error)
      toast.error('Failed to add holding')
      // Revert optimistic update on error
      fetchPortfolioData()
    }
  }, [portfolioId, holdings, metrics]) // Remove fetchPortfolioData from deps to prevent infinite loop

  // Delete holding function with optimistic updates
  const handleDeleteHolding = async (holdingId: string, symbol: string) => {
    if (!portfolioId) return

    const confirmDelete = window.confirm(`Are you sure you want to remove ${symbol} from your portfolio?`)
    if (!confirmDelete) return

    try {
      // Optimistically remove from UI
      const updatedHoldings = holdings.filter(h => h.id !== holdingId)
      setHoldings(updatedHoldings)

      // Recalculate metrics optimistically
      if (metrics) {
        const removedHolding = holdings.find(h => h.id === holdingId)
        if (removedHolding) {
          const newTotalValue = metrics.totalValue - removedHolding.value
          const newTotalPnL = metrics.totalPnL - removedHolding.pnl
          setMetrics({
            ...metrics,
            totalValue: newTotalValue,
            totalPnL: newTotalPnL,
            totalPnLPercentage: newTotalValue > 0 ? (newTotalPnL / (newTotalValue - newTotalPnL)) * 100 : 0
          })
        }
      }

      // Show immediate feedback
      toast.success(`${symbol} removed from portfolio`)

      // Make API call in background
      const response = await fetch(`/api/portfolio/${portfolioId}/holdings/${holdingId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete holding')
      }

      // Refresh data to ensure consistency
      setTimeout(() => {
        fetchPortfolioData()
      }, 500)

    } catch (error: any) {
      console.error('Delete holding error:', error)
      toast.error(error.message)
      // Revert optimistic update on error
      fetchPortfolioData()
    }
  }

  // Table columns for holdings
  const columns: ColumnDef<PortfolioHolding>[] = [
    {
      id: "asset",
      header: "Asset",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          {row.original.image ? (
            <img
              src={row.original.image}
              alt={row.original.name}
              className="w-8 h-8 rounded-full"
              onError={(e) => {
                // Fallback to gradient circle if image fails to load
                const target = e.target as HTMLElement
                target.style.display = 'none'
                const fallback = target.nextElementSibling as HTMLElement
                if (fallback) fallback.style.display = 'flex'
              }}
            />
          ) : null}
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium"
            style={{ display: row.original.image ? 'none' : 'flex' }}
          >
            {row.original.symbol.slice(0, 2)}
          </div>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-sm text-muted-foreground uppercase">
              {row.original.symbol}
            </div>
          </div>
        </div>
      )
    },
    {
      id: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.amount.toFixed(6)}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.symbol}
          </div>
        </div>
      )
    },
    {
      id: "price",
      header: "Price",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{formatPrice(row.original.current_price)}</div>
          <div className="text-sm text-muted-foreground">
            Avg: {formatPrice(row.original.purchase_price)}
          </div>
        </div>
      )
    },
    {
      id: "value",
      header: "Value",
      cell: ({ row }) => (
        <div className="font-medium">
          {formatPrice(row.original.value)}
        </div>
      )
    },
    {
      id: "pnl",
      header: "P&L",
      cell: ({ row }) => {
        const isPositive = row.original.pnl >= 0
        return (
          <div className={cn(
            "font-medium",
            isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          )}>
            <div className="flex items-center space-x-1">
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{formatPrice(Math.abs(row.original.pnl))}</span>
            </div>
            <div className="text-sm">
              {formatPercentage(row.original.pnlPercentage)}
            </div>
          </div>
        )
      }
    },
    {
      id: "allocation",
      header: "Allocation",
      cell: ({ row }) => (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">{row.original.allocation.toFixed(1)}%</span>
          </div>
          <Progress value={row.original.allocation} className="h-2" />
        </div>
      )
    },
    {
      id: "recommendation",
      header: "Action",
      cell: ({ row }) => {
        const action = row.original.action_recommendation
        const reason = row.original.recommendation_reason
        const confidence = row.original.recommendation_confidence

        if (!action) {
          return (
            <div className="text-muted-foreground text-sm">
              No recommendation
            </div>
          )
        }

        const getActionIcon = (action: string) => {
          switch (action) {
            case 'buy': return <ShoppingCart className="h-4 w-4" />
            case 'sell': return <Minus className="h-4 w-4" />
            case 'hold': return <Equal className="h-4 w-4" />
            default: return <Info className="h-4 w-4" />
          }
        }

        const getActionColor = (action: string) => {
          switch (action) {
            case 'buy': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950'
            case 'sell': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950'
            case 'hold': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950'
            default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950'
          }
        }

        return (
          <div className="space-y-1">
            <div className={cn(
              "inline-flex items-center space-x-1 px-2 py-1 rounded-sm text-xs font-medium",
              getActionColor(action)
            )}>
              {getActionIcon(action)}
              <span className="uppercase">{action}</span>
            </div>
            {confidence && (
              <div className="text-xs text-muted-foreground">
                {Math.round(confidence * 100)}% confidence
              </div>
            )}
            {reason && (
              <div className="text-xs text-muted-foreground max-w-[200px] truncate" title={reason}>
                {reason}
              </div>
            )}
          </div>
        )
      }
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                // TODO: Implement edit functionality
                toast.info("Edit functionality coming soon!")
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Holding
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDeleteHolding(row.original.id, row.original.symbol)}
              className="text-red-600 dark:text-red-400"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Holding
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  if (loading) {
    return (
      <div className="h-full w-full overflow-auto bg-slate-50/50 dark:bg-slate-950/50">
        <div className="space-y-4 px-4 pb-4 pt-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Portfolio
            </h1>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <MetricsCard key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </MetricsCard>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full w-full overflow-auto bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-center">
        <DataCard className="max-w-md">
          <div className="p-6 text-center">
            <h3 className="text-lg font-medium mb-2">Error Loading Portfolio</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </DataCard>
      </div>
    )
  }

  return (
    <div className="h-full w-full overflow-auto bg-slate-50/50 dark:bg-slate-950/50">
      <motion.div
        className="space-y-4 px-4 pb-4 pt-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              My Portfolio
            </h1>
            <p className="text-sm text-muted-foreground">
              Track your cryptocurrency investments and performance
            </p>
          </div>
          {portfolioId && (
            <AddAssetModal portfolioId={portfolioId} onAssetAdded={handleAddHolding} />
          )}
        </div>

      {/* Portfolio Metrics */}
      {metrics && (
        <motion.div
          className="grid gap-4 md:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <PriceCard
            title="Total Value"
            price={metrics.totalValue}
            subtitle="Portfolio Worth"
          />
          <PriceCard
            title="Total P&L"
            price={Math.abs(metrics.totalPnL)}
            change={metrics.totalPnLPercentage}
            subtitle={metrics.totalPnL >= 0 ? "Profit" : "Loss"}
          />
          <MetricsCard>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Best Performer</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            {metrics.topGainer ? (
              <>
                <div className="text-xl font-semibold">{metrics.topGainer.symbol}</div>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {formatPercentage(metrics.topGainer.pnlPercentage)}
                </p>
              </>
            ) : (
              <div className="text-muted-foreground">No data</div>
            )}
          </MetricsCard>
          <MetricsCard>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Worst Performer</span>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
            {metrics.topLoser ? (
              <>
                <div className="text-xl font-semibold">{metrics.topLoser.symbol}</div>
                <p className="text-xs text-red-600 dark:text-red-400">
                  {formatPercentage(metrics.topLoser.pnlPercentage)}
                </p>
              </>
            ) : (
              <div className="text-muted-foreground">No data</div>
            )}
          </MetricsCard>
        </motion.div>
      )}

        {/* Portfolio Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Tabs defaultValue="holdings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="holdings">
            {holdings.length > 0 ? (
              <TableCard>
                <DataTable
                  columns={columns}
                  data={holdings}
                  title="Portfolio Holdings"
                />
              </TableCard>
            ) : (
              <DataCard>
                <div className="p-12 text-center">
                  <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Holdings Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start building your portfolio by adding your first cryptocurrency holding.
                  </p>
                  {portfolioId && (
                    <AddAssetModal portfolioId={portfolioId} onAssetAdded={handleAddHolding}>
                      <Button className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Asset
                      </Button>
                    </AddAssetModal>
                  )}
                </div>
              </DataCard>
            )}
          </TabsContent>

          <TabsContent value="allocation">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Allocation Pie Chart */}
              <ChartCard title="Portfolio Allocation">
                  {allocationData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={allocationData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                            label={false}
                          >
                            {allocationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: any) => [formatPrice(value), 'Value']}
                            labelFormatter={(label) => `${label}`}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {allocationData.map((item) => (
                          <div key={item.name} className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm font-medium">{item.name}</span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {item.percentage.toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                      <div className="text-center">
                        <PieChartIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No allocation data to display</p>
                      </div>
                    </div>
                  )}
              </ChartCard>

              {/* Allocation List */}
              <DataCard title="Detailed Allocation">
                  {holdings.length > 0 ? (
                    <div className="space-y-4">
                      {holdings.map((holding) => (
                        <div key={holding.id} className="flex items-center space-x-4">
                          {holding.image ? (
                            <img
                              src={holding.image}
                              alt={holding.name}
                              className="w-8 h-8 rounded-full"
                              onError={(e) => {
                                // Fallback to gradient circle if image fails to load
                                const target = e.target as HTMLElement
                                target.style.display = 'none'
                                const fallback = target.nextElementSibling as HTMLElement
                                if (fallback) fallback.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <div
                            className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium"
                            style={{ display: holding.image ? 'none' : 'flex' }}
                          >
                            {holding.symbol.slice(0, 2)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{holding.name}</span>
                              <span className="text-sm font-medium">{holding.allocation.toFixed(1)}%</span>
                            </div>
                            <Progress value={holding.allocation} className="h-2" />
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatPrice(holding.value)}</div>
                            <div className="text-sm text-muted-foreground">{holding.amount.toFixed(4)} {holding.symbol}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      No holdings to display allocation
                    </div>
                  )}
              </DataCard>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Portfolio Value Chart */}
              <ChartCard title="Portfolio Value Over Time">
                  {performanceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={performanceData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--muted-foreground))"
                          opacity={0.3}
                        />
                        <XAxis
                          dataKey="date"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={11}
                          fontWeight={500}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={11}
                          fontWeight={500}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          tickFormatter={(value) => formatPrice(value)}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
                                  <p className="font-medium text-foreground">{label}</p>
                                  <p className="text-sm">
                                    <span className="text-muted-foreground">Value: </span>
                                    <span className="font-semibold text-primary">
                                      {formatPrice(payload[0].value)}
                                    </span>
                                  </p>
                                  {payload[1] && (
                                    <p className="text-sm">
                                      <span className="text-muted-foreground">P&L: </span>
                                      <span className={`font-semibold ${payload[1].value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {formatPrice(payload[1].value)}
                                      </span>
                                    </p>
                                  )}
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--chart-1))"
                          fill="url(#colorValue)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No performance data to display</p>
                      </div>
                    </div>
                  )}
              </ChartCard>

              {/* P&L Chart */}
              <ChartCard title="Profit & Loss Over Time">
                  {performanceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={performanceData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--muted-foreground))"
                          opacity={0.3}
                        />
                        <XAxis
                          dataKey="date"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={11}
                          fontWeight={500}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={11}
                          fontWeight={500}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          tickFormatter={(value) => formatPrice(value)}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const value = payload[0].value as number
                              return (
                                <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
                                  <p className="font-medium text-foreground">{label}</p>
                                  <p className="text-sm">
                                    <span className="text-muted-foreground">P&L: </span>
                                    <span className={`font-semibold ${value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                      {formatPrice(value)}
                                    </span>
                                  </p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="pnl"
                          stroke="hsl(var(--chart-2))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: "hsl(var(--chart-2))", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                      <div className="text-center">
                        <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No P&L data to display</p>
                      </div>
                    </div>
                  )}
              </ChartCard>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <DataCard title="Transaction History">
                <div className="text-center text-muted-foreground py-8">
                  Transaction history coming soon...
                </div>
            </DataCard>
          </TabsContent>
        </Tabs>
        </motion.div>
      </motion.div>
    </div>
  )
}
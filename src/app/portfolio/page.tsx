"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  PieChart,
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
  MoreHorizontal
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
        allocation: 0 // Will be calculated below
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

    } catch (err) {
      console.error('Error fetching portfolio data:', err)
      setError('Failed to fetch portfolio data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [user, profile])

  useEffect(() => {
    fetchPortfolioData()
  }, [fetchPortfolioData])

  // Delete holding function
  const handleDeleteHolding = async (holdingId: string, symbol: string) => {
    if (!portfolioId) return

    const confirmDelete = window.confirm(`Are you sure you want to remove ${symbol} from your portfolio?`)
    if (!confirmDelete) return

    try {
      const response = await fetch(`/api/portfolio/${portfolioId}/holdings/${holdingId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete holding')
      }

      toast.success(data.message || `${symbol} removed from portfolio`)
      fetchPortfolioData() // Refresh the portfolio
    } catch (error: any) {
      console.error('Delete holding error:', error)
      toast.error(error.message)
    }
  }

  // Table columns for holdings
  const columns: ColumnDef<PortfolioHolding>[] = [
    {
      id: "asset",
      header: "Asset",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
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
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight purple-gradient bg-clip-text text-transparent">
            Portfolio
          </h1>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="ai-card animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="ai-card max-w-md">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium mb-2">Error Loading Portfolio</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      className="flex-1 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight purple-gradient bg-clip-text text-transparent">
            My Portfolio
          </h1>
          <p className="text-muted-foreground">
            Track your cryptocurrency investments and performance
          </p>
        </div>
        {portfolioId && (
          <AddAssetModal portfolioId={portfolioId} onAssetAdded={fetchPortfolioData} />
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
          <Card className="ai-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {metrics.topGainer ? (
                <>
                  <div className="text-2xl font-bold">{metrics.topGainer.symbol}</div>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {formatPercentage(metrics.topGainer.pnlPercentage)}
                  </p>
                </>
              ) : (
                <div className="text-muted-foreground">No data</div>
              )}
            </CardContent>
          </Card>
          <Card className="ai-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Worst Performer</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              {metrics.topLoser ? (
                <>
                  <div className="text-2xl font-bold">{metrics.topLoser.symbol}</div>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {formatPercentage(metrics.topLoser.pnlPercentage)}
                  </p>
                </>
              ) : (
                <div className="text-muted-foreground">No data</div>
              )}
            </CardContent>
          </Card>
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
              <DataTable
                columns={columns}
                data={holdings}
                title="Portfolio Holdings"
                searchKey="name"
                searchPlaceholder="Search holdings..."
              />
            ) : (
              <Card className="ai-card">
                <CardContent className="p-12 text-center">
                  <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Holdings Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start building your portfolio by adding your first cryptocurrency holding.
                  </p>
                  {portfolioId && (
                    <AddAssetModal portfolioId={portfolioId} onAssetAdded={fetchPortfolioData}>
                      <Button className="purple-gradient">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Asset
                      </Button>
                    </AddAssetModal>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="allocation">
            <Card className="ai-card">
              <CardHeader>
                <CardTitle>Portfolio Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                {holdings.length > 0 ? (
                  <div className="space-y-4">
                    {holdings.map((holding) => (
                      <div key={holding.id} className="flex items-center space-x-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card className="ai-card">
              <CardHeader>
                <CardTitle>Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  Performance charts coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="ai-card">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  Transaction history coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
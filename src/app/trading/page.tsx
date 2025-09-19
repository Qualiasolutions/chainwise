"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { CryptoChart } from "@/components/ui/crypto-chart"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  DollarSign,
  Target,
  BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import { supabase } from "@/lib/supabase/client"
import { cryptoAPI, formatPrice, formatPercentage, generatePriceHistory } from "@/lib/crypto-api"
import { ColumnDef } from "@tanstack/react-table"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

interface TradeOrder {
  id: string
  symbol: string
  type: 'buy' | 'sell'
  order_type: 'market' | 'limit' | 'stop'
  amount: number
  price: number
  filled: number
  status: 'pending' | 'completed' | 'cancelled' | 'partial'
  created_at: string
  fee: number
}

// Trade form validation schema
const tradeFormSchema = z.object({
  symbol: z.string().min(1, "Please select a cryptocurrency"),
  type: z.enum(['buy', 'sell']),
  orderType: z.enum(['market', 'limit', 'stop']),
  amount: z.number().positive("Amount must be greater than 0"),
  price: z.number().positive("Price must be greater than 0").optional(),
})

type TradeFormValues = z.infer<typeof tradeFormSchema>

export default function TradingPage() {
  const { user, profile } = useSupabaseAuth()
  const [orders, setOrders] = useState<TradeOrder[]>([])
  const [selectedCrypto, setSelectedCrypto] = useState<any>(null)
  const [cryptoData, setCryptoData] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: {
      type: 'buy',
      orderType: 'market',
    }
  })

  // Fetch trading data
  useEffect(() => {
    const fetchTradingData = async () => {
      try {
        setLoading(true)

        // Fetch top cryptocurrencies
        const cryptos = await cryptoAPI.getTopCryptos(20)
        setCryptoData(cryptos)

        // Set default selected crypto
        if (cryptos.length > 0) {
          setSelectedCrypto(cryptos[0])
          form.setValue('symbol', cryptos[0].symbol.toUpperCase())

          // Generate chart data
          const priceHistory = generatePriceHistory(cryptos[0].current_price)
          setChartData(priceHistory)
        }

        // Fetch user's trading orders if authenticated
        if (user && profile) {
          // In a real app, we'd have a trading_orders table
          // For now, we'll use mock data structure
          setOrders([])
        }
      } catch (error) {
        console.error('Error fetching trading data:', error)
        toast.error('Failed to fetch trading data')
      } finally {
        setLoading(false)
      }
    }

    fetchTradingData()
  }, [user, profile, form])

  // Handle crypto selection change
  const handleCryptoChange = async (symbol: string) => {
    const crypto = cryptoData.find(c => c.symbol.toUpperCase() === symbol)
    if (crypto) {
      setSelectedCrypto(crypto)
      form.setValue('price', crypto.current_price)

      // Generate new chart data
      const priceHistory = generatePriceHistory(crypto.current_price)
      setChartData(priceHistory)
    }
  }

  // Handle trade form submission
  const onSubmit = async (values: TradeFormValues) => {
    if (!user || !profile) {
      toast.error('Please log in to place trades')
      return
    }

    try {
      setSubmitting(true)

      // In a real trading app, this would:
      // 1. Validate available balance
      // 2. Create order in trading_orders table
      // 3. Execute trade logic
      // 4. Update portfolio holdings

      // For now, we'll simulate the trade
      const newOrder: TradeOrder = {
        id: Date.now().toString(),
        symbol: values.symbol,
        type: values.type,
        order_type: values.orderType,
        amount: values.amount,
        price: values.price || selectedCrypto?.current_price || 0,
        filled: values.orderType === 'market' ? values.amount : 0,
        status: values.orderType === 'market' ? 'completed' : 'pending',
        created_at: new Date().toISOString(),
        fee: (values.amount * (values.price || selectedCrypto?.current_price || 0)) * 0.001 // 0.1% fee
      }

      setOrders(prev => [newOrder, ...prev])

      toast.success(
        `${values.type.toUpperCase()} order ${values.orderType === 'market' ? 'executed' : 'placed'} successfully!`
      )

      form.reset({
        type: values.type,
        orderType: 'market',
        symbol: values.symbol
      })

    } catch (error) {
      console.error('Error placing trade:', error)
      toast.error('Failed to place trade order')
    } finally {
      setSubmitting(false)
    }
  }

  // Table columns for orders
  const orderColumns: ColumnDef<TradeOrder>[] = [
    {
      id: "timestamp",
      header: "Time",
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.original.created_at).toLocaleString()}
        </div>
      )
    },
    {
      id: "symbol",
      header: "Asset",
      cell: ({ row }) => (
        <div className="font-medium uppercase">
          {row.original.symbol}
        </div>
      )
    },
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant={row.original.type === 'buy' ? 'default' : 'secondary'}>
          {row.original.type.toUpperCase()}
        </Badge>
      )
    },
    {
      id: "orderType",
      header: "Order",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.order_type.toUpperCase()}
        </Badge>
      )
    },
    {
      id: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div>{row.original.amount.toFixed(6)}</div>
      )
    },
    {
      id: "price",
      header: "Price",
      cell: ({ row }) => (
        <div>{formatPrice(row.original.price)}</div>
      )
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        const icons = {
          pending: Clock,
          completed: CheckCircle,
          cancelled: XCircle,
          partial: Pause
        }
        const colors = {
          pending: "text-yellow-500",
          completed: "text-green-500",
          cancelled: "text-red-500",
          partial: "text-blue-500"
        }
        const Icon = icons[status]

        return (
          <div className={cn("flex items-center space-x-1", colors[status])}>
            <Icon className="h-4 w-4" />
            <span className="capitalize">{status}</span>
          </div>
        )
      }
    },
    {
      id: "total",
      header: "Total",
      cell: ({ row }) => (
        <div className="text-right">
          <div>{formatPrice(row.original.amount * row.original.price)}</div>
          <div className="text-xs text-muted-foreground">
            Fee: {formatPrice(row.original.fee)}
          </div>
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight purple-gradient bg-clip-text text-transparent">
            Trading
          </h1>
        </div>
        <div className="animate-pulse">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="ai-card">
                <CardContent className="p-6">
                  <div className="h-96 bg-muted rounded"></div>
                </CardContent>
              </Card>
            </div>
            <Card className="ai-card">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-32 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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
            Spot Trading
          </h1>
          <p className="text-muted-foreground">
            Trade cryptocurrencies with advanced order types
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Market Open</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart and Order Book */}
        <motion.div
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Price Chart */}
          {selectedCrypto && chartData.length > 0 && (
            <Card className="ai-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedCrypto.image}
                      alt={selectedCrypto.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <CardTitle>{selectedCrypto.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold">
                          {formatPrice(selectedCrypto.current_price)}
                        </span>
                        <div className={cn(
                          "flex items-center space-x-1 text-sm font-medium",
                          selectedCrypto.price_change_percentage_24h >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        )}>
                          {selectedCrypto.price_change_percentage_24h >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span>
                            {formatPercentage(selectedCrypto.price_change_percentage_24h)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CryptoChart data={chartData} height={350} />
              </CardContent>
            </Card>
          )}

          {/* Order History */}
          <DataTable
            columns={orderColumns}
            data={orders}
            title="Order History"
            searchKey="symbol"
            searchPlaceholder="Search orders..."
          />
        </motion.div>

        {/* Trading Panel */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* Trade Form */}
          <Card className="ai-card">
            <CardHeader>
              <CardTitle>Place Order</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Asset Selection */}
                <div className="space-y-2">
                  <Label>Asset</Label>
                  <Select
                    value={form.watch('symbol')}
                    onValueChange={handleCryptoChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {cryptoData.map((crypto) => (
                        <SelectItem
                          key={crypto.id}
                          value={crypto.symbol.toUpperCase()}
                        >
                          <div className="flex items-center space-x-2">
                            <img
                              src={crypto.image}
                              alt={crypto.name}
                              className="w-4 h-4 rounded-full"
                            />
                            <span>{crypto.symbol.toUpperCase()}</span>
                            <span className="text-muted-foreground">
                              {crypto.name}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Order Type Tabs */}
                <Tabs
                  value={form.watch('type')}
                  onValueChange={(value) => form.setValue('type', value as 'buy' | 'sell')}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="buy" className="text-green-600 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900/20">
                      Buy
                    </TabsTrigger>
                    <TabsTrigger value="sell" className="text-red-600 data-[state=active]:bg-red-100 dark:data-[state=active]:bg-red-900/20">
                      Sell
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Order Type */}
                <div className="space-y-2">
                  <Label>Order Type</Label>
                  <Select
                    value={form.watch('orderType')}
                    onValueChange={(value) => form.setValue('orderType', value as 'market' | 'limit' | 'stop')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market">Market</SelectItem>
                      <SelectItem value="limit">Limit</SelectItem>
                      <SelectItem value="stop">Stop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price (for limit orders) */}
                {form.watch('orderType') !== 'market' && (
                  <div className="space-y-2">
                    <Label>Price (USD)</Label>
                    <Input
                      type="number"
                      step="0.000001"
                      placeholder="0.000000"
                      {...form.register('price', { valueAsNumber: true })}
                    />
                  </div>
                )}

                {/* Amount */}
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    placeholder="0.000000"
                    {...form.register('amount', { valueAsNumber: true })}
                  />
                </div>

                {/* Total */}
                {form.watch('amount') && (
                  <div className="space-y-2">
                    <Label>Total (USD)</Label>
                    <div className="text-lg font-semibold">
                      {formatPrice(
                        (form.watch('amount') || 0) *
                        (form.watch('price') || selectedCrypto?.current_price || 0)
                      )}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitting}
                  className={cn(
                    "w-full",
                    form.watch('type') === 'buy'
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  )}
                >
                  {submitting ? (
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                  )}
                  {form.watch('type') === 'buy' ? 'Buy' : 'Sell'} {form.watch('symbol')}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Market Stats */}
          {selectedCrypto && (
            <Card className="ai-card">
              <CardHeader>
                <CardTitle>Market Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24h High</span>
                  <span className="font-medium">{formatPrice(selectedCrypto.high_24h)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24h Low</span>
                  <span className="font-medium">{formatPrice(selectedCrypto.low_24h)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24h Volume</span>
                  <span className="font-medium">{formatPrice(selectedCrypto.total_volume)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Market Cap</span>
                  <span className="font-medium">{formatPrice(selectedCrypto.market_cap)}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
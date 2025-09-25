'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import {
  Activity,
  TrendingUp,
  Wallet,
  Plus,
  X,
  Search,
  AlertTriangle,
  DollarSign,
  Clock,
  Users,
  Zap
} from 'lucide-react'

interface WhaleWallet {
  wallet_address: string
  wallet_label: string
  total_usd_value: number
  last_activity_at: string
}

interface WhaleTransaction {
  transaction_hash: string
  transaction_type: string
  token_symbol: string
  amount: number
  usd_value: number
  exchange: string
  timestamp: string
}

interface WhaleReport {
  whale_wallets: Array<{
    wallet_address: string
    wallet_label: string
    balance_btc: number
    balance_eth: number
    total_usd_value: number
    recent_transactions: WhaleTransaction[]
  }>
  summary: {
    total_transactions: number
    total_volume_usd: number
    time_period: string
    report_type: string
    generated_at: string
  }
  metadata: {
    reportId: string
    creditsUsed: number
    walletCount: number
    timePeriod: string
    reportType: string
  }
}

export default function WhaleTrackerPage() {
  const { user, loading } = useSupabaseAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [isGenerating, setIsGenerating] = useState(false)
  const [walletAddresses, setWalletAddresses] = useState<string[]>([''])
  const [timePeriod, setTimePeriod] = useState<'1h' | '24h' | '7d' | '30d'>('24h')
  const [reportType, setReportType] = useState<'standard' | 'detailed'>('standard')
  const [currentReport, setCurrentReport] = useState<WhaleReport | null>(null)
  const [previousReports, setPreviousReports] = useState<any[]>([])
  const [popularWhales, setPopularWhales] = useState<WhaleWallet[]>([])
  const [userCredits, setUserCredits] = useState(0)
  const [userTier, setUserTier] = useState('')

  const creditCost = reportType === 'detailed' ? 10 : 5

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
      return
    }

    if (user) {
      fetchUserData()
    }
  }, [user, loading, router])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/tools/whale-tracker')
      if (!response.ok) throw new Error('Failed to fetch data')

      const data = await response.json()
      if (data.success) {
        setPreviousReports(data.reports || [])
        setPopularWhales(data.popularWhales || [])
        setUserCredits(data.creditsRemaining || 0)
        setUserTier(data.userTier || 'free')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const addWalletAddress = () => {
    setWalletAddresses([...walletAddresses, ''])
  }

  const removeWalletAddress = (index: number) => {
    const newAddresses = walletAddresses.filter((_, i) => i !== index)
    setWalletAddresses(newAddresses.length > 0 ? newAddresses : [''])
  }

  const updateWalletAddress = (index: number, value: string) => {
    const newAddresses = [...walletAddresses]
    newAddresses[index] = value
    setWalletAddresses(newAddresses)
  }

  const addPopularWhale = (whale: WhaleWallet) => {
    if (!walletAddresses.includes(whale.wallet_address)) {
      const newAddresses = walletAddresses[0] === ''
        ? [whale.wallet_address]
        : [...walletAddresses, whale.wallet_address]
      setWalletAddresses(newAddresses)
    }
  }

  const generateReport = async () => {
    if (userCredits < creditCost) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${creditCost} credits for this ${reportType} report.`,
        variant: "destructive"
      })
      return
    }

    const validAddresses = walletAddresses.filter(addr => addr.trim() !== '')

    if (validAddresses.length === 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter at least one wallet address.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch('/api/tools/whale-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddresses: validAddresses,
          timePeriod,
          reportType
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate report')
      }

      if (data.success) {
        setCurrentReport(data.report)
        setUserCredits(data.creditsRemaining)
        toast({
          title: "Report Generated",
          description: `Whale tracker report created successfully. ${data.creditsUsed} credits used.`
        })
        fetchUserData() // Refresh reports list
      }
    } catch (error: any) {
      console.error('Error generating report:', error)
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate whale tracker report.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: amount > 1000000 ? 'compact' : 'standard',
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: num > 1000 ? 'compact' : 'standard',
      maximumFractionDigits: 8
    }).format(num)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Whale Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track whale wallets and their trading activities
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <Badge variant="secondary" className="gap-1">
            <Zap className="w-3 h-3" />
            {userCredits} Credits
          </Badge>
          <Badge variant="outline" className="capitalize">
            {userTier} Tier
          </Badge>
        </div>
      </motion.div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Configure Whale Tracker
              </CardTitle>
              <CardDescription>
                Enter wallet addresses to track whale activities and transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Wallet Addresses */}
              <div className="space-y-3">
                <Label>Wallet Addresses</Label>
                {walletAddresses.map((address, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Enter Bitcoin or Ethereum wallet address..."
                      value={address}
                      onChange={(e) => updateWalletAddress(index, e.target.value)}
                      className="flex-1"
                    />
                    {walletAddresses.length > 1 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeWalletAddress(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addWalletAddress}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Wallet
                </Button>
              </div>

              {/* Time Period and Report Type */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Time Period</Label>
                  <Select value={timePeriod} onValueChange={setTimePeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">Last Hour</SelectItem>
                      <SelectItem value="24h">Last 24 Hours</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (5 credits)</SelectItem>
                      <SelectItem value="detailed">Detailed (10 credits)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {userCredits < creditCost && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You need {creditCost} credits for this {reportType} report. You currently have {userCredits} credits.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={generateReport}
                disabled={isGenerating || userCredits < creditCost}
                size="lg"
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 mr-2" />
                    Generate Whale Report ({creditCost} credits)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Popular Whales */}
          {popularWhales.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Popular Whale Wallets
                </CardTitle>
                <CardDescription>
                  Click to add these well-known whale wallets to your tracker
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {popularWhales.map((whale) => (
                    <motion.div
                      key={whale.wallet_address}
                      whileHover={{ scale: 1.02 }}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => addPopularWhale(whale)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{whale.wallet_label}</p>
                          <p className="text-xs text-gray-500 font-mono">
                            {whale.wallet_address.slice(0, 10)}...{whale.wallet_address.slice(-8)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600">
                            {formatCurrency(whale.total_usd_value)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {whale.last_activity_at ? new Date(whale.last_activity_at).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results">
          {currentReport ? (
            <div className="space-y-6">
              {/* Report Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Report Summary
                  </CardTitle>
                  <CardDescription>
                    Generated on {new Date(currentReport.summary.generated_at).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {currentReport.metadata.walletCount}
                      </p>
                      <p className="text-sm text-gray-600">Wallets Tracked</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {currentReport.summary.total_transactions}
                      </p>
                      <p className="text-sm text-gray-600">Transactions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(currentReport.summary.total_volume_usd)}
                      </p>
                      <p className="text-sm text-gray-600">Total Volume</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {currentReport.metadata.creditsUsed}
                      </p>
                      <p className="text-sm text-gray-600">Credits Used</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Whale Wallets Details */}
              <div className="space-y-4">
                {currentReport.whale_wallets.map((wallet, index) => (
                  <Card key={wallet.wallet_address}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wallet className="w-5 h-5" />
                        {wallet.wallet_label}
                      </CardTitle>
                      <CardDescription className="font-mono">
                        {wallet.wallet_address}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">BTC Balance</p>
                          <p className="font-semibold">{formatNumber(wallet.balance_btc)} BTC</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">ETH Balance</p>
                          <p className="font-semibold">{formatNumber(wallet.balance_eth)} ETH</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Value</p>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(wallet.total_usd_value)}
                          </p>
                        </div>
                      </div>

                      {wallet.recent_transactions && wallet.recent_transactions.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Recent Transactions
                          </h4>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {wallet.recent_transactions.map((tx, txIndex) => (
                              <div
                                key={tx.transaction_hash}
                                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    {tx.transaction_type.toUpperCase()} {formatNumber(tx.amount)} {tx.token_symbol}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {tx.exchange && `via ${tx.exchange}`} • {new Date(tx.timestamp).toLocaleString()}
                                  </p>
                                </div>
                                <p className="text-sm font-semibold text-green-600">
                                  {formatCurrency(tx.usd_value)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No Report Generated Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Go to the Generate Report tab to create your first whale tracker report.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          {previousReports.length > 0 ? (
            <div className="space-y-4">
              {previousReports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {report.report_type} Report ({report.time_period})
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(report.created_at).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {report.whale_wallets.length} wallets • {report.credits_used} credits
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentReport(report.report_data)}
                      >
                        View Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No Previous Reports
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your whale tracker report history will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
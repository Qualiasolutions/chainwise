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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { RequireFeature } from '@/components/auth/RequireFeature'
import {
  Copy,
  TrendingUp,
  TrendingDown,
  Wallet,
  Eye,
  Target,
  DollarSign,
  Clock,
  Users,
  Zap,
  Star,
  Trophy,
  Activity,
  BarChart3,
  Crown,
  AlertTriangle,
  Search,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Loader2
} from 'lucide-react'
import { formatPrice, formatPercentage, formatMarketCap } from "@/lib/crypto-api"

// Interfaces
interface WhaleAnalytic {
  whale_address: string
  whale_name: string
  blockchain: string
  total_balance_usd: number
  success_rate: number
  avg_roi: number
  influence_score: number
  copy_worthiness: number
  specialty_tokens: string[]
  last_significant_move: string
}

interface WhaleMovement {
  id: string
  whale_address: string
  whale_tag: string
  blockchain: string
  movement_type: string
  cryptocurrency: string
  symbol: string
  amount_usd: number
  price_at_movement: number
  movement_significance: number
  detected_at: string
}

interface WhaleCopySignal {
  id: string
  whale_address: string
  signal_type: string
  cryptocurrency: string
  symbol: string
  signal_strength: string
  whale_action: string
  copy_recommendation: string
  entry_price: number
  suggested_amount_usd: number
  confidence_score: number
  whale_track_record: any
  signal_reasoning: string
  expires_at: string
  created_at: string
  status: string
}

interface CopyStrategy {
  id: string
  strategy_name: string
  description: string
  success_rate: number
  avg_roi: number
  risk_level: string
  min_whale_balance: number
}

interface WhaleCopyResponse {
  signal: {
    signalId: string
    signalData: any
    whaleData: any
    creditsUsed: number
    generatedAt: string
    userTier: string
    metadata: any
  }
  creditsRemaining: number
  creditsUsed: number
}

export default function WhaleCopyPage() {
  const { user, loading } = useSupabaseAuth()
  const router = useRouter()
  const { toast } = useToast()

  // State management
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [whaleAddress, setWhaleAddress] = useState('')
  const [cryptocurrency, setCryptocurrency] = useState('bitcoin')
  const [currentSignal, setCurrentSignal] = useState<WhaleCopyResponse | null>(null)

  // Data states
  const [topWhales, setTopWhales] = useState<WhaleAnalytic[]>([])
  const [recentMovements, setRecentMovements] = useState<WhaleMovement[]>([])
  const [userSignals, setUserSignals] = useState<WhaleCopySignal[]>([])
  const [strategies, setStrategies] = useState<CopyStrategy[]>([])

  // User states
  const [userCredits, setUserCredits] = useState(0)
  const [userTier, setUserTier] = useState('')
  const [selectedWhale, setSelectedWhale] = useState<WhaleAnalytic | null>(null)

  const creditCost = 25 // Elite tier whale copy signal cost

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
      return
    }

    if (user) {
      fetchData()
    }
  }, [user, loading, router])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/tools/whale-copy')

      if (!response.ok) {
        throw new Error('Failed to fetch whale copy data')
      }

      const data = await response.json()

      if (data.success) {
        setTopWhales(data.topWhales || [])
        setRecentMovements(data.recentMovements || [])
        setUserSignals(data.userSignals || [])
        setStrategies(data.strategies || [])
        setUserCredits(data.creditsRemaining || 0)
        setUserTier(data.userTier || 'free')
      }
    } catch (error) {
      console.error('Error fetching whale copy data:', error)
      toast({
        title: "Error",
        description: "Failed to load whale copy data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateWhaleCopySignal = async () => {
    if (!whaleAddress.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a whale address to generate signals.",
        variant: "destructive"
      })
      return
    }

    // Validate whale address format
    const isValidAddress = whaleAddress.match(/^0x[a-fA-F0-9]{40}$/) || whaleAddress.match(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/)
    if (!isValidAddress) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Bitcoin or Ethereum wallet address.",
        variant: "destructive"
      })
      return
    }

    if (userTier !== 'elite') {
      toast({
        title: "Elite Tier Required",
        description: "Whale copy signals require Elite tier subscription.",
        variant: "destructive"
      })
      return
    }

    if (userCredits < creditCost) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${creditCost} credits to generate whale copy signals. You have ${userCredits} credits.`,
        variant: "destructive"
      })
      return
    }

    try {
      setIsGenerating(true)

      const response = await fetch('/api/tools/whale-copy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          whaleAddress: whaleAddress.trim(),
          cryptocurrency
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate whale copy signal')
      }

      if (data.success) {
        setCurrentSignal(data)
        setUserCredits(data.creditsRemaining)

        toast({
          title: "Signal Generated! 🐋",
          description: `Whale copy signal generated successfully. ${data.creditsUsed} credits used.`
        })

        // Refresh user signals
        await fetchData()
      }
    } catch (error: any) {
      console.error('Error generating whale copy signal:', error)
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate whale copy signal. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const selectWhaleFromList = (whale: WhaleAnalytic) => {
    setWhaleAddress(whale.whale_address)
    setSelectedWhale(whale)

    // Auto-select the whale's specialty cryptocurrency
    if (whale.specialty_tokens && whale.specialty_tokens.length > 0) {
      const primaryToken = whale.specialty_tokens[0].toLowerCase()
      if (['bitcoin', 'ethereum', 'solana'].includes(primaryToken)) {
        setCryptocurrency(primaryToken)
      }
    }
  }

  const getSignalStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'text-green-500'
      case 'moderate': return 'text-yellow-500'
      case 'weak': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <RequireFeature feature="whale_copy">
      <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Crown className="h-8 w-8 text-purple-500" />
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            Elite Tier Required
          </Badge>
        </div>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Whale Copy Signals
        </h1>

        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Follow the smartest money in crypto. Get AI-powered signals when elite whales make significant moves,
          with detailed analysis and copy recommendations.
        </p>

        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span>{creditCost} Credits per Signal</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Elite Tier Access</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>25+ Credits Remaining: {userCredits}</span>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Generate Signal
          </TabsTrigger>
          <TabsTrigger value="top-whales" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Top Whales
          </TabsTrigger>
          <TabsTrigger value="my-signals" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            My Signals
          </TabsTrigger>
          <TabsTrigger value="strategies" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Strategies
          </TabsTrigger>
        </TabsList>

        {/* Generate Signal Tab */}
        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Signal Generation Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Copy className="h-5 w-5" />
                  Generate Whale Copy Signal
                </CardTitle>
                <CardDescription>
                  Enter a whale address to analyze their recent activity and generate copy signals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="whale-address">Whale Address</Label>
                  <Input
                    id="whale-address"
                    placeholder="0x... or 1..."
                    value={whaleAddress}
                    onChange={(e) => setWhaleAddress(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cryptocurrency">Cryptocurrency</Label>
                  <Select value={cryptocurrency} onValueChange={setCryptocurrency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cryptocurrency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                      <SelectItem value="solana">Solana (SOL)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedWhale && (
                  <Alert>
                    <Star className="h-4 w-4" />
                    <AlertDescription>
                      Selected whale: <strong>{selectedWhale.whale_name}</strong> with {selectedWhale.success_rate}% success rate
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={generateWhaleCopySignal}
                  disabled={isGenerating || userTier !== 'elite' || userCredits < creditCost}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating Signal...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Signal ({creditCost} Credits)
                    </>
                  )}
                </Button>

                {userTier !== 'elite' && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Elite tier subscription required for whale copy signals.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Current Signal Display */}
            {currentSignal && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Generated Signal
                  </CardTitle>
                  <CardDescription>
                    Latest whale copy signal with recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Signal Type</p>
                      <Badge variant="outline" className="capitalize">
                        {currentSignal.signal.signalData.signal_type}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Confidence</p>
                      <div className="flex items-center gap-2">
                        <Progress value={currentSignal.signal.signalData.confidence_score} className="flex-1" />
                        <span className="text-sm">{currentSignal.signal.signalData.confidence_score}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Entry Price</p>
                      <p className="font-mono">${formatPrice(currentSignal.signal.signalData.entry_price)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Suggested Amount</p>
                      <p className="font-mono">${formatPrice(currentSignal.signal.signalData.suggested_amount)}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Whale Information</p>
                    <div className="space-y-1">
                      <p className="font-semibold">{currentSignal.signal.whaleData.whale_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Success Rate: {currentSignal.signal.whaleData.success_rate}% •
                        Portfolio Value: ${formatMarketCap(currentSignal.signal.whaleData.portfolio_value)} •
                        Copy Worthiness: {currentSignal.signal.whaleData.copy_worthiness}/100
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Movements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Whale Movements
              </CardTitle>
              <CardDescription>
                Latest significant whale activities across all tracked wallets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {recentMovements.map((movement, index) => (
                    <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          movement.movement_type === 'buy' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {movement.movement_type === 'buy' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-semibold">{movement.whale_tag}</p>
                          <p className="text-sm text-muted-foreground">
                            {movement.movement_type} {movement.symbol} • ${formatMarketCap(movement.amount_usd)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">
                          {movement.movement_significance}% impact
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(movement.detected_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Whales Tab */}
        <TabsContent value="top-whales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Top Performing Whales
              </CardTitle>
              <CardDescription>
                Elite whale wallets ranked by performance and copy-worthiness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topWhales.map((whale, index) => (
                  <Card key={whale.whale_address} className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => selectWhaleFromList(whale)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{whale.whale_name}</CardTitle>
                        <Badge variant="secondary">#{index + 1}</Badge>
                      </div>
                      <CardDescription className="font-mono text-xs">
                        {whale.whale_address.substring(0, 6)}...{whale.whale_address.substring(-4)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Success Rate</p>
                          <p className="font-semibold text-green-600">{whale.success_rate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg ROI</p>
                          <p className="font-semibold">{whale.avg_roi}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Portfolio</p>
                          <p className="font-semibold">${formatMarketCap(whale.total_balance_usd)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Copy Score</p>
                          <p className="font-semibold">{whale.copy_worthiness}/100</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Specialties</p>
                        <div className="flex flex-wrap gap-1">
                          {whale.specialty_tokens.map((token, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {token.toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button size="sm" className="w-full" onClick={(e) => {
                        e.stopPropagation()
                        selectWhaleFromList(whale)
                      }}>
                        <Copy className="h-3 w-3 mr-1" />
                        Select for Copy
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Signals Tab */}
        <TabsContent value="my-signals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                My Whale Copy Signals
              </CardTitle>
              <CardDescription>
                Your active whale copy signals and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userSignals.length === 0 ? (
                <div className="text-center py-8">
                  <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No active whale copy signals yet.</p>
                  <p className="text-sm text-muted-foreground">Generate your first signal to start following whales!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userSignals.map((signal) => (
                    <Card key={signal.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {signal.signal_type}
                            </Badge>
                            <Badge className={getSignalStrengthColor(signal.signal_strength)}>
                              {signal.signal_strength}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Confidence</p>
                            <p className="font-semibold">{signal.confidence_score}%</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Cryptocurrency</p>
                            <p className="font-semibold">{signal.symbol}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Entry Price</p>
                            <p className="font-mono">${formatPrice(signal.entry_price)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Suggested Amount</p>
                            <p className="font-mono">${formatPrice(signal.suggested_amount_usd)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Expires</p>
                            <p className="text-xs">{new Date(signal.expires_at).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <Separator className="my-3" />

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Signal Reasoning</p>
                          <p className="text-sm text-muted-foreground">{signal.signal_reasoning}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strategies Tab */}
        <TabsContent value="strategies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Whale Copy Strategies
              </CardTitle>
              <CardDescription>
                Available strategies for whale copy signal generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {strategies.map((strategy) => (
                  <Card key={strategy.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{strategy.strategy_name}</CardTitle>
                      <CardDescription>{strategy.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Success Rate</p>
                          <p className="font-semibold text-green-600">{strategy.success_rate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg ROI</p>
                          <p className="font-semibold">{strategy.avg_roi}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Risk Level</p>
                          <Badge className={getRiskLevelColor(strategy.risk_level)}>
                            {strategy.risk_level}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Minimum Whale Balance</p>
                        <p className="font-mono text-sm">${formatMarketCap(strategy.min_whale_balance)}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </RequireFeature>
  )
}
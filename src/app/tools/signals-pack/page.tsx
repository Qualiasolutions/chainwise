"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  Signal,
  Zap,
  Target,
  DollarSign,
  Clock,
  Users,
  BarChart3,
  Trophy,
  Star,
  Eye,
  Calendar,
  ArrowUp,
  ArrowDown,
  Loader2,
  RefreshCw,
  Activity,
  PieChart,
  Briefcase
} from "lucide-react"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import { formatPrice, formatPercentage, formatMarketCap } from "@/lib/crypto-api"
import { RequireFeature } from '@/components/auth/RequireFeature'

interface SignalPackRequest {
  packType: 'daily' | 'weekly' | 'flash' | 'premium'
  marketTheme?: 'bullish' | 'bearish' | 'neutral' | 'volatility'
}

interface TradingSignal {
  id: string
  signal_type: string
  cryptocurrency: string
  symbol: string
  signal_strength: 'weak' | 'moderate' | 'strong'
  entry_price: number
  target_price: number
  stop_loss: number
  timeframe: string
  confidence_score: number
  risk_reward_ratio: number
  signal_description: string
  signal_reasoning: string
  expires_at: string
  created_at: string
  status: string
}

interface SignalPack {
  id: string
  pack_name: string
  pack_type: string
  description: string
  total_signals: number
  pack_price_credits: number
  tier_requirement: string
  market_theme: string
  success_rate_target: number
  risk_profile: string
  created_at: string
  valid_until: string
}

interface UserSignalData {
  userPacks: Array<{
    id: string
    access_granted_at: string
    credits_used: number
    signal_pack: SignalPack
  }>
  availablePacks: SignalPack[]
  subscriptions: Array<{
    id: string
    subscription_type: string
    is_active: boolean
    auto_renewal: boolean
    total_packs_received: number
  }>
  recentSignals: TradingSignal[]
  templates: Array<{
    signal_type: string
    template_name: string
    description: string
    success_rate: number
    risk_level: string
    target_audience: string
  }>
  userTier: string
  creditsRemaining: number
  creditCosts: {
    daily: number
    weekly: number
    flash: number
    premium: number
  }
}

const signalTypeColors = {
  buy: "bg-green-500 text-white",
  sell: "bg-red-500 text-white",
  hold: "bg-yellow-500 text-black",
  entry: "bg-blue-500 text-white",
  exit: "bg-purple-500 text-white"
}

const signalStrengthColors = {
  weak: "bg-gray-400 text-white",
  moderate: "bg-orange-500 text-white",
  strong: "bg-green-600 text-white"
}

const riskProfileColors = {
  conservative: "bg-blue-500 text-white",
  balanced: "bg-purple-500 text-white",
  aggressive: "bg-red-500 text-white"
}

const marketThemeColors = {
  bullish: "bg-green-500 text-white",
  bearish: "bg-red-500 text-white",
  neutral: "bg-gray-500 text-white",
  volatility: "bg-orange-500 text-white"
}

export default function SignalsPackPage() {
  const { user } = useSupabaseAuth()
  const [userData, setUserData] = useState<UserSignalData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedPack, setSelectedPack] = useState<any>(null)
  const [generationForm, setGenerationForm] = useState<SignalPackRequest>({
    packType: 'daily',
    marketTheme: 'neutral'
  })

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/tools/signals-pack')
      if (!response.ok) throw new Error('Failed to fetch data')

      const data = await response.json()
      setUserData(data)
    } catch (error) {
      console.error('Error fetching signals data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGeneratePack = async () => {
    try {
      setIsGenerating(true)
      const response = await fetch('/api/tools/signals-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generationForm)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate signal pack')
      }

      // Refresh data and show results
      await fetchUserData()
      setSelectedPack(result.pack)

    } catch (error: any) {
      console.error('Pack generation error:', error)
      alert(error.message || 'Failed to generate signal pack')
    } finally {
      setIsGenerating(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please sign in to access ChainWise Signals Pack.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading signals...</span>
        </div>
      </div>
    )
  }

  return (
    <RequireFeature feature="signals_pack">
      <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Signal className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-600 bg-clip-text text-transparent">
                ChainWise Signals Pack
              </h1>
              <p className="text-xl text-muted-foreground">
                AI-powered trading signals for maximum profit potential 📈
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <span>Credits: <strong>{userData?.creditsRemaining}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-purple-500" />
              <span>Tier: <strong className="capitalize">{userData?.userTier}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span>Active Packs: <strong>{userData?.userPacks.length || 0}</strong></span>
            </div>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="generate">Generate Pack</TabsTrigger>
          <TabsTrigger value="active">Active Signals</TabsTrigger>
          <TabsTrigger value="history">Pack History</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Generate Pack Tab */}
        <TabsContent value="generate" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pack Generation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  <span>Generate Signal Pack</span>
                </CardTitle>
                <CardDescription>
                  Create AI-powered trading signals tailored to your strategy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Pack Type</label>
                  <Select
                    value={generationForm.packType}
                    onValueChange={(value: 'daily' | 'weekly' | 'flash' | 'premium') =>
                      setGenerationForm(prev => ({ ...prev, packType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">
                        Daily Signals ({userData?.creditCosts.daily} credits)
                      </SelectItem>
                      <SelectItem value="weekly">
                        Weekly Strategy ({userData?.creditCosts.weekly} credits)
                      </SelectItem>
                      <SelectItem
                        value="flash"
                        disabled={userData?.userTier !== 'elite'}
                      >
                        Flash Alerts ({userData?.creditCosts.flash} credits) - Elite Only
                      </SelectItem>
                      <SelectItem
                        value="premium"
                        disabled={userData?.userTier !== 'elite'}
                      >
                        Premium Pack ({userData?.creditCosts.premium} credits) - Elite Only
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Market Theme</label>
                  <Select
                    value={generationForm.marketTheme}
                    onValueChange={(value: 'bullish' | 'bearish' | 'neutral' | 'volatility') =>
                      setGenerationForm(prev => ({ ...prev, marketTheme: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bullish">🐂 Bullish Market</SelectItem>
                      <SelectItem value="bearish">🐻 Bearish Market</SelectItem>
                      <SelectItem value="neutral">⚖️ Neutral Market</SelectItem>
                      <SelectItem value="volatility">⚡ High Volatility</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-muted p-3 rounded-md text-sm">
                  <h4 className="font-semibold mb-2">Pack Details:</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Signals:</span>
                      <span>
                        {generationForm.packType === 'daily' ? '5 signals' :
                         generationForm.packType === 'weekly' ? '8 signals' :
                         generationForm.packType === 'flash' ? '3 signals' :
                         '10 signals'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost:</span>
                      <span>{userData?.creditCosts[generationForm.packType]} credits</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valid:</span>
                      <span>7 days</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleGeneratePack}
                  disabled={
                    isGenerating ||
                    (userData?.creditsRemaining || 0) < (userData?.creditCosts[generationForm.packType] || 0)
                  }
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Signals...
                    </>
                  ) : (
                    <>
                      <Signal className="mr-2 h-4 w-4" />
                      Generate Pack ({userData?.creditCosts[generationForm.packType]} credits)
                    </>
                  )}
                </Button>

                {userData?.userTier === 'free' && (
                  <p className="text-xs text-muted-foreground text-center">
                    Signal packs require Pro tier or higher
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Available Packs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5 text-green-500" />
                  <span>Available Packs</span>
                </CardTitle>
                <CardDescription>
                  Pre-generated signal packs ready for immediate access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {userData?.availablePacks.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No available packs at the moment
                      </p>
                    ) : (
                      userData?.availablePacks.map((pack) => (
                        <Card key={pack.id} className="border-muted">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-sm">{pack.pack_name}</h4>
                                <p className="text-xs text-muted-foreground">{pack.description}</p>
                              </div>
                              <div className="text-right">
                                <Badge className={marketThemeColors[pack.market_theme as keyof typeof marketThemeColors]}>
                                  {pack.market_theme}
                                </Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Signals:</span>
                                <p className="font-medium">{pack.total_signals}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Cost:</span>
                                <p className="font-medium">{pack.pack_price_credits} credits</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Success Rate:</span>
                                <p className="font-medium">{pack.success_rate_target}%</p>
                              </div>
                            </div>
                            <div className="mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                disabled={userData?.userTier === 'free'}
                              >
                                Access Pack
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Active Signals Tab */}
        <TabsContent value="active" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Active Trading Signals</h3>
              <p className="text-muted-foreground">Live signals from your purchased packs</p>
            </div>
            <Button variant="outline" onClick={fetchUserData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4">
            {userData?.recentSignals.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-muted-foreground">
                    No active signals. Generate a signal pack to get started!
                  </p>
                </CardContent>
              </Card>
            ) : (
              userData?.recentSignals.map((signal) => (
                <Card key={signal.id} className="border-muted">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                          {signal.symbol}
                        </div>
                        <div>
                          <h4 className="font-semibold">{signal.cryptocurrency.charAt(0).toUpperCase() + signal.cryptocurrency.slice(1)}</h4>
                          <p className="text-sm text-muted-foreground">{signal.signal_description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={signalTypeColors[signal.signal_type as keyof typeof signalTypeColors]}>
                            {signal.signal_type.toUpperCase()}
                          </Badge>
                          <Badge className={signalStrengthColors[signal.signal_strength as keyof typeof signalStrengthColors]}>
                            {signal.signal_strength}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Expires: {new Date(signal.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Entry Price</p>
                        <p className="font-semibold">{formatPrice(signal.entry_price)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Target</p>
                        <p className="font-semibold text-green-600">{formatPrice(signal.target_price)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Stop Loss</p>
                        <p className="font-semibold text-red-600">{formatPrice(signal.stop_loss)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">R/R Ratio</p>
                        <p className="font-semibold">{signal.risk_reward_ratio.toFixed(2)}:1</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Confidence</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={signal.confidence_score} className="flex-1" />
                          <span className="font-semibold">{signal.confidence_score}%</span>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-muted-foreground">Timeframe</p>
                        <p className="font-medium">{signal.timeframe}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Created</p>
                        <p className="font-medium">{new Date(signal.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {signal.signal_reasoning && (
                      <div className="mt-3 p-3 bg-muted rounded-md">
                        <p className="text-sm">{signal.signal_reasoning}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Pack History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Your Signal Pack History</h3>
              <p className="text-muted-foreground">Previously purchased signal packs</p>
            </div>
            <Button variant="outline" onClick={fetchUserData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4">
            {userData?.userPacks.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-muted-foreground">
                    No signal packs purchased yet. Generate your first pack!
                  </p>
                </CardContent>
              </Card>
            ) : (
              userData?.userPacks.map((userPack) => (
                <Card key={userPack.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">{userPack.signal_pack.pack_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Purchased {new Date(userPack.access_granted_at).toLocaleDateString()} •
                          {userPack.signal_pack.total_signals} signals •
                          {userPack.credits_used} credits used
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={riskProfileColors[userPack.signal_pack.risk_profile as keyof typeof riskProfileColors]}>
                          {userPack.signal_pack.risk_profile}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Pack Type</p>
                        <p className="font-medium capitalize">{userPack.signal_pack.pack_type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Market Theme</p>
                        <p className="font-medium capitalize">{userPack.signal_pack.market_theme}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Target Success</p>
                        <p className="font-medium">{userPack.signal_pack.success_rate_target}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valid Until</p>
                        <p className="font-medium">{new Date(userPack.signal_pack.valid_until).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-500" />
                <span>Signal Subscriptions</span>
              </CardTitle>
              <CardDescription>
                Manage your recurring signal pack subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userData?.subscriptions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No active subscriptions. Set up automated signal delivery!
                </p>
              ) : (
                <div className="space-y-4">
                  {userData?.subscriptions.map((sub) => (
                    <Card key={sub.id} className="border-muted">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold capitalize">{sub.subscription_type} Subscription</h4>
                            <p className="text-sm text-muted-foreground">
                              {sub.total_packs_received} packs received
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={sub.is_active ? "default" : "secondary"}>
                              {sub.is_active ? "Active" : "Inactive"}
                            </Badge>
                            {sub.auto_renewal && (
                              <Badge variant="outline">Auto-Renew</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-green-500" />
                <span>Signal Performance Analytics</span>
              </CardTitle>
              <CardDescription>
                Track the success rate and performance of your signals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Performance analytics will be available once you have active signals.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generated Pack Results Modal */}
      {selectedPack && (
        <Dialog open={!!selectedPack} onOpenChange={() => setSelectedPack(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Signal className="h-5 w-5 text-blue-500" />
                <span>Signal Pack Generated Successfully!</span>
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] mt-4">
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-500">{selectedPack.totalSignals}</p>
                        <p className="text-sm text-muted-foreground">Signals Generated</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-500">{selectedPack.creditsUsed}</p>
                        <p className="text-sm text-muted-foreground">Credits Used</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-500 capitalize">{selectedPack.packType}</p>
                        <p className="text-sm text-muted-foreground">Pack Type</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-orange-500 capitalize">{selectedPack.marketTheme}</p>
                        <p className="text-sm text-muted-foreground">Market Theme</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-center">
                  <p className="text-muted-foreground">
                    Your signal pack has been generated and is now available in the Active Signals tab.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
    </RequireFeature>
  )
}
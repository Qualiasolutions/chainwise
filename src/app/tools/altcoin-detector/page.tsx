"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  TrendingUp,
  Gem,
  AlertTriangle,
  Clock,
  DollarSign,
  Users,
  BarChart3,
  Target,
  Zap,
  Trophy,
  Star,
  Eye,
  Calendar,
  ArrowUp,
  ArrowDown,
  Loader2,
  RefreshCw
} from "lucide-react"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import { formatPrice, formatPercentage, formatMarketCap } from "@/lib/crypto-api"
import { RequireFeature } from '@/components/auth/RequireFeature'

interface AltcoinScanRequest {
  scanName: string
  criteriaConfig: {
    max_market_cap?: number
    min_volume_24h?: number
    min_holders?: number
    max_age_days?: number
    max_risk_score?: number
    min_gem_score?: number
    blockchain?: string[]
  }
}

interface DiscoveredToken {
  id: string
  symbol: string
  name: string
  contract_address: string
  blockchain: string
  market_cap: number
  price_usd: number
  volume_24h: number
  holders_count: number
  liquidity_usd: number
  age_days: number
  social_score: number
  risk_score: number
  gem_score: number
  price_change_24h: number
  volume_change_24h: number
  performance_score: number
  potential_rating: 'exceptional' | 'high' | 'good' | 'moderate' | 'speculative'
  risk_level: 'low' | 'medium' | 'high' | 'very_high'
  discovery_timestamp: string
}

interface AltcoinScan {
  scanId: string
  discoveredTokens: DiscoveredToken[]
  totalDiscovered: number
  creditsUsed: number
  generatedAt: string
  requestedBy: string
  criteriaConfig: any
  userTier: string
}

interface UserData {
  scans: Array<{
    id: string
    scan_name: string
    scan_criteria: any
    discovered_tokens: any
    total_discovered: number
    scan_summary: string
    credits_used: number
    created_at: string
  }>
  recentDiscoveries: DiscoveredToken[]
  criteria: Array<{
    criteria_name: string
    description: string
    criteria_config: any
    success_rate: number
  }>
  watchlist: Array<{
    id: string
    added_at: string
    notes: string
    target_price: number
    stop_loss: number
    altcoin: DiscoveredToken
  }>
  userTier: string
  creditsRemaining: number
  creditCost: number
}

const potentialRatingColors = {
  exceptional: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white",
  high: "bg-gradient-to-r from-green-400 to-blue-500 text-white",
  good: "bg-gradient-to-r from-blue-400 to-purple-500 text-white",
  moderate: "bg-gradient-to-r from-purple-400 to-pink-500 text-white",
  speculative: "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
}

const riskLevelColors = {
  low: "bg-green-500 text-white",
  medium: "bg-yellow-500 text-black",
  high: "bg-orange-500 text-white",
  very_high: "bg-red-500 text-white"
}

export default function AltcoinDetectorPage() {
  const { user } = useSupabaseAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [selectedScan, setSelectedScan] = useState<any>(null)
  const [scanForm, setScanForm] = useState<AltcoinScanRequest>({
    scanName: "",
    criteriaConfig: {
      max_market_cap: 10000000,
      min_volume_24h: 50000,
      min_holders: 100,
      max_age_days: 90,
      max_risk_score: 70,
      min_gem_score: 50,
      blockchain: ["ethereum"]
    }
  })

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/tools/altcoin-detector')
      if (!response.ok) throw new Error('Failed to fetch data')

      const data = await response.json()
      setUserData(data)
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleScanSubmit = async () => {
    if (!scanForm.scanName.trim()) return

    try {
      setIsScanning(true)
      const response = await fetch('/api/tools/altcoin-detector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanForm)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate scan')
      }

      // Refresh data and show results
      await fetchUserData()
      setSelectedScan(result.scan)

      // Reset form
      setScanForm({
        scanName: "",
        criteriaConfig: {
          max_market_cap: 10000000,
          min_volume_24h: 50000,
          min_holders: 100,
          max_age_days: 90,
          max_risk_score: 70,
          min_gem_score: 50,
          blockchain: ["ethereum"]
        }
      })
    } catch (error: any) {
      console.error('Scan generation error:', error)
      alert(error.message || 'Failed to generate altcoin scan')
    } finally {
      setIsScanning(false)
    }
  }

  const handleUseCriteria = (criteria: any) => {
    setScanForm({
      scanName: criteria.criteria_name,
      criteriaConfig: criteria.criteria_config
    })
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please sign in to access the Altcoin Early Detector.
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
          <span className="ml-2">Loading detector...</span>
        </div>
      </div>
    )
  }

  return (
    <RequireFeature feature="altcoin_detector">
      <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
              <Gem className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
                Altcoin Early Detector
              </h1>
              <p className="text-xl text-muted-foreground">
                Discover hidden gems before they moon 🚀
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span>Credits: <strong>{userData?.creditsRemaining}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Cost: <strong>{userData?.creditCost} credits</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-purple-500" />
              <span>Tier: <strong className="capitalize">{userData?.userTier}</strong></span>
            </div>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate">Generate Scan</TabsTrigger>
          <TabsTrigger value="discoveries">Recent Discoveries</TabsTrigger>
          <TabsTrigger value="history">Scan History</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
        </TabsList>

        {/* Generate Scan Tab */}
        <TabsContent value="generate" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Scan Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-emerald-500" />
                  <span>Detection Criteria</span>
                </CardTitle>
                <CardDescription>
                  Configure your altcoin discovery parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="scanName">Scan Name</Label>
                  <Input
                    id="scanName"
                    placeholder="e.g., Hidden Gems Hunt"
                    value={scanForm.scanName}
                    onChange={(e) => setScanForm(prev => ({ ...prev, scanName: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxMarketCap">Max Market Cap ($)</Label>
                    <Input
                      id="maxMarketCap"
                      type="number"
                      value={scanForm.criteriaConfig.max_market_cap}
                      onChange={(e) => setScanForm(prev => ({
                        ...prev,
                        criteriaConfig: { ...prev.criteriaConfig, max_market_cap: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minVolume">Min 24h Volume ($)</Label>
                    <Input
                      id="minVolume"
                      type="number"
                      value={scanForm.criteriaConfig.min_volume_24h}
                      onChange={(e) => setScanForm(prev => ({
                        ...prev,
                        criteriaConfig: { ...prev.criteriaConfig, min_volume_24h: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minHolders">Min Holders</Label>
                    <Input
                      id="minHolders"
                      type="number"
                      value={scanForm.criteriaConfig.min_holders}
                      onChange={(e) => setScanForm(prev => ({
                        ...prev,
                        criteriaConfig: { ...prev.criteriaConfig, min_holders: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxAge">Max Age (days)</Label>
                    <Input
                      id="maxAge"
                      type="number"
                      value={scanForm.criteriaConfig.max_age_days}
                      onChange={(e) => setScanForm(prev => ({
                        ...prev,
                        criteriaConfig: { ...prev.criteriaConfig, max_age_days: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxRisk">Max Risk Score</Label>
                    <Input
                      id="maxRisk"
                      type="number"
                      min="0"
                      max="100"
                      value={scanForm.criteriaConfig.max_risk_score}
                      onChange={(e) => setScanForm(prev => ({
                        ...prev,
                        criteriaConfig: { ...prev.criteriaConfig, max_risk_score: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minGem">Min Gem Score</Label>
                    <Input
                      id="minGem"
                      type="number"
                      min="0"
                      max="100"
                      value={scanForm.criteriaConfig.min_gem_score}
                      onChange={(e) => setScanForm(prev => ({
                        ...prev,
                        criteriaConfig: { ...prev.criteriaConfig, min_gem_score: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="blockchain">Blockchain</Label>
                  <Select
                    value={scanForm.criteriaConfig.blockchain?.[0] || "ethereum"}
                    onValueChange={(value) => setScanForm(prev => ({
                      ...prev,
                      criteriaConfig: { ...prev.criteriaConfig, blockchain: [value] }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ethereum">Ethereum</SelectItem>
                      <SelectItem value="bsc">Binance Smart Chain</SelectItem>
                      <SelectItem value="polygon">Polygon</SelectItem>
                      <SelectItem value="arbitrum">Arbitrum</SelectItem>
                      <SelectItem value="base">Base</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleScanSubmit}
                  disabled={isScanning || !scanForm.scanName.trim() || (userData?.creditsRemaining || 0) < (userData?.creditCost || 0)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scanning for Gems...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Start Gem Hunt ({userData?.creditCost} credits)
                    </>
                  )}
                </Button>

                {userData?.userTier === 'free' && (
                  <p className="text-xs text-muted-foreground">
                    Free tier: Limited to $1M market cap, 30 days age
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Detection Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Detection Templates</span>
                </CardTitle>
                <CardDescription>
                  Pre-built criteria from successful detection patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {userData?.criteria.map((template, index) => (
                      <Card key={index} className="border-muted">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm">{template.criteria_name}</h4>
                            <Badge variant="outline">
                              {template.success_rate}% success
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">
                            {template.description}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUseCriteria(template)}
                            className="w-full"
                          >
                            Use Template
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recent Discoveries Tab */}
        <TabsContent value="discoveries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span>Recently Discovered Gems</span>
              </CardTitle>
              <CardDescription>
                Latest altcoins discovered by our detection algorithms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {userData?.recentDiscoveries.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No recent discoveries available
                  </p>
                ) : (
                  userData?.recentDiscoveries.map((token) => (
                    <Card key={token.id} className="border-muted">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                              {token.symbol.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-semibold">{token.name}</h4>
                              <p className="text-sm text-muted-foreground">${token.symbol.toUpperCase()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatPrice(token.price_usd)}</p>
                            <div className="flex items-center space-x-2">
                              <Badge className={potentialRatingColors[token.potential_rating]}>
                                {token.potential_rating}
                              </Badge>
                              <Badge className={riskLevelColors[token.risk_level]}>
                                {token.risk_level} risk
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Market Cap</p>
                            <p className="font-medium">{formatMarketCap(token.market_cap)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Volume 24h</p>
                            <p className="font-medium">{formatMarketCap(token.volume_24h)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Gem Score</p>
                            <p className="font-medium flex items-center">
                              <Star className="h-3 w-3 text-yellow-500 mr-1" />
                              {token.gem_score}/100
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Age</p>
                            <p className="font-medium">{token.age_days} days</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scan History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Your Scan History</h3>
              <p className="text-muted-foreground">Previous altcoin detection scans</p>
            </div>
            <Button variant="outline" onClick={fetchUserData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4">
            {userData?.scans.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-muted-foreground">
                    No scans yet. Generate your first altcoin detection scan!
                  </p>
                </CardContent>
              </Card>
            ) : (
              userData?.scans.map((scan) => (
                <Card key={scan.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">{scan.scan_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(scan.created_at).toLocaleDateString()} •
                          Found {scan.total_discovered} tokens •
                          {scan.credits_used} credits used
                        </p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Results
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>{scan.scan_name} - Results</DialogTitle>
                          </DialogHeader>
                          <ScrollArea className="mt-4 max-h-[60vh]">
                            <div className="space-y-4">
                              <p className="text-sm text-muted-foreground">{scan.scan_summary}</p>
                              <div className="grid gap-3">
                                {Array.isArray(scan.discovered_tokens) && scan.discovered_tokens.map((token: DiscoveredToken, index: number) => (
                                  <Card key={index} className="border-muted">
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                                            {token.symbol.substring(0, 2).toUpperCase()}
                                          </div>
                                          <div>
                                            <h5 className="font-semibold">{token.name}</h5>
                                            <p className="text-sm text-muted-foreground">${token.symbol.toUpperCase()}</p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-semibold">{formatPrice(token.price_usd)}</p>
                                          <div className="flex items-center space-x-1">
                                            <Badge className={potentialRatingColors[token.potential_rating]} variant="secondary">
                                              {token.potential_rating}
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <p className="text-sm text-muted-foreground">{scan.scan_summary}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Watchlist Tab */}
        <TabsContent value="watchlist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-blue-500" />
                <span>Your Watchlist</span>
              </CardTitle>
              <CardDescription>
                Tokens you're tracking for potential entry points
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userData?.watchlist.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Your watchlist is empty. Add discovered gems to track them!
                </p>
              ) : (
                <div className="grid gap-4">
                  {userData?.watchlist.map((item) => (
                    <Card key={item.id} className="border-muted">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                              {item.altcoin.symbol.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-semibold">{item.altcoin.name}</h4>
                              <p className="text-sm text-muted-foreground">${item.altcoin.symbol.toUpperCase()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatPrice(item.altcoin.price_usd)}</p>
                            {item.target_price && (
                              <p className="text-xs text-muted-foreground">
                                Target: {formatPrice(item.target_price)}
                              </p>
                            )}
                          </div>
                        </div>
                        {item.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{item.notes}</p>
                        )}
                        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                          <span>Added {new Date(item.added_at).toLocaleDateString()}</span>
                          <div className="flex items-center space-x-2">
                            <Badge className={potentialRatingColors[item.altcoin.potential_rating]}>
                              {item.altcoin.potential_rating}
                            </Badge>
                            <Badge className={riskLevelColors[item.altcoin.risk_level]}>
                              {item.altcoin.risk_level}
                            </Badge>
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
      </Tabs>

      {/* Scan Results Modal */}
      {selectedScan && (
        <Dialog open={!!selectedScan} onOpenChange={() => setSelectedScan(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Gem className="h-5 w-5 text-emerald-500" />
                <span>Scan Results: {selectedScan.metadata?.scanName}</span>
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] mt-4">
              <div className="space-y-6">
                {/* Scan Summary */}
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-emerald-500">{selectedScan.totalDiscovered}</p>
                        <p className="text-sm text-muted-foreground">Gems Found</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-500">{selectedScan.creditsUsed}</p>
                        <p className="text-sm text-muted-foreground">Credits Used</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-500">{selectedScan.metadata?.userTier}</p>
                        <p className="text-sm text-muted-foreground">Tier Level</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-orange-500">
                          {new Date(selectedScan.generatedAt).toLocaleTimeString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Generated</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Discovered Tokens */}
                <div className="grid gap-3">
                  {selectedScan.discoveredTokens?.map((token: DiscoveredToken, index: number) => (
                    <Card key={index} className="border-muted">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                              {token.symbol.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-semibold">{token.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                ${token.symbol.toUpperCase()} • {token.blockchain.charAt(0).toUpperCase() + token.blockchain.slice(1)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">{formatPrice(token.price_usd)}</p>
                            <div className="flex items-center space-x-2">
                              <Badge className={potentialRatingColors[token.potential_rating]}>
                                {token.potential_rating}
                              </Badge>
                              <Badge className={riskLevelColors[token.risk_level]}>
                                {token.risk_level}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Market Cap</p>
                            <p className="font-medium">{formatMarketCap(token.market_cap)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">24h Volume</p>
                            <p className="font-medium">{formatMarketCap(token.volume_24h)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Holders</p>
                            <p className="font-medium">{token.holders_count?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Age</p>
                            <p className="font-medium">{token.age_days} days</p>
                          </div>
                        </div>

                        <Separator className="my-3" />

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Gem Score</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Progress value={token.gem_score} className="flex-1" />
                              <span className="font-medium">{token.gem_score}/100</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Risk Score</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Progress value={token.risk_score} className="flex-1" />
                              <span className="font-medium">{token.risk_score}/100</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Social Score</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Progress value={token.social_score} className="flex-1" />
                              <span className="font-medium">{token.social_score}/100</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
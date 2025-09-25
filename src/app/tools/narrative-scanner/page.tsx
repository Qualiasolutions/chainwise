'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Brain, TrendingUp, Activity, Zap, Clock, Search, Target, Globe, CreditCard, Sparkles, BarChart3 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

interface NarrativeScan {
  id: string
  scan_name: string
  scan_type: 'comprehensive' | 'targeted' | 'trending'
  target_keywords?: string[]
  time_period: string
  scan_results: {
    trending_topics: Array<{
      keyword: string
      category: string
      social_volume: number
      sentiment_score: number
      volume_change_24h: number
      sentiment_change_24h: number
      related_tokens: string[]
      strength: 'very_strong' | 'strong' | 'moderate' | 'weak'
    }>
    sentiment_analysis: {
      overall_sentiment: number
      total_volume: number
      positive_ratio: number
      negative_ratio: number
      neutral_ratio: number
      top_sources: string[]
    }
    social_volume_data: {
      total_mentions: number
      avg_engagement: number
      peak_volume_hour: string
      volume_trend: 'high' | 'medium' | 'low'
    }
    confidence_score: number
    narrative_summary: string
    data_quality: 'excellent' | 'good' | 'fair' | 'limited'
    recommendations: string[]
  }
  narrative_summary: string
  confidence_score: number
  credits_used: number
  created_at: string
}

interface NarrativeTrend {
  trend_keyword: string
  trend_category: string
  social_volume: number
  sentiment_score: number
  volume_change_24h: number
  sentiment_change_24h: number
  related_tokens: string[]
}

interface NarrativeKeyword {
  keyword: string
  category: string
  description: string
  related_tokens: string[]
}

export default function NarrativeScannerPage() {
  const [scans, setScans] = useState<NarrativeScan[]>([])
  const [trends, setTrends] = useState<NarrativeTrend[]>([])
  const [keywords, setKeywords] = useState<NarrativeKeyword[]>([])
  const [userTier, setUserTier] = useState<'free' | 'pro' | 'elite'>('free')
  const [creditsRemaining, setCreditsRemaining] = useState(0)
  const [creditCost, setCreditCost] = useState(40)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedScan, setSelectedScan] = useState<NarrativeScan | null>(null)
  const [newScan, setNewScan] = useState({
    scanName: '',
    scanType: '' as 'comprehensive' | 'targeted' | 'trending',
    targetKeywords: [] as string[],
    timePeriod: '24h' as '1h' | '6h' | '24h' | '7d'
  })
  const [keywordInput, setKeywordInput] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchScannerData()
  }, [])

  const fetchScannerData = async () => {
    try {
      const response = await fetch('/api/tools/narrative-scanner')
      const data = await response.json()

      if (data.success) {
        setScans(data.scans)
        setTrends(data.trends)
        setKeywords(data.keywords)
        setUserTier(data.userTier)
        setCreditsRemaining(data.creditsRemaining)
        setCreditCost(data.creditCost)
      } else {
        toast.error('Failed to load scanner data')
      }
    } catch (error) {
      console.error('Error fetching scanner data:', error)
      toast.error('Failed to load scanner data')
    } finally {
      setIsLoading(false)
    }
  }

  const generateScan = async () => {
    if (!newScan.scanName || !newScan.scanType) {
      toast.error('Please fill in scan name and type')
      return
    }

    if (creditsRemaining < creditCost) {
      toast.error(`Insufficient credits. You need ${creditCost} credits for a Narrative Deep Scan.`)
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/tools/narrative-scanner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scanName: newScan.scanName,
          scanType: newScan.scanType,
          targetKeywords: newScan.targetKeywords.length > 0 ? newScan.targetKeywords : undefined,
          timePeriod: newScan.timePeriod
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Narrative scan generated successfully!')
        setCreditsRemaining(data.creditsRemaining)
        setNewScan({
          scanName: '',
          scanType: '' as any,
          targetKeywords: [],
          timePeriod: '24h'
        })
        setKeywordInput('')
        await fetchScannerData()
      } else {
        toast.error(data.error || 'Failed to generate scan')
      }
    } catch (error) {
      console.error('Error generating scan:', error)
      toast.error('Failed to generate scan')
    } finally {
      setIsGenerating(false)
    }
  }

  const addKeyword = () => {
    if (keywordInput.trim() && !newScan.targetKeywords.includes(keywordInput.trim().toLowerCase())) {
      setNewScan(prev => ({
        ...prev,
        targetKeywords: [...prev.targetKeywords, keywordInput.trim().toLowerCase()]
      }))
      setKeywordInput('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setNewScan(prev => ({
      ...prev,
      targetKeywords: prev.targetKeywords.filter(k => k !== keyword)
    }))
  }

  const addSuggestedKeyword = (keyword: string) => {
    if (!newScan.targetKeywords.includes(keyword)) {
      setNewScan(prev => ({
        ...prev,
        targetKeywords: [...prev.targetKeywords, keyword]
      }))
    }
  }

  const canAccessFeature = () => {
    const tierHierarchy = { free: 0, pro: 1, elite: 2 }
    return tierHierarchy[userTier] >= 1
  }

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 20) return 'text-green-600'
    if (sentiment < -20) return 'text-red-600'
    return 'text-yellow-600'
  }

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment > 20) return 'Bullish'
    if (sentiment < -20) return 'Bearish'
    return 'Neutral'
  }

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'very_strong': return 'bg-green-600'
      case 'strong': return 'bg-green-500'
      case 'moderate': return 'bg-yellow-500'
      case 'weak': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Narrative Deep Scanner</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered analysis of crypto market narratives and sentiment trends
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            {creditsRemaining} Credits
          </Badge>
          <Badge variant="secondary">
            {userTier.charAt(0).toUpperCase() + userTier.slice(1)} Tier
          </Badge>
          <Badge variant="outline" className="text-purple-600 border-purple-600">
            {creditCost} Credits per Scan
          </Badge>
        </div>
      </div>

      {!canAccessFeature() && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Narrative Deep Scans require Pro tier or higher.
            <Button variant="link" className="p-0 h-auto ml-1" onClick={() => router.push('/pricing')}>
              Upgrade now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="scanner" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scanner">Scanner</TabsTrigger>
          <TabsTrigger value="trends">Live Trends</TabsTrigger>
          <TabsTrigger value="history">Scan History</TabsTrigger>
        </TabsList>

        {/* Scanner Tab */}
        <TabsContent value="scanner" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scan Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Configure Scan
                </CardTitle>
                <CardDescription>
                  Set up your narrative analysis parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="scanName">Scan Name *</Label>
                  <Input
                    id="scanName"
                    placeholder="e.g., AI Token Narrative Analysis"
                    value={newScan.scanName}
                    onChange={(e) => setNewScan(prev => ({ ...prev, scanName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scanType">Scan Type *</Label>
                  <Select
                    value={newScan.scanType}
                    onValueChange={(value: any) => setNewScan(prev => ({ ...prev, scanType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select scan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprehensive">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Comprehensive</div>
                            <div className="text-xs text-muted-foreground">Full market narrative analysis</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="targeted">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Targeted</div>
                            <div className="text-xs text-muted-foreground">Focus on specific keywords</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="trending">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Trending</div>
                            <div className="text-xs text-muted-foreground">Current trending narratives</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timePeriod">Time Period</Label>
                  <Select
                    value={newScan.timePeriod}
                    onValueChange={(value: any) => setNewScan(prev => ({ ...prev, timePeriod: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">Last 1 Hour</SelectItem>
                      <SelectItem value="6h">Last 6 Hours</SelectItem>
                      <SelectItem value="24h">Last 24 Hours</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newScan.scanType === 'targeted' && (
                  <div className="space-y-2">
                    <Label>Target Keywords</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter keyword..."
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                      />
                      <Button onClick={addKeyword} size="sm">
                        Add
                      </Button>
                    </div>
                    {newScan.targetKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newScan.targetKeywords.map((keyword) => (
                          <Badge
                            key={keyword}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeKeyword(keyword)}
                          >
                            {keyword} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={generateScan}
                  disabled={!canAccessFeature() || isGenerating || creditsRemaining < creditCost}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Generating Scan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Deep Scan ({creditCost} Credits)
                    </>
                  )}
                </Button>

                {creditsRemaining < creditCost && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Insufficient credits. You need {creditCost} credits for a Deep Scan.
                      <Button variant="link" className="p-0 h-auto ml-1" onClick={() => router.push('/settings/billing')}>
                        Buy credits
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Suggested Keywords */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-600" />
                  Suggested Keywords
                </CardTitle>
                <CardDescription>
                  Popular narrative keywords to target
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {keywords.map((keyword) => (
                    <div
                      key={keyword.keyword}
                      className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{keyword.keyword}</span>
                          <Badge variant="outline" className="text-xs">
                            {keyword.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {keyword.description}
                        </p>
                        {keyword.related_tokens.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {keyword.related_tokens.slice(0, 4).map((token) => (
                              <Badge key={token} variant="secondary" className="text-xs">
                                {token}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addSuggestedKeyword(keyword.keyword)}
                        disabled={newScan.targetKeywords.includes(keyword.keyword)}
                      >
                        {newScan.targetKeywords.includes(keyword.keyword) ? 'Added' : 'Add'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Live Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Live Narrative Trends
              </CardTitle>
              <CardDescription>
                Real-time trending narratives in the crypto space
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trends.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trends.map((trend, index) => (
                    <Card key={`${trend.trend_keyword}-${index}`} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{trend.trend_keyword}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {trend.trend_category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Social Volume</span>
                          <span className="font-medium">{trend.social_volume.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Sentiment</span>
                          <span className={`font-medium ${getSentimentColor(trend.sentiment_score)}`}>
                            {getSentimentLabel(trend.sentiment_score)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Volume Change</span>
                          <span className={`font-medium ${trend.volume_change_24h > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trend.volume_change_24h > 0 ? '+' : ''}{trend.volume_change_24h.toFixed(1)}%
                          </span>
                        </div>
                        {trend.related_tokens.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {trend.related_tokens.slice(0, 3).map((token) => (
                              <Badge key={token} variant="secondary" className="text-xs">
                                {token}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <div className="text-lg font-medium mb-2">No trending narratives</div>
                  <div className="text-muted-foreground">Live trend data will appear here</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scan History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scan History</CardTitle>
              <CardDescription>
                Your previous narrative deep scans
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scans.length > 0 ? (
                <div className="space-y-4">
                  {scans.map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedScan(scan)}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{scan.scan_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {scan.scan_type}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {scan.time_period}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {scan.narrative_summary}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{new Date(scan.created_at).toLocaleDateString()}</span>
                          <span>Confidence: {scan.confidence_score.toFixed(1)}%</span>
                          <span>{scan.credits_used} credits</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Progress
                          value={scan.confidence_score}
                          className="w-20 h-2"
                        />
                        <Badge variant={scan.confidence_score > 75 ? "default" : "secondary"} className="text-xs">
                          {scan.scan_results.data_quality}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <div className="text-lg font-medium mb-2">No scans yet</div>
                  <div className="text-muted-foreground mb-4">Generate your first narrative scan to get started</div>
                  <Button onClick={() => document.querySelector('[value="scanner"]')?.click()}>
                    Generate Scan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Scan Details Modal */}
      {selectedScan && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>{selectedScan.scan_name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{selectedScan.scan_type}</Badge>
                    <Badge variant="secondary">{selectedScan.time_period}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(selectedScan.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setSelectedScan(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[70vh] p-6">
              <div className="space-y-6">
                {/* Summary */}
                <div>
                  <h3 className="font-semibold mb-2">Narrative Summary</h3>
                  <p className="text-muted-foreground">{selectedScan.narrative_summary}</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold">{selectedScan.confidence_score.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Confidence</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold">
                      {selectedScan.scan_results.sentiment_analysis?.total_volume?.toLocaleString() || 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Volume</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold">
                      {selectedScan.scan_results.trending_topics?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Topics</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold capitalize">
                      {selectedScan.scan_results.data_quality}
                    </div>
                    <div className="text-xs text-muted-foreground">Data Quality</div>
                  </div>
                </div>

                {/* Trending Topics */}
                {selectedScan.scan_results.trending_topics && (
                  <div>
                    <h3 className="font-semibold mb-3">Trending Topics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedScan.scan_results.trending_topics.slice(0, 6).map((topic, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{topic.keyword}</span>
                            <div className={`w-2 h-2 rounded-full ${getStrengthColor(topic.strength)}`} />
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Volume: {topic.social_volume.toLocaleString()} |
                            Sentiment: <span className={getSentimentColor(topic.sentiment_score)}>
                              {getSentimentLabel(topic.sentiment_score)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {selectedScan.scan_results.recommendations && selectedScan.scan_results.recommendations.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">AI Recommendations</h3>
                    <div className="space-y-2">
                      {selectedScan.scan_results.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                          <Zap className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  )
}
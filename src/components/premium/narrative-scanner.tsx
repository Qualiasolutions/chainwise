'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { 
  Radar, 
  TrendingUp, 
  Zap, 
  Clock,
  Target,
  BarChart3,
  Loader2,
  Lightbulb,
  AlertCircle,
  Coins
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'

interface NarrativeReport {
  scanType: string
  timeframe: string
  executedAt: string
  summary: {
    totalNarratives: number
    strongNarratives: number
    emergingNarratives: number
    relatedTokens: number
  }
  narratives: Array<{
    name: string
    description: string
    strength: number
    momentum: number
    sentiment: number
    mentions: number
    growth: string
    keyTopics: string[]
    influencerBuzz: string
    timeToBreakout: string
  }>
  relatedTokens: Array<{
    symbol: string
    name: string
    narrative: string
    narrativeStrength: number
    priceChange24h: string
    volume24h: string
    marketCap: string
    socialScore: number
    riskLevel: string
  }>
  insights: string[]
  recommendations: string[]
}

export function NarrativeScanner() {
  const [scanType, setScanType] = useState('trending')
  const [specificNarrative, setSpecificNarrative] = useState('')
  const [timeframe, setTimeframe] = useState('24h')
  const [includeTokens, setIncludeTokens] = useState(true)
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<NarrativeReport | null>(null)
  const { toast } = useToast()

  const handleScan = async () => {
    if (scanType === 'specific' && !specificNarrative.trim()) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a specific narrative to search for',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/narrative-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scanType,
          specificNarrative: scanType === 'specific' ? specificNarrative.trim() : undefined,
          timeframe,
          includeTokens
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setReport(data.report)
        toast({
          title: 'Scan Complete!',
          description: `Used ${data.creditsUsed} credits. ${data.remainingCredits} credits remaining.`,
        })
      } else {
        throw new Error(data.error || 'Failed to perform narrative scan')
      }
    } catch (error: any) {
      toast({
        title: 'Scan Failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStrengthColor = (strength: number) => {
    if (strength >= 8) return 'text-green-600'
    if (strength >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getBuzzColor = (buzz: string) => {
    if (buzz === 'High') return 'bg-green-100 text-green-800'
    if (buzz.includes('Medium')) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getRiskColor = (risk: string) => {
    if (risk === 'Low') return 'bg-green-100 text-green-800'
    if (risk === 'Medium') return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-6">
      {/* Scan Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radar className="w-5 h-5" />
            Narrative Deep Scan
          </CardTitle>
          <CardDescription>
            AI-powered market narrative analysis (40 credits per scan)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scanType">Scan Type</Label>
              <Select value={scanType} onValueChange={setScanType} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trending">Trending Narratives</SelectItem>
                  <SelectItem value="emerging">Emerging Narratives</SelectItem>
                  <SelectItem value="specific">Specific Narrative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {scanType === 'specific' && (
              <div className="space-y-2">
                <Label htmlFor="narrative">Specific Narrative</Label>
                <Input
                  id="narrative"
                  placeholder="e.g., AI, DeFi, Gaming"
                  value={specificNarrative}
                  onChange={(e) => setSpecificNarrative(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="timeframe">Timeframe</Label>
              <Select value={timeframe} onValueChange={setTimeframe} disabled={loading}>
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
            
            <div className="flex items-center space-x-2">
              <Switch
                id="tokens"
                checked={includeTokens}
                onCheckedChange={setIncludeTokens}
                disabled={loading}
              />
              <Label htmlFor="tokens">Include Related Tokens Analysis</Label>
            </div>
            
            <Button 
              onClick={handleScan} 
              disabled={loading || (scanType === 'specific' && !specificNarrative.trim())}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Radar className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Scanning...' : 'Start Deep Scan (40 Credits)'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {report && (
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Scan Results</span>
                <Badge variant="outline" className="text-xs">
                  {new Date(report.executedAt).toLocaleString()}
                </Badge>
              </CardTitle>
              <CardDescription>
                {report.scanType.charAt(0).toUpperCase() + report.scanType.slice(1)} narratives • {report.timeframe} timeframe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold">{report.summary.totalNarratives}</p>
                  <p className="text-sm text-gray-600">Total Narratives</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold">{report.summary.strongNarratives}</p>
                  <p className="text-sm text-gray-600">Strong Narratives</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold">{report.summary.emergingNarratives}</p>
                  <p className="text-sm text-gray-600">Emerging</p>
                </div>
                
                {includeTokens && (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Coins className="w-5 h-5 text-orange-500" />
                    </div>
                    <p className="text-2xl font-bold">{report.summary.relatedTokens}</p>
                    <p className="text-sm text-gray-600">Related Tokens</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Narratives */}
          <Card>
            <CardHeader>
              <CardTitle>Narrative Analysis</CardTitle>
              <CardDescription>
                Top narratives ranked by strength and momentum
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {report.narratives.map((narrative, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{narrative.name}</h3>
                        <p className="text-gray-600 text-sm">{narrative.description}</p>
                      </div>
                      <Badge className={getBuzzColor(narrative.influencerBuzz)}>
                        {narrative.influencerBuzz} Buzz
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Strength</p>
                        <div className="flex items-center gap-2">
                          <Progress value={narrative.strength * 10} className="flex-1" />
                          <span className={`font-semibold ${getStrengthColor(narrative.strength)}`}>
                            {narrative.strength}/10
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Momentum</p>
                        <div className="flex items-center gap-2">
                          <Progress value={narrative.momentum * 100} className="flex-1" />
                          <span className="font-semibold">{(narrative.momentum * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Growth</p>
                        <p className="font-semibold text-green-600">{narrative.growth}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Breakout ETA</p>
                        <p className="font-semibold">{narrative.timeToBreakout}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {narrative.keyTopics.map((topic, topicIndex) => (
                        <Badge key={topicIndex} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Related Tokens */}
          {includeTokens && report.relatedTokens.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Tokens</CardTitle>
                <CardDescription>
                  Tokens associated with detected narratives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {report.relatedTokens.slice(0, 12).map((token, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{token.symbol}</h4>
                          <p className="text-xs text-gray-600">{token.narrative}</p>
                        </div>
                        <Badge className={getRiskColor(token.riskLevel)} variant="outline">
                          {token.riskLevel}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>24h Change:</span>
                          <span className={parseFloat(token.priceChange24h) >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {token.priceChange24h}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Social Score:</span>
                          <span className="font-medium">{token.socialScore}/100</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Insights & Recommendations */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-500" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
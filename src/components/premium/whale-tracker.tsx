'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Clock,
  DollarSign,
  Activity,
  Loader2,
  ExternalLink,
  Coins
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface WhaleReport {
  walletAddress: string
  trackingPeriod: string
  summary: {
    totalTransactions: number
    totalVolumeUSD: string
    uniqueTokens: number
    riskScore: number
    activityPattern: string
  }
  transactions: Array<{
    hash: string
    timestamp: string
    type: string
    token: string
    amount: string
    valueUSD: string
    to: string
  }>
  insights: string[]
  alerts: string[]
  generatedAt: string
}

export function WhaleTracker() {
  const [walletAddress, setWalletAddress] = useState('')
  const [trackingDuration, setTrackingDuration] = useState('24h')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<WhaleReport | null>(null)
  const { toast } = useToast()

  const handleTrackWallet = async () => {
    if (!walletAddress.trim()) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a valid wallet address',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/whale-tracker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          walletAddress: walletAddress.trim(),
          trackingDuration
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setReport(data.report)
        toast({
          title: 'Analysis Complete!',
          description: `Used ${data.creditsUsed} credits. ${data.remainingCredits} credits remaining.`,
        })
      } else {
        throw new Error(data.error || 'Failed to track wallet')
      }
    } catch (error: any) {
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600 bg-green-100'
    if (score < 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getPatternIcon = (pattern: string) => {
    return pattern === 'accumulating' ? 
      <TrendingUp className="w-4 h-4 text-green-600" /> : 
      <TrendingDown className="w-4 h-4 text-red-600" />
  }

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Whale Wallet Tracker
          </CardTitle>
          <CardDescription>
            Track whale wallet movements and get detailed reports (5 credits per analysis)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wallet">Wallet Address</Label>
              <Input
                id="wallet"
                placeholder="0x... or ENS name"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Tracking Duration</Label>
              <Select value={trackingDuration} onValueChange={setTrackingDuration} disabled={loading}>
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
            
            <Button 
              onClick={handleTrackWallet} 
              disabled={loading || !walletAddress.trim()}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Analyzing...' : 'Track Wallet (5 Credits)'}
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
                <span>Analysis Summary</span>
                <Badge variant="outline" className="text-xs">
                  {new Date(report.generatedAt).toLocaleString()}
                </Badge>
              </CardTitle>
              <CardDescription className="font-mono text-sm">
                {report.walletAddress}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold">{report.summary.totalTransactions}</p>
                  <p className="text-sm text-gray-600">Transactions</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold">${report.summary.totalVolumeUSD}</p>
                  <p className="text-sm text-gray-600">Total Volume</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Coins className="w-5 h-5 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold">{report.summary.uniqueTokens}</p>
                  <p className="text-sm text-gray-600">Unique Tokens</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  </div>
                  <Badge className={getRiskColor(report.summary.riskScore)}>
                    Risk: {report.summary.riskScore}/100
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">Risk Score</p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex items-center justify-center gap-2">
                {getPatternIcon(report.summary.activityPattern)}
                <span className="font-medium capitalize">
                  {report.summary.activityPattern} Pattern
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Top 10 most recent transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.transactions.map((tx) => (
                  <div key={tx.hash} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={tx.type === 'buy' ? 'default' : 'secondary'}>
                        {tx.type.toUpperCase()}
                      </Badge>
                      <div>
                        <p className="font-medium">{tx.token}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(tx.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium">${tx.valueUSD}</p>
                      <a 
                        href={`https://etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insights & Alerts */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
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
            
            {report.alerts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-600">Risk Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {report.alerts.map((alert, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{alert}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
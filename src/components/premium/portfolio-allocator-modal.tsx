'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Target, DollarSign, PieChart, TrendingUp, Shield, Clock, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/hooks/useSupabaseAuth'
import { useToast } from '@/hooks/use-toast'

interface AllocationRequest {
  totalAmount: number
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  investmentHorizon: 'short' | 'medium' | 'long'
  goals: string
  preferences: {
    includeAltcoins: boolean
    includeDeFi: boolean
    maxSingleAsset: number
  }
}

interface AllocationResponse {
  success: boolean
  analysis: any
  credits_remaining: number
  credits_used: number
  ai_analysis: string
}

export function PortfolioAllocator() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [formData, setFormData] = useState<AllocationRequest>({
    totalAmount: 10000,
    riskTolerance: 'moderate',
    investmentHorizon: 'medium',
    goals: '',
    preferences: {
      includeAltcoins: true,
      includeDeFi: false,
      maxSingleAsset: 50
    }
  })

  const { user } = useAuth()
  const { toast } = useToast()

  const handleInputChange = (field: keyof AllocationRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePreferenceChange = (field: keyof AllocationRequest['preferences'], value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [field]: value }
    }))
  }

  const generateAllocation = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to generate portfolio allocations.',
        variant: 'destructive'
      })
      return
    }

    if (!formData.totalAmount || !formData.goals) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/tools/portfolio-allocator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data: AllocationResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate portfolio allocation')
      }

      setAnalysis(data.analysis)
      toast({
        title: 'Portfolio Analysis Complete',
        description: `Allocation strategy generated. ${data.credits_used} credits used.`,
      })

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate portfolio allocation',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      totalAmount: 10000,
      riskTolerance: 'moderate',
      investmentHorizon: 'medium',
      goals: '',
      preferences: {
        includeAltcoins: true,
        includeDeFi: false,
        maxSingleAsset: 50
      }
    })
    setAnalysis(null)
  }

  const getRiskColor = (riskScore: number) => {
    if (riskScore <= 30) return 'text-green-600'
    if (riskScore <= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Target className="w-4 h-4 mr-2" />
          Portfolio Allocator
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            AI Smart Portfolio Allocator
            <Badge variant="secondary">8 Credits</Badge>
          </DialogTitle>
          <DialogDescription>
            Get AI-powered portfolio allocation recommendations based on your risk profile and goals
          </DialogDescription>
        </DialogHeader>

        {!analysis ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Investment Amount ($)</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  min="1000"
                  value={formData.totalAmount}
                  onChange={(e) => handleInputChange('totalAmount', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Risk Tolerance</Label>
                <Select
                  value={formData.riskTolerance}
                  onValueChange={(value) => handleInputChange('riskTolerance', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative - Lower risk, stable returns</SelectItem>
                    <SelectItem value="moderate">Moderate - Balanced risk and growth</SelectItem>
                    <SelectItem value="aggressive">Aggressive - Higher risk, growth focused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Investment Horizon</Label>
              <Select
                value={formData.investmentHorizon}
                onValueChange={(value) => handleInputChange('investmentHorizon', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short Term (1-2 years)</SelectItem>
                  <SelectItem value="medium">Medium Term (2-5 years)</SelectItem>
                  <SelectItem value="long">Long Term (5+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals">Investment Goals</Label>
              <Textarea
                id="goals"
                placeholder="Describe your investment goals, expectations, and any specific requirements..."
                value={formData.goals}
                onChange={(e) => handleInputChange('goals', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">Investment Preferences</Label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <Label htmlFor="includeAltcoins">Include Altcoins</Label>
                    <p className="text-sm text-muted-foreground">Add smaller cap cryptocurrencies</p>
                  </div>
                  <Switch
                    id="includeAltcoins"
                    checked={formData.preferences.includeAltcoins}
                    onCheckedChange={(checked) => handlePreferenceChange('includeAltcoins', checked)}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <Label htmlFor="includeDeFi">Include DeFi Tokens</Label>
                    <p className="text-sm text-muted-foreground">Add decentralized finance protocols</p>
                  </div>
                  <Switch
                    id="includeDeFi"
                    checked={formData.preferences.includeDeFi}
                    onCheckedChange={(checked) => handlePreferenceChange('includeDeFi', checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxSingleAsset">Maximum Single Asset Allocation (%)</Label>
                <Input
                  id="maxSingleAsset"
                  type="number"
                  min="10"
                  max="80"
                  value={formData.preferences.maxSingleAsset}
                  onChange={(e) => handlePreferenceChange('maxSingleAsset', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={generateAllocation} disabled={loading}>
                {loading ? 'Analyzing...' : 'Generate Allocation'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Portfolio Allocation Analysis</h3>
              <Button variant="outline" size="sm" onClick={resetForm}>
                Create New Analysis
              </Button>
            </div>

            {/* Risk & Diversification Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="w-4 h-4" />
                    Risk Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getRiskColor(analysis.risk_score)}`}>
                      {analysis.risk_score}/100
                    </span>
                    <Badge variant="outline">
                      {analysis.risk_score <= 30 ? 'Low Risk' : analysis.risk_score <= 60 ? 'Medium Risk' : 'High Risk'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <PieChart className="w-4 h-4" />
                    Diversification Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-600">
                      {analysis.diversification_score}/100
                    </span>
                    <Badge variant="outline">
                      {analysis.diversification_score >= 70 ? 'Well Diversified' : 'Moderate Diversification'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Allocation Breakdown */}
            {analysis.recommendations?.allocation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Recommended Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.recommendations.allocation.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full" style={{
                            backgroundColor: `hsl(${(index * 60) % 360}, 70%, 50%)`
                          }}></div>
                          <div>
                            <p className="font-medium">{item.symbol}</p>
                            <p className="text-sm text-muted-foreground">{item.reasoning}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{item.percentage}%</p>
                          <p className="text-sm text-muted-foreground">${item.amount?.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rebalancing Strategy */}
            {analysis.recommendations?.rebalancing_strategy && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Rebalancing Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Frequency</p>
                      <p className="font-semibold capitalize">{analysis.recommendations.rebalancing_strategy.frequency}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Threshold</p>
                      <p className="font-semibold">{analysis.recommendations.rebalancing_strategy.threshold}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Risk Management */}
            {analysis.recommendations?.risk_management && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Risk Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Stop Loss Level</p>
                      <p className="font-semibold">{analysis.recommendations.risk_management.stop_loss_level}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Portfolio Correlation</p>
                      <p className="text-sm">{analysis.recommendations.risk_management.portfolio_correlation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Emergency Exit Strategy</p>
                      <p className="text-sm">{analysis.recommendations.risk_management.emergency_exit}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
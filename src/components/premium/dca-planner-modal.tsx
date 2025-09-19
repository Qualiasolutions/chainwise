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
import { TrendingUp, DollarSign, Clock, Shield, Target, AlertTriangle } from 'lucide-react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { useToast } from '@/hooks/use-toast'

interface DCARequest {
  coinSymbol: string
  coinName: string
  totalInvestment: number
  frequency: 'weekly' | 'monthly'
  durationWeeks: number
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  currentPrice: number
  goals: string
}

interface DCAResponse {
  success: boolean
  plan: any
  credits_remaining: number
  credits_used: number
  ai_analysis: string
}

export function DCAPlanner() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<any>(null)
  const [formData, setFormData] = useState<DCARequest>({
    coinSymbol: '',
    coinName: '',
    totalInvestment: 1000,
    frequency: 'weekly',
    durationWeeks: 12,
    riskTolerance: 'moderate',
    currentPrice: 0,
    goals: ''
  })

  const { user } = useSupabaseAuth()
  const { toast } = useToast()

  const handleInputChange = (field: keyof DCARequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateDCAplan = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to generate DCA plans.',
        variant: 'destructive'
      })
      return
    }

    if (!formData.coinSymbol || !formData.coinName || !formData.currentPrice) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/tools/dca-planner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data: DCAResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate DCA plan')
      }

      setPlan(data.plan)
      toast({
        title: 'DCA Plan Generated',
        description: `Plan created successfully. ${data.credits_used} credits used.`,
      })

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate DCA plan',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      coinSymbol: '',
      coinName: '',
      totalInvestment: 1000,
      frequency: 'weekly',
      durationWeeks: 12,
      riskTolerance: 'moderate',
      currentPrice: 0,
      goals: ''
    })
    setPlan(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <TrendingUp className="w-4 h-4 mr-2" />
          DCA & Exit Planner
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            AI Smart DCA & Exit Planner
            <Badge variant="secondary">5 Credits</Badge>
          </DialogTitle>
          <DialogDescription>
            Generate an AI-powered Dollar Cost Averaging strategy with smart exit planning
          </DialogDescription>
        </DialogHeader>

        {!plan ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coinName">Cryptocurrency</Label>
                <Input
                  id="coinName"
                  placeholder="e.g., Bitcoin"
                  value={formData.coinName}
                  onChange={(e) => handleInputChange('coinName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coinSymbol">Symbol</Label>
                <Input
                  id="coinSymbol"
                  placeholder="e.g., BTC"
                  value={formData.coinSymbol}
                  onChange={(e) => handleInputChange('coinSymbol', e.target.value.toUpperCase())}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalInvestment">Total Investment ($)</Label>
                <Input
                  id="totalInvestment"
                  type="number"
                  min="100"
                  value={formData.totalInvestment}
                  onChange={(e) => handleInputChange('totalInvestment', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentPrice">Current Price ($)</Label>
                <Input
                  id="currentPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.currentPrice}
                  onChange={(e) => handleInputChange('currentPrice', parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => handleInputChange('frequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationWeeks">Duration (weeks)</Label>
                <Input
                  id="durationWeeks"
                  type="number"
                  min="1"
                  max="104"
                  value={formData.durationWeeks}
                  onChange={(e) => handleInputChange('durationWeeks', parseInt(e.target.value))}
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
                    <SelectItem value="conservative">Conservative</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals">Investment Goals</Label>
              <Textarea
                id="goals"
                placeholder="Describe your investment goals, timeline, and expectations..."
                value={formData.goals}
                onChange={(e) => handleInputChange('goals', e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={generateDCAplan} disabled={loading}>
                {loading ? 'Generating...' : 'Generate DCA Plan'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">DCA Plan for {formData.coinName}</h3>
              <Button variant="outline" size="sm" onClick={resetForm}>
                Create New Plan
              </Button>
            </div>

            {/* DCA Schedule */}
            {plan.plan_data?.dca_schedule && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    DCA Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount per {formData.frequency}</p>
                      <p className="text-lg font-semibold">${plan.plan_data.dca_schedule.amount_per_period?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Periods</p>
                      <p className="text-lg font-semibold">{plan.plan_data.dca_schedule.total_periods}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Frequency</p>
                      <p className="text-lg font-semibold capitalize">{plan.plan_data.dca_schedule.frequency}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Exit Strategy */}
            {plan.exit_strategy && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Exit Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plan.exit_strategy.target_levels?.map((level: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">${level.price?.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">{level.reason}</p>
                        </div>
                        <Badge variant="outline">{level.action}</Badge>
                      </div>
                    ))}

                    {plan.exit_strategy.stop_loss && (
                      <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            Stop Loss: ${plan.exit_strategy.stop_loss.price?.toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">{plan.exit_strategy.stop_loss.reason}</p>
                        </div>
                        <Badge variant="destructive">{plan.exit_strategy.stop_loss.action}</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Risk Management */}
            {plan.plan_data?.risk_management && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Risk Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {typeof plan.plan_data.risk_management === 'string' ? (
                      <p>{plan.plan_data.risk_management}</p>
                    ) : (
                      <div className="space-y-2">
                        {plan.plan_data.risk_management.portfolio_allocation && (
                          <p><strong>Portfolio Allocation:</strong> {plan.plan_data.risk_management.portfolio_allocation}</p>
                        )}
                        {plan.plan_data.risk_management.rebalancing_frequency && (
                          <p><strong>Rebalancing:</strong> {plan.plan_data.risk_management.rebalancing_frequency}</p>
                        )}
                        {plan.plan_data.risk_management.emergency_exit_conditions && (
                          <p><strong>Emergency Exit:</strong> {plan.plan_data.risk_management.emergency_exit_conditions}</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Analysis */}
            {plan.plan_data?.ai_analysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{plan.plan_data.ai_analysis}</p>
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
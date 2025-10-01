'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, DollarSign, Clock, Target, Calculator, ArrowLeft, History } from 'lucide-react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { RequireFeature } from '@/components/auth/RequireFeature'

interface DCARequest {
  planName: string
  coinSymbol: string
  coinName: string
  totalInvestment: number
  investmentFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  investmentPeriodMonths: number
  startDate?: string
}

export default function DCAPlanner() {
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [plan, setPlan] = useState<any>(null)
  const [previousPlans, setPreviousPlans] = useState<any[]>([])
  const [formData, setFormData] = useState<DCARequest>({
    planName: '',
    coinSymbol: '',
    coinName: '',
    totalInvestment: 1000,
    investmentFrequency: 'weekly',
    investmentPeriodMonths: 12,
    startDate: ''
  })

  const { user, profile } = useSupabaseAuth()
  const { toast } = useToast()

  // Fetch DCA plan history
  const fetchPlanHistory = async () => {
    try {
      setHistoryLoading(true)
      const response = await fetch('/api/tools/dca-planner')
      if (!response.ok) throw new Error('Failed to fetch plan history')
      const data = await response.json()
      if (data.success) {
        setPreviousPlans(data.plans || [])
      }
    } catch (error) {
      console.error('Error fetching plan history:', error)
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchPlanHistory()
    }
  }, [user])

  const handleGeneratePlan = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the DCA Planner.",
        variant: "destructive"
      })
      return
    }

    if (!formData.planName || !formData.coinSymbol || formData.totalInvestment < 100) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and ensure minimum investment of $100.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/tools/dca-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setPlan(data.plan)
        fetchPlanHistory()
        toast({
          title: "DCA Plan Generated!",
          description: `Plan created successfully. ${data.creditsRemaining} credits remaining.`
        })
      } else {
        throw new Error(data.error || 'Failed to generate plan')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate DCA plan. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' }
  ]

  return (
    <RequireFeature feature="dca_planner">
      <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <Calculator className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                DCA Planner
              </h1>
              <p className="text-muted-foreground">
                Create systematic investment strategies with dollar-cost averaging
              </p>
            </div>
          </div>

          {profile && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-blue-400 border-blue-400/30">
                {profile.credits} credits remaining
              </Badge>
              <Badge variant="outline" className="text-purple-400 border-purple-400/30">
                {profile.tier} tier
              </Badge>
            </div>
          )}
        </motion.div>

        <Tabs defaultValue="planner" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="planner" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              DCA Planner
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Plan History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="planner">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Section */}
              <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-400" />
                    Investment Parameters
                  </CardTitle>
                  <CardDescription>
                    Configure your DCA strategy parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Plan Name */}
                  <div className="space-y-2">
                    <Label>Plan Name *</Label>
                    <Input
                      placeholder="My Bitcoin DCA Strategy"
                      value={formData.planName}
                      onChange={(e) => setFormData(prev => ({ ...prev, planName: e.target.value }))}
                    />
                  </div>

                  {/* Cryptocurrency Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cryptocurrency Symbol *</Label>
                      <Input
                        placeholder="BTC, ETH, etc."
                        value={formData.coinSymbol}
                        onChange={(e) => setFormData(prev => ({ ...prev, coinSymbol: e.target.value.toUpperCase() }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Full Name (Optional)</Label>
                      <Input
                        placeholder="Bitcoin, Ethereum, etc."
                        value={formData.coinName}
                        onChange={(e) => setFormData(prev => ({ ...prev, coinName: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Investment Amount */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Total Investment Amount *
                    </Label>
                    <Input
                      type="number"
                      min="100"
                      step="100"
                      placeholder="1000"
                      value={formData.totalInvestment}
                      onChange={(e) => setFormData(prev => ({ ...prev, totalInvestment: Number(e.target.value) }))}
                    />
                  </div>

                  {/* Frequency and Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Investment Frequency
                      </Label>
                      <Select
                        value={formData.investmentFrequency}
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, investmentFrequency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {frequencyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Investment Period (Months)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="60"
                        value={formData.investmentPeriodMonths}
                        onChange={(e) => setFormData(prev => ({ ...prev, investmentPeriodMonths: Number(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleGeneratePlan}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Generating Plan...' : 'Generate DCA Plan (3 Credits)'}
                  </Button>
                </CardContent>
              </Card>

              {/* Results Section */}
              {plan && (
                <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-400" />
                      DCA Plan Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Asset</p>
                          <p className="font-semibold">{plan.planAnalysis?.coinAnalysis?.symbol}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Total Investment</p>
                          <p className="font-semibold">${formData.totalInvestment}</p>
                        </div>
                      </div>

                      {plan.planAnalysis && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Investment Per Period</p>
                              <p className="font-semibold">${plan.planAnalysis.amountPerInvestment?.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Total Investments</p>
                              <p className="font-semibold">{plan.planAnalysis.totalInvestments}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {plan.portfolioInsights && (
                        <div className="p-4 rounded-lg bg-muted/50">
                          <h4 className="font-semibold mb-2">Portfolio Insights</h4>
                          <p className="text-sm text-muted-foreground">
                            {plan.portfolioInsights.recommendedAdjustment}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-blue-400" />
                  Your DCA Plans
                </CardTitle>
                <CardDescription>
                  View and manage your previous DCA planning history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading plan history...</p>
                  </div>
                ) : previousPlans.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No DCA plans created yet.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Create your first plan using the DCA Planner tab.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {previousPlans.map((planItem, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{planItem.plan_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {planItem.coin_symbol} • ${planItem.total_investment_amount} • {planItem.investment_frequency}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(planItem.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={planItem.is_active ? "default" : "secondary"}>
                            {planItem.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </RequireFeature>
  )
}
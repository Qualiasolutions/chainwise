'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Target, DollarSign, PieChart, TrendingUp, Shield, Clock, AlertTriangle, ArrowLeft, History } from 'lucide-react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { RequireFeature } from '@/components/auth/RequireFeature'

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

export default function PortfolioAllocator() {
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [previousAllocations, setPreviousAllocations] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
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

  const { user, profile } = useSupabaseAuth()
  const { toast } = useToast()

  // Fetch allocation history when component loads
  useEffect(() => {
    if (user) {
      fetchAllocationHistory()
    }
  }, [user])

  const fetchAllocationHistory = async () => {
    try {
      setHistoryLoading(true)
      const response = await fetch('/api/tools/portfolio-allocator')
      if (!response.ok) throw new Error('Failed to fetch allocation history')

      const data = await response.json()
      if (data.success) {
        setPreviousAllocations(data.allocations || [])
      }
    } catch (error) {
      console.error('Error fetching allocation history:', error)
      toast({
        title: "Error",
        description: "Failed to load allocation history",
        variant: "destructive",
      })
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleGenerateAllocation = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the Portfolio Allocator.",
        variant: "destructive"
      })
      return
    }

    if (formData.totalAmount < 100) {
      toast({
        title: "Invalid Amount",
        description: "Minimum investment amount is $100.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/tools/portfolio-allocator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data: AllocationResponse = await response.json()

      if (data.success) {
        setAnalysis(data.analysis)
        // Refresh history to show the new allocation
        fetchAllocationHistory()
        toast({
          title: "Portfolio Analysis Complete!",
          description: `Allocation generated successfully. ${data.credits_remaining} credits remaining.`
        })
      } else {
        throw new Error('Failed to generate allocation')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate portfolio allocation. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const riskOptions = [
    { value: 'conservative', label: 'Conservative', desc: 'Lower risk, stable returns', color: 'bg-green-500' },
    { value: 'moderate', label: 'Moderate', desc: 'Balanced risk and growth', color: 'bg-yellow-500' },
    { value: 'aggressive', label: 'Aggressive', desc: 'Higher risk, growth potential', color: 'bg-red-500' }
  ]

  const horizonOptions = [
    { value: 'short', label: 'Short Term', desc: '< 1 year' },
    { value: 'medium', label: 'Medium Term', desc: '1-5 years' },
    { value: 'long', label: 'Long Term', desc: '5+ years' }
  ]

  return (
    <RequireFeature feature="portfolio_allocator">
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
            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <PieChart className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Portfolio Allocator
              </h1>
              <p className="text-muted-foreground">
                Get AI-powered portfolio allocation recommendations based on your risk profile
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

        <Tabs defaultValue="allocator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="allocator">Portfolio Allocator</TabsTrigger>
            <TabsTrigger value="history">Allocation History</TabsTrigger>
          </TabsList>

          <TabsContent value="allocator">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-400" />
                  Investment Parameters
                </CardTitle>
                <CardDescription>
                  Configure your portfolio allocation preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Total Investment Amount */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Total Investment Amount
                  </Label>
                  <Input
                    type="number"
                    min="100"
                    step="100"
                    placeholder="10000"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: Number(e.target.value) }))}
                  />
                </div>

                {/* Risk Tolerance */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Risk Tolerance
                  </Label>
                  <Select
                    value={formData.riskTolerance}
                    onValueChange={(value: 'conservative' | 'moderate' | 'aggressive') =>
                      setFormData(prev => ({ ...prev, riskTolerance: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {riskOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${option.color}`} />
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-muted-foreground">{option.desc}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Investment Horizon */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Investment Horizon
                  </Label>
                  <Select
                    value={formData.investmentHorizon}
                    onValueChange={(value: 'short' | 'medium' | 'long') =>
                      setFormData(prev => ({ ...prev, investmentHorizon: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {horizonOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">{option.desc}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Investment Goals */}
                <div className="space-y-2">
                  <Label>Investment Goals</Label>
                  <Textarea
                    placeholder="Describe your investment goals, preferences, and any specific requirements..."
                    value={formData.goals}
                    onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                    rows={3}
                  />
                </div>

                {/* Preferences */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Portfolio Preferences</Label>

                  <div className="space-y-4 p-4 border rounded-lg border-border/40">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Include Altcoins</Label>
                        <p className="text-xs text-muted-foreground">Include alternative cryptocurrencies beyond Bitcoin and Ethereum</p>
                      </div>
                      <Switch
                        checked={formData.preferences.includeAltcoins}
                        onCheckedChange={(checked) =>
                          setFormData(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, includeAltcoins: checked }
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Include DeFi</Label>
                        <p className="text-xs text-muted-foreground">Include decentralized finance protocols and tokens</p>
                      </div>
                      <Switch
                        checked={formData.preferences.includeDeFi}
                        onCheckedChange={(checked) =>
                          setFormData(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, includeDeFi: checked }
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Maximum Single Asset Allocation (%)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.preferences.maxSingleAsset}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, maxSingleAsset: Number(e.target.value) }
                        }))}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateAllocation}
                  disabled={loading || formData.totalAmount < 100}
                  className="w-full purple-gradient"
                >
                  {loading ? (
                    <>Generating Allocation...</>
                  ) : (
                    <>
                      <PieChart className="h-4 w-4 mr-2" />
                      Generate Portfolio Allocation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {analysis ? (
              <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-green-400">Your Portfolio Allocation</CardTitle>
                  <CardDescription>
                    AI-generated allocation strategy
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Analysis results would be rendered here */}
                  <div className="text-center py-8">
                    <PieChart className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Portfolio allocation generated successfully! Integration with MCP backend in progress.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-muted-foreground">Allocation Preview</CardTitle>
                  <CardDescription>
                    Your personalized portfolio allocation will appear here
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-16">
                    <PieChart className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Fill in the form and click "Generate Portfolio Allocation" to get started
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>

        {/* Information Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Target className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="font-semibold">Smart Allocation</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                AI analyzes market data and your preferences to create optimal portfolio distributions
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Shield className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="font-semibold">Risk Balanced</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Allocations are optimized based on your risk tolerance and investment horizon
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="font-semibold">Performance Optimized</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Recommendations consider historical performance and future growth potential
              </p>
            </CardContent>
          </Card>
        </motion.div>
          </TabsContent>

          <TabsContent value="history">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {historyLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-muted-foreground mt-4">Loading allocation history...</p>
                </div>
              ) : previousAllocations.length > 0 ? (
                <div className="space-y-4">
                  {previousAllocations.map((allocation) => (
                    <Card key={allocation.id} className="border-border/40 bg-card/40 backdrop-blur-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">
                              ${allocation.total_amount?.toLocaleString()} Allocation
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(allocation.created_at).toLocaleDateString()} •
                              {allocation.risk_tolerance} risk • {allocation.investment_horizon} horizon
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="text-purple-400 border-purple-400/30">
                              {allocation.credits_used} credits
                            </Badge>
                          </div>
                        </div>

                        {allocation.allocation_result && (
                          <div className="space-y-3">
                            <div className="text-sm">
                              <span className="font-medium">Goals:</span> {allocation.goals || 'Not specified'}
                            </div>
                            {allocation.ai_analysis && (
                              <div className="p-4 bg-muted/30 rounded-lg">
                                <h4 className="font-medium mb-2">AI Analysis:</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {allocation.ai_analysis}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No allocation history yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate your first portfolio allocation to see it here
                  </p>
                  <Button
                    onClick={() => document.querySelector('[value="allocator"]')?.click()}
                    variant="outline"
                  >
                    Create Allocation
                  </Button>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </RequireFeature>
  )
}
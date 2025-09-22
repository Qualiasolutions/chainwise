'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, DollarSign, Clock, Shield, Target, AlertTriangle, Calculator, ArrowLeft } from 'lucide-react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'
import Link from 'next/link'

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

export default function DCAPlanner() {
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

  const { user, profile } = useSupabaseAuth()
  const { toast } = useToast()

  const handleGeneratePlan = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the DCA Planner.",
        variant: "destructive"
      })
      return
    }

    if (!formData.coinSymbol || !formData.coinName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
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

      const data: DCAResponse = await response.json()

      if (data.success) {
        setPlan(data.plan)
        toast({
          title: "DCA Plan Generated!",
          description: `Plan created successfully. ${data.credits_remaining} credits remaining.`
        })
      } else {
        throw new Error('Failed to generate plan')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate DCA plan. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const frequencyOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ]

  const riskOptions = [
    { value: 'conservative', label: 'Conservative', color: 'bg-green-500' },
    { value: 'moderate', label: 'Moderate', color: 'bg-yellow-500' },
    { value: 'aggressive', label: 'Aggressive', color: 'bg-red-500' }
  ]

  return (
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
                Create an intelligent Dollar Cost Averaging strategy with AI-powered insights
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
                  <Target className="h-5 w-5 text-blue-400" />
                  Investment Parameters
                </CardTitle>
                <CardDescription>
                  Configure your DCA strategy parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cryptocurrency Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cryptocurrency Symbol</Label>
                    <Input
                      placeholder="BTC, ETH, etc."
                      value={formData.coinSymbol}
                      onChange={(e) => setFormData(prev => ({ ...prev, coinSymbol: e.target.value.toUpperCase() }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Full Name</Label>
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
                    Total Investment Amount
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
                      value={formData.frequency}
                      onValueChange={(value: 'weekly' | 'monthly') => setFormData(prev => ({ ...prev, frequency: value }))}
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
                    <Label>Duration (weeks)</Label>
                    <Input
                      type="number"
                      min="4"
                      max="104"
                      value={formData.durationWeeks}
                      onChange={(e) => setFormData(prev => ({ ...prev, durationWeeks: Number(e.target.value) }))}
                    />
                  </div>
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
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Investment Goals */}
                <div className="space-y-2">
                  <Label>Investment Goals (Optional)</Label>
                  <Textarea
                    placeholder="Describe your investment goals and expectations..."
                    value={formData.goals}
                    onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleGeneratePlan}
                  disabled={loading || !formData.coinSymbol || !formData.coinName}
                  className="w-full purple-gradient"
                >
                  {loading ? (
                    <>Generating Plan...</>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Generate DCA Plan
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
            {plan ? (
              <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-green-400">Your DCA Plan</CardTitle>
                  <CardDescription>
                    AI-generated investment strategy for {formData.coinSymbol}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Plan details would be rendered here */}
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      DCA plan generated successfully! Integration with MCP backend in progress.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-muted-foreground">DCA Plan Preview</CardTitle>
                  <CardDescription>
                    Your personalized investment plan will appear here
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-16">
                    <Calculator className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Fill in the form and click "Generate DCA Plan" to get started
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
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Target className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="font-semibold">Strategic Planning</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                AI analyzes market trends and your risk profile to create optimal DCA schedules
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Shield className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="font-semibold">Risk Management</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Automated risk assessment based on your tolerance and market volatility
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="font-semibold">Performance Tracking</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Monitor your DCA strategy performance with detailed analytics and insights
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
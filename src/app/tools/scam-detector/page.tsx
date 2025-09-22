'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, Users, Code, TrendingDown, ArrowLeft, Search } from 'lucide-react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { useToast } from '@/hooks/use-toast'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface ScamDetectionRequest {
  coinSymbol: string
  coinName?: string
  contractAddress?: string
  website?: string
  socialLinks?: {
    twitter?: string
    telegram?: string
    discord?: string
  }
  additionalInfo?: string
}

interface ScamDetectionResponse {
  success: boolean
  detection: any
  credits_remaining: number
  credits_used: number
  ai_analysis: string
}

export default function ScamDetector() {
  const [loading, setLoading] = useState(false)
  const [detection, setDetection] = useState<any>(null)
  const [formData, setFormData] = useState<ScamDetectionRequest>({
    coinSymbol: '',
    coinName: '',
    contractAddress: '',
    website: '',
    socialLinks: {
      twitter: '',
      telegram: '',
      discord: ''
    },
    additionalInfo: ''
  })

  const { user, profile } = useSupabaseAuth()
  const { toast } = useToast()

  const handleAnalyzeProject = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the Scam Detector.",
        variant: "destructive"
      })
      return
    }

    if (!formData.coinSymbol && !formData.contractAddress && !formData.website) {
      toast({
        title: "Missing Information",
        description: "Please provide at least a coin symbol, contract address, or website URL.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/tools/scam-detector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data: ScamDetectionResponse = await response.json()

      if (data.success) {
        setDetection(data.detection)
        toast({
          title: "Analysis Complete!",
          description: `Project analyzed successfully. ${data.credits_remaining} credits remaining.`
        })
      } else {
        throw new Error('Failed to analyze project')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze project. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

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
            <div className="p-3 rounded-lg bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20">
              <Shield className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-red-200 to-orange-200 bg-clip-text text-transparent">
                Scam Detector
              </h1>
              <p className="text-muted-foreground">
                AI-powered analysis to identify potentially fraudulent cryptocurrency projects
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
                  <Search className="h-5 w-5 text-red-400" />
                  Project Information
                </CardTitle>
                <CardDescription>
                  Provide details about the cryptocurrency project to analyze
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Project Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Coin Symbol</Label>
                    <Input
                      placeholder="BTC, ETH, SCAM, etc."
                      value={formData.coinSymbol}
                      onChange={(e) => setFormData(prev => ({ ...prev, coinSymbol: e.target.value.toUpperCase() }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Coin Name (Optional)</Label>
                    <Input
                      placeholder="Bitcoin, Ethereum, etc."
                      value={formData.coinName}
                      onChange={(e) => setFormData(prev => ({ ...prev, coinName: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Contract Address */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Smart Contract Address (Optional)
                  </Label>
                  <Input
                    placeholder="0x..."
                    value={formData.contractAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, contractAddress: e.target.value }))}
                  />
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Official Website (Optional)
                  </Label>
                  <Input
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Social Media Links (Optional)
                  </Label>

                  <div className="space-y-3 p-4 border rounded-lg border-border/40">
                    <div className="space-y-2">
                      <Label className="text-sm">Twitter/X</Label>
                      <Input
                        placeholder="https://twitter.com/username"
                        value={formData.socialLinks?.twitter || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Telegram</Label>
                      <Input
                        placeholder="https://t.me/username"
                        value={formData.socialLinks?.telegram || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, telegram: e.target.value }
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Discord</Label>
                      <Input
                        placeholder="https://discord.gg/invite"
                        value={formData.socialLinks?.discord || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, discord: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-2">
                  <Label>Additional Information (Optional)</Label>
                  <Textarea
                    placeholder="Any additional details, concerns, or context about this project..."
                    value={formData.additionalInfo}
                    onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleAnalyzeProject}
                  disabled={loading || (!formData.coinSymbol && !formData.contractAddress && !formData.website)}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                >
                  {loading ? (
                    <>Analyzing Project...</>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Analyze for Scams
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
            {detection ? (
              <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-400" />
                    Analysis Results
                  </CardTitle>
                  <CardDescription>
                    AI-powered scam detection for {formData.coinSymbol || 'project'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Analysis results would be rendered here */}
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Scam analysis completed successfully! Integration with MCP backend in progress.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-muted-foreground">Analysis Results</CardTitle>
                  <CardDescription>
                    Detailed scam detection results will appear here
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-16">
                    <Shield className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Provide project information and click "Analyze for Scams" to get started
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>

        {/* Warning Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="border-amber-500/40 bg-amber-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-300 mb-2">Important Disclaimer</h3>
                  <p className="text-sm text-amber-200/80 leading-relaxed">
                    This tool provides AI-powered analysis to help identify potential red flags in cryptocurrency projects.
                    However, it should not be considered as financial advice. Always conduct your own research (DYOR) and
                    consult with financial professionals before making investment decisions. The crypto space is highly volatile
                    and risky.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Information Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Eye className="h-5 w-5 text-red-400" />
                </div>
                <h3 className="font-semibold">Deep Analysis</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                AI examines multiple data points including contract code, social presence, and market behavior
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                </div>
                <h3 className="font-semibold">Red Flag Detection</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Identifies common scam patterns, suspicious code, and fraudulent marketing tactics
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="font-semibold">Risk Assessment</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Provides a comprehensive risk score and actionable recommendations for investors
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
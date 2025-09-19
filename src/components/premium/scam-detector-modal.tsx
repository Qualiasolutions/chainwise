'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, Users, Code, TrendingDown } from 'lucide-react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { useToast } from '@/hooks/use-toast'
import { Progress } from '@/components/ui/progress'

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

export function ScamDetector() {
  const [open, setOpen] = useState(false)
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

  const { user } = useSupabaseAuth()
  const { toast } = useToast()

  const handleInputChange = (field: keyof ScamDetectionRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSocialLinkChange = (platform: keyof ScamDetectionRequest['socialLinks'], value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }))
  }

  const analyzeProject = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to analyze crypto projects.',
        variant: 'destructive'
      })
      return
    }

    if (!formData.coinSymbol) {
      toast({
        title: 'Missing Information',
        description: 'Please provide at least the coin symbol.',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/tools/scam-detector', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data: ScamDetectionResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze project')
      }

      setDetection(data.detection)
      toast({
        title: 'Analysis Complete',
        description: `Project analyzed successfully. ${data.credits_used} credits used.`,
      })

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to analyze project',
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
      contractAddress: '',
      website: '',
      socialLinks: {
        twitter: '',
        telegram: '',
        discord: ''
      },
      additionalInfo: ''
    })
    setDetection(null)
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'safe': return 'text-green-600'
      case 'caution': return 'text-yellow-600'
      case 'high_risk': return 'text-orange-600'
      case 'scam': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'safe': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'caution': return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'high_risk': return <XCircle className="w-5 h-5 text-orange-600" />
      case 'scam': return <XCircle className="w-5 h-5 text-red-600" />
      default: return <Eye className="w-5 h-5 text-gray-600" />
    }
  }

  const getVerdictLabel = (verdict: string) => {
    switch (verdict) {
      case 'safe': return 'Safe'
      case 'caution': return 'Exercise Caution'
      case 'high_risk': return 'High Risk'
      case 'scam': return 'Likely Scam'
      default: return 'Unknown'
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Shield className="w-4 h-4 mr-2" />
          Scam & Risk Detector
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            AI Scam & Risk Detector
            <Badge variant="secondary">3 Credits</Badge>
          </DialogTitle>
          <DialogDescription>
            Analyze cryptocurrency projects for potential scam indicators and risk factors
          </DialogDescription>
        </DialogHeader>

        {!detection ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coinSymbol">Coin Symbol *</Label>
                <Input
                  id="coinSymbol"
                  placeholder="e.g., BTC, ETH, DOGE"
                  value={formData.coinSymbol}
                  onChange={(e) => handleInputChange('coinSymbol', e.target.value.toUpperCase())}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coinName">Coin Name</Label>
                <Input
                  id="coinName"
                  placeholder="e.g., Bitcoin, Ethereum"
                  value={formData.coinName}
                  onChange={(e) => handleInputChange('coinName', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractAddress">Contract Address</Label>
                <Input
                  id="contractAddress"
                  placeholder="0x..."
                  value={formData.contractAddress}
                  onChange={(e) => handleInputChange('contractAddress', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Official Website</Label>
                <Input
                  id="website"
                  placeholder="https://..."
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">Social Media Links (Optional)</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter/X</Label>
                  <Input
                    id="twitter"
                    placeholder="https://twitter.com/..."
                    value={formData.socialLinks?.twitter}
                    onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegram">Telegram</Label>
                  <Input
                    id="telegram"
                    placeholder="https://t.me/..."
                    value={formData.socialLinks?.telegram}
                    onChange={(e) => handleSocialLinkChange('telegram', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discord">Discord</Label>
                  <Input
                    id="discord"
                    placeholder="https://discord.gg/..."
                    value={formData.socialLinks?.discord}
                    onChange={(e) => handleSocialLinkChange('discord', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Any additional details about the project, team, or concerns..."
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={analyzeProject} disabled={loading}>
                {loading ? 'Analyzing...' : 'Analyze Project'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Risk Analysis for {formData.coinSymbol}</h3>
              <Button variant="outline" size="sm" onClick={resetForm}>
                Analyze Another Project
              </Button>
            </div>

            {/* Overall Verdict */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getVerdictIcon(detection.overall_verdict)}
                  Overall Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-xl font-bold ${getVerdictColor(detection.overall_verdict)}`}>
                      {getVerdictLabel(detection.overall_verdict)}
                    </span>
                    <Badge variant={detection.overall_verdict === 'safe' ? 'default' :
                                   detection.overall_verdict === 'caution' ? 'secondary' :
                                   'destructive'}>
                      Risk Score: {detection.risk_score}/100
                    </Badge>
                  </div>
                  <Progress value={detection.risk_score} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    {detection.risk_score <= 25 ? 'Very low risk - Project appears legitimate' :
                     detection.risk_score <= 50 ? 'Low to moderate risk - Minor concerns identified' :
                     detection.risk_score <= 75 ? 'High risk - Multiple red flags detected' :
                     'Very high risk - Strong scam indicators present'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Risk Factors */}
            {detection.risk_factors && detection.risk_factors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    Risk Factors Identified
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {detection.risk_factors.map((factor: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{factor}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Social Sentiment */}
            {detection.social_sentiment && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Social Sentiment Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {detection.social_sentiment.overall_sentiment && (
                      <div>
                        <p className="text-sm text-muted-foreground">Overall Sentiment</p>
                        <p className="font-semibold capitalize">{detection.social_sentiment.overall_sentiment}</p>
                      </div>
                    )}
                    {detection.social_sentiment.community_size && (
                      <div>
                        <p className="text-sm text-muted-foreground">Community Size</p>
                        <p className="font-semibold capitalize">{detection.social_sentiment.community_size}</p>
                      </div>
                    )}
                    {detection.social_sentiment.engagement_quality && (
                      <div>
                        <p className="text-sm text-muted-foreground">Engagement Quality</p>
                        <p className="font-semibold capitalize">{detection.social_sentiment.engagement_quality.replace('_', ' ')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Developer Activity */}
            {detection.developer_activity && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-purple-600" />
                    Developer Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {detection.developer_activity.github_activity && (
                      <div>
                        <p className="text-sm text-muted-foreground">GitHub Activity</p>
                        <p className="font-semibold capitalize">{detection.developer_activity.github_activity}</p>
                      </div>
                    )}
                    {detection.developer_activity.team_transparency && (
                      <div>
                        <p className="text-sm text-muted-foreground">Team Transparency</p>
                        <p className="font-semibold capitalize">{detection.developer_activity.team_transparency.replace('_', ' ')}</p>
                      </div>
                    )}
                    {detection.developer_activity.code_quality && (
                      <div>
                        <p className="text-sm text-muted-foreground">Code Quality</p>
                        <p className="font-semibold capitalize">{detection.developer_activity.code_quality.replace('_', ' ')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {detection.analysis_data?.recommendations && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-green-600" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {detection.analysis_data.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
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
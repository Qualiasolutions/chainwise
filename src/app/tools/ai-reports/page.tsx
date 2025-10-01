'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Calendar, CreditCard, Download, FileText, Clock, TrendingUp, Zap, Crown, Sparkles } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { RequireFeature } from '@/components/auth/RequireFeature'

interface AIReport {
  id: string
  report_type: 'weekly_pro' | 'monthly_elite' | 'deep_dive'
  report_title: string
  report_content: {
    title: string
    sections: Record<string, string>
    market_data: any
    generated_at: string
    word_count: number
    template_used: string
    user_tier: string
  }
  credits_used: number
  is_premium: boolean
  created_at: string
  expires_at?: string
}

interface ReportSubscription {
  id: string
  report_type: string
  is_active: boolean
  auto_generate: boolean
  email_delivery: boolean
  last_generated_at?: string
  next_due_at?: string
}

interface ReportTemplate {
  report_type: string
  template_name: string
  template_sections: {
    sections: Array<{
      id: string
      title: string
      priority: number
    }>
    word_limit: number
    tone: string
  }
}

export default function AIReportsPage() {
  const [reports, setReports] = useState<AIReport[]>([])
  const [subscriptions, setSubscriptions] = useState<ReportSubscription[]>([])
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [userTier, setUserTier] = useState<'free' | 'pro' | 'elite'>('free')
  const [creditsRemaining, setCreditsRemaining] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedReport, setSelectedReport] = useState<AIReport | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchReportsData()
  }, [])

  const fetchReportsData = async () => {
    try {
      const response = await fetch('/api/tools/ai-reports')
      const data = await response.json()

      if (data.success) {
        setReports(data.reports)
        setSubscriptions(data.subscriptions)
        setTemplates(data.templates)
        setUserTier(data.userTier)
        setCreditsRemaining(data.creditsRemaining)
      } else {
        toast.error('Failed to load reports data')
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast.error('Failed to load reports')
    } finally {
      setIsLoading(false)
    }
  }

  const generateReport = async (reportType: 'weekly_pro' | 'monthly_elite' | 'deep_dive', isPremium = false) => {
    if (isGenerating) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/tools/ai-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          isPremium,
          customParameters: {}
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('AI Report generated successfully!')
        setCreditsRemaining(data.creditsRemaining)
        await fetchReportsData() // Refresh the data
      } else {
        toast.error(data.error || 'Failed to generate report')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report')
    } finally {
      setIsGenerating(false)
    }
  }

  const updateSubscription = async (reportType: 'weekly_pro' | 'monthly_elite', isActive: boolean) => {
    try {
      const response = await fetch('/api/tools/ai-reports/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          isActive,
          autoGenerate: true,
          emailDelivery: true
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        await fetchReportsData()
      } else {
        toast.error(data.error || 'Failed to update subscription')
      }
    } catch (error) {
      console.error('Error updating subscription:', error)
      toast.error('Failed to update subscription')
    }
  }

  const getSubscription = (reportType: string) => {
    return subscriptions.find(sub => sub.report_type === reportType)
  }

  const getReportIcon = (reportType: string) => {
    switch (reportType) {
      case 'weekly_pro':
        return <TrendingUp className="h-5 w-5" />
      case 'monthly_elite':
        return <Crown className="h-5 w-5" />
      case 'deep_dive':
        return <Zap className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getReportTypeLabel = (reportType: string) => {
    switch (reportType) {
      case 'weekly_pro':
        return 'Weekly Pro Report'
      case 'monthly_elite':
        return 'Monthly Elite Report'
      case 'deep_dive':
        return 'Deep Dive Report'
      default:
        return 'AI Report'
    }
  }

  const canAccessReport = (reportType: string) => {
    const tierLevels = { free: 0, pro: 1, elite: 2 }
    const userLevel = tierLevels[userTier]

    switch (reportType) {
      case 'weekly_pro':
        return userLevel >= 1
      case 'monthly_elite':
        return userLevel >= 2
      case 'deep_dive':
        return userLevel >= 1
      default:
        return true
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <RequireFeature feature="ai_reports">
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Reports</h1>
          <p className="text-muted-foreground mt-1">
            Get AI-powered market insights and analysis reports
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
        </div>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate Reports</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        {/* Generate Reports Tab */}
        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Weekly Pro Report */}
            <Card className="relative">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg">Weekly Pro Report</CardTitle>
                  </div>
                  <Badge variant="secondary">Pro+</Badge>
                </div>
                <CardDescription>
                  Weekly market insights with practical investment guidance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div>• Market overview & narratives</div>
                  <div>• Top 3 coins performance</div>
                  <div>• Portfolio optimization tips</div>
                  <div>• Weekly alerts recap</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">~800 words</span>
                  <span className="font-medium text-blue-600">
                    {userTier === 'pro' || userTier === 'elite' ? 'Included' : '5 Credits'}
                  </span>
                </div>
                <Button
                  onClick={() => generateReport('weekly_pro')}
                  disabled={!canAccessReport('weekly_pro') || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
                {!canAccessReport('weekly_pro') && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Requires Pro tier. <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/pricing')}>Upgrade now</Button>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Monthly Elite Report */}
            <Card className="relative">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-purple-500" />
                    <CardTitle className="text-lg">Monthly Elite Report</CardTitle>
                  </div>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">Elite</Badge>
                </div>
                <CardDescription>
                  Comprehensive monthly deep analysis for advanced traders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div>• Advanced narrative detection</div>
                  <div>• Technical & on-chain analysis</div>
                  <div>• Whale activity monitoring</div>
                  <div>• Stress test scenarios</div>
                  <div>• Elite-only recommendations</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">~1500 words</span>
                  <span className="font-medium text-purple-600">
                    {userTier === 'elite' ? 'Included' : '10 Credits'}
                  </span>
                </div>
                <Button
                  onClick={() => generateReport('monthly_elite')}
                  disabled={!canAccessReport('monthly_elite') || isGenerating}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isGenerating ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Crown className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
                {!canAccessReport('monthly_elite') && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Requires Elite tier. <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/pricing')}>Upgrade now</Button>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Deep Dive Report */}
            <Card className="relative">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-orange-500" />
                    <CardTitle className="text-lg">Deep Dive Report</CardTitle>
                  </div>
                  <Badge variant="outline">10 Credits</Badge>
                </div>
                <CardDescription>
                  Custom analytical report on specific market conditions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div>• Executive summary</div>
                  <div>• Detailed technical analysis</div>
                  <div>• Comprehensive risk assessment</div>
                  <div>• Actionable recommendations</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">~1000 words</span>
                  <span className="font-medium text-orange-600">10 Credits</span>
                </div>
                <Button
                  onClick={() => generateReport('deep_dive')}
                  disabled={!canAccessReport('deep_dive') || isGenerating || creditsRemaining < 10}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  variant={creditsRemaining < 10 ? "outline" : "default"}
                >
                  {isGenerating ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
                {!canAccessReport('deep_dive') && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Requires Pro tier or higher. <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/pricing')}>Upgrade now</Button>
                    </AlertDescription>
                  </Alert>
                )}
                {canAccessReport('deep_dive') && creditsRemaining < 10 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Insufficient credits. <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/settings/billing')}>Buy credits</Button>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Subscriptions</CardTitle>
              <CardDescription>
                Manage your automatic report generation preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Weekly Pro Subscription */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Weekly Pro Reports</span>
                    <Badge variant="secondary" className="text-xs">Pro+</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automatic weekly reports every Sunday
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {getSubscription('weekly_pro')?.next_due_at && (
                    <div className="text-sm text-muted-foreground">
                      Next: {new Date(getSubscription('weekly_pro')!.next_due_at!).toLocaleDateString()}
                    </div>
                  )}
                  <Switch
                    checked={getSubscription('weekly_pro')?.is_active || false}
                    onCheckedChange={(checked) => updateSubscription('weekly_pro', checked)}
                    disabled={!canAccessReport('weekly_pro')}
                  />
                </div>
              </div>

              {/* Monthly Elite Subscription */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">Monthly Elite Reports</span>
                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">Elite</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive monthly reports on the 1st
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {getSubscription('monthly_elite')?.next_due_at && (
                    <div className="text-sm text-muted-foreground">
                      Next: {new Date(getSubscription('monthly_elite')!.next_due_at!).toLocaleDateString()}
                    </div>
                  )}
                  <Switch
                    checked={getSubscription('monthly_elite')?.is_active || false}
                    onCheckedChange={(checked) => updateSubscription('monthly_elite', checked)}
                    disabled={!canAccessReport('monthly_elite')}
                  />
                </div>
              </div>

              {(userTier === 'free') && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Automatic report subscriptions are available with Pro and Elite tiers.
                    <Button variant="link" className="p-0 h-auto ml-1" onClick={() => router.push('/pricing')}>
                      Upgrade your plan
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
              <CardDescription>
                Your previously generated AI reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reports.length > 0 ? (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="flex items-center gap-3">
                        {getReportIcon(report.report_type)}
                        <div>
                          <div className="font-medium">{report.report_title}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>{new Date(report.created_at).toLocaleDateString()}</span>
                            <Separator orientation="vertical" className="h-4" />
                            <span>{report.report_content.word_count} words</span>
                            {report.credits_used > 0 && (
                              <>
                                <Separator orientation="vertical" className="h-4" />
                                <span>{report.credits_used} credits</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {report.is_premium && (
                          <Badge variant="outline" className="text-xs">Premium</Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <div className="text-lg font-medium mb-2">No reports yet</div>
                  <div className="text-muted-foreground mb-4">Generate your first AI report to get started</div>
                  <Button onClick={() => document.querySelector('[value="generate"]')?.click()}>
                    Generate Report
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getReportIcon(selectedReport.report_type)}
                  <CardTitle>{selectedReport.report_title}</CardTitle>
                </div>
                <Button variant="ghost" onClick={() => setSelectedReport(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[70vh] p-6">
              <div className="prose dark:prose-invert max-w-none">
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <span className="font-medium">Generated:</span> {new Date(selectedReport.created_at).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Word Count:</span> {selectedReport.report_content.word_count}
                  </div>
                  <div>
                    <span className="font-medium">Template:</span> {selectedReport.report_content.template_used}
                  </div>
                  <div>
                    <span className="font-medium">Credits Used:</span> {selectedReport.credits_used}
                  </div>
                </div>

                <Separator className="my-6" />

                {Object.entries(selectedReport.report_content.sections).map(([key, content]) => (
                  <div key={key} className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 capitalize">
                      {key.replace(/_/g, ' ')}
                    </h3>
                    <div className="text-muted-foreground leading-relaxed">
                      {content}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
    </RequireFeature>
  )
}
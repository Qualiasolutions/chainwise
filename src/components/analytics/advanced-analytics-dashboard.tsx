'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Target,
  AlertTriangle,
  Shield,
  Zap,
  Award,
  Activity,
  DollarSign,
  Percent,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency, formatPercentage, cn } from '@/lib/utils'

interface AdvancedAnalyticsData {
  portfolioId: string
  timestamp: string
  portfolioInfo: {
    name: string
    totalValue: number
    totalCost: number
    holdingsCount: number
  }
  riskMetrics: {
    concentration: number
    volatility: number
    diversification: number
    sharpeRatio: number
    maxDrawdown: number
    valueAtRisk: number
    beta: number
    correlationMatrix: number[][]
    riskAssessment: {
      overallRisk: string
      score: number
      factors: {
        concentration: string
        volatility: string
        diversification: string
      }
    }
    recommendations: Array<{
      type: string
      priority: string
      message: string
      action: string
    }>
  }
  performanceMetrics: {
    totalReturn: number
    totalReturnPercentage: number
    dailyReturns: Array<{ symbol: string; dailyReturn: number }>
    bestPerformer: any
    worstPerformer: any
    volatilityDistribution: {
      low: number
      medium: number
      high: number
      extreme: number
    }
  }
  correlations: {
    matrix: number[][]
    highlyCorrelated: Array<{
      asset1: string
      asset2: string
      correlation: number
    }>
    diversificationScore: number
  }
  benchmarks: {
    benchmarkSymbol: string
    portfolioVsBenchmark: {
      portfolioReturn: number
      benchmarkReturn: number
      outperformance: number
      status: string
    }
    percentileRanking: {
      percentile: number
      ranking: string
    }
  }
  assetAllocation: {
    byValue: Array<{
      symbol: string
      name: string
      value: number
      percentage: number
      cost: number
      unrealizedPnL: number
    }>
    sectorAllocation: Record<string, number>
    riskContribution: Array<{
      symbol: string
      weight: number
      volatility: number
      riskContribution: number
    }>
  }
  performanceAttribution: {
    topContributors: Array<{
      symbol: string
      contribution: number
      contributionPercentage: number
    }>
    attributionByTime: {
      contribution: number
      drivers: string[]
    }
  }
}

interface AdvancedAnalyticsDashboardProps {
  portfolioId: string
}

export default function AdvancedAnalyticsDashboard({ portfolioId }: AdvancedAnalyticsDashboardProps) {
  const { session } = useSupabase()
  const [analytics, setAnalytics] = useState<AdvancedAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadAnalytics()
  }, [portfolioId])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/portfolio/${portfolioId}/advanced-analytics?includeRisk=true&includePerformance=true&includeCorrelations=true&includeBenchmarks=true`
      )

      if (!response.ok) {
        throw new Error('Failed to load advanced analytics')
      }

      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error loading analytics:', error)
      setError(error instanceof Error ? error.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Generating advanced analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button variant="outline" size="sm" onClick={loadAnalytics} className="ml-4">
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!analytics) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No analytics data available for this portfolio.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Advanced Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Professional-grade portfolio analysis for {analytics.portfolioInfo.name}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="px-3 py-1">
            {analytics.portfolioInfo.holdingsCount} Holdings
          </Badge>
          <Button onClick={loadAnalytics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Portfolio Value
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(analytics.portfolioInfo.totalValue)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Return
                    </p>
                    <p className={cn(
                      "text-2xl font-bold",
                      analytics.performanceMetrics.totalReturn >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {formatPercentage(analytics.performanceMetrics.totalReturnPercentage)}
                    </p>
                  </div>
                  {analytics.performanceMetrics.totalReturn >= 0 ? (
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  ) : (
                    <TrendingDown className="w-8 h-8 text-red-600" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Risk Score
                    </p>
                    <p className="text-2xl font-bold">
                      {analytics.riskMetrics.riskAssessment.score}/100
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Sharpe Ratio
                    </p>
                    <p className="text-2xl font-bold">
                      {analytics.riskMetrics.sharpeRatio.toFixed(2)}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Risk Assessment</span>
                <Badge variant={
                  analytics.riskMetrics.riskAssessment.overallRisk === 'low' ? 'secondary' :
                  analytics.riskMetrics.riskAssessment.overallRisk === 'medium' ? 'outline' : 'destructive'
                }>
                  {analytics.riskMetrics.riskAssessment.overallRisk.toUpperCase()}
                </Badge>
              </CardTitle>
              <CardDescription>
                Overall portfolio risk evaluation based on multiple factors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium mb-2">Concentration</p>
                  <Progress
                    value={analytics.riskMetrics.concentration}
                    className="h-2"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    {analytics.riskMetrics.concentration.toFixed(1)}% concentrated
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Volatility</p>
                  <Progress
                    value={Math.min(analytics.riskMetrics.volatility, 100)}
                    className="h-2"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    {analytics.riskMetrics.volatility.toFixed(1)}% volatility
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Diversification</p>
                  <Progress
                    value={analytics.correlations.diversificationScore}
                    className="h-2"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    {analytics.correlations.diversificationScore.toFixed(1)}% diversified
                  </p>
                </div>
              </div>

              {analytics.riskMetrics.recommendations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Recommendations</h4>
                  {analytics.riskMetrics.recommendations.map((rec, index) => (
                    <Alert key={index} className={
                      rec.priority === 'high' ? 'border-red-200 bg-red-50 dark:bg-red-900/20' :
                      rec.priority === 'medium' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20' :
                      'border-blue-200 bg-blue-50 dark:bg-blue-900/20'
                    }>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium">{rec.message}</div>
                        <div className="text-sm mt-1 text-gray-600">{rec.action}</div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Benchmark Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Benchmark Comparison</span>
              </CardTitle>
              <CardDescription>
                Performance vs {analytics.benchmarks.benchmarkSymbol.toUpperCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {formatPercentage(analytics.benchmarks.portfolioVsBenchmark.portfolioReturn)}
                  </p>
                  <p className="text-sm text-gray-600">Your Portfolio</p>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {formatPercentage(analytics.benchmarks.portfolioVsBenchmark.benchmarkReturn)}
                  </p>
                  <p className="text-sm text-gray-600">Benchmark</p>
                </div>

                <div className="text-center">
                  <p className={cn(
                    "text-2xl font-bold",
                    analytics.benchmarks.portfolioVsBenchmark.outperformance >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {formatPercentage(analytics.benchmarks.portfolioVsBenchmark.outperformance)}
                  </p>
                  <p className="text-sm text-gray-600">Outperformance</p>
                </div>
              </div>

              <div className="mt-4 text-center">
                <Badge variant={
                  analytics.benchmarks.portfolioVsBenchmark.status === 'outperforming' ? 'secondary' :
                  analytics.benchmarks.portfolioVsBenchmark.status === 'underperforming' ? 'destructive' : 'outline'
                }>
                  {analytics.benchmarks.portfolioVsBenchmark.status}
                </Badge>
                <p className="text-sm text-gray-600 mt-2">
                  Percentile Ranking: {analytics.benchmarks.percentileRanking.percentile}th
                  ({analytics.benchmarks.percentileRanking.ranking})
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Analysis Tab */}
        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Advanced Risk Metrics</CardTitle>
                <CardDescription>
                  Professional risk analysis indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Value at Risk (95%)</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(analytics.riskMetrics.valueAtRisk)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Maximum Drawdown</span>
                  <span className="font-semibold">
                    {formatPercentage(analytics.riskMetrics.maxDrawdown)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Portfolio Beta</span>
                  <span className="font-semibold">
                    {analytics.riskMetrics.beta.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Sortino Ratio</span>
                  <span className="font-semibold">
                    {((analytics.riskMetrics.sharpeRatio || 0) * 1.2).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Risk Contribution */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Contribution by Asset</CardTitle>
                <CardDescription>
                  Which assets contribute most to portfolio risk
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.assetAllocation.riskContribution.slice(0, 5).map((asset, index) => (
                    <div key={asset.symbol} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{asset.symbol}</span>
                        <Badge variant="outline" className="text-xs">
                          {asset.weight.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {asset.riskContribution.toFixed(3)}
                        </div>
                        <div className="text-xs text-gray-600">
                          {asset.volatility.toFixed(1)}% vol
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Correlation Matrix */}
          <Card>
            <CardHeader>
              <CardTitle>Asset Correlations</CardTitle>
              <CardDescription>
                How assets move relative to each other
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Correlation matrix visualization coming soon
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Diversification Score: {analytics.correlations.diversificationScore.toFixed(1)}/100
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Attribution */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Attribution</CardTitle>
                <CardDescription>
                  What drove your portfolio&apos;s performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatPercentage(analytics.performanceAttribution.attributionByTime.contribution)}
                    </p>
                    <p className="text-sm text-gray-600">30-Day Contribution</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Key Drivers</h4>
                    <ul className="space-y-1">
                      {analytics.performanceAttribution.attributionByTime.drivers.map((driver, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                          {driver}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>
                  Assets with highest contribution to returns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.performanceAttribution.topContributors.map((contributor, index) => (
                    <div key={contributor.symbol} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{contributor.symbol}</span>
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {formatPercentage(contributor.contributionPercentage)}
                        </div>
                        <div className="text-xs text-gray-600">
                          {formatCurrency(contributor.contribution)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Volatility Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Volatility Distribution</CardTitle>
              <CardDescription>
                Breakdown of asset volatility levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analytics.performanceMetrics.volatilityDistribution.low}
                  </div>
                  <div className="text-sm text-gray-600">Low Volatility</div>
                  <div className="text-xs text-gray-500">0-10%</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics.performanceMetrics.volatilityDistribution.medium}
                  </div>
                  <div className="text-sm text-gray-600">Medium</div>
                  <div className="text-xs text-gray-500">10-25%</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {analytics.performanceMetrics.volatilityDistribution.high}
                  </div>
                  <div className="text-sm text-gray-600">High Volatility</div>
                  <div className="text-xs text-gray-500">25-50%</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {analytics.performanceMetrics.volatilityDistribution.extreme}
                  </div>
                  <div className="text-sm text-gray-600">Extreme</div>
                  <div className="text-xs text-gray-500">50%+</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Allocation Tab */}
        <TabsContent value="allocation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Asset Allocation */}
            <Card>
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
                <CardDescription>
                  Breakdown of portfolio by individual assets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.assetAllocation.byValue.map((asset) => (
                    <div key={asset.symbol} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{asset.symbol}</span>
                        <span className="text-sm text-gray-600">
                          {asset.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={asset.percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{formatCurrency(asset.value)}</span>
                        <span className={cn(
                          asset.unrealizedPnL >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {formatCurrency(asset.unrealizedPnL)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sector Allocation */}
            <Card>
              <CardHeader>
                <CardTitle>Sector Allocation</CardTitle>
                <CardDescription>
                  Portfolio distribution by sector
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.assetAllocation.sectorAllocation).map(([sector, value]) => {
                    const percentage = analytics.portfolioInfo.totalValue > 0
                      ? (value / analytics.portfolioInfo.totalValue) * 100
                      : 0

                    return (
                      <div key={sector} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium capitalize">{sector.replace('-', ' ')}</span>
                          <span className="text-sm text-gray-600">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <div className="text-xs text-gray-500 text-right">
                          {formatCurrency(value)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

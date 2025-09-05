import { Suspense } from 'react'
import AdvancedAnalyticsDashboard from '@/components/analytics/advanced-analytics-dashboard'
import RiskGauge from '@/components/analytics/risk-gauge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TrendingUp, BarChart3, Shield } from 'lucide-react'
import Link from 'next/link'

interface PortfolioAnalyticsPageProps {
  params: {
    id: string
  }
}

export default function PortfolioAnalyticsPage({ params }: PortfolioAnalyticsPageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href={`/portfolio/${params.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portfolio
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Portfolio Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Advanced analytics and risk assessment
          </p>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Performance
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  Advanced
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Risk Analysis
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  Professional
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Risk Metrics
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  Institutional
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Dashboard */}
      <Suspense fallback={
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading advanced analytics...
            </p>
          </CardContent>
        </Card>
      }>
        <AdvancedAnalyticsDashboard portfolioId={params.id} />
      </Suspense>

      {/* Pro Features Notice */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">
            Professional Analytics
          </CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            These advanced analytics provide institutional-grade insights including risk-adjusted returns,
            correlation analysis, and performance attribution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Sharpe Ratio</Badge>
            <Badge variant="secondary">Value at Risk</Badge>
            <Badge variant="secondary">Correlation Matrix</Badge>
            <Badge variant="secondary">Performance Attribution</Badge>
            <Badge variant="secondary">Risk Contribution</Badge>
            <Badge variant="secondary">Benchmark Comparison</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Metadata for SEO
export async function generateMetadata({ params }: PortfolioAnalyticsPageProps) {
  return {
    title: 'Portfolio Analytics | ChainWise',
    description: 'Advanced portfolio analytics with risk assessment, performance attribution, and professional-grade metrics.',
  }
}

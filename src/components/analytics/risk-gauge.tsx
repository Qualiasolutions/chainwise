'use client'

import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RiskGaugeProps {
  riskScore: number // 0-100
  riskLevel: 'low' | 'medium' | 'high'
  factors: {
    concentration: string
    volatility: string
    diversification: string
  }
}

export default function RiskGauge({ riskScore, riskLevel, factors }: RiskGaugeProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'medium': return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'high': return <AlertTriangle className="w-5 h-5 text-red-600" />
      default: return <Shield className="w-5 h-5 text-gray-600" />
    }
  }

  const getRiskDescription = (level: string) => {
    switch (level) {
      case 'low': return 'Conservative approach with strong risk management'
      case 'medium': return 'Balanced risk profile with moderate volatility'
      case 'high': return 'Aggressive strategy with higher volatility'
      default: return 'Risk assessment in progress'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getRiskIcon(riskLevel)}
          <span>Portfolio Risk Assessment</span>
        </CardTitle>
        <CardDescription>
          {getRiskDescription(riskLevel)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Risk Score */}
        <div className="text-center">
          <div className={cn(
            "text-4xl font-bold mb-2",
            getRiskColor(riskLevel)
          )}>
            {riskScore}/100
          </div>
          <div className="text-sm text-gray-600 mb-4">
            Overall Risk Score
          </div>
          <Progress
            value={riskScore}
            className="h-3"
          />
        </div>

        {/* Risk Factors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold mb-1">
              {factors.concentration}
            </div>
            <div className="text-sm text-gray-600">Concentration</div>
          </div>

          <div className="text-center">
            <div className="text-lg font-semibold mb-1">
              {factors.volatility}
            </div>
            <div className="text-sm text-gray-600">Volatility</div>
          </div>

          <div className="text-center">
            <div className="text-lg font-semibold mb-1">
              {factors.diversification}
            </div>
            <div className="text-sm text-gray-600">Diversification</div>
          </div>
        </div>

        {/* Risk Level Indicator */}
        <div className="flex justify-center">
          <div className={cn(
            "px-4 py-2 rounded-full text-sm font-medium",
            riskLevel === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          )}>
            {riskLevel.toUpperCase()} RISK
          </div>
        </div>

        {/* Recommendations */}
        {riskLevel === 'high' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <div className="font-medium text-red-900 dark:text-red-100">
                  High Risk Alert
                </div>
                <div className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Consider reducing concentration, adding stable assets, or implementing stop-loss orders.
                </div>
              </div>
            </div>
          </div>
        )}

        {riskLevel === 'low' && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium text-green-900 dark:text-green-100">
                  Strong Risk Management
                </div>
                <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Your portfolio demonstrates excellent risk management practices.
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

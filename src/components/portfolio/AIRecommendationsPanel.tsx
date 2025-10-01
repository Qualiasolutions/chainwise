"use client"

import { useEffect, useState } from 'react'
import { DataCard } from '@/components/ui/professional-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Brain,
  Shield,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Lightbulb
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface RiskAnalysis {
  overallRisk: string
  riskScore: number
  concentrationRisk: number
  avgVolatility: number
  diversificationScore: number
  valueAtRisk: number
  recommendations: string[]
}

interface Props {
  portfolioId: string | null
}

export function AIRecommendationsPanel({ portfolioId }: Props) {
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchRiskAnalysis = async () => {
    if (!portfolioId) {
      setLoading(false)
      return
    }

    try {
      setRefreshing(true)
      const response = await fetch(`/api/portfolio/${portfolioId}/risk-analysis`)
      const data = await response.json()
      if (data.riskAnalysis) {
        setRiskAnalysis(data.riskAnalysis)
      }
    } catch (error) {
      console.error('Failed to fetch risk analysis:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchRiskAnalysis()
  }, [portfolioId])

  if (loading) {
    return (
      <DataCard>
        <div className="p-6 space-y-4">
          <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
          <div className="h-24 bg-muted rounded animate-pulse"></div>
          <div className="h-24 bg-muted rounded animate-pulse"></div>
        </div>
      </DataCard>
    )
  }

  if (!riskAnalysis) {
    return (
      <DataCard>
        <div className="p-6 text-center text-muted-foreground">
          <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No AI recommendations available</p>
        </div>
      </DataCard>
    )
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'text-red-600 dark:text-red-400'
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400'
      default:
        return 'text-green-600 dark:text-green-400'
    }
  }

  const getRiskBg = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30'
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30'
      default:
        return 'bg-green-100 dark:bg-green-900/30'
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high':
        return <AlertCircle className="h-5 w-5" />
      case 'medium':
        return <Shield className="h-5 w-5" />
      default:
        return <TrendingUp className="h-5 w-5" />
    }
  }

  return (
    <DataCard>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              AI Recommendations
            </h3>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={fetchRiskAnalysis}
            disabled={refreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </Button>
        </div>

        {/* Risk Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-4 rounded-lg border",
            riskAnalysis.overallRisk === 'high'
              ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30'
              : riskAnalysis.overallRisk === 'medium'
              ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30'
              : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30'
          )}
        >
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-lg", getRiskBg(riskAnalysis.overallRisk))}>
              <div className={getRiskColor(riskAnalysis.overallRisk)}>
                {getRiskIcon(riskAnalysis.overallRisk)}
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Overall Risk: <span className={cn("capitalize", getRiskColor(riskAnalysis.overallRisk))}>
                  {riskAnalysis.overallRisk}
                </span>
              </h4>
              <p className="text-xs text-muted-foreground">
                Risk Score: {riskAnalysis.riskScore}/100
              </p>
            </div>
          </div>
        </motion.div>

        {/* Risk Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
          >
            <p className="text-xs text-muted-foreground mb-1">Concentration Risk</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {riskAnalysis.concentrationRisk.toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Max allocation
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
          >
            <p className="text-xs text-muted-foreground mb-1">Avg Volatility</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {riskAnalysis.avgVolatility.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Price movement
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
          >
            <p className="text-xs text-muted-foreground mb-1">Diversification</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {riskAnalysis.diversificationScore}/100
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {riskAnalysis.diversificationScore >= 70 ? 'Well diversified' : 'Needs improvement'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
          >
            <p className="text-xs text-muted-foreground mb-1">Value at Risk</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
              ${riskAnalysis.valueAtRisk.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              95% confidence
            </p>
          </motion.div>
        </div>

        {/* Recommendations */}
        {riskAnalysis.recommendations.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Actionable Recommendations
                </h4>
              </div>
              <div className="space-y-2">
                {riskAnalysis.recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="flex items-start gap-2 p-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30"
                  >
                    <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-900 dark:text-slate-100 flex-1">
                      {rec}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* AI Badge */}
        <div className="pt-2">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Brain className="h-3 w-3 mr-1" />
              AI-Powered Analysis
            </Badge>
          </div>
        </div>
      </div>
    </DataCard>
  )
}

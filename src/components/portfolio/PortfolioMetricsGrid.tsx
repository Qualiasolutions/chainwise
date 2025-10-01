"use client"

import { useEffect, useState } from "react"
import { MetricsCard } from "@/components/ui/professional-card"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Shield,
  Target,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatPrice, formatPercentage } from "@/lib/crypto-api"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface PortfolioMetrics {
  totalValue: number
  totalCost: number
  totalPnL: number
  totalPnLPercentage: number
  healthScore: number
  diversificationScore: number
  riskScore: number
  volatility: number
  bestPerformer: { symbol: string; name: string; pnlPercentage: number } | null
  worstPerformer: { symbol: string; name: string; pnlPercentage: number } | null
  unrealizedGains: number
  realizedGains: number
  holdingsCount: number
}

interface Props {
  portfolioId: string | null
  onMetricsLoaded?: (metrics: PortfolioMetrics) => void
}

export function PortfolioMetricsGrid({ portfolioId, onMetricsLoaded }: Props) {
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!portfolioId) {
      setLoading(false)
      return
    }

    const fetchMetrics = async () => {
      try {
        const response = await fetch(`/api/portfolio/${portfolioId}/metrics`)
        const data = await response.json()
        if (data.metrics) {
          setMetrics(data.metrics)
          if (onMetricsLoaded) {
            onMetricsLoaded(data.metrics)
          }
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [portfolioId, onMetricsLoaded])

  if (loading || !metrics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <MetricsCard key={i} className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-muted rounded w-3/4"></div>
          </MetricsCard>
        ))}
      </div>
    )
  }

  const getHealthColor = (score: number) => {
    if (score >= 75) return 'text-green-600 dark:text-green-400'
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getHealthBgColor = (score: number) => {
    if (score >= 75) return 'bg-green-100 dark:bg-green-900/30'
    if (score >= 50) return 'bg-yellow-100 dark:bg-yellow-900/30'
    return 'bg-red-100 dark:bg-red-900/30'
  }

  const getRiskColor = (score: number) => {
    if (score >= 60) return 'text-red-600 dark:text-red-400'
    if (score >= 35) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  const getRiskLabel = (score: number) => {
    if (score >= 60) return 'High Risk'
    if (score >= 35) return 'Medium Risk'
    return 'Low Risk'
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Value */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <MetricsCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-sm bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <DollarSign className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Portfolio Value</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {formatPrice(metrics.totalValue)}
            </div>
            <div className="flex items-center text-xs">
              {metrics.totalPnL >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              <span className={metrics.totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                {formatPercentage(metrics.totalPnLPercentage)}
              </span>
            </div>
          </div>
        </MetricsCard>
      </motion.div>

      {/* Total P&L */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <MetricsCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded-sm flex items-center justify-center ${metrics.totalPnL >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                {metrics.totalPnL >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                )}
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Total P&L</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className={`text-xl font-bold ${metrics.totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {metrics.totalPnL >= 0 ? '+' : ''}{formatPrice(metrics.totalPnL)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Cost basis: {formatPrice(metrics.totalCost)}
            </div>
          </div>
        </MetricsCard>
      </motion.div>

      {/* Portfolio Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <MetricsCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded-sm flex items-center justify-center ${getHealthBgColor(metrics.healthScore)}`}>
                {metrics.healthScore >= 75 ? (
                  <CheckCircle2 className={`h-3 w-3 ${getHealthColor(metrics.healthScore)}`} />
                ) : metrics.healthScore >= 50 ? (
                  <Activity className={`h-3 w-3 ${getHealthColor(metrics.healthScore)}`} />
                ) : (
                  <AlertTriangle className={`h-3 w-3 ${getHealthColor(metrics.healthScore)}`} />
                )}
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Health Score</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className={`text-xl font-bold ${getHealthColor(metrics.healthScore)}`}>
              {metrics.healthScore}/100
            </div>
            <Progress value={metrics.healthScore} className="h-2" />
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {metrics.healthScore >= 75 ? 'Excellent' : metrics.healthScore >= 50 ? 'Good' : 'Needs Attention'}
            </div>
          </div>
        </MetricsCard>
      </motion.div>

      {/* Risk Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <MetricsCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-sm bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Shield className="h-3 w-3 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Risk Level</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {metrics.riskScore}/100
            </div>
            <Badge variant="outline" className={cn("text-xs", getRiskColor(metrics.riskScore))}>
              {getRiskLabel(metrics.riskScore)}
            </Badge>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Volatility: {metrics.volatility != null ? metrics.volatility.toFixed(1) : '0.0'}%
            </div>
          </div>
        </MetricsCard>
      </motion.div>

      {/* Best Performer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <MetricsCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-sm bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Top Performer</span>
            </div>
          </div>
          <div className="space-y-1">
            {metrics.bestPerformer ? (
              <>
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {metrics.bestPerformer.symbol}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  {formatPercentage(metrics.bestPerformer.pnlPercentage)}
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-500 dark:text-slate-400">No data</div>
            )}
          </div>
        </MetricsCard>
      </motion.div>

      {/* Worst Performer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <MetricsCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-sm bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Worst Performer</span>
            </div>
          </div>
          <div className="space-y-1">
            {metrics.worstPerformer ? (
              <>
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {metrics.worstPerformer.symbol}
                </div>
                <div className="text-xs text-red-600 dark:text-red-400">
                  {formatPercentage(metrics.worstPerformer.pnlPercentage)}
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-500 dark:text-slate-400">No data</div>
            )}
          </div>
        </MetricsCard>
      </motion.div>

      {/* Diversification */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <MetricsCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-sm bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Target className="h-3 w-3 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Diversification</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {metrics.diversificationScore}/100
            </div>
            <Progress value={metrics.diversificationScore} className="h-2" />
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {metrics.holdingsCount} holdings
            </div>
          </div>
        </MetricsCard>
      </motion.div>

      {/* Unrealized Gains */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <MetricsCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-sm bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                <Zap className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Unrealized Gains</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className={`text-xl font-bold ${metrics.unrealizedGains >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {metrics.unrealizedGains >= 0 ? '+' : ''}{formatPrice(metrics.unrealizedGains)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Not yet realized
            </div>
          </div>
        </MetricsCard>
      </motion.div>
    </div>
  )
}

"use client"

import { useEffect, useState } from 'react'
import { DataCard } from '@/components/ui/professional-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Target,
  Lightbulb,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { formatPrice } from '@/lib/crypto-api'

interface Insight {
  type: string
  priority?: string
  severity?: string
  symbol?: string
  message: string
  action?: string
  potentialGain?: number
}

interface MarketInsights {
  fearGreedIndex: number | null
  fearGreedLabel: string | null
  marketSentiment: string
  marketCapChange24h: number
  recommendations: Insight[]
  opportunities: Insight[]
  warnings: Insight[]
  lastUpdated: string
}

interface Props {
  portfolioId: string | null
}

export function MarketInsightsWidget({ portfolioId }: Props) {
  const [insights, setInsights] = useState<MarketInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchInsights = async () => {
    if (!portfolioId) {
      setLoading(false)
      return
    }

    try {
      setRefreshing(true)
      const response = await fetch(`/api/portfolio/${portfolioId}/insights`)
      const data = await response.json()
      if (data.insights) {
        setInsights(data.insights)
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [portfolioId])

  if (loading) {
    return (
      <DataCard>
        <div className="p-6 space-y-4">
          <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
          <div className="h-20 bg-muted rounded animate-pulse"></div>
          <div className="h-20 bg-muted rounded animate-pulse"></div>
        </div>
      </DataCard>
    )
  }

  if (!insights) {
    return (
      <DataCard>
        <div className="p-6 text-center text-muted-foreground">
          <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No insights available</p>
        </div>
      </DataCard>
    )
  }

  const getFearGreedColor = (index: number | null) => {
    if (!index) return 'text-slate-600 dark:text-slate-400'
    if (index > 75) return 'text-red-600 dark:text-red-400'
    if (index > 55) return 'text-orange-600 dark:text-orange-400'
    if (index > 45) return 'text-blue-600 dark:text-blue-400'
    if (index > 25) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'bearish':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Target className="h-4 w-4 text-blue-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30'
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30'
      default:
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30'
      case 'medium':
        return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30'
      default:
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30'
    }
  }

  return (
    <DataCard>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Market Insights
            </h3>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={fetchInsights}
            disabled={refreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </Button>
        </div>

        {/* Fear & Greed Index + Market Sentiment */}
        <div className="grid grid-cols-2 gap-4">
          {insights.fearGreedIndex !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            >
              <p className="text-xs text-muted-foreground mb-2">Fear & Greed</p>
              <div className={cn("text-2xl font-bold", getFearGreedColor(insights.fearGreedIndex))}>
                {insights.fearGreedIndex}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{insights.fearGreedLabel}</p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
          >
            <p className="text-xs text-muted-foreground mb-2">Market Sentiment</p>
            <div className="flex items-center gap-2">
              {getSentimentIcon(insights.marketSentiment)}
              <span className="text-sm font-semibold capitalize">{insights.marketSentiment}</span>
            </div>
            <p className={cn(
              "text-xs mt-1",
              insights.marketCapChange24h >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}>
              {insights.marketCapChange24h >= 0 ? '+' : ''}{insights.marketCapChange24h.toFixed(2)}% (24h)
            </p>
          </motion.div>
        </div>

        {/* Warnings */}
        {insights.warnings.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Warnings ({insights.warnings.length})
                </h4>
              </div>
              <div className="space-y-2">
                {insights.warnings.map((warning, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn("p-3 rounded-lg border", getSeverityColor(warning.severity || 'low'))}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        {warning.symbol && (
                          <Badge variant="outline" className="mb-2 text-xs">
                            {warning.symbol}
                          </Badge>
                        )}
                        <p className="text-sm text-slate-900 dark:text-slate-100">
                          {warning.message}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Opportunities */}
        {insights.opportunities.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Opportunities ({insights.opportunities.length})
                </h4>
              </div>
              <div className="space-y-2">
                {insights.opportunities.map((opp, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        {opp.symbol && (
                          <Badge variant="outline" className="mb-2 text-xs border-green-300 dark:border-green-700">
                            {opp.symbol}
                          </Badge>
                        )}
                        <p className="text-sm text-slate-900 dark:text-slate-100 mb-1">
                          {opp.message}
                        </p>
                        {opp.potentialGain && (
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                            Potential: {formatPrice(opp.potentialGain)}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Recommendations */}
        {insights.recommendations.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Recommendations ({insights.recommendations.length})
                </h4>
              </div>
              <div className="space-y-2">
                {insights.recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn("p-3 rounded-lg border", getPriorityColor(rec.priority || 'low'))}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {rec.priority && (
                            <Badge variant="outline" className="text-xs">
                              {rec.priority} priority
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-900 dark:text-slate-100">
                          {rec.message}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="pt-2">
          <p className="text-xs text-muted-foreground text-center">
            Last updated: {new Date(insights.lastUpdated).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </DataCard>
  )
}

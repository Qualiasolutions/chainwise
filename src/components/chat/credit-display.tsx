'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Plus, Zap, Crown, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface UserCredits {
  balance: number
  tier: 'free' | 'pro' | 'elite'
}

interface CreditDisplayProps {
  credits: UserCredits
  showTier?: boolean
  compact?: boolean
  className?: string
}

const TIER_CONFIG = {
  free: {
    name: 'Free',
    icon: Star,
    color: 'text-slate-400',
    bgColor: 'bg-slate-800',
    monthlyCredits: 3
  },
  pro: {
    name: 'Pro',
    icon: Zap,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
    monthlyCredits: 50
  },
  elite: {
    name: 'Elite',
    icon: Crown,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/20',
    monthlyCredits: 200
  }
}

export function CreditDisplay({ 
  credits, 
  showTier = true, 
  compact = false,
  className 
}: CreditDisplayProps) {
  const tierConfig = TIER_CONFIG[credits.tier]
  const isLowCredits = credits.balance < 10
  const isVeryLowCredits = credits.balance < 5

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex items-center gap-1.5">
          <div className={cn(
            'w-2 h-2 rounded-full',
            isVeryLowCredits ? 'bg-red-500' : isLowCredits ? 'bg-yellow-500' : 'bg-emerald-500'
          )} />
          <span className="text-sm font-medium text-slate-300">
            {credits.balance}
          </span>
        </div>
        
        {showTier && (
          <Badge variant="secondary" className={cn(
            'text-xs capitalize',
            tierConfig.bgColor,
            tierConfig.color
          )}>
            <tierConfig.icon className="w-3 h-3 mr-1" />
            {tierConfig.name}
          </Badge>
        )}
      </div>
    )
  }

  return (
    <Card className={cn(
      'bg-slate-800/50 backdrop-blur-sm border-slate-700/30 transition-all duration-200 hover:bg-slate-700/50',
      className
    )}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          {/* Credit Balance */}
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              isVeryLowCredits 
                ? 'bg-red-500/10 border border-red-500/20' 
                : isLowCredits 
                ? 'bg-yellow-500/10 border border-yellow-500/20'
                : 'bg-emerald-500/10 border border-emerald-500/20'
            )}>
              <CreditCard className={cn(
                'w-5 h-5',
                isVeryLowCredits 
                  ? 'text-red-400' 
                  : isLowCredits 
                  ? 'text-yellow-400'
                  : 'text-emerald-400'
              )} />
            </div>
            
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-semibold text-white">
                  {credits.balance}
                </span>
                <span className="text-sm text-slate-400">credits</span>
              </div>
              
              {isLowCredits && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'text-xs mt-1',
                    isVeryLowCredits ? 'text-red-400' : 'text-yellow-400'
                  )}
                >
                  {isVeryLowCredits ? 'Very low credits!' : 'Running low'}
                </motion.p>
              )}
            </div>
          </div>

          {/* Tier & Actions */}
          <div className="flex items-center gap-2">
            {showTier && (
              <Badge className={cn(
                'text-xs font-medium capitalize',
                tierConfig.bgColor,
                tierConfig.color
              )}>
                <tierConfig.icon className="w-3 h-3 mr-1" />
                {tierConfig.name}
              </Badge>
            )}

            {isLowCredits && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
              >
                <Plus className="w-3 h-3 mr-1" />
                Buy More
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar for monthly allowance */}
        {credits.tier !== 'free' && (
          <div className="mt-3 pt-3 border-t border-slate-700/30">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Monthly allowance</span>
              <span>{credits.balance}/{tierConfig.monthlyCredits}</span>
            </div>
            <div className="w-full bg-slate-700/30 rounded-full h-1.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((credits.balance / tierConfig.monthlyCredits) * 100, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  isVeryLowCredits 
                    ? 'bg-red-500' 
                    : isLowCredits 
                    ? 'bg-yellow-500'
                    : 'bg-emerald-500'
                )}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
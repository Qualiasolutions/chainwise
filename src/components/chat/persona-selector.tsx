'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon, Sparkles, Brain, TrendingUp, Crown, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PersonaConfig {
  id: 'buddy' | 'professor' | 'trader'
  name: string
  description: string
  icon: LucideIcon
  color: string
  creditCost: number
}

interface PersonaSelectorProps {
  personas: Record<string, PersonaConfig>
  onSelect: (persona: keyof typeof personas) => void
  userCredits: {
    balance: number
    tier: 'free' | 'pro' | 'elite'
  }
}

const TIER_REQUIREMENTS = {
  buddy: ['free', 'pro', 'elite'],
  professor: ['pro', 'elite'],
  trader: ['elite']
}

const TIER_BADGES = {
  free: { label: 'All tiers', icon: Star, color: 'bg-emerald-500' },
  pro: { label: 'Pro & Elite', icon: Sparkles, color: 'bg-blue-500' },
  elite: { label: 'Elite only', icon: Crown, color: 'bg-purple-500' }
}

export function PersonaSelector({ personas, onSelect, userCredits }: PersonaSelectorProps) {
  const isPersonaAvailable = (personaId: string) => {
    return TIER_REQUIREMENTS[personaId as keyof typeof TIER_REQUIREMENTS]?.includes(userCredits.tier) ?? false
  }

  const hasEnoughCredits = (creditCost: number) => {
    return userCredits.balance >= creditCost
  }

  const getTierBadge = (personaId: string) => {
    if (TIER_REQUIREMENTS[personaId as keyof typeof TIER_REQUIREMENTS]?.includes('free')) {
      return TIER_BADGES.free
    } else if (TIER_REQUIREMENTS[personaId as keyof typeof TIER_REQUIREMENTS]?.includes('pro')) {
      return TIER_BADGES.pro
    } else {
      return TIER_BADGES.elite
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent mb-4">
          Choose Your AI Assistant
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Select the perfect AI companion for your cryptocurrency journey. Each assistant specializes in different aspects of crypto knowledge.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            Available Credits: {userCredits.balance}
          </div>
          <Badge variant="secondary" className="bg-slate-800 text-slate-300 capitalize">
            {userCredits.tier} Tier
          </Badge>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(personas).map(([id, persona], index) => {
          const available = isPersonaAvailable(id)
          const affordable = hasEnoughCredits(persona.creditCost)
          const canUse = available && affordable
          const tierBadge = getTierBadge(id)
          
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <Card
                className={cn(
                  'relative overflow-hidden transition-all duration-300 cursor-pointer group',
                  'bg-slate-800/50 backdrop-blur-xl border-slate-700/50',
                  canUse 
                    ? 'hover:bg-slate-700/50 hover:border-slate-600/50 hover:shadow-2xl hover:shadow-purple-500/10' 
                    : 'opacity-60 cursor-not-allowed',
                  'h-[320px]'
                )}
                onClick={() => canUse && onSelect(id as keyof typeof personas)}
              >
                {/* Background gradient */}
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-br opacity-5 transition-opacity duration-300',
                  persona.color,
                  canUse ? 'group-hover:opacity-10' : ''
                )} />

                <CardContent className="p-6 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      'w-12 h-12 rounded-xl bg-gradient-to-r flex items-center justify-center',
                      persona.color,
                      !canUse && 'grayscale'
                    )}>
                      <persona.icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          'text-xs text-white',
                          tierBadge.color
                        )}
                      >
                        <tierBadge.icon className="w-3 h-3 mr-1" />
                        {tierBadge.label}
                      </Badge>
                      <Badge variant="outline" className="border-slate-600 text-slate-400">
                        {persona.creditCost} credits
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {persona.name}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">
                      {persona.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-auto">
                    <Button
                      className={cn(
                        'w-full transition-all duration-300',
                        canUse
                          ? `bg-gradient-to-r ${persona.color} hover:opacity-90 text-white`
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      )}
                      disabled={!canUse}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (canUse) onSelect(id as keyof typeof personas)
                      }}
                    >
                      {!available 
                        ? 'Upgrade Required'
                        : !affordable
                        ? 'Insufficient Credits'
                        : 'Start Chatting'
                      }
                    </Button>
                  </div>
                </CardContent>

                {/* Shine effect */}
                {canUse && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[400%] transition-transform duration-1000" />
                  </div>
                )}
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Help text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-8 text-slate-500 text-sm"
      >
        Need more credits? Visit the marketplace or upgrade your subscription for better rates.
      </motion.div>
    </div>
  )
}
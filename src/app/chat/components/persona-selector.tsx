'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Brain, TrendingUp, Lock, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type AIPersona } from '@/lib/openai-service'
import { useChatCredits } from '../hooks/use-chat-credits'

interface PersonaSelectorProps {
  selectedPersona: AIPersona
  onPersonaSelect: (persona: AIPersona) => void
  disabled?: boolean
}

export function PersonaSelector({ selectedPersona, onPersonaSelect, disabled }: PersonaSelectorProps) {
  const { canAffordPersona, canAccessPersona, getPersonaInfo, subscriptionTier } = useChatCredits()

  const personas = [
    {
      id: 'buddy' as AIPersona,
      name: 'Crypto Buddy',
      icon: MessageSquare,
      description: 'Friendly guidance for crypto beginners',
      color: 'from-blue-500 to-cyan-500',
      borderColor: 'border-blue-400/30',
      bgColor: 'bg-blue-500/10',
      detailedDescription: 'Perfect for beginners! I explain complex crypto concepts in simple, friendly terms and help you navigate your crypto journey with confidence.'
    },
    {
      id: 'professor' as AIPersona,
      name: 'Crypto Professor',
      icon: Brain,
      description: 'Deep technical analysis & education',
      color: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-400/30',
      bgColor: 'bg-purple-500/10',
      detailedDescription: 'For serious learners! I provide comprehensive technical analysis, blockchain education, and data-driven insights for advanced crypto understanding.'
    },
    {
      id: 'trader' as AIPersona,
      name: 'Crypto Trader',
      icon: TrendingUp,
      description: 'Market insights & trading strategies',
      color: 'from-green-500 to-emerald-500',
      borderColor: 'border-green-400/30',
      bgColor: 'bg-green-500/10',
      detailedDescription: 'For active traders! I focus on market analysis, technical indicators, and trading strategies. Remember: this is educational, not financial advice!'
    }
  ]

  const getPersonaStatus = (persona: AIPersona) => {
    const canAccess = canAccessPersona(persona)
    const canAfford = canAffordPersona(persona)
    const info = getPersonaInfo(persona)

    if (!canAccess) {
      return {
        available: false,
        reason: 'upgrade',
        message: `Available in ${persona === 'trader' ? 'Elite' : 'Pro'} plan`
      }
    }

    if (!canAfford) {
      return {
        available: false,
        reason: 'credits',
        message: `Need ${info?.cost || 1} credits to use`
      }
    }

    return {
      available: true,
      reason: null,
      message: `${info?.cost || 1} credit${info?.cost === 1 ? '' : 's'} per message`
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <motion.div 
        className="text-center mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">
          Choose Your AI Persona
        </h2>
        <p className="text-purple-200/70 text-sm">
          Each persona offers unique expertise and costs different credits
        </p>
      </motion.div>

      {/* Persona Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {personas.map((persona, index) => {
          const status = getPersonaStatus(persona.id)
          const isSelected = selectedPersona === persona.id
          const info = getPersonaInfo(persona.id)

          return (
            <motion.div
              key={persona.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="relative group"
            >
              <motion.button
                onClick={() => status.available && !disabled && onPersonaSelect(persona.id)}
                disabled={disabled || !status.available}
                className={cn(
                  "w-full p-6 rounded-2xl border backdrop-blur-xl text-left relative overflow-hidden transition-all duration-300",
                  "hover:shadow-2xl",
                  isSelected
                    ? `bg-gradient-to-br ${persona.color} text-white shadow-2xl scale-105 ${persona.borderColor}`
                    : status.available
                    ? "bg-white/5 hover:bg-white/10 border-purple-300/20 hover:border-purple-400/40 text-white"
                    : "bg-white/5 border-gray-600/20 text-gray-400 cursor-not-allowed",
                  disabled && "opacity-50"
                )}
                whileHover={status.available && !disabled ? { scale: isSelected ? 1.05 : 1.02, y: -2 } : {}}
                whileTap={status.available && !disabled ? { scale: isSelected ? 1.03 : 0.98 } : {}}
              >
                {/* Background Pattern */}
                <div className={cn(
                  "absolute inset-0 opacity-5",
                  isSelected ? "bg-white/10" : persona.bgColor
                )} />

                {/* Content */}
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      "p-3 rounded-xl",
                      isSelected 
                        ? "bg-white/20" 
                        : status.available
                        ? persona.bgColor
                        : "bg-gray-600/20"
                    )}>
                      <persona.icon className="w-6 h-6" />
                    </div>
                    
                    {!status.available && (
                      <div className="flex items-center space-x-1">
                        <Lock className="w-4 h-4" />
                        {status.reason === 'upgrade' && (
                          <div className="text-xs font-medium px-2 py-1 bg-yellow-500/20 rounded-full border border-yellow-400/30">
                            {persona.id === 'trader' ? 'Elite' : 'Pro'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-lg font-bold mb-2">{persona.name}</h3>
                  <p className={cn(
                    "text-sm mb-4 leading-relaxed",
                    isSelected ? "text-white/90" : "text-white/70"
                  )}>
                    {persona.detailedDescription}
                  </p>

                  {/* Cost and Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className={cn(
                        "w-4 h-4",
                        isSelected ? "text-yellow-200" : "text-purple-300"
                      )} />
                      <span className="text-sm font-medium">
                        {status.message}
                      </span>
                    </div>

                    {isSelected && (
                      <motion.div
                        className="flex items-center space-x-1 bg-white/20 rounded-full px-3 py-1"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-xs font-medium">Active</span>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Selection Ring */}
                {isSelected && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl ring-2 ring-white/30 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>

              {/* Upgrade Tooltip */}
              {!status.available && status.reason === 'upgrade' && (
                <AnimatePresence>
                  <motion.div
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap shadow-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    Upgrade to unlock
                  </motion.div>
                </AnimatePresence>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Current Subscription Info */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-sm text-purple-200/50">
          Current plan: <span className="font-medium text-purple-200">
            {subscriptionTier?.charAt(0).toUpperCase() + subscriptionTier?.slice(1) || 'Free'}
          </span>
          {(subscriptionTier === 'free' || !subscriptionTier) && (
            <span className="ml-2 text-xs">
              • <button className="text-purple-300 hover:text-purple-200 underline">
                Upgrade for more personas
              </button>
            </span>
          )}
        </p>
      </motion.div>
    </div>
  )
}
"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bot, GraduationCap, TrendingUp, ChevronDown, Check, Lock, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

type PersonaId = 'buddy' | 'professor' | 'trader'

interface BotSelectorProps {
  selectedPersona: PersonaId
  userTier: 'free' | 'pro' | 'elite'
  onPersonaChange: (persona: PersonaId) => void
  onUpgrade?: () => void
}

const PERSONAS = {
  buddy: {
    id: 'buddy' as PersonaId,
    name: 'Buddy',
    icon: Bot,
    description: 'Casual crypto companion for simple advice',
    bgColor: 'bg-blue-500',
    tier: 'free' as const,
    creditCost: 1,
  },
  professor: {
    id: 'professor' as PersonaId,
    name: 'Professor',
    icon: GraduationCap,
    description: 'Educational insights and deep analysis',
    bgColor: 'bg-purple-500',
    tier: 'pro' as const,
    creditCost: 2,
  },
  trader: {
    id: 'trader' as PersonaId,
    name: 'Trader',
    icon: TrendingUp,
    description: 'Professional trading strategies',
    bgColor: 'bg-emerald-500',
    tier: 'elite' as const,
    creditCost: 3,
  }
}

export function BotSelector({
  selectedPersona,
  userTier,
  onPersonaChange,
  onUpgrade
}: BotSelectorProps) {
  const canUsePersona = (persona: PersonaId) => {
    const personaConfig = PERSONAS[persona]
    if (personaConfig.tier === 'free') return true
    if (personaConfig.tier === 'pro') return ['pro', 'elite'].includes(userTier)
    if (personaConfig.tier === 'elite') return userTier === 'elite'
    return false
  }

  const selectedConfig = PERSONAS[selectedPersona]
  const Icon = selectedConfig.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            className="flex items-center gap-2 px-3 py-2 h-auto border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50/80 dark:hover:bg-slate-900/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-700"
          >
            <div className={cn(
              "w-7 h-7 rounded-md flex items-center justify-center text-white",
              selectedConfig.bgColor
            )}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {selectedConfig.name}
              </div>
              <div className="text-xs text-slate-500">
                {selectedConfig.creditCost} credit{selectedConfig.creditCost > 1 ? 's' : ''}/msg
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-500 ml-1" />
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 p-2">
        {Object.values(PERSONAS).map((persona) => {
          const PersonaIcon = persona.icon
          const isSelected = selectedPersona === persona.id
          const canUse = canUsePersona(persona.id)

          return (
            <DropdownMenuItem
              key={persona.id}
              onClick={() => canUse && onPersonaChange(persona.id)}
              className={cn(
                "flex items-start gap-3 p-3 cursor-pointer rounded-lg",
                isSelected && "bg-slate-100 dark:bg-slate-800",
                !canUse && "opacity-50 cursor-not-allowed"
              )}
              disabled={!canUse}
            >
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center text-white flex-shrink-0",
                persona.bgColor
              )}>
                <PersonaIcon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {persona.name}
                  </span>
                  {persona.tier !== 'free' && (
                    <Badge variant="outline" className="text-xs h-4 px-1">
                      {persona.tier}
                    </Badge>
                  )}
                  {isSelected && (
                    <Check className="h-3 w-3 text-green-500 ml-auto" />
                  )}
                  {!canUse && (
                    <Lock className="h-3 w-3 text-slate-400 ml-auto" />
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {persona.description}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-slate-500">
                    {persona.creditCost} credit{persona.creditCost > 1 ? 's' : ''} per message
                  </span>
                </div>
              </div>
            </DropdownMenuItem>
          )
        })}

        {userTier === 'free' && onUpgrade && (
          <div className="border-t border-slate-200 dark:border-slate-700 mt-2 pt-2">
            <Button
              size="sm"
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Unlock Premium Advisors
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

"use client"

import { Bot, GraduationCap, TrendingUp, Zap, Menu, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export const AI_PERSONAS = {
  buddy: {
    id: 'buddy',
    name: 'Buddy',
    icon: Bot,
    description: 'Casual crypto companion',
    color: 'from-blue-500 to-blue-600',
    tier: 'free',
    creditCost: 1,
  },
  professor: {
    id: 'professor',
    name: 'Professor',
    icon: GraduationCap,
    description: 'Deep analysis & education',
    color: 'from-purple-500 to-purple-600',
    tier: 'pro',
    creditCost: 2,
  },
  trader: {
    id: 'trader',
    name: 'Trader',
    icon: TrendingUp,
    description: 'Professional strategies',
    color: 'from-emerald-500 to-emerald-600',
    tier: 'elite',
    creditCost: 3,
  }
} as const

interface ChatHeaderProps {
  selectedPersona: keyof typeof AI_PERSONAS
  onPersonaChange: (persona: keyof typeof AI_PERSONAS) => void
  credits: number
  onToggleSidebar?: () => void
  canUsePersona: (persona: keyof typeof AI_PERSONAS) => boolean
}

export function ChatHeader({
  selectedPersona,
  onPersonaChange,
  credits,
  onToggleSidebar,
  canUsePersona
}: ChatHeaderProps) {
  const persona = AI_PERSONAS[selectedPersona]
  const Icon = persona.icon

  return (
    <motion.header
      className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Left: Menu + Persona Selector */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 px-3 py-2 h-auto border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <div className={cn(
                "w-6 h-6 rounded-lg flex items-center justify-center text-white bg-gradient-to-r",
                persona.color
              )}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">{persona.name}</div>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {Object.entries(AI_PERSONAS).map(([key, p]) => {
              const PIcon = p.icon
              const canUse = canUsePersona(key as keyof typeof AI_PERSONAS)
              const isSelected = key === selectedPersona

              return (
                <DropdownMenuItem
                  key={key}
                  onClick={() => canUse && onPersonaChange(key as keyof typeof AI_PERSONAS)}
                  disabled={!canUse}
                  className={cn(
                    "flex items-center gap-3 p-3 cursor-pointer",
                    isSelected && "bg-gray-100 dark:bg-gray-800",
                    !canUse && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-r flex-shrink-0",
                    p.color
                  )}>
                    <PIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{p.name}</span>
                      {p.tier !== 'free' && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          {p.tier}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{p.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{p.creditCost} credit{p.creditCost > 1 ? 's' : ''}/msg</p>
                  </div>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: Credits */}
      <motion.div
        className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 rounded-full border border-amber-200/50 dark:border-amber-800/50"
        whileHover={{ scale: 1.05 }}
      >
        <Zap className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
          {credits}
        </span>
      </motion.div>
    </motion.header>
  )
}

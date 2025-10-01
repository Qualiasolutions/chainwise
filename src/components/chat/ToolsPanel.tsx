"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import {
  Wallet,
  FileText,
  Brain,
  Gem,
  Star,
  Zap,
  TrendingUp,
  Bell,
  Copy,
  Crown
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Tool {
  id: string
  name: string
  icon: React.ElementType
  description: string
  credits: string
  href: string
  gradient: string
  tier?: 'free' | 'pro' | 'elite'
}

const TOOLS: Tool[] = [
  {
    id: 'whale-tracker',
    name: 'Whale Tracker',
    icon: Wallet,
    description: 'Track large wallet movements',
    credits: '5-10',
    href: '/tools/whale-tracker',
    gradient: 'from-blue-50 to-indigo-50 dark:from-slate-800/50 dark:to-slate-800/30',
    tier: 'pro'
  },
  {
    id: 'ai-reports',
    name: 'AI Reports',
    icon: FileText,
    description: 'Weekly & monthly insights',
    credits: '0-10',
    href: '/tools/ai-reports',
    gradient: 'from-purple-50 to-violet-50 dark:from-slate-800/50 dark:to-slate-800/30',
    tier: 'pro'
  },
  {
    id: 'narrative-scanner',
    name: 'Narrative Scanner',
    icon: Brain,
    description: 'Detect market narratives',
    credits: '5',
    href: '/tools/narrative-scanner',
    gradient: 'from-green-50 to-emerald-50 dark:from-slate-800/50 dark:to-slate-800/30',
    tier: 'elite'
  },
  {
    id: 'altcoin-detector',
    name: 'Altcoin Detector',
    icon: Gem,
    description: 'Find hidden gems early',
    credits: '8',
    href: '/tools/altcoin-detector',
    gradient: 'from-orange-50 to-red-50 dark:from-slate-800/50 dark:to-slate-800/30',
    tier: 'elite'
  },
  {
    id: 'smart-alerts',
    name: 'Smart Alerts',
    icon: Bell,
    description: 'Advanced price alerts',
    credits: '3',
    href: '/tools/smart-alerts',
    gradient: 'from-yellow-50 to-amber-50 dark:from-slate-800/50 dark:to-slate-800/30',
    tier: 'pro'
  },
  {
    id: 'signals-pack',
    name: 'Signals Pack',
    icon: TrendingUp,
    description: 'Trading signals & analysis',
    credits: '10',
    href: '/tools/signals-pack',
    gradient: 'from-pink-50 to-rose-50 dark:from-slate-800/50 dark:to-slate-800/30',
    tier: 'elite'
  },
  {
    id: 'whale-copy',
    name: 'Whale Copy',
    icon: Copy,
    description: 'Copy successful traders',
    credits: '15',
    href: '/tools/whale-copy',
    gradient: 'from-cyan-50 to-blue-50 dark:from-slate-800/50 dark:to-slate-800/30',
    tier: 'elite'
  }
]

interface ToolsPanelProps {
  userTier?: 'free' | 'pro' | 'elite'
  onUpgrade?: () => void
}

export function ToolsPanel({ userTier = 'free', onUpgrade }: ToolsPanelProps) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Crown className="h-4 w-4 text-yellow-500" />
          </motion.div>
          <h2 className="text-sm font-semibold">Premium Tools</h2>
        </div>
        <p className="text-xs text-slate-500">
          Quick access to advanced features
        </p>
      </div>

      {/* Tools Grid */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {TOOLS.map((tool, index) => {
            const Icon = tool.icon
            const isLocked = tool.tier && (
              (tool.tier === 'pro' && userTier === 'free') ||
              (tool.tier === 'elite' && userTier !== 'elite')
            )

            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={isLocked ? '#' : tool.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full h-auto flex flex-col items-start gap-2 p-3 bg-gradient-to-br border",
                      tool.gradient,
                      "hover:shadow-md transition-all duration-200",
                      isLocked && "opacity-60 cursor-not-allowed"
                    )}
                    disabled={isLocked}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">{tool.name}</span>
                      </div>
                      {tool.tier && (
                        <Badge variant="secondary" className="text-xs h-4 px-1 capitalize">
                          {tool.tier}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 text-left">
                      {tool.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Zap className="h-3 w-3" />
                      <span>{tool.credits} credits</span>
                    </div>
                  </Button>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Upgrade CTA */}
      {userTier === 'free' && onUpgrade && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              size="sm"
            >
              <Star className="h-3 w-3 mr-1" />
              Upgrade to Access All
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

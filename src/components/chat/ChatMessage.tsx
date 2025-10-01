"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Bot,
  GraduationCap,
  TrendingUp,
  User,
  Copy,
  Share,
  RotateCw,
  Zap,
  Check
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  persona?: string
  timestamp: Date | string
  credits?: number
}

interface ChatMessageProps {
  message: Message
  onCopy?: () => void
  onShare?: () => void
  onRegenerate?: () => void
}

const PERSONA_CONFIG = {
  buddy: {
    icon: Bot,
    bgColor: 'bg-blue-500',
    gradient: 'from-blue-500 to-blue-600',
    name: 'Buddy'
  },
  professor: {
    icon: GraduationCap,
    bgColor: 'bg-purple-500',
    gradient: 'from-purple-500 to-purple-600',
    name: 'Professor'
  },
  trader: {
    icon: TrendingUp,
    bgColor: 'bg-emerald-500',
    gradient: 'from-emerald-500 to-emerald-600',
    name: 'Trader'
  }
}

export function ChatMessage({
  message,
  onCopy,
  onShare,
  onRegenerate
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false)

  const isUser = message.sender === 'user'
  const personaConfig = !isUser && message.persona
    ? PERSONA_CONFIG[message.persona as keyof typeof PERSONA_CONFIG]
    : null

  const handleCopy = async () => {
    if (onCopy) {
      onCopy()
    } else {
      await navigator.clipboard.writeText(message.content)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.4,
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
        className={cn(
          "flex gap-4 group",
          isUser ? "justify-end" : "justify-start"
        )}
      >
        {/* AI Avatar */}
        {!isUser && personaConfig && (
          <motion.div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg",
              personaConfig.bgColor
            )}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {(() => {
              const Icon = personaConfig.icon
              return <Icon className="h-5 w-5" />
            })()}
          </motion.div>
        )}

        {/* Message Content */}
        <div className={cn(
          "max-w-[85%] md:max-w-[75%] relative",
          isUser ? "order-first" : ""
        )}>
          <motion.div
            className={cn(
              "px-5 py-3 rounded-2xl shadow-sm backdrop-blur-sm relative overflow-hidden",
              isUser
                ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white ml-auto"
                : "bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 border border-slate-200/50 dark:border-slate-700/50"
            )}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {/* Subtle gradient overlay */}
            <div className={cn(
              "absolute inset-0 opacity-5 pointer-events-none",
              isUser
                ? "bg-gradient-to-br from-white to-transparent"
                : "bg-gradient-to-br from-violet-500/10 to-blue-500/10"
            )} />

            {/* Message text with proper whitespace */}
            <p className="text-sm leading-relaxed whitespace-pre-wrap relative z-10 break-words">
              {message.content}
            </p>
          </motion.div>

          {/* Message Actions (AI messages only) */}
          {!isUser && (
            <motion.div
              className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0, y: 0 }}
              whileHover={{ opacity: 1 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>{copied ? 'Copied!' : 'Copy message'}</TooltipContent>
              </Tooltip>

              {onShare && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        onClick={onShare}
                      >
                        <Share className="h-3 w-3" />
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>Share message</TooltipContent>
                </Tooltip>
              )}

              {onRegenerate && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        onClick={onRegenerate}
                      >
                        <RotateCw className="h-3 w-3" />
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>Regenerate response</TooltipContent>
                </Tooltip>
              )}
            </motion.div>
          )}

          {/* Credit cost indicator */}
          {message.credits && (
            <motion.div
              className="flex items-center gap-1 mt-2 text-xs text-slate-400 justify-end"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="h-3 w-3" />
              </motion.div>
              <span>-{message.credits} credit{message.credits > 1 ? 's' : ''}</span>
            </motion.div>
          )}
        </div>

        {/* User Avatar */}
        {isUser && (
          <motion.div
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-100 dark:to-slate-200 flex items-center justify-center flex-shrink-0 shadow-lg"
            whileHover={{ scale: 1.1, rotate: -5 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <User className="h-5 w-5 text-white dark:text-slate-900" />
          </motion.div>
        )}
      </motion.div>
    </TooltipProvider>
  )
}

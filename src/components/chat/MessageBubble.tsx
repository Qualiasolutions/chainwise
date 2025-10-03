"use client"

import { motion } from "framer-motion"
import { Bot, User, Copy, RotateCw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AI_PERSONAS } from "./ChatHeader"
import { useState } from "react"

interface MessageBubbleProps {
  content: string
  sender: 'user' | 'ai'
  persona?: keyof typeof AI_PERSONAS
  timestamp: Date
  index: number
}

export function MessageBubble({
  content,
  sender,
  persona,
  timestamp,
  index
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const isUser = sender === 'user'
  const personaConfig = persona ? AI_PERSONAS[persona] : null
  const Icon = isUser ? User : (personaConfig?.icon || Bot)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      className={cn(
        "flex gap-3 group",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index === 0 ? 0 : 0.1 }}
    >
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isUser
          ? "bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-300"
          : personaConfig
            ? `bg-gradient-to-r ${personaConfig.color}`
            : "bg-gray-500"
      )}>
        <Icon className={cn(
          "h-4 w-4",
          isUser ? "text-white dark:text-gray-900" : "text-white"
        )} />
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex flex-col gap-2 max-w-[85%] md:max-w-[75%]",
        isUser && "items-end"
      )}>
        <div className={cn(
          "px-4 py-3 rounded-2xl",
          isUser
            ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white"
            : "bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-800"
        )}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {content}
          </p>
        </div>

        {/* Actions (for AI messages only) */}
        {!isUser && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3 text-gray-400" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
            >
              <RotateCw className="h-3 w-3 text-gray-400" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

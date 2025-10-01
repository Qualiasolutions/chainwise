"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ArrowUp, Paperclip, Mic, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
  persona?: string
  creditCost?: number
  maxLength?: number
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  disabled = false,
  placeholder = "Type your message...",
  persona = "Buddy",
  creditCost = 1,
  maxLength = 4000
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
    setCharCount(value.length)
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isLoading && value.trim()) {
        onSubmit()
      }
    }
  }

  const showCharCount = charCount > maxLength * 0.8

  return (
    <TooltipProvider>
      <div className="border-t border-slate-200/50 dark:border-slate-800/50 px-4 py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl relative">
        <div className="absolute inset-0 bg-gradient-to-t from-violet-500/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <motion.div
                className="relative rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-lg focus-within:shadow-xl transition-all duration-300 focus-within:border-violet-300 dark:focus-within:border-violet-600"
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <textarea
                  ref={textareaRef}
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={disabled || isLoading}
                  maxLength={maxLength}
                  className={cn(
                    "w-full px-4 py-4 pr-32 resize-none bg-transparent border-none",
                    "focus:ring-0 focus:outline-none",
                    "text-sm placeholder:text-slate-500 dark:text-slate-100",
                    "max-h-32 min-h-[52px]",
                    "scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700"
                  )}
                  rows={1}
                />

                <div className="absolute bottom-2 right-2 flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        disabled
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Attach file (coming soon)</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        disabled
                      >
                        <Mic className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Voice message (coming soon)</TooltipContent>
                  </Tooltip>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button
                      onClick={onSubmit}
                      disabled={isLoading || !value.trim() || disabled}
                      size="sm"
                      className={cn(
                        "h-8 w-8 rounded-lg p-0",
                        "bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700",
                        "text-white shadow-md hover:shadow-lg",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "transition-all duration-300"
                      )}
                    >
                      <motion.div
                        animate={isLoading ? { rotate: 360 } : {}}
                        transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
                      >
                        {isLoading ? (
                          <Clock className="h-4 w-4" />
                        ) : (
                          <ArrowUp className="h-4 w-4" />
                        )}
                      </motion.div>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          <motion.div
            className="flex items-center justify-between mt-3 text-xs text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="flex items-center gap-1"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-2 h-2 rounded-full bg-violet-600" />
                <span>
                  Using {persona} • {creditCost} credit{creditCost > 1 ? 's' : ''} per message
                </span>
              </motion.div>
              {showCharCount && (
                <span className={cn(
                  "transition-colors",
                  charCount > maxLength * 0.95 && "text-red-500"
                )}>
                  {charCount}/{maxLength}
                </span>
              )}
            </div>
            <motion.kbd
              className="px-2 py-1 bg-slate-100/80 dark:bg-slate-900/80 rounded text-xs border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm font-mono"
              whileHover={{ scale: 1.02 }}
            >
              Enter to send
            </motion.kbd>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  )
}

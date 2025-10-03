"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowUp, Paperclip, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AI_PERSONAS } from "./ChatHeader"

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading: boolean
  selectedPersona: keyof typeof AI_PERSONAS
  disabled?: boolean
}

export function ChatInput({
  onSend,
  isLoading,
  selectedPersona,
  disabled
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const persona = AI_PERSONAS[selectedPersona]

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [message])

  const handleSend = () => {
    if (!message.trim() || isLoading || disabled) return
    onSend(message)
    setMessage('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <motion.div
      className="border-t border-gray-100 dark:border-gray-800 px-4 md:px-6 lg:px-8 py-4 bg-white dark:bg-gray-950"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-2">
          {/* Main textarea with floating send button */}
          <div className="flex-1 relative">
            <div className={cn(
              "relative rounded-2xl border bg-white dark:bg-gray-900 transition-all duration-200",
              "border-gray-200 dark:border-gray-700",
              "focus-within:border-violet-400 dark:focus-within:border-violet-600",
              "focus-within:shadow-lg focus-within:shadow-violet-100 dark:focus-within:shadow-violet-950/50"
            )}>
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading || disabled}
                placeholder={`Message ${persona.name}...`}
                className={cn(
                  "w-full px-4 py-3 pr-12 bg-transparent resize-none",
                  "focus:outline-none focus:ring-0",
                  "text-sm text-gray-900 dark:text-gray-100",
                  "placeholder:text-gray-400",
                  "min-h-[52px] max-h-[200px]",
                  "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
                )}
                rows={1}
              />

              {/* Floating action buttons */}
              <div className="absolute bottom-2 right-2 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  type="button"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  type="button"
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleSend}
                    disabled={isLoading || !message.trim() || disabled}
                    size="icon"
                    className={cn(
                      "h-8 w-8 rounded-lg",
                      "bg-gradient-to-r from-violet-600 to-purple-600",
                      "hover:from-violet-700 hover:to-purple-700",
                      "text-white",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between mt-2 px-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full bg-gradient-to-r",
              persona.color
            )} />
            <span>{persona.name} • {persona.creditCost} credit{persona.creditCost > 1 ? 's' : ''}/msg</span>
          </div>
          <kbd className="px-2 py-0.5 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
            Enter to send
          </kbd>
        </div>
      </div>
    </motion.div>
  )
}

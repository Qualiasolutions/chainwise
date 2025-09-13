'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, Paperclip, Smile, Command } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ProfessionalChatInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  disabled?: boolean
  placeholder?: string
  onSubmit?: () => void
  className?: string
}

export function ProfessionalChatInput({
  value,
  onChange,
  disabled = false,
  placeholder = "Type your message...",
  onSubmit,
  className
}: ProfessionalChatInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const scrollHeight = Math.min(textarea.scrollHeight, 120) // Max 120px height
      textarea.style.height = `${scrollHeight}px`
    }
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit?.()
    }
  }

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)

  return (
    <div className={cn(
      'relative flex items-end gap-3 p-3 rounded-xl transition-all duration-200',
      'bg-slate-900/50 backdrop-blur-sm border',
      isFocused 
        ? 'border-purple-500/50 bg-slate-900/70' 
        : 'border-slate-700/30 hover:border-slate-600/50',
      className
    )}>
      {/* Input Area */}
      <div className="flex-1 relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            'min-h-[44px] max-h-[120px] resize-none border-0 bg-transparent p-0',
            'text-slate-100 placeholder:text-slate-500',
            'focus-visible:ring-0 focus-visible:ring-offset-0',
            'scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent'
          )}
          rows={1}
        />

        {/* Character count or hint */}
        {isFocused && (value?.length || 0) > 100 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-6 right-0 text-xs text-slate-500"
          >
{value?.length || 0}/2000
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 opacity-70 hover:opacity-100 transition-all"
          disabled={disabled}
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 opacity-70 hover:opacity-100 transition-all"
          disabled={disabled}
        >
          <Smile className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 opacity-70 hover:opacity-100 transition-all"
          disabled={disabled}
        >
          <Mic className="w-4 h-4" />
        </Button>
      </div>

      {/* Keyboard shortcut hint */}
      {isFocused && !value?.trim() && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute bottom-full left-3 mb-2 px-3 py-1.5 bg-slate-800 border border-slate-700/50 rounded-lg text-xs text-slate-400 flex items-center gap-1.5"
        >
          <Command className="w-3 h-3" />
          <span>Enter to send • Shift+Enter for new line</span>
        </motion.div>
      )}

      {/* Focus glow effect */}
      {isFocused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 -m-0.5 bg-gradient-to-r from-purple-500/20 via-transparent to-purple-500/20 rounded-xl -z-10 blur-sm"
        />
      )}
    </div>
  )
}
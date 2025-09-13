'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Command, 
  Mic, 
  Paperclip, 
  Smile, 
  Sparkles,
  AlertTriangle,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { type AIPersona } from '@/lib/openai-service'
import { useChatCredits } from '../hooks/use-chat-credits'

interface ChatInputProps {
  onSend: (message: string) => void
  persona: AIPersona
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, persona, disabled, placeholder }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [showCommands, setShowCommands] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const commandsRef = useRef<HTMLDivElement>(null)

  const { canAffordPersona, getPersonaCost, getCreditStatus } = useChatCredits()
  
  const creditStatus = getCreditStatus()
  const personaCost = getPersonaCost(persona)
  const canAfford = canAffordPersona(persona)

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    const newHeight = Math.min(textarea.scrollHeight, 160) // max height
    textarea.style.height = `${newHeight}px`
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [message, adjustHeight])

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    
    if (e.key === '/' && message === '') {
      setShowCommands(true)
    }
    
    if (e.key === 'Escape') {
      setShowCommands(false)
    }
  }

  const handleSend = () => {
    if (!message.trim() || disabled || !canAfford) return
    
    onSend(message.trim())
    setMessage('')
    setShowCommands(false)
  }

  const insertCommand = (command: string) => {
    setMessage(prev => prev + command + ' ')
    setShowCommands(false)
    textareaRef.current?.focus()
  }

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commandsRef.current && !commandsRef.current.contains(event.target as Node)) {
        setShowCommands(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const commands = [
    { trigger: '/portfolio', description: 'Analyze my portfolio', icon: '📊' },
    { trigger: '/price', description: 'Check crypto prices', icon: '💰' },
    { trigger: '/news', description: 'Latest crypto news', icon: '📰' },
    { trigger: '/learn', description: 'Educational content', icon: '🎓' },
    { trigger: '/strategy', description: 'Trading strategies', icon: '📈' },
    { trigger: '/risk', description: 'Risk assessment', icon: '⚠️' }
  ]

  const getPersonaPlaceholder = () => {
    const placeholders = {
      buddy: "Ask me anything about crypto - I'll explain it simply! 😊",
      professor: "What would you like to analyze or learn about today?",
      trader: "What's your trading question or market analysis need?"
    }
    return placeholder || placeholders[persona]
  }

  return (
    <div className="relative w-full">
      {/* Commands Palette */}
      <AnimatePresence>
        {showCommands && (
          <motion.div
            ref={commandsRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-0 right-0 mb-2 backdrop-blur-2xl bg-gradient-to-br from-purple-900/90 to-indigo-900/90 rounded-2xl border border-purple-300/30 shadow-2xl overflow-hidden z-50"
          >
            <div className="p-2">
              <div className="text-xs font-medium text-purple-200/70 px-3 py-2">
                Quick Commands
              </div>
              {commands.map((cmd, index) => (
                <motion.button
                  key={cmd.trigger}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => insertCommand(cmd.trigger)}
                  className="w-full flex items-center space-x-3 px-3 py-3 text-left hover:bg-purple-500/20 rounded-xl transition-colors group"
                >
                  <span className="text-lg">{cmd.icon}</span>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{cmd.trigger}</div>
                    <div className="text-purple-200/60 text-xs">{cmd.description}</div>
                  </div>
                  <Sparkles className="w-4 h-4 text-purple-300/60 group-hover:text-purple-300" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Input Container */}
      <motion.div 
        className={cn(
          "backdrop-blur-2xl bg-gradient-to-br from-chainwise-neutral-900/20 to-chainwise-neutral-800/10 rounded-3xl border shadow-2xl transition-all duration-200",
          isFocused 
            ? "border-chainwise-primary-400/50 shadow-chainwise-primary-500/20 shadow-glow" 
            : "border-chainwise-primary-300/20",
          !canAfford && "border-chainwise-error-400/40"
        )}
        whileHover={{ scale: 1.01, y: -1 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        {/* Warning Banner */}
        {!canAfford && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="px-4 py-3 bg-red-500/10 border-b border-red-400/20 rounded-t-3xl"
          >
            <div className="flex items-center space-x-2 text-red-300 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>
                Need {personaCost} credit{personaCost === 1 ? '' : 's'} to use {
                  persona === 'buddy' ? 'Crypto Buddy' :
                  persona === 'professor' ? 'Crypto Professor' : 'Crypto Trader'
                }
              </span>
            </div>
          </motion.div>
        )}

        {/* Input Area */}
        <div className="p-4 md:p-6">
          <div className="flex items-end space-x-4">
            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={getPersonaPlaceholder()}
                disabled={disabled}
                rows={1}
                className={cn(
                  "w-full bg-transparent border-none outline-none resize-none text-white text-base md:text-lg placeholder:text-purple-200/50",
                  "scrollbar-hide overflow-y-auto min-h-[40px] max-h-[160px]",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              />
              
              {/* Character Indicator */}
              {message.length > 200 && (
                <div className="absolute -bottom-6 right-0 text-xs text-purple-200/50">
                  {message.length}/2000
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Commands Button */}
              <motion.button
                onClick={() => setShowCommands(!showCommands)}
                className={cn(
                  "p-3 rounded-2xl transition-all hover:scale-105",
                  showCommands 
                    ? "bg-purple-500/30 text-white" 
                    : "bg-white/10 text-purple-300/60 hover:text-white hover:bg-white/20"
                )}
                whileTap={{ scale: 0.95 }}
                title="Show commands"
              >
                <Command className="w-5 h-5" />
              </motion.button>

              {/* Additional Tools */}
              <div className="hidden md:flex items-center space-x-2">
                <button className="p-3 bg-white/10 text-purple-300/60 hover:text-white hover:bg-white/20 rounded-2xl transition-all hover:scale-105">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button className="p-3 bg-white/10 text-purple-300/60 hover:text-white hover:bg-white/20 rounded-2xl transition-all hover:scale-105">
                  <Smile className="w-5 h-5" />
                </button>
              </div>

              {/* Enhanced Send Button */}
              <motion.button
                onClick={handleSend}
                disabled={!message.trim() || disabled || !canAfford}
                className={cn(
                  "p-3 rounded-2xl font-semibold transition-all flex items-center space-x-2 relative overflow-hidden",
                  message.trim() && canAfford && !disabled
                    ? "bg-gradient-to-r from-chainwise-primary-500 to-chainwise-secondary-500 text-white shadow-lg shadow-chainwise-primary-500/30 hover:shadow-chainwise-primary-500/40 hover:scale-105"
                    : "bg-chainwise-neutral-700/30 text-chainwise-neutral-400 cursor-not-allowed"
                )}
                whileHover={message.trim() && canAfford && !disabled ? { scale: 1.05, y: -1 } : {}}
                whileTap={message.trim() && canAfford && !disabled ? { scale: 0.95 } : {}}
              >
                {/* Button Shimmer Effect */}
                {message.trim() && canAfford && !disabled && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
                )}
                
                {canAfford ? (
                  <Send className="w-5 h-5 relative z-10" />
                ) : (
                  <div className="flex items-center space-x-1 relative z-10">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm">{personaCost}</span>
                  </div>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Focus Ring */}
        {isFocused && (
          <motion.div 
            className="absolute inset-0 rounded-3xl ring-2 ring-purple-400/30 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </motion.div>

      {/* Credit Status */}
      {creditStatus.status !== 'good' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-center"
        >
          <p className="text-sm text-purple-200/70">
            {creditStatus.message}
          </p>
        </motion.div>
      )}
    </div>
  )
}
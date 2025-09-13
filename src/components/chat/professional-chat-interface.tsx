'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useChat } from '@ai-sdk/react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Sparkles, 
  TrendingUp, 
  Brain,
  Settings,
  Loader2,
  ArrowLeft,
  Zap,
  BarChart3,
  MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PersonaSelector } from './persona-selector'
import { ChatMessageList } from './chat-message-list'
import { CreditDisplay } from './credit-display'

interface UserCredits {
  balance: number
  tier: 'free' | 'pro' | 'elite'
}

const PERSONA_CONFIGS = {
  buddy: {
    id: 'buddy' as const,
    name: 'ChainWise Assistant',
    description: 'Educational guidance and crypto basics',
    icon: Sparkles,
    color: 'from-emerald-500 to-teal-600',
    creditCost: 5,
    bgGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent'
  },
  professor: {
    id: 'professor' as const,
    name: 'Market Analyst',
    description: 'Technical analysis and market insights',
    icon: Brain,
    color: 'from-blue-500 to-indigo-600',
    creditCost: 10,
    bgGradient: 'from-blue-500/20 via-indigo-500/10 to-transparent'
  },
  trader: {
    id: 'trader' as const,
    name: 'Strategy Advisor',
    description: 'Advanced trading strategies and portfolio guidance',
    icon: TrendingUp,
    color: 'from-purple-500 to-pink-600',
    creditCost: 15,
    bgGradient: 'from-purple-500/20 via-pink-500/10 to-transparent'
  }
}

export function ProfessionalChatInterface() {
  const [selectedPersona, setSelectedPersona] = useState<keyof typeof PERSONA_CONFIGS>('buddy')
  const [userCredits, setUserCredits] = useState<UserCredits>({ balance: 200, tier: 'elite' })
  const [showPersonaSelector, setShowPersonaSelector] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setInput } = useChat({
    api: '/api/chat',
    body: {
      persona: selectedPersona
    },
    onError: (error) => {
      console.error('Chat error:', error)
    }
  })

  // Sync local input value with useChat input
  useEffect(() => {
    setInputValue(input)
  }, [input])

  // Handle initial message from Hero component
  useEffect(() => {
    const initialMessage = sessionStorage.getItem('chatInitialMessage');
    if (initialMessage && !showPersonaSelector) {
      setInput(initialMessage);
      sessionStorage.removeItem('chatInitialMessage');
    }
  }, [showPersonaSelector, setInput]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const scrollHeight = Math.min(textarea.scrollHeight, 120)
      textarea.style.height = `${scrollHeight}px`
    }
  }, [inputValue])

  // Robust form submission handler
  const handleFormSubmit = useCallback(async (e?: React.FormEvent) => {
    try {
      e?.preventDefault();
      
      // Enhanced validation
      if (!inputValue || !inputValue.trim()) {
        return;
      }
      
      if (isLoading || isSubmitting) {
        return;
      }
      
      setIsSubmitting(true);
      
      // Ensure handleSubmit exists and is a function
      if (handleSubmit && typeof handleSubmit === 'function') {
        await handleSubmit(e);
        setInputValue(''); // Clear input after successful submission
      } else {
        throw new Error('Chat submission handler is not available.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [handleSubmit, inputValue, isLoading, isSubmitting]);

  const handlePersonaSelect = (persona: keyof typeof PERSONA_CONFIGS) => {
    setSelectedPersona(persona)
    setShowPersonaSelector(false)
  }

  const handleInputValueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
    handleInputChange(e);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit();
    }
  }

  const currentPersona = PERSONA_CONFIGS[selectedPersona]
  const isInputValid = inputValue && inputValue.trim().length > 0

  if (showPersonaSelector) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-4">
        <PersonaSelector 
          personas={PERSONA_CONFIGS}
          onSelect={handlePersonaSelect}
          userCredits={userCredits}
        />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${currentPersona.bgGradient} opacity-30`} />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-purple-900/30 to-slate-900/90" />
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-glass-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-spin-slow" />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-2xl animate-pulse-slow delay-2000" />
      </div>

      {/* Header - Fixed with Premium Glass Effect */}
      <motion.div 
        className="relative z-10 backdrop-blur-2xl bg-slate-900/60 border-b border-white/20 shadow-2xl"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
          borderImage: 'linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.3), rgba(255,255,255,0.1)) 1'
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPersonaSelector(true)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <currentPersona.icon className="w-5 h-5 mr-2" />
                {currentPersona.name}
              </Button>
              <Badge variant="secondary" className="bg-slate-800/50 text-slate-300 border-slate-700/50">
                {currentPersona.creditCost} credits per message
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <CreditDisplay credits={userCredits} />
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Chat Area - Flexible with perfect mobile responsiveness */}
      <div className="flex-1 flex flex-col min-h-0 max-w-4xl mx-auto w-full px-2 sm:px-4">
        {/* Messages Container - Scrollable with mobile optimization */}
        <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 sm:py-6">
          {messages.length === 0 ? (
            <motion.div
              className="h-full flex items-center justify-center p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center max-w-md">
                <motion.div 
                  className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${currentPersona.color} flex items-center justify-center shadow-2xl`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <currentPersona.icon className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  Chat with {currentPersona.name}
                </h3>
                <p className="text-slate-400 mb-6">
                  {currentPersona.description}
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {['Market trends', 'Portfolio analysis', 'Risk management'].map((topic, index) => (
                    <motion.button
                      key={topic}
                      className="backdrop-blur-xl bg-slate-800/30 hover:bg-slate-700/40 border border-white/20 hover:border-purple-400/50 text-slate-300 hover:text-white px-5 py-3 rounded-2xl text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 relative overflow-hidden group"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onClick={() => {
                        const message = `Tell me about ${topic.toLowerCase()}`
                        setInputValue(message)
                        setInput(message)
                      }}
                      style={{
                        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
                        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <span className="relative z-10">{topic}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <ChatMessageList
              messages={messages}
              isLoading={isLoading}
              persona={currentPersona}
            />
          )}
        </div>

        {/* Input Area - Fixed at bottom with mobile safety */}
        <motion.div 
          className="p-3 sm:p-4 relative z-10 pb-safe-bottom"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <form onSubmit={handleFormSubmit} className="relative">
            <div className="relative flex items-end backdrop-blur-2xl border border-white/20 rounded-2xl sm:rounded-3xl p-3 sm:p-4 transition-all duration-300 focus-within:border-purple-400/60 focus-within:shadow-2xl focus-within:shadow-purple-500/25 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 touch-manipulation" style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 50%, rgba(30, 41, 59, 0.7) 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
              {/* Input Field */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={handleInputValueChange}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading || isSubmitting}
                  placeholder={`Ask ${currentPersona.name} anything about crypto...`}
                  className="w-full bg-transparent text-slate-100 placeholder:text-slate-400 border-0 outline-none resize-none min-h-[48px] max-h-[120px] text-base leading-6 py-2 pr-4 focus:outline-none selection:bg-purple-500/30"
                  rows={1}
                  style={{
                    height: 'auto',
                    minHeight: '48px',
                    maxHeight: '120px'
                  }}
                />
                
                {/* Character count */}
                {inputValue && inputValue.length > 100 && (
                  <motion.div
                    className="absolute -bottom-6 right-0 text-xs text-slate-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {inputValue.length}/2000
                  </motion.div>
                )}
              </div>
              
              {/* Send Button */}
              <div className="flex items-center gap-2 ml-4">
                <Button
                  type="submit"
                  disabled={!isInputValid || isLoading || isSubmitting}
                  className={`h-12 w-12 bg-gradient-to-r ${currentPersona.color} hover:opacity-90 transition-all duration-300 rounded-xl shadow-lg hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none p-0 relative overflow-hidden`}
                  style={{
                    background: `linear-gradient(135deg, ${currentPersona.color.includes('emerald') ? '#10b981, #0d9488' : currentPersona.color.includes('blue') ? '#3b82f6, #6366f1' : '#8b5cf6, #ec4899'})`,
                    boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <AnimatePresence mode="wait">
                    {isLoading || isSubmitting ? (
                      <motion.div
                        key="loading"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="send"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Send className="w-5 h-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            </div>
            
            {/* Keyboard shortcuts hint */}
            <motion.div 
              className="mt-3 text-center text-xs text-slate-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Press <kbd className="px-2 py-1 bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-md text-slate-300 font-mono shadow-sm">Enter</kbd> to send, <kbd className="px-2 py-1 bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-md text-slate-300 font-mono shadow-sm">Shift + Enter</kbd> for new line
            </motion.div>
          </form>
          
          {/* Enhanced Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="mt-4 bg-red-500/10 border border-red-500/30 rounded-2xl p-5 backdrop-blur-xl shadow-lg shadow-red-500/10"
                style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)'
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-red-300">Chat Error</div>
                    <div className="mt-1 text-red-400/90 text-sm">{error.message}</div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="mt-2 text-red-300 hover:text-red-200 h-auto p-0 font-normal"
                      onClick={() => window.location.reload()}
                    >
                      Try refreshing the page
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
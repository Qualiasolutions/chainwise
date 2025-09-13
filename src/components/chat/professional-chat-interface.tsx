'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useChat } from '@ai-sdk/react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Sparkles, 
  TrendingUp, 
  Brain,
  CreditCard,
  Settings,
  MessageSquare,
  Plus,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PersonaSelector } from './persona-selector'
import { ChatMessageList } from './chat-message-list'
import { ProfessionalChatInput } from './professional-chat-input'
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
    creditCost: 5
  },
  professor: {
    id: 'professor' as const,
    name: 'Market Analyst',
    description: 'Technical analysis and market insights',
    icon: Brain,
    color: 'from-blue-500 to-indigo-600',
    creditCost: 10
  },
  trader: {
    id: 'trader' as const,
    name: 'Strategy Advisor',
    description: 'Advanced trading strategies and portfolio guidance',
    icon: TrendingUp,
    color: 'from-purple-500 to-pink-600',
    creditCost: 15
  }
}

export function ProfessionalChatInterface() {
  const [selectedPersona, setSelectedPersona] = useState<keyof typeof PERSONA_CONFIGS>('buddy')
  const [userCredits, setUserCredits] = useState<UserCredits>({ balance: 200, tier: 'elite' })
  const [showPersonaSelector, setShowPersonaSelector] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setInput } = useChat({
    api: '/api/chat',
    body: {
      persona: selectedPersona
    },
    onError: (error) => {
      console.error('Chat error:', error)
    }
  })

  // Robust form submission handler to fix 'g is not a function' error
  const handleFormSubmit = useCallback(async (e?: React.FormEvent) => {
    try {
      e?.preventDefault();
      
      // Comprehensive validation
      if (!input || !input.trim()) {
        console.warn('Cannot submit empty message');
        return;
      }
      
      if (isLoading || isSubmitting) {
        console.warn('Already processing a request');
        return;
      }
      
      // Set submitting state for better UX
      setIsSubmitting(true);
      
      // Ensure handleSubmit exists and is a function
      if (handleSubmit && typeof handleSubmit === 'function') {
        await handleSubmit(e);
      } else {
        console.error('handleSubmit function is not available');
        throw new Error('Chat submission handler is not available. Please refresh the page.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      // Error will be handled by useChat's onError callback
    } finally {
      setIsSubmitting(false);
    }
  }, [handleSubmit, input, isLoading, isSubmitting]);

  // Handle initial message from Hero component
  useEffect(() => {
    const initialMessage = sessionStorage.getItem('chatInitialMessage');
    if (initialMessage && !showPersonaSelector) {
      setInput(initialMessage);
      sessionStorage.removeItem('chatInitialMessage');
    }
  }, [showPersonaSelector, setInput]);

  const handlePersonaSelect = (persona: keyof typeof PERSONA_CONFIGS) => {
    setSelectedPersona(persona)
    setShowPersonaSelector(false)
  }

  const currentPersona = PERSONA_CONFIGS[selectedPersona]

  if (showPersonaSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-4">
        <PersonaSelector 
          personas={PERSONA_CONFIGS}
          onSelect={handlePersonaSelect}
          userCredits={userCredits}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPersonaSelector(true)}
                className="text-slate-400 hover:text-white"
              >
                <currentPersona.icon className="w-5 h-5 mr-2" />
                {currentPersona.name}
              </Button>
              <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                {currentPersona.creditCost} credits per message
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <CreditDisplay credits={userCredits} />
              <Button variant="ghost" size="sm">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-md"
              >
                <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r ${currentPersona.color} flex items-center justify-center`}>
                  <currentPersona.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  Chat with {currentPersona.name}
                </h3>
                <p className="text-slate-400 mb-6">
                  {currentPersona.description}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Market trends', 'Portfolio analysis', 'Risk management'].map((topic) => (
                    <Button
                      key={topic}
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-800"
                      onClick={() => handleInputChange({ target: { value: `Tell me about ${topic.toLowerCase()}` } } as React.ChangeEvent<HTMLTextAreaElement>)}
                    >
                      {topic}
                    </Button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <ChatMessageList
              messages={messages}
              isLoading={isLoading}
              persona={currentPersona}
            />
          )}
        </div>

        {/* Redesigned Input Area */}
        <div className="p-4 md:p-6">
          <div className="relative">
            <form onSubmit={handleFormSubmit} className="relative">
              <div className="relative flex items-end bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-3 md:p-4 transition-all duration-200 focus-within:border-purple-500/50 focus-within:bg-slate-800/80 touch-manipulation">
                {/* Input Field */}
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder={`Ask ${currentPersona.name} anything about crypto...`}
                    className="w-full bg-transparent text-slate-100 placeholder:text-slate-400 border-0 outline-none resize-none min-h-[44px] max-h-[120px] text-base leading-6 py-2 pr-4 touch-manipulation focus:outline-none"
                    rows={1}
                    style={{
                      height: 'auto',
                      minHeight: '44px',
                      maxHeight: '120px'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleFormSubmit();
                      }
                      
                      // Auto-resize
                      const target = e.target as HTMLTextAreaElement;
                      setTimeout(() => {
                        target.style.height = 'auto';
                        const scrollHeight = Math.min(target.scrollHeight, 120);
                        target.style.height = `${scrollHeight}px`;
                      }, 0);
                    }}
                  />
                  
                  {/* Character count for long messages */}
                  {input && input.length > 100 && (
                    <div className="absolute -bottom-6 right-0 text-xs text-slate-500">
                      {input.length}/2000
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2 ml-3">
                  {/* Send Button */}
                  <Button
                    type="submit"
                    disabled={!input?.trim() || isLoading || isSubmitting}
                    className={`h-10 px-4 bg-gradient-to-r ${currentPersona.color} hover:opacity-90 transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                  >
                    {isLoading || isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Keyboard shortcut hint */}
              <div className="mt-2 text-center text-xs text-slate-500">
                Press <kbd className="px-1.5 py-0.5 bg-slate-700/50 rounded text-slate-300">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-slate-700/50 rounded text-slate-300">Shift + Enter</kbd> for new line
              </div>
            </form>
            
            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-4 backdrop-blur-sm"
              >
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium">Chat Error</div>
                    <div className="mt-1 opacity-90">{error.message}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
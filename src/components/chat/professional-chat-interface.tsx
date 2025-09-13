'use client'

import React, { useState } from 'react'
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

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    body: {
      persona: selectedPersona
    },
    onError: (error) => {
      console.error('Chat error:', error)
    }
  })

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
                      onClick={() => handleInputChange({ target: { value: `Tell me about ${topic.toLowerCase()}` } } as any)}
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

        {/* Input Area */}
        <div className="p-6">
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-4">
              <form onSubmit={handleSubmit} className="flex gap-4">
                <ProfessionalChatInput
                  value={input}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  placeholder={`Ask ${currentPersona.name} anything about crypto...`}
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`px-6 bg-gradient-to-r ${currentPersona.color} hover:opacity-90 transition-opacity`}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </form>
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                >
                  {error.message}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
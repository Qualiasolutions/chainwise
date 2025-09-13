'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Sparkles, Zap, AlertCircle, Plus, MessageSquare, Send, Loader2, Bot, User, Brain, Star, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BuddyCharacter } from '@/components/ai-characters/buddy-character'
import { ProfessorCharacter } from '@/components/ai-characters/professor-character'
import { TraderCharacter } from '@/components/ai-characters/trader-character'
import { SparklesText } from '@/components/magicui/sparkles-text'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { RippleButton } from '@/components/magicui/ripple-button'

// Types
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  credits_used?: number
}

interface ChatSession {
  id: string
  title: string
  persona: 'buddy' | 'professor' | 'trader'
  messages: ChatMessage[]
  created_at: string
  updated_at: string
}

interface UserCredits {
  balance: number
  tier: 'free' | 'pro' | 'elite'
  points: number
}

// AI Persona configurations with 3D Character integration
const AI_PERSONAS = {
  buddy: {
    name: 'Buddy',
    displayName: 'Buddy - Your Crypto Companion',
    description: 'Your encouraging crypto companion for learning basics and friendly guidance',
    character: BuddyCharacter,
    tier: 'All tiers',
    color: 'from-emerald-400 to-green-500',
    bgGradient: 'from-emerald-500/10 to-green-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
    icon: Star,
    creditCost: 5
  },
  professor: {
    name: 'Professor',
    displayName: 'Professor - Market Analysis Expert', 
    description: 'Deep market analysis, educational insights, and data-driven research',
    character: ProfessorCharacter,
    tier: 'Pro & Elite',
    color: 'from-blue-400 to-indigo-500',
    bgGradient: 'from-blue-500/10 to-indigo-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    icon: Brain,
    creditCost: 10
  },
  trader: {
    name: 'Trader',
    displayName: 'Trader - Pro Trading Strategist',
    description: 'Advanced trading strategies, market timing, and professional insights',
    character: TraderCharacter,
    tier: 'Elite only',
    color: 'from-chainwise-primary-400 to-chainwise-accent-500',
    bgGradient: 'from-chainwise-primary-500/10 to-chainwise-accent-500/10',
    borderColor: 'border-chainwise-primary-500/30',
    textColor: 'text-chainwise-primary-400',
    icon: Crown,
    creditCost: 15
  }
}

export function ChatInterface() {
  // State management
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [userCredits, setUserCredits] = useState<UserCredits>({ balance: 0, tier: 'free', points: 0 })
  const [selectedPersona, setSelectedPersona] = useState<keyof typeof AI_PERSONAS>('buddy')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [showPersonaSelector, setShowPersonaSelector] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize credits and load sessions
  useEffect(() => {
    initializeUserData()
  }, [])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentSession?.messages])

  const initializeUserData = async () => {
    try {
      setIsInitializing(true)
      
      // Initialize credits
      const creditsResponse = await fetch('/api/credits/initialize', { method: 'POST' })
      if (creditsResponse.ok) {
        const creditsData = await creditsResponse.json()
        setUserCredits({
          balance: creditsData.balance,
          tier: creditsData.tier,
          points: creditsData.points || 0
        })
      }

      // Load existing sessions
      const sessionsResponse = await fetch('/api/chat')
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json()
        setSessions(sessionsData.data || [])
        
        // Set most recent session as current if available
        if (sessionsData.data && sessionsData.data.length > 0) {
          setCurrentSession(sessionsData.data[0])
          setShowPersonaSelector(false)
        }
      }
    } catch (error) {
      console.error('Failed to initialize user data:', error)
      toast.error('Failed to load user data')
    } finally {
      setIsInitializing(false)
    }
  }

  const createNewSession = async (persona: keyof typeof AI_PERSONAS) => {
    try {
      // Check if user can access this persona based on their subscription tier
      const personaConfig = AI_PERSONAS[persona]
      
      // Check subscription tier restrictions
      if (persona === 'professor' && userCredits.tier === 'free') {
        toast.error('Professor requires Pro or Elite subscription')
        return
      }
      
      if (persona === 'trader' && (userCredits.tier === 'free' || userCredits.tier === 'pro')) {
        toast.error('Trader requires Elite subscription')
        return
      }

      // Check credits
      if (userCredits.balance < personaConfig.creditCost) {
        toast.error(`Insufficient credits. Need ${personaConfig.creditCost} credits for ${personaConfig.name}`)
        return
      }

      const newSession: ChatSession = {
        id: `temp-${Date.now()}`,
        title: 'New Chat',
        persona,
        messages: [{
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: getWelcomeMessage(persona),
          timestamp: new Date()
        }],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setCurrentSession(newSession)
      setSessions(prev => [newSession, ...prev])
      setSelectedPersona(persona)
      setShowPersonaSelector(false)
    } catch (error) {
      console.error('Error creating new session:', error)
      toast.error('Failed to create new chat session')
    }
  }

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !currentSession || isLoading) return

    const personaConfig = AI_PERSONAS[currentSession.persona]
    
    // Check credits
    if (userCredits.balance < personaConfig.creditCost) {
      toast.error(`Insufficient credits. Need ${personaConfig.creditCost} credits for ${personaConfig.name}`)
      return
    }

    setIsLoading(true)
    
    try {
      // Add user message immediately
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: messageText,
        timestamp: new Date()
      }

      const updatedMessages = [...currentSession.messages, userMessage]
      setCurrentSession(prev => prev ? { ...prev, messages: updatedMessages } : null)
      setMessage('')

      // Send to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          persona: currentSession.persona,
          sessionId: currentSession.id.startsWith('temp-') ? undefined : currentSession.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      const responseData = await response.json()
      
      // Add AI response
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: responseData.data.message,
        timestamp: new Date(),
        credits_used: responseData.data.creditsUsed
      }

      const finalMessages = [...updatedMessages, aiMessage]
      
      // Update session
      const updatedSession = {
        ...currentSession,
        id: responseData.data.sessionId || currentSession.id,
        messages: finalMessages,
        title: currentSession.title === 'New Chat' ? messageText.slice(0, 50) : currentSession.title
      }
      
      setCurrentSession(updatedSession)
      
      // Update sessions list
      setSessions(prev => {
        const filtered = prev.filter(s => s.id !== currentSession.id)
        return [updatedSession, ...filtered]
      })
      
      // Update credits
      setUserCredits(prev => ({
        ...prev,
        balance: responseData.data.newBalance
      }))

    } catch (error) {
      console.error('Error sending message:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send message')
      
      // Remove the user message if sending failed
      setCurrentSession(prev => prev ? {
        ...prev,
        messages: prev.messages.slice(0, -1)
      } : null)
    } finally {
      setIsLoading(false)
    }
  }

  const getWelcomeMessage = (persona: keyof typeof AI_PERSONAS): string => {
    const messages = {
      buddy: "Hey there! I'm Buddy, your friendly crypto companion! I'm here to guide you through the exciting world of cryptocurrency with encouragement and clear explanations. Whether you're taking your first steps or building on your knowledge, I'll make sure you feel confident and supported every step of the way. Let's explore crypto together!",
      professor: "Welcome! I'm Professor, your dedicated market analysis expert. I specialize in breaking down complex market dynamics, technical analysis, and educational insights that help you understand the 'why' behind crypto movements. I'm here to share knowledge, analyze trends, and help you develop a deeper understanding of the markets.",
      trader: "Welcome to the trading floor! I'm your Pro Trader, specializing in advanced strategies, market timing, and professional-grade insights. I focus on risk management, market psychology, and sophisticated trading concepts that can help elevate your trading game. Ready to dive into the professional world of crypto trading?"
    }
    return messages[persona]
  }

  const PersonaCard = ({ persona, config, isSelected, onClick }: {
    persona: keyof typeof AI_PERSONAS
    config: typeof AI_PERSONAS[keyof typeof AI_PERSONAS]
    isSelected: boolean
    onClick: () => void
  }) => {
    // Check if persona is locked based on subscription tier
    const isLocked = (persona === 'professor' && userCredits.tier === 'free') ||
                    (persona === 'trader' && (userCredits.tier === 'free' || userCredits.tier === 'pro'))
    
    const hasInsufficientCredits = userCredits.balance < config.creditCost
    const CharacterComponent = config.character
    const IconComponent = config.icon

    return (
      <motion.div
        className={cn(
          "relative overflow-hidden transition-all duration-500",
          "bg-white/5 backdrop-blur-xl border rounded-3xl p-8",
          isLocked || hasInsufficientCredits
            ? "opacity-50 cursor-not-allowed border-red-400/30"
            : "cursor-pointer hover:scale-[1.02] hover:shadow-2xl group",
          isSelected && !isLocked && !hasInsufficientCredits
            ? `shadow-2xl ring-2 ring-white/20 ${config.borderColor}` 
            : "border-white/10 hover:border-white/20"
        )}
        onClick={isLocked || hasInsufficientCredits ? undefined : onClick}
        whileHover={isLocked || hasInsufficientCredits ? {} : { y: -8 }}
        whileTap={isLocked || hasInsufficientCredits ? {} : { scale: 0.98 }}
        layout
      >
        {/* Background Gradient */}
        <div className={cn("absolute inset-0 opacity-20 bg-gradient-to-br rounded-3xl", config.color)} />
        <div className={cn("absolute inset-0 opacity-10 bg-gradient-to-br rounded-3xl", config.bgGradient)} />
        
        {/* Content */}
        <div className="relative z-10 text-center">
          {/* 3D Character */}
          <motion.div
            className="mb-6"
            whileHover={!isLocked && !hasInsufficientCredits ? { scale: 1.1 } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <CharacterComponent />
          </motion.div>

          {/* Character Name & Title */}
          <motion.h3 
            className={cn(
              "text-2xl font-bold mb-2 transition-all duration-300",
              isSelected ? config.textColor : "text-white group-hover:" + config.textColor
            )}
          >
            {config.displayName}
          </motion.h3>

          {/* Tier Badge */}
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-gray-300 text-sm mb-4 group-hover:border-white/30 transition-all duration-300"
          >
            <IconComponent className="w-4 h-4" />
            {config.tier}
          </motion.div>

          {/* Description */}
          <p className="text-gray-400 leading-relaxed mb-6 group-hover:text-gray-300 transition-colors duration-300">
            {config.description}
          </p>

          {/* Status & Credits */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <Badge 
                variant="secondary" 
                className={cn(
                  "bg-white/10 text-white/90 border border-white/20",
                  !isLocked && !hasInsufficientCredits && "group-hover:bg-white/15"
                )}
              >
                {config.creditCost} credits per message
              </Badge>
              
              {isLocked && (
                <Badge variant="destructive" className="bg-red-500/20 text-red-300 text-xs border-red-500/30">
                  {persona === 'professor' ? 'Requires Pro+' : 'Requires Elite'}
                </Badge>
              )}
              
              {!isLocked && hasInsufficientCredits && (
                <Badge variant="destructive" className="bg-orange-500/20 text-orange-300 text-xs border-orange-500/30">
                  Need {config.creditCost - userCredits.balance} more credits
                </Badge>
              )}
            </div>

            {/* Selection Indicator */}
            <div className="flex items-center">
              {isSelected && !isLocked && !hasInsufficientCredits && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </motion.div>
              )}
              
              {isLocked && (
                <div className="w-8 h-8 bg-red-500/50 rounded-full flex items-center justify-center border border-red-500/30">
                  <AlertCircle className="w-4 h-4 text-red-300" />
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-chainwise-primary-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-chainwise-accent-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="text-center relative z-10">
          <motion.div className="mb-8">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
              }}
              className="w-20 h-20 bg-gradient-to-r from-chainwise-primary-500 to-chainwise-accent-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl"
            >
              <Brain className="w-10 h-10 text-white" />
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <SparklesText 
              className="text-3xl font-bold mb-4"
              colors={{
                first: "#4f46e5",
                second: "#2563eb"
              }}
              sparklesCount={8}
            >
              ChainWise AI
            </SparklesText>
            <motion.p 
              className="text-gray-300 text-lg"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Initializing your AI trading assistant...
            </motion.p>
            <div className="flex items-center justify-center mt-4 space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-chainwise-primary-400 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Session Sidebar */}
      <div className={cn(
        "transition-all duration-300 bg-black/30 backdrop-blur-xl border-r border-white/10",
        sidebarOpen ? "w-80" : "w-0 overflow-hidden"
      )}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Chat Sessions</h2>
            <RippleButton
              size="sm"
              onClick={() => setShowPersonaSelector(true)}
              className="text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg"
            >
              <Plus className="w-4 h-4" />
            </RippleButton>
          </div>
          <ScrollArea className="h-[calc(100vh-200px)]">
            {sessions.map((session) => {
              const personaConfig = AI_PERSONAS[session.persona]
              const CharacterComponent = personaConfig.character
              
              return (
                <motion.div
                  key={session.id}
                  className={cn(
                    "p-4 rounded-xl cursor-pointer transition-all mb-3 border",
                    currentSession?.id === session.id
                      ? "bg-white/15 border-white/30 shadow-lg"
                      : "hover:bg-white/10 border-white/10 hover:border-white/20"
                  )}
                  onClick={() => setCurrentSession(session)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8">
                      <CharacterComponent />
                    </div>
                    <span className="text-xs text-white/60 font-medium">{personaConfig.name}</span>
                  </div>
                  <p className="text-sm text-white truncate font-medium">{session.title}</p>
                  <p className="text-xs text-white/50 mt-1">{new Date(session.created_at).toLocaleDateString()}</p>
                </motion.div>
              )
            })}
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-black/30 backdrop-blur-xl border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <RippleButton
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg"
              >
                <MessageSquare className="w-4 h-4" />
              </RippleButton>
              <div>
                <SparklesText 
                  className="text-2xl font-bold"
                  colors={{
                    first: "#4f46e5", // chainwise-primary-600
                    second: "#2563eb"  // chainwise-accent-600
                  }}
                  sparklesCount={6}
                >
                  ChainWise AI
                </SparklesText>
                {currentSession && (
                  <div className="flex items-center space-x-3 text-sm text-gray-300 mt-1">
                    <div className="w-5 h-5">
                      {React.createElement(AI_PERSONAS[currentSession.persona].character)}
                    </div>
                    <span className="font-medium">{AI_PERSONAS[currentSession.persona].displayName}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Enhanced Credits Display */}
            <div className="flex items-center space-x-4">
              <motion.div 
                className={cn(
                  "relative overflow-hidden text-right bg-gradient-to-r backdrop-blur-sm px-6 py-3 rounded-xl border shadow-lg",
                  userCredits.balance <= 0 
                    ? "from-red-500/10 to-orange-500/10 border-red-500/30" 
                    : userCredits.balance < 5 
                      ? "from-orange-500/10 to-yellow-500/10 border-orange-500/30"
                      : "from-green-500/10 to-emerald-500/10 border-green-500/30"
                )}
                whileHover={{ scale: 1.02 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-50" />
                <div className="relative z-10">
                  <div className="text-sm font-bold text-white flex items-center gap-2 justify-end">
                    <motion.div
                      animate={{ 
                        rotate: userCredits.balance > 0 ? [0, 360] : 0,
                        scale: userCredits.balance <= 0 ? [1, 1.1, 1] : 1
                      }}
                      transition={{ 
                        rotate: { duration: 2, repeat: userCredits.balance > 0 ? Infinity : 0, ease: "linear" },
                        scale: { duration: 1, repeat: userCredits.balance <= 0 ? Infinity : 0 }
                      }}
                    >
                      {userCredits.balance <= 0 ? (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-chainwise-primary-400" />
                      )}
                    </motion.div>
                    <span className={cn(
                      "tabular-nums",
                      userCredits.balance <= 0 ? "text-red-300" : "text-white"
                    )}>
                      {userCredits.balance}
                    </span>
                    <span className="text-xs text-gray-300 font-normal">Credits</span>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <div className={cn(
                      "text-xs px-2 py-0.5 rounded-full capitalize font-medium",
                      userCredits.tier === 'free' ? "bg-gray-500/20 text-gray-300" :
                      userCredits.tier === 'pro' ? "bg-blue-500/20 text-blue-300" :
                      "bg-purple-500/20 text-purple-300"
                    )}>
                      {userCredits.tier} Plan
                    </div>
                    {userCredits.balance <= 0 && (
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-xs text-red-400"
                      >
                        Low Credits
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
              <RippleButton
                size="sm"
                onClick={() => setShowPersonaSelector(true)}
                className="text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg"
              >
                <Settings className="w-4 h-4" />
              </RippleButton>
            </div>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {showPersonaSelector ? (
            /* Persona Selection */
            <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
              <div className="absolute top-20 left-20 w-64 h-64 bg-chainwise-primary-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-20 w-48 h-48 bg-chainwise-accent-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              
              <div className="w-full max-w-6xl relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-12"
                >
                  <SparklesText 
                    className="text-4xl font-bold mb-6"
                    colors={{
                      first: "#4f46e5",
                      second: "#2563eb"
                    }}
                    sparklesCount={12}
                  >
                    Choose Your AI Assistant
                  </SparklesText>
                  <p className="text-gray-300 text-xl max-w-2xl mx-auto">
                    Each character brings unique expertise and personality to guide your crypto journey
                  </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                  {Object.entries(AI_PERSONAS).map(([key, config], index) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <PersonaCard
                        persona={key as keyof typeof AI_PERSONAS}
                        config={config}
                        isSelected={selectedPersona === key}
                        onClick={() => setSelectedPersona(key as keyof typeof AI_PERSONAS)}
                      />
                    </motion.div>
                  ))}
                </div>

                <motion.div 
                  className="text-center mt-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  {(() => {
                    const isPersonaLocked = (selectedPersona === 'professor' && userCredits.tier === 'free') ||
                                          (selectedPersona === 'trader' && (userCredits.tier === 'free' || userCredits.tier === 'pro'))
                    const hasInsufficientCredits = userCredits.balance < AI_PERSONAS[selectedPersona].creditCost
                    
                    if (isPersonaLocked) {
                      return (
                        <div className="space-y-4">
                          <ShimmerButton
                            onClick={() => toast.info('Visit /pricing to upgrade your subscription')}
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-10 py-4 rounded-xl font-semibold text-lg shadow-xl"
                          >
                            <Crown className="w-5 h-5 mr-2" />
                            Upgrade to {selectedPersona === 'professor' ? 'Pro' : 'Elite'}
                          </ShimmerButton>
                          <p className="text-orange-400 text-sm max-w-md mx-auto">
                            {selectedPersona === 'professor' 
                              ? 'Professor requires Pro ($12.99/month) or Elite subscription for advanced market analysis'
                              : 'Trader requires Elite subscription ($24.99/month) for professional trading insights'
                            }
                          </p>
                        </div>
                      )
                    }
                    
                    return (
                      <div className="space-y-4">
                        <ShimmerButton
                          onClick={() => createNewSession(selectedPersona)}
                          className={cn(
                            "px-10 py-4 rounded-xl font-semibold text-lg shadow-xl transition-all",
                            hasInsufficientCredits 
                              ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                              : "bg-gradient-to-r from-chainwise-primary-600 to-chainwise-accent-600 hover:from-chainwise-primary-700 hover:to-chainwise-accent-700 text-white"
                          )}
                          disabled={hasInsufficientCredits}
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                          Start Conversation with {AI_PERSONAS[selectedPersona].name}
                        </ShimmerButton>
                        
                        <div className="text-sm text-gray-400">
                          <span>Cost: {AI_PERSONAS[selectedPersona].creditCost} credits per message</span>
                        </div>
                        
                        {hasInsufficientCredits && (
                          <div className="space-y-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <p className="text-red-400 text-sm">
                              Insufficient credits. You need {AI_PERSONAS[selectedPersona].creditCost} credits but only have {userCredits.balance}.
                            </p>
                            <RippleButton
                              onClick={() => toast.info('Visit /pricing to buy more credits')}
                              className="border-red-400/30 text-red-400 hover:bg-red-500/10 bg-red-500/5 rounded-lg px-4 py-2"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Buy More Credits
                            </RippleButton>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </motion.div>
              </div>
            </div>
          ) : currentSession ? (
            /* Chat Messages */
            <>
              <ScrollArea className="flex-1 p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                  {currentSession.messages.map((msg, index) => {
                    const personaConfig = AI_PERSONAS[currentSession.persona]
                    const CharacterComponent = personaConfig.character
                    
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                          "flex gap-4 items-start",
                          msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        {/* Avatar */}
                        <motion.div 
                          className={cn(
                            "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
                            msg.role === 'user' 
                              ? "bg-gradient-to-r from-chainwise-accent-500 to-chainwise-primary-500 shadow-lg" 
                              : "bg-transparent"
                          )}
                          whileHover={{ scale: 1.05 }}
                        >
                          {msg.role === 'user' ? (
                            <User className="w-6 h-6 text-white" />
                          ) : (
                            <div className="w-12 h-12">
                              <CharacterComponent />
                            </div>
                          )}
                        </motion.div>

                        {/* Message Bubble */}
                        <motion.div
                          className={cn(
                            "max-w-2xl p-6 rounded-3xl backdrop-blur-sm border shadow-lg",
                            msg.role === 'user'
                              ? "bg-white/10 border-white/20 text-white ml-4"
                              : "bg-gradient-to-br from-white/5 to-white/10 border-white/10 text-gray-100 mr-4"
                          )}
                          whileHover={{ scale: 1.01 }}
                        >
                          {/* Character name for AI messages */}
                          {msg.role === 'assistant' && (
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                              <span className={cn("font-semibold text-sm", personaConfig.textColor)}>
                                {personaConfig.name}
                              </span>
                              <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                                AI Assistant
                              </Badge>
                            </div>
                          )}
                          
                          {/* Message content */}
                          <div className="text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </div>
                          
                          {/* Message metadata */}
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10 text-xs text-gray-400">
                            <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                            {msg.credits_used && (
                              <div className="flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                <span>{msg.credits_used} credits</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </motion.div>
                    )
                  })}
                  
                  {/* Loading message */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex gap-4 items-start"
                    >
                      <div className="w-12 h-12">
                        {React.createElement(AI_PERSONAS[currentSession.persona].character)}
                      </div>
                      <motion.div
                        className="max-w-2xl p-6 rounded-3xl backdrop-blur-sm border bg-gradient-to-br from-white/5 to-white/10 border-white/10 mr-4"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                          <span className={cn("font-semibold text-sm", AI_PERSONAS[currentSession.persona].textColor)}>
                            {AI_PERSONAS[currentSession.persona].name}
                          </span>
                          <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                            Thinking...
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-300">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Brain className="w-5 h-5 text-chainwise-primary-400" />
                          </motion.div>
                          <span className="text-sm">Analyzing and crafting response...</span>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Chat Input */}
              <div className="flex-shrink-0 p-6 bg-black/30 backdrop-blur-xl border-t border-white/10">
                <div className="max-w-4xl mx-auto">
                  {/* Character Context Bar */}
                  <div className="flex items-center justify-between mb-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8">
                        {React.createElement(AI_PERSONAS[currentSession.persona].character)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          Chatting with {AI_PERSONAS[currentSession.persona].displayName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {AI_PERSONAS[currentSession.persona].creditCost} credits per message
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm font-medium text-white">
                        <Sparkles className="w-4 h-4 text-chainwise-primary-400" />
                        {userCredits.balance} credits
                      </div>
                      <div className="text-xs text-gray-400 capitalize">
                        {userCredits.tier} plan
                      </div>
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage(message)
                          }
                        }}
                        placeholder={`Ask ${AI_PERSONAS[currentSession.persona].name} about crypto...`}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-chainwise-primary-400/50 focus:ring-1 focus:ring-chainwise-primary-400/50 pr-12 py-6 text-base rounded-xl"
                        disabled={isLoading}
                      />
                      {message.trim() && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                            Ready to send
                          </Badge>
                        </motion.div>
                      )}
                    </div>
                    <ShimmerButton
                      onClick={() => sendMessage(message)}
                      disabled={!message.trim() || isLoading}
                      className={cn(
                        "px-6 py-3 rounded-xl font-medium transition-all",
                        !message.trim() || isLoading
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-chainwise-primary-600 to-chainwise-accent-600 hover:from-chainwise-primary-700 hover:to-chainwise-accent-700 text-white shadow-lg"
                      )}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </ShimmerButton>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-2">
                      <RippleButton
                        onClick={() => setMessage("What's happening in the crypto market today?")}
                        className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white"
                        disabled={isLoading}
                      >
                        Market Update
                      </RippleButton>
                      <RippleButton
                        onClick={() => setMessage("Can you help me analyze my portfolio?")}
                        className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white"
                        disabled={isLoading}
                      >
                        Portfolio Review
                      </RippleButton>
                    </div>
                    <div className="text-xs text-gray-500">
                      Press Enter to send • Shift + Enter for new line
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* No Session State */
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
              <div className="absolute top-32 left-32 w-48 h-48 bg-chainwise-primary-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-32 right-32 w-32 h-32 bg-chainwise-accent-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              
              <div className="text-center relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="w-20 h-20 mx-auto mb-6">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      className="w-full h-full bg-gradient-to-r from-chainwise-primary-500 to-chainwise-accent-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Brain className="w-10 h-10 text-white" />
                    </motion.div>
                  </div>
                  
                  <SparklesText 
                    className="text-2xl font-bold mb-4"
                    colors={{
                      first: "#4f46e5",
                      second: "#2563eb"
                    }}
                    sparklesCount={8}
                  >
                    Welcome to ChainWise AI
                  </SparklesText>
                  
                  <p className="text-gray-300 text-lg mb-8 max-w-md">
                    Choose an AI character to start your personalized crypto conversation
                  </p>
                  
                  <ShimmerButton 
                    onClick={() => setShowPersonaSelector(true)}
                    className="bg-gradient-to-r from-chainwise-primary-600 to-chainwise-accent-600 hover:from-chainwise-primary-700 hover:to-chainwise-accent-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start New Chat
                  </ShimmerButton>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
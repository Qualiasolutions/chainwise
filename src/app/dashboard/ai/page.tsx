"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Bot,
  GraduationCap,
  TrendingUp,
  Send,
  Sparkles,
  Brain,
  Target,
  MessageCircle,
  Zap,
  Star,
  Clock,
  CreditCard,
  Crown,
  Shield,
  ChevronDown,
  Mic,
  Paperclip,
  MoreVertical,
  Settings,
  Maximize2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import { UpgradeModal } from "@/components/UpgradeModal"
import { DCAPlanner } from "@/components/premium/dca-planner-modal"
import { PortfolioAllocator } from "@/components/premium/portfolio-allocator-modal"
import { ScamDetector } from "@/components/premium/scam-detector-modal"
import { SmartSkeleton } from "@/components/ui/smart-skeleton"
import { AnimatedLoader } from "@/components/ui/animated-loader"
import { MicroInteraction } from "@/components/ui/micro-interaction"
import { DashboardGlassCard, GlassmorphismCard } from "@/components/ui/glassmorphism-card"

// AI Personas configuration matching OpenAI personas
const AI_PERSONAS = {
  buddy: {
    id: 'buddy',
    name: 'Buddy',
    icon: Bot,
    description: 'Casual crypto advice and friendly guidance',
    gradient: 'from-blue-500 to-cyan-500',
    tier: 'free',
    creditCost: 1,
    features: ['Basic market insights', 'Friendly conversation', 'General crypto advice', 'Simple explanations']
  },
  professor: {
    id: 'professor',
    name: 'Professor',
    icon: GraduationCap,
    description: 'Educational insights and deep analysis',
    gradient: 'from-purple-500 to-indigo-500',
    tier: 'pro',
    creditCost: 2,
    features: ['Educational content', 'Technical analysis', 'Market research', 'Investment strategies', 'Historical context']
  },
  trader: {
    id: 'trader',
    name: 'Trader',
    icon: TrendingUp,
    description: 'Professional trading signals and strategies',
    gradient: 'from-emerald-500 to-teal-500',
    tier: 'elite',
    creditCost: 3,
    features: ['Trading signals', 'Risk management', 'Portfolio optimization', 'Advanced strategies', 'Professional insights']
  }
}

// Note: Mock user data replaced with real Supabase integration

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  persona?: string
  timestamp: Date
  credits?: number
}

export default function AIPage() {
  const { profile } = useSupabaseAuth() // Get real user data from Supabase
  const [selectedPersona, setSelectedPersona] = useState<keyof typeof AI_PERSONAS>('buddy')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hi! I'm ${AI_PERSONAS.buddy.name}, your friendly crypto advisor. I'm here to help you navigate the exciting world of cryptocurrency with casual, easy-to-understand advice. What would you like to know about crypto today?`,
      sender: 'ai',
      persona: 'buddy',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const canUsePersona = (persona: keyof typeof AI_PERSONAS) => {
    const personaConfig = AI_PERSONAS[persona]
    const userTier = profile?.tier || 'free' // Use real user tier from Supabase

    if (personaConfig.tier === 'free') return true
    if (personaConfig.tier === 'pro') return ['pro', 'elite'].includes(userTier)
    if (personaConfig.tier === 'elite') return userTier === 'elite'
    return false
  }

  const handlePersonaChange = (persona: keyof typeof AI_PERSONAS) => {
    if (!canUsePersona(persona)) return

    setSelectedPersona(persona)
    const personaConfig = AI_PERSONAS[persona]

    // Add welcome message from new persona
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: getPersonaWelcomeMessage(persona),
      sender: 'ai',
      persona: persona,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, welcomeMessage])
  }

  const getPersonaWelcomeMessage = (persona: keyof typeof AI_PERSONAS) => {
    switch (persona) {
      case 'buddy':
        return "Hey there! I'm Buddy, your friendly crypto companion. I'll help you understand crypto in simple terms and give you casual advice. What's on your mind?"
      case 'professor':
        return "Greetings! I'm Professor, your educational crypto advisor. I specialize in providing in-depth analysis, technical insights, and comprehensive market research. How can I assist your learning journey today?"
      case 'trader':
        return "Welcome! I'm Trader, your professional trading strategist. I provide advanced trading signals, risk management strategies, and portfolio optimization techniques. What trading challenge can I help you solve?"
      default:
        return "Hello! How can I assist you today?"
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const personaConfig = AI_PERSONAS[selectedPersona]

    // Check if user has enough credits
    const userCredits = profile?.credits || 0
    if (userCredits < personaConfig.creditCost) {
      // Show proper upgrade modal for credit refill
      const upgradeModal = document.querySelector('[data-upgrade-modal-trigger]') as HTMLElement
      if (upgradeModal) {
        upgradeModal.click()
      } else {
        alert(`Insufficient credits. You need ${personaConfig.creditCost} credits to use ${personaConfig.name}. Please upgrade your plan.`)
      }
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Call real chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputMessage,
          persona: selectedPersona,
          sessionId: null // For now, create new session each time - can be enhanced later
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response')
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'ai',
        persona: selectedPersona,
        timestamp: new Date(),
        credits: personaConfig.creditCost
      }

      setMessages(prev => [...prev, aiResponse])

      // Update user credits in the UI (will be refetched on next auth state change)
      // This is a temporary solution until we implement proper state management
      if (profile && data.creditsRemaining !== undefined) {
        // Update the profile credits optimistically
        profile.credits = data.creditsRemaining
      }

    } catch (error: any) {
      console.error('Chat error:', error)

      // Show error message as AI response
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        sender: 'ai',
        persona: selectedPersona,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  // Mock response function removed - now using real API integration

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Professional Header - Clean and minimal */}
      <GlassmorphismCard variant="frost" className="relative border-b border-slate-200/60 dark:border-slate-800/60 flex-shrink-0 rounded-none"
        border={false}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900">
                    <div className="w-full h-full bg-green-400 rounded-full animate-ping"></div>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                    AI Advisory Console
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Professional cryptocurrency intelligence platform
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-4 ml-8">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-950/30 rounded-full border border-green-200 dark:border-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">Online</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <MessageCircle className="h-4 w-4" />
                  <span>{messages.length - 1} conversations</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{profile?.credits || 0}</span>
                    <span className="text-xs text-slate-500">credits</span>
                  </div>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <Badge
                  variant="outline"
                  className={cn(
                    "font-medium",
                    profile?.tier === 'elite' ? "border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/30" :
                    profile?.tier === 'pro' ? "border-purple-300 text-purple-700 bg-purple-50 dark:bg-purple-950/30" :
                    "border-slate-300 text-slate-700 bg-slate-50 dark:bg-slate-800"
                  )}
                >
                  {profile?.tier === 'elite' && <Crown className="h-3 w-3 mr-1" />}
                  {(profile?.tier || 'free').toUpperCase()}
                </Badge>
              </div>
              {profile?.tier === 'free' && (
                <UpgradeModal requiredTier="pro" personaName="Professor & Trader">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </UpgradeModal>
              )}
            </div>
          </div>
        </div>
      </GlassmorphismCard>

      <div className="flex-1 container mx-auto px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-4 h-full">
          {/* Professional Persona Selection */}
          <div className="lg:col-span-1">
            <DashboardGlassCard className="h-full flex flex-col">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">AI Advisors</h2>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Select your specialized cryptocurrency advisor
                </p>
              </div>
              <div className="flex-1 p-6 space-y-4">
                {Object.entries(AI_PERSONAS).map(([key, persona]) => {
                  const isSelected = selectedPersona === key
                  const canUse = canUsePersona(key as keyof typeof AI_PERSONAS)
                  const Icon = persona.icon

                  return (
                    <div
                      key={key}
                      className={cn(
                        "relative p-4 rounded-xl border cursor-pointer transition-all duration-200",
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 shadow-md"
                          : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800",
                        !canUse && "opacity-60"
                      )}
                      onClick={() => canUse && handlePersonaChange(key as keyof typeof AI_PERSONAS)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "relative w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm",
                          `bg-gradient-to-br ${persona.gradient}`,
                          isSelected && "ring-2 ring-blue-200 dark:ring-blue-800"
                        )}>
                          <Icon className="h-5 w-5" />
                          {isSelected && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white dark:border-slate-900"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={cn(
                              "font-semibold text-sm",
                              isSelected ? "text-blue-900 dark:text-blue-100" : "text-slate-900 dark:text-slate-100"
                            )}>
                              {persona.name}
                            </h3>
                            {persona.tier !== 'free' && (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs font-medium h-5",
                                  persona.tier === 'elite' ? "border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-950/30" :
                                  persona.tier === 'pro' ? "border-purple-200 text-purple-700 bg-purple-50 dark:bg-purple-950/30" : ""
                                )}
                              >
                                {persona.tier.toUpperCase()}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 leading-relaxed">
                            {persona.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3 text-amber-500" />
                              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                {persona.creditCost} credit{persona.creditCost > 1 ? 's' : ''}
                              </span>
                            </div>
                            {isSelected && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 text-xs h-5">
                                Active
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {!canUse && (
                        <div className="absolute inset-0 bg-slate-50/80 dark:bg-slate-900/80 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <UpgradeModal requiredTier={persona.tier} personaName={persona.name}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-white dark:bg-slate-800 shadow-sm text-xs"
                            >
                              <Crown className="h-3 w-3 mr-1" />
                              Unlock
                            </Button>
                          </UpgradeModal>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Professional Stats */}
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-3">Session Overview</div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-3 w-3 text-blue-500" />
                      <span className="text-slate-600 dark:text-slate-400">{messages.filter(m => m.sender === 'user').length} messages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-3 w-3 text-amber-500" />
                      <span className="text-slate-600 dark:text-slate-400">{messages.reduce((acc, m) => acc + (m.credits || 0), 0)} used</span>
                    </div>
                  </div>
                </div>
              </div>
            </DashboardGlassCard>
          </div>

          {/* Professional Chat Interface */}
          <div className="lg:col-span-3 flex flex-col h-full">
            <DashboardGlassCard className="flex-1 flex flex-col overflow-hidden" data-chat-card>
              {/* Clean Chat Header */}
              <div className="flex-shrink-0 border-b border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm",
                      `bg-gradient-to-br ${AI_PERSONAS[selectedPersona].gradient}`
                    )}>
                      {(() => {
                        const IconComponent = AI_PERSONAS[selectedPersona].icon
                        return <IconComponent className="h-5 w-5" />
                      })()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {AI_PERSONAS[selectedPersona].name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{AI_PERSONAS[selectedPersona].description}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 h-8 w-8 p-0"
                      onClick={() => {
                        setMessages([{
                          id: '1',
                          content: getPersonaWelcomeMessage(selectedPersona),
                          sender: 'ai',
                          persona: selectedPersona,
                          timestamp: new Date()
                        }])
                      }}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 h-8 w-8 p-0"
                      onClick={() => {
                        const chatCard = document.querySelector('[data-chat-card]') as HTMLElement
                        if (chatCard) {
                          if (chatCard.style.position === 'fixed') {
                            chatCard.style.position = 'relative'
                            chatCard.style.top = 'auto'
                            chatCard.style.left = 'auto'
                            chatCard.style.width = 'auto'
                            chatCard.style.height = 'auto'
                            chatCard.style.zIndex = 'auto'
                          } else {
                            chatCard.style.position = 'fixed'
                            chatCard.style.top = '0'
                            chatCard.style.left = '0'
                            chatCard.style.width = '100vw'
                            chatCard.style.height = '100vh'
                            chatCard.style.zIndex = '50'
                          }
                        }
                      }}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Professional Messages Container */}
              <div className="flex-1 flex flex-col bg-slate-50/30 dark:bg-slate-800/20">
                <ScrollArea className="flex-1 px-6 py-6">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3 group",
                          message.sender === 'user' ? "justify-end" : "justify-start"
                        )}
                      >
                        {message.sender === 'ai' && (
                          <div className={cn(
                            "w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center text-white shadow-sm",
                            `bg-gradient-to-br ${AI_PERSONAS[selectedPersona].gradient}`
                          )}>
                            {(() => {
                              const IconComponent = AI_PERSONAS[selectedPersona].icon
                              return <IconComponent className="h-4 w-4" />
                            })()}
                          </div>
                        )}

                        <div className={cn(
                          "max-w-[70%] flex flex-col",
                          message.sender === 'user' ? "items-end" : "items-start"
                        )}>
                          <div className={cn(
                            "relative px-4 py-3 rounded-2xl shadow-sm border",
                            message.sender === 'user'
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700"
                          )}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                            {/* Professional Message Actions */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-7 right-0 flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm px-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                                onClick={() => {
                                  navigator.clipboard.writeText(message.content)
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              {message.sender === 'ai' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                                    onClick={async () => {
                                      try {
                                        await fetch('/api/chat/feedback', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({
                                            messageId: message.id,
                                            feedback: 'positive',
                                            persona: selectedPersona
                                          })
                                        })
                                      } catch (error) {
                                        console.error('Failed to save feedback:', error)
                                      }
                                    }}
                                  >
                                    <ThumbsUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                                    onClick={async () => {
                                      try {
                                        await fetch('/api/chat/feedback', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({
                                            messageId: message.id,
                                            feedback: 'negative',
                                            persona: selectedPersona
                                          })
                                        })
                                      } catch (error) {
                                        console.error('Failed to save feedback:', error)
                                      }
                                    }}
                                  >
                                    <ThumbsDown className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                            <span>
                              {typeof window !== 'undefined' ? message.timestamp.toLocaleTimeString() : ''}
                            </span>
                            {message.credits && (
                              <Badge variant="outline" className="text-xs border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-950/30">
                                <Zap className="h-3 w-3 mr-1" />
                                -{message.credits} credits
                              </Badge>
                            )}
                          </div>
                        </div>

                        {message.sender === 'user' && (
                          <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                            {profile?.email?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                    </div>
                  ))}

                    {isLoading && (
                      <div className="flex gap-3">
                        <div className={cn(
                          "w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center text-white shadow-sm",
                          `bg-gradient-to-br ${AI_PERSONAS[selectedPersona].gradient}`
                        )}>
                          {(() => {
                            const IconComponent = AI_PERSONAS[selectedPersona].icon
                            return <IconComponent className="h-4 w-4" />
                          })()}
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-sm border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                            </div>
                            <span className="text-sm text-slate-500">Analyzing...</span>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

                {/* Professional Input Area */}
                <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex-shrink-0">
                  <div className="flex items-end gap-3">
                    <div className="flex-1 relative">
                      <Textarea
                        placeholder={`Message ${AI_PERSONAS[selectedPersona].name}...`}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        disabled={isLoading}
                        className="min-h-[48px] max-h-[120px] resize-none bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30"
                        rows={1}
                      />
                      <div className="absolute bottom-3 right-3 flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                          <Paperclip className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                          <Mic className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputMessage.trim()}
                      size="lg"
                      className="h-[48px] w-[48px] rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                    <span>
                      Press Enter to send • Shift+Enter for new line
                    </span>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-500" />
                      <span>
                        {AI_PERSONAS[selectedPersona].creditCost} credit{AI_PERSONAS[selectedPersona].creditCost > 1 ? 's' : ''} per message
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </DashboardGlassCard>
          </div>
        </div>

        {/* Professional Premium Tools Section */}
        <div className="container mx-auto px-6 py-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Professional AI Tools</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Advanced cryptocurrency analysis and strategy tools
              </p>
            </div>
            {(profile?.tier === 'free' || !profile) && (
              <UpgradeModal requiredTier="pro" personaName="Premium Tools">
                <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
                  <Crown className="h-4 w-4 mr-2" />
                  Unlock Premium Tools
                </Button>
              </UpgradeModal>
            )}
          </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* DCA Planner */}
          <Card className="ai-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                DCA & Exit Planner
                <Badge variant="secondary">5 Credits</Badge>
              </CardTitle>
              <CardDescription>
                AI-powered Dollar Cost Averaging strategy with smart exit planning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Optimized DCA schedules</li>
                  <li>• Risk management strategies</li>
                  <li>• Exit strategy planning</li>
                  <li>• Professional trading advice</li>
                </ul>
                {(profile?.tier === 'pro' || profile?.tier === 'elite') ? (
                  <DCAPlanner />
                ) : (
                  <UpgradeModal requiredTier="pro" personaName="DCA Planner">
                    <Button variant="outline" className="w-full" disabled>
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade Required
                    </Button>
                  </UpgradeModal>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Allocator */}
          <Card className="ai-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Portfolio Allocator
                <Badge variant="secondary">8 Credits</Badge>
              </CardTitle>
              <CardDescription>
                AI-driven portfolio allocation and rebalancing recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Smart allocation analysis</li>
                  <li>• Risk-adjusted portfolios</li>
                  <li>• Rebalancing strategies</li>
                  <li>• Diversification insights</li>
                </ul>
                {(profile?.tier === 'pro' || profile?.tier === 'elite') ? (
                  <PortfolioAllocator />
                ) : (
                  <UpgradeModal requiredTier="pro" personaName="Portfolio Allocator">
                    <Button variant="outline" className="w-full" disabled>
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade Required
                    </Button>
                  </UpgradeModal>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Scam Detection */}
          <Card className="ai-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                Scam & Risk Detector
                <Badge variant="secondary">3 Credits</Badge>
              </CardTitle>
              <CardDescription>
                Advanced scam detection and risk analysis for crypto projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Smart contract analysis</li>
                  <li>• Social sentiment scoring</li>
                  <li>• Developer activity tracking</li>
                  <li>• Risk assessment reports</li>
                </ul>
                {(profile?.tier === 'pro' || profile?.tier === 'elite') ? (
                  <ScamDetector />
                ) : (
                  <UpgradeModal requiredTier="pro" personaName="Scam & Risk Detector">
                    <Button variant="outline" className="w-full" disabled>
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade Required
                    </Button>
                  </UpgradeModal>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  )
}
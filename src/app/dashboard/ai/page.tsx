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
    <div className="h-full flex flex-col">
      {/* Modern Header - Reduced spacing and height */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-cyan-950/30 p-6 backdrop-blur-sm border border-white/20 flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10"></div>
        <div className="relative flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              AI Chat Assistant
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Get personalized crypto advice from our AI-powered advisors
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                AI Models Online
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <MessageCircle className="h-4 w-4" />
                {messages.length - 1} messages today
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Card className="bg-white/60 backdrop-blur-sm border-white/40 shadow-lg rounded-lg">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    {(profile?.credits || 0) > 0 && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold">{profile?.credits || 0}</span>
                    <span className="text-xs text-muted-foreground">credits</span>
                  </div>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <Badge
                  variant="outline"
                  className={cn(
                    "font-semibold text-xs",
                    profile?.tier === 'elite' ? "border-yellow-400 text-yellow-600 bg-yellow-50" :
                    profile?.tier === 'pro' ? "border-purple-400 text-purple-600 bg-purple-50" :
                    "border-gray-400 text-gray-600 bg-gray-50"
                  )}
                >
                  {profile?.tier === 'elite' && <Crown className="h-3 w-3 mr-1" />}
                  {(profile?.tier || 'free').toUpperCase()}
                </Badge>
              </CardContent>
            </Card>
            {profile?.tier === 'free' && (
              <UpgradeModal requiredTier="pro" personaName="Professor & Trader">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg rounded-lg">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade
                </Button>
              </UpgradeModal>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 grid gap-4 lg:grid-cols-4 overflow-hidden">
        {/* Enhanced Persona Selection */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-0 shadow-xl rounded-lg h-full flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                AI Advisors
              </CardTitle>
              <CardDescription>
                Choose your preferred AI personality for personalized advice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(AI_PERSONAS).map(([key, persona]) => {
                const isSelected = selectedPersona === key
                const canUse = canUsePersona(key as keyof typeof AI_PERSONAS)
                const Icon = persona.icon

                return (
                  <div
                    key={key}
                    className={cn(
                      "relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02]",
                      isSelected
                        ? "ring-4 ring-blue-500/20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/40 dark:to-purple-950/40 border-blue-400 shadow-lg"
                        : "hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 border-gray-200 dark:border-gray-700",
                      !canUse && "opacity-60"
                    )}
                    onClick={() => canUse && handlePersonaChange(key as keyof typeof AI_PERSONAS)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "relative w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-lg",
                        `bg-gradient-to-r ${persona.gradient}`,
                        isSelected && "ring-4 ring-white/30"
                      )}>
                        <Icon className="h-6 w-6" />
                        {isSelected && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white">
                            <div className="w-full h-full bg-green-400 rounded-full animate-ping"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={cn(
                            "font-bold text-lg",
                            isSelected ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-gray-100"
                          )}>
                            {persona.name}
                          </h3>
                          {persona.tier !== 'free' && (
                            <Badge
                              variant={isSelected ? "default" : "secondary"}
                              className={cn(
                                "text-xs font-semibold",
                                persona.tier === 'elite' ? "bg-yellow-100 text-yellow-700 border-yellow-300" :
                                persona.tier === 'pro' ? "bg-purple-100 text-purple-700 border-purple-300" : ""
                              )}
                            >
                              {persona.tier.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                          {persona.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-500" />
                            <span className="text-sm font-medium text-amber-600">
                              {persona.creditCost} credit{persona.creditCost > 1 ? 's' : ''}
                            </span>
                          </div>
                          {isSelected && (
                            <Badge variant="default" className="bg-green-100 text-green-700 border-green-300">
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {!canUse && (
                      <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <UpgradeModal requiredTier={persona.tier} personaName={persona.name}>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="bg-white/90 hover:bg-white shadow-lg"
                          >
                            <Crown className="h-4 w-4 mr-2" />
                            Unlock
                          </Button>
                        </UpgradeModal>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Quick Stats */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border border-blue-200/50">
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Today's Usage</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3 text-blue-500" />
                    <span>{messages.filter(m => m.sender === 'user').length} chats</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-amber-500" />
                    <span>{messages.reduce((acc, m) => acc + (m.credits || 0), 0)} credits</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Chat Interface */}
        <div className="lg:col-span-3 flex flex-col h-full">
          <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-0 shadow-2xl rounded-lg flex-1 flex flex-col overflow-hidden" data-chat-card>
            {/* Chat Header */}
            <CardHeader className="flex-shrink-0 bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border-2 border-white shadow-lg">
                    <AvatarFallback className={cn(
                      "text-white font-bold",
                      `bg-gradient-to-r ${AI_PERSONAS[selectedPersona].gradient}`
                    )}>
                      {(() => {
                        const IconComponent = AI_PERSONAS[selectedPersona].icon
                        return <IconComponent className="h-5 w-5" />
                      })()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                      Chat with {AI_PERSONAS[selectedPersona].name}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      {AI_PERSONAS[selectedPersona].description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0"
                    onClick={() => {
                      // Clear chat messages
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
                    className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0"
                    onClick={() => {
                      // Toggle fullscreen mode
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
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages Container */}
            <CardContent className="flex-1 flex flex-col p-0 bg-gradient-to-br from-gray-50/30 to-white/30 dark:from-gray-900/30 dark:to-gray-800/30">
              <ScrollArea className="flex-1 px-6 py-4">
                <div className="space-y-6">
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-4 group",
                        message.sender === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.sender === 'ai' && (
                        <Avatar className="w-10 h-10 flex-shrink-0 border-2 border-white shadow-lg">
                          <AvatarFallback className={cn(
                            "text-white",
                            `bg-gradient-to-r ${AI_PERSONAS[selectedPersona].gradient}`
                          )}>
                            {(() => {
                              const IconComponent = AI_PERSONAS[selectedPersona].icon
                              return <IconComponent className="h-5 w-5" />
                            })()}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div className={cn(
                        "max-w-[75%] flex flex-col",
                        message.sender === 'user' ? "items-end" : "items-start"
                      )}>
                        <div className={cn(
                          "relative px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm border",
                          message.sender === 'user'
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-500/20"
                            : "bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 border-gray-200/50 dark:border-gray-700/50"
                        )}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                          {/* Message actions */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-8 right-0 flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => {
                                navigator.clipboard.writeText(message.content)
                                // Could add a toast here
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            {message.sender === 'ai' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={async () => {
                                    // Save feedback via MCP
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
                                  className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={async () => {
                                    // Save feedback via MCP
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

                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span>
                            {typeof window !== 'undefined' ? message.timestamp.toLocaleTimeString() : ''}
                          </span>
                          {message.credits && (
                            <Badge variant="outline" className="text-xs border-amber-300 text-amber-600 bg-amber-50">
                              <Zap className="h-3 w-3 mr-1" />
                              -{message.credits} credits
                            </Badge>
                          )}
                        </div>
                      </div>

                      {message.sender === 'user' && (
                        <Avatar className="w-10 h-10 flex-shrink-0 border-2 border-white shadow-lg">
                          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold">
                            {profile?.email?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-4">
                      <Avatar className="w-10 h-10 flex-shrink-0 border-2 border-white shadow-lg">
                        <AvatarFallback className={cn(
                          "text-white",
                          `bg-gradient-to-r ${AI_PERSONAS[selectedPersona].gradient}`
                        )}>
                          {(() => {
                            const IconComponent = AI_PERSONAS[selectedPersona].icon
                            return <IconComponent className="h-5 w-5" />
                          })()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg px-4 py-3 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center gap-1">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-200"></div>
                          </div>
                          <span className="text-sm text-gray-500 ml-2">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Enhanced Input Area */}
              <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-3 flex-shrink-0">
                <div className="flex items-end gap-3">
                  <div className="flex-1 relative">
                    <Textarea
                      placeholder={`Ask ${AI_PERSONAS[selectedPersona].name} anything about crypto...`}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      disabled={isLoading}
                      className="min-h-[50px] max-h-[100px] resize-none bg-white/80 dark:bg-gray-900/80 border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20"
                      rows={1}
                    />
                    <div className="absolute bottom-2 right-2 flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600">
                        <Paperclip className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600">
                        <Mic className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    size="lg"
                    className="h-[50px] w-[50px] rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>
                    Press Enter to send, Shift+Enter for new line
                  </span>
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-amber-500" />
                    <span>
                      {AI_PERSONAS[selectedPersona].creditCost} credit{AI_PERSONAS[selectedPersona].creditCost > 1 ? 's' : ''} per message
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Premium Tools Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Premium AI Tools</h2>
            <p className="text-muted-foreground">
              Advanced AI-powered tools for professional crypto analysis
            </p>
          </div>
          {(profile?.tier === 'free' || !profile) && (
            <UpgradeModal requiredTier="pro" personaName="Premium Tools">
              <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
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
  )
}
"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
  CreditCard
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"

// AI Personas configuration based on README.md
const AI_PERSONAS = {
  buddy: {
    id: 'buddy',
    name: 'Buddy',
    icon: Bot,
    description: 'Casual crypto advice and friendly guidance',
    gradient: 'from-blue-500 to-cyan-500',
    tier: 'free',
    creditCost: 1,
    features: ['Basic market insights', 'Friendly conversation', 'General crypto advice']
  },
  professor: {
    id: 'professor',
    name: 'Professor',
    icon: GraduationCap,
    description: 'Educational insights and deep analysis',
    gradient: 'from-purple-500 to-indigo-500',
    tier: 'pro',
    creditCost: 2,
    features: ['Educational content', 'Technical analysis', 'Market research', 'Investment strategies']
  },
  trader: {
    id: 'trader',
    name: 'Trader',
    icon: TrendingUp,
    description: 'Professional trading signals and strategies',
    gradient: 'from-emerald-500 to-teal-500',
    tier: 'elite',
    creditCost: 3,
    features: ['Trading signals', 'Risk management', 'Portfolio optimization', 'Advanced strategies']
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
      // TODO: Show upgrade modal or redirect to billing
      alert(`Insufficient credits. You need ${personaConfig.creditCost} credits to use ${personaConfig.name}.`)
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
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Chat Assistant
          </h1>
          <p className="text-muted-foreground">
            Get personalized crypto advice from our AI-powered advisors
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Card className="ai-card">
            <CardContent className="flex items-center gap-2 p-3">
              <CreditCard className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{profile?.credits || 0} credits</span>
              <Badge variant="outline">{(profile?.tier || 'free').toUpperCase()}</Badge>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Persona Selection */}
        <div className="lg:col-span-1">
          <Card className="ai-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Advisors
              </CardTitle>
              <CardDescription>
                Choose your preferred AI persona
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(AI_PERSONAS).map(([key, persona]) => {
                const isSelected = selectedPersona === key
                const canUse = canUsePersona(key as keyof typeof AI_PERSONAS)
                const Icon = persona.icon

                return (
                  <div
                    key={key}
                    className={cn(
                      "relative p-4 rounded-lg border cursor-pointer transition-all duration-200",
                      isSelected ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20" : "hover:bg-gray-100 dark:hover:bg-gray-800",
                      !canUse && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => canUse && handlePersonaChange(key as keyof typeof AI_PERSONAS)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center text-white",
                        `bg-gradient-to-r ${persona.gradient}`
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{persona.name}</h3>
                          {!canUse && (
                            <Badge variant="secondary" className="text-xs">
                              {persona.tier.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {persona.description}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <Zap className="h-3 w-3 text-amber-500" />
                          <span className="text-xs text-gray-500">
                            {persona.creditCost} credit{persona.creditCost > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!canUse && (
                      <div className="absolute inset-0 bg-black/5 rounded-lg flex items-center justify-center">
                        <Badge variant="secondary">Upgrade Required</Badge>
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="ai-card h-[700px] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-white",
                  `bg-gradient-to-r ${AI_PERSONAS[selectedPersona].gradient}`
                )}>
                  {(() => {
                    const IconComponent = AI_PERSONAS[selectedPersona].icon
                    return <IconComponent className="h-5 w-5" />
                  })()}
                </div>
                <div>
                  <CardTitle>Chat with {AI_PERSONAS[selectedPersona].name}</CardTitle>
                  <CardDescription>
                    {AI_PERSONAS[selectedPersona].description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <Separator />

            {/* Messages */}
            <CardContent className="flex-1 flex flex-col p-0">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.sender === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.sender === 'ai' && (
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0",
                        `bg-gradient-to-r ${AI_PERSONAS[selectedPersona].gradient}`
                      )}>
                        {(() => {
                          const IconComponent = AI_PERSONAS[selectedPersona].icon
                          return <IconComponent className="h-4 w-4" />
                        })()}
                      </div>
                    )}

                    <div className={cn(
                      "max-w-[80%] rounded-lg p-3",
                      message.sender === 'user'
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800"
                    )}>
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs opacity-70">
                          {typeof window !== 'undefined' ? message.timestamp.toLocaleTimeString() : ''}
                        </span>
                        {message.credits && (
                          <Badge variant="secondary" className="text-xs">
                            -{message.credits} credits
                          </Badge>
                        )}
                      </div>
                    </div>

                    {message.sender === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
                        <span className="text-sm font-semibold">U</span>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-white",
                      `bg-gradient-to-r ${AI_PERSONAS[selectedPersona].gradient}`
                    )}>
                      {(() => {
                        const IconComponent = AI_PERSONAS[selectedPersona].icon
                        return <IconComponent className="h-4 w-4" />
                      })()}
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder={`Ask ${AI_PERSONAS[selectedPersona].name} anything about crypto...`}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This conversation will cost {AI_PERSONAS[selectedPersona].creditCost} credit{AI_PERSONAS[selectedPersona].creditCost > 1 ? 's' : ''} per message
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
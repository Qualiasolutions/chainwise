"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bot,
  GraduationCap,
  TrendingUp,
  Send,
  Sparkles,
  Menu,
  Plus,
  ArrowUp,
  User,
  ChevronDown,
  Copy,
  RotateCw,
  Share,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import { UpgradeModal } from "@/components/UpgradeModal"

const AI_PERSONAS = {
  buddy: {
    id: 'buddy',
    name: 'Buddy',
    icon: Bot,
    description: 'Casual crypto companion',
    gradient: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500',
    tier: 'free',
    creditCost: 1,
  },
  professor: {
    id: 'professor',
    name: 'Professor',
    icon: GraduationCap,
    description: 'Educational insights',
    gradient: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500',
    tier: 'pro',
    creditCost: 2,
  },
  trader: {
    id: 'trader',
    name: 'Trader',
    icon: TrendingUp,
    description: 'Professional trading',
    gradient: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-500',
    tier: 'elite',
    creditCost: 3,
  }
}

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  persona?: string
  timestamp: Date
  credits?: number
}

export default function AIPage() {
  const { profile } = useSupabaseAuth()
  const [selectedPersona, setSelectedPersona] = useState<keyof typeof AI_PERSONAS>('buddy')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hi! I'm ${AI_PERSONAS.buddy.name}, your crypto companion. How can I help you today?`,
      sender: 'ai',
      persona: 'buddy',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [inputMessage])

  const canUsePersona = (persona: keyof typeof AI_PERSONAS) => {
    const personaConfig = AI_PERSONAS[persona]
    const userTier = profile?.tier || 'free'

    if (personaConfig.tier === 'free') return true
    if (personaConfig.tier === 'pro') return ['pro', 'elite'].includes(userTier)
    if (personaConfig.tier === 'elite') return userTier === 'elite'
    return false
  }

  const handlePersonaChange = (persona: keyof typeof AI_PERSONAS) => {
    if (!canUsePersona(persona)) return

    setSelectedPersona(persona)
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: getPersonaWelcomeMessage(persona),
      sender: 'ai',
      persona: persona,
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
    setShowSidebar(false)
  }

  const getPersonaWelcomeMessage = (persona: keyof typeof AI_PERSONAS) => {
    switch (persona) {
      case 'buddy':
        return "Hey! I'm Buddy, here to help with crypto in simple terms. What's on your mind?"
      case 'professor':
        return "Greetings! I'm Professor, ready to provide in-depth analysis and insights. How can I assist?"
      case 'trader':
        return "Welcome! I'm Trader, your professional trading strategist. What's your trading question?"
      default:
        return "Hello! How can I help you today?"
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const personaConfig = AI_PERSONAS[selectedPersona]
    const userCredits = profile?.credits || 0

    if (userCredits < personaConfig.creditCost) {
      alert(`Insufficient credits. You need ${personaConfig.creditCost} credits.`)
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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          persona: selectedPersona,
          sessionId: null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
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

      if (profile && data.creditsRemaining !== undefined) {
        profile.credits = data.creditsRemaining
      }

    } catch (error: any) {
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `Sorry, I encountered an error. Please try again.`,
        sender: 'ai',
        persona: selectedPersona,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-950 overflow-hidden">
      {/* Mobile-first header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm">New chat</span>
          </Button>

          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center text-white",
              AI_PERSONAS[selectedPersona].bgColor
            )}>
              {(() => {
                const Icon = AI_PERSONAS[selectedPersona].icon
                return <Icon className="h-4 w-4" />
              })()}
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {AI_PERSONAS[selectedPersona].name}
              </div>
              <div className="text-xs text-slate-500">
                {AI_PERSONAS[selectedPersona].description}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-lg">
            <Zap className="h-3 w-3 text-amber-500" />
            <span className="text-sm font-medium">{profile?.credits || 0}</span>
          </div>

          {profile?.tier === 'free' && (
            <UpgradeModal requiredTier="pro" personaName="Premium">
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 px-3 py-1.5 text-sm"
              >
                Upgrade
              </Button>
            </UpgradeModal>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Mobile overlay or desktop persistent */}
        <div className={cn(
          "absolute md:relative z-40 md:z-0 w-64 md:w-72 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 h-full",
          showSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "hidden md:block" // Hide on mobile by default
        )}>
          <div className="p-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">AI Advisors</h3>
            <div className="space-y-2">
              {Object.entries(AI_PERSONAS).map(([key, persona]) => {
                const isSelected = selectedPersona === key
                const canUse = canUsePersona(key as keyof typeof AI_PERSONAS)
                const Icon = persona.icon

                return (
                  <button
                    key={key}
                    onClick={() => canUse && handlePersonaChange(key as keyof typeof AI_PERSONAS)}
                    className={cn(
                      "w-full p-3 rounded-lg text-left transition-all",
                      isSelected
                        ? "bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700"
                        : "hover:bg-white/50 dark:hover:bg-slate-800/50",
                      !canUse && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={!canUse}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center text-white",
                        persona.bgColor
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {persona.name}
                          </span>
                          {persona.tier !== 'free' && (
                            <Badge variant="outline" className="text-xs h-4 px-1">
                              {persona.tier}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {persona.creditCost} credit{persona.creditCost > 1 ? 's' : ''} per message
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Mobile sidebar overlay backdrop */}
        {showSidebar && (
          <div
            className="absolute inset-0 bg-black/20 z-30 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Main chat area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-950">
          {/* Messages */}
          <ScrollArea className="flex-1 px-4 py-6">
            <div className="max-w-3xl mx-auto space-y-6">
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
                      "w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0",
                      AI_PERSONAS[message.persona as keyof typeof AI_PERSONAS]?.bgColor || 'bg-slate-500'
                    )}>
                      {(() => {
                        const persona = AI_PERSONAS[message.persona as keyof typeof AI_PERSONAS]
                        const Icon = persona?.icon || Bot
                        return <Icon className="h-4 w-4" />
                      })()}
                    </div>
                  )}

                  <div className={cn(
                    "max-w-[85%] md:max-w-[75%] group relative",
                    message.sender === 'user' ? "order-first" : ""
                  )}>
                    <div className={cn(
                      "px-4 py-2.5 rounded-2xl",
                      message.sender === 'user'
                        ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                        : "bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    )}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>

                    {/* Message actions */}
                    {message.sender === 'ai' && (
                      <div className="absolute -bottom-5 left-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          onClick={() => navigator.clipboard.writeText(message.content)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          <Share className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          <RotateCw className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {message.sender === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white dark:text-slate-900" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-white",
                    AI_PERSONAS[selectedPersona].bgColor
                  )}>
                    {(() => {
                      const Icon = AI_PERSONAS[selectedPersona].icon
                      return <Icon className="h-4 w-4" />
                    })()}
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-3 bg-white dark:bg-slate-950">
            <div className="max-w-3xl mx-auto">
              <div className="relative flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
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
                    className={cn(
                      "w-full px-4 py-3 pr-12 resize-none rounded-2xl",
                      "bg-slate-100 dark:bg-slate-900",
                      "border-0 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100",
                      "text-sm placeholder:text-slate-500",
                      "max-h-32 min-h-[48px]"
                    )}
                    rows={1}
                    style={{ height: 'auto' }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    size="sm"
                    className={cn(
                      "absolute right-2 bottom-2 h-8 w-8 rounded-lg p-0",
                      "bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <ArrowUp className="h-4 w-4 text-white dark:text-slate-900" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                <span className="hidden sm:block">
                  {AI_PERSONAS[selectedPersona].creditCost} credit{AI_PERSONAS[selectedPersona].creditCost > 1 ? 's' : ''} per message
                </span>
                <span className="sm:hidden">
                  {AI_PERSONAS[selectedPersona].creditCost} credit{AI_PERSONAS[selectedPersona].creditCost > 1 ? 's' : ''}
                </span>
                <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 rounded text-xs">
                  Enter to send
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
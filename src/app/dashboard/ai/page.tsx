"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bot,
  GraduationCap,
  TrendingUp,
  Send,
  Plus,
  ArrowUp,
  User,
  ChevronDown,
  Copy,
  RotateCw,
  Share,
  Zap,
  Check,
  Lock,
  Sparkles,
  Brain,
  MessageCircle,
  Clock,
  Search,
  History,
  Settings,
  Trash2,
  Archive,
  Star,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeft,
  Command as CommandIcon,
  Mic,
  Paperclip
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import { UpgradeModal } from "@/components/UpgradeModal"

const AI_PERSONAS = {
  buddy: {
    id: 'buddy',
    name: 'Buddy',
    icon: Bot,
    description: 'Casual crypto companion for simple advice',
    gradient: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500',
    tier: 'free',
    creditCost: 1,
    color: 'blue',
  },
  professor: {
    id: 'professor',
    name: 'Professor',
    icon: GraduationCap,
    description: 'Educational insights and deep analysis',
    gradient: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500',
    tier: 'pro',
    creditCost: 2,
    color: 'purple',
  },
  trader: {
    id: 'trader',
    name: 'Trader',
    icon: TrendingUp,
    description: 'Professional trading strategies',
    gradient: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-500',
    tier: 'elite',
    creditCost: 3,
    color: 'emerald',
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

interface ChatSession {
  id: string
  title: string
  lastMessage?: string
  timestamp: Date
  persona: keyof typeof AI_PERSONAS
  messageCount: number
}

export default function AIPage() {
  const { profile } = useSupabaseAuth()
  const [selectedPersona, setSelectedPersona] = useState<keyof typeof AI_PERSONAS>('buddy')
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: 'Bitcoin Analysis',
      lastMessage: 'What do you think about BTC?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      persona: 'buddy',
      messageCount: 5
    },
    {
      id: '2',
      title: 'Trading Strategy',
      lastMessage: 'Show me some trading signals',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      persona: 'trader',
      messageCount: 12
    },
    {
      id: '3',
      title: 'DeFi Learning',
      lastMessage: 'Explain liquidity pools',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      persona: 'professor',
      messageCount: 8
    }
  ])
  const [currentSessionId, setCurrentSessionId] = useState<string>('1')
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
  const [isTyping, setIsTyping] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const scrollContainer = messagesEndRef.current?.parentElement?.parentElement
    if (scrollContainer) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

      if (isNearBottom || messages[messages.length - 1]?.sender === 'ai') {
        setTimeout(() => scrollToBottom(), 100)
      }
    }
  }, [messages])

  useEffect(() => {
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
    const transitionMessage: Message = {
      id: Date.now().toString(),
      content: `Switched to ${AI_PERSONAS[persona].name}. ${getPersonaTransitionMessage(persona)}`,
      sender: 'ai',
      persona: persona,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, transitionMessage])
  }

  const getPersonaTransitionMessage = (persona: keyof typeof AI_PERSONAS) => {
    switch (persona) {
      case 'buddy':
        return "I'll help you understand crypto in simple terms. What would you like to know?"
      case 'professor':
        return "I'll provide you with detailed analysis and educational insights. How can I assist?"
      case 'trader':
        return "I'll give you professional trading strategies and market analysis. What's your question?"
      default:
        return "How can I help you?"
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
    setIsTyping(true)

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
      setIsTyping(false)
    }
  }

  const handleNewChat = () => {
    const newSessionId = Date.now().toString()
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Chat',
      timestamp: new Date(),
      persona: selectedPersona,
      messageCount: 1
    }

    setSessions(prev => [newSession, ...prev])
    setCurrentSessionId(newSessionId)
    setMessages([{
      id: Date.now().toString(),
      content: `Hi! I'm ${AI_PERSONAS[selectedPersona].name}. How can I help you today?`,
      sender: 'ai',
      persona: selectedPersona,
      timestamp: new Date()
    }])
  }

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="h-screen flex w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/10 to-blue-400/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/10 to-purple-400/10 rounded-full blur-3xl"
              animate={{
                scale: [1.1, 1, 1.1],
                rotate: [360, 180, 0]
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-violet-400/5 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Sidebar */}
          <Sidebar className="border-r border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
            <SidebarHeader className="p-4 border-b border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 flex items-center justify-center"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Brain className="h-4 w-4 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">AI Assistant</h2>
                  <p className="text-xs text-slate-500">ChainWise</p>
                </div>
              </div>

              <Button
                onClick={handleNewChat}
                className="w-full mt-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </SidebarHeader>

            <SidebarContent className="p-2">
              {/* Search */}
              <div className="px-2 mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-700/50 rounded-lg focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>

              <SidebarGroup>
                <SidebarGroupLabel className="text-xs text-slate-500 mb-2 px-2">Recent Chats</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <AnimatePresence>
                      {filteredSessions.map((session, index) => (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              onClick={() => setCurrentSessionId(session.id)}
                              className={cn(
                                "w-full h-auto p-3 flex flex-col items-start gap-1 rounded-lg transition-all duration-300 hover:bg-slate-100/80 dark:hover:bg-slate-900/80",
                                currentSessionId === session.id && "bg-slate-100 dark:bg-slate-900 border border-violet-200 dark:border-violet-800"
                              )}
                            >
                              <div className="flex items-center gap-2 w-full">
                                <div className={cn(
                                  "w-6 h-6 rounded-md flex items-center justify-center text-white flex-shrink-0",
                                  AI_PERSONAS[session.persona].bgColor
                                )}>
                                  {(() => {
                                    const Icon = AI_PERSONAS[session.persona].icon
                                    return <Icon className="h-3 w-3" />
                                  })()}
                                </div>
                                <span className="text-sm font-medium truncate flex-1">{session.title}</span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                                      <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem>
                                      <Star className="h-4 w-4 mr-2" />
                                      Favorite
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Archive className="h-4 w-4 mr-2" />
                                      Archive
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              {session.lastMessage && (
                                <p className="text-xs text-slate-500 truncate w-full text-left">
                                  {session.lastMessage}
                                </p>
                              )}
                              <div className="flex items-center justify-between w-full text-xs text-slate-400">
                                <span>{new Date(session.timestamp).toLocaleDateString()}</span>
                                <Badge variant="secondary" className="text-xs h-4 px-1">
                                  {session.messageCount}
                                </Badge>
                              </div>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div
                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/50 dark:to-yellow-950/50 rounded-lg border border-amber-200/50 dark:border-amber-800/50"
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="h-3 w-3 text-amber-500" />
                    </motion.div>
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-300">{profile?.credits || 0}</span>
                  </motion.div>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Settings</TooltipContent>
                </Tooltip>
              </div>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>

          {/* Main Content */}
          <SidebarInset className="flex-1 flex flex-col">
            {/* Header */}
            <motion.header
              className="flex items-center justify-between px-4 py-3 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl relative"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-blue-500/5 pointer-events-none" />

              <div className="flex items-center gap-3 relative z-10">
                <SidebarTrigger className="md:hidden" />

                {/* Persona Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 px-3 py-2 h-auto border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50/80 dark:hover:bg-slate-900/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-700"
                      >
                        <div className={cn(
                          "w-7 h-7 rounded-md flex items-center justify-center text-white",
                          AI_PERSONAS[selectedPersona].bgColor
                        )}>
                          {(() => {
                            const Icon = AI_PERSONAS[selectedPersona].icon
                            return <Icon className="h-4 w-4" />
                          })()}
                        </div>
                        <div className="text-left hidden sm:block">
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {AI_PERSONAS[selectedPersona].name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {AI_PERSONAS[selectedPersona].creditCost} credit{AI_PERSONAS[selectedPersona].creditCost > 1 ? 's' : ''}/msg
                          </div>
                        </div>
                        <ChevronDown className="h-4 w-4 text-slate-500 ml-1" />
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-72 p-2">
                    {Object.entries(AI_PERSONAS).map(([key, persona]) => {
                      const isSelected = selectedPersona === key
                      const canUse = canUsePersona(key as keyof typeof AI_PERSONAS)
                      const Icon = persona.icon

                      return (
                        <DropdownMenuItem
                          key={key}
                          onClick={() => canUse && handlePersonaChange(key as keyof typeof AI_PERSONAS)}
                          className={cn(
                            "flex items-start gap-3 p-3 cursor-pointer rounded-lg",
                            isSelected && "bg-slate-100 dark:bg-slate-800",
                            !canUse && "opacity-50 cursor-not-allowed"
                          )}
                          disabled={!canUse}
                        >
                          <div className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center text-white flex-shrink-0",
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
                              {isSelected && (
                                <Check className="h-3 w-3 text-green-500 ml-auto" />
                              )}
                              {!canUse && (
                                <Lock className="h-3 w-3 text-slate-400 ml-auto" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              {persona.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs text-slate-500">
                                {persona.creditCost} credit{persona.creditCost > 1 ? 's' : ''} per message
                              </span>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      )
                    })}

                    {profile?.tier === 'free' && (
                      <div className="border-t border-slate-200 dark:border-slate-700 mt-2 pt-2">
                        <UpgradeModal requiredTier="pro" personaName="Premium Advisors">
                          <Button
                            size="sm"
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Unlock Premium Advisors
                          </Button>
                        </UpgradeModal>
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-2 relative z-10">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCommandOpen(true)}
                      className="hidden md:flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      <CommandIcon className="h-3 w-3" />
                      <span>⌘K</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Open command palette</TooltipContent>
                </Tooltip>

                {profile?.tier === 'free' && (
                  <UpgradeModal requiredTier="pro" personaName="Premium">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 px-3 py-1.5 text-sm hidden sm:inline-flex"
                    >
                      Upgrade
                    </Button>
                  </UpgradeModal>
                )}
              </div>
            </motion.header>

            {/* Messages Area */}
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-6 py-6">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{
                        duration: 0.4,
                        delay: index === messages.length - 1 ? 0.1 : 0,
                        type: "spring",
                        stiffness: 260,
                        damping: 20
                      }}
                      className={cn(
                        "flex gap-4 group",
                        message.sender === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.sender === 'ai' && (
                        <motion.div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg",
                            AI_PERSONAS[message.persona as keyof typeof AI_PERSONAS]?.bgColor || 'bg-slate-500'
                          )}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          {(() => {
                            const persona = AI_PERSONAS[message.persona as keyof typeof AI_PERSONAS]
                            const Icon = persona?.icon || Bot
                            return <Icon className="h-5 w-5" />
                          })()}
                        </motion.div>
                      )}

                      <div className={cn(
                        "max-w-[85%] md:max-w-[75%] relative",
                        message.sender === 'user' ? "order-first" : ""
                      )}>
                        <motion.div
                          className={cn(
                            "px-5 py-3 rounded-2xl shadow-sm backdrop-blur-sm relative overflow-hidden",
                            message.sender === 'user'
                              ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white ml-auto"
                              : "bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 border border-slate-200/50 dark:border-slate-700/50"
                          )}
                          whileHover={{ scale: 1.01 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <div className={cn(
                            "absolute inset-0 opacity-5 pointer-events-none",
                            message.sender === 'user'
                              ? "bg-gradient-to-br from-white to-transparent"
                              : "bg-gradient-to-br from-violet-500/10 to-blue-500/10"
                          )} />
                          <p className="text-sm leading-relaxed whitespace-pre-wrap relative z-10">
                            {message.content}
                          </p>
                        </motion.div>

                        {/* Message actions */}
                        {message.sender === 'ai' && (
                          <motion.div
                            className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 0, y: 0 }}
                            whileHover={{ opacity: 1 }}
                          >
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    onClick={() => navigator.clipboard.writeText(message.content)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </motion.div>
                              </TooltipTrigger>
                              <TooltipContent>Copy message</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  >
                                    <Share className="h-3 w-3" />
                                  </Button>
                                </motion.div>
                              </TooltipTrigger>
                              <TooltipContent>Share message</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  >
                                    <RotateCw className="h-3 w-3" />
                                  </Button>
                                </motion.div>
                              </TooltipTrigger>
                              <TooltipContent>Regenerate response</TooltipContent>
                            </Tooltip>
                          </motion.div>
                        )}

                        {/* Credit cost indicator */}
                        {message.credits && (
                          <motion.div
                            className="flex items-center gap-1 mt-2 text-xs text-slate-400 justify-end"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <Zap className="h-3 w-3" />
                            </motion.div>
                            <span>-{message.credits} credit{message.credits > 1 ? 's' : ''}</span>
                          </motion.div>
                        )}
                      </div>

                      {message.sender === 'user' && (
                        <motion.div
                          className="w-10 h-10 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-100 dark:to-slate-200 flex items-center justify-center flex-shrink-0 shadow-lg"
                          whileHover={{ scale: 1.1, rotate: -5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <User className="h-5 w-5 text-white dark:text-slate-900" />
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Loading indicator */}
                {isLoading && (
                  <motion.div
                    className="flex gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <motion.div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg",
                        AI_PERSONAS[selectedPersona].bgColor
                      )}
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {(() => {
                        const Icon = AI_PERSONAS[selectedPersona].icon
                        return <Icon className="h-5 w-5" />
                      })()}
                    </motion.div>
                    <motion.div
                      className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl px-5 py-3 backdrop-blur-sm"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className="flex items-center gap-1">
                        <motion.div
                          className="w-2 h-2 bg-slate-400 rounded-full"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-slate-400 rounded-full"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-slate-400 rounded-full"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <motion.div
              className="border-t border-slate-200/50 dark:border-slate-800/50 px-4 py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-violet-500/5 via-transparent to-transparent pointer-events-none" />
              <div className="relative">
                <div className="flex items-end gap-3">
                  <div className="flex-1 relative">
                    <motion.div
                      className="relative rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-lg focus-within:shadow-xl transition-all duration-300 focus-within:border-violet-300 dark:focus-within:border-violet-600"
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
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
                          "w-full px-4 py-4 pr-20 resize-none bg-transparent border-none",
                          "focus:ring-0 focus:outline-none",
                          "text-sm placeholder:text-slate-500 dark:text-slate-100",
                          "max-h-32 min-h-[52px]",
                          "scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700"
                        )}
                        rows={1}
                      />
                      <div className="absolute bottom-2 right-2 flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                              <Paperclip className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Attach file</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                              <Mic className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Voice message</TooltipContent>
                        </Tooltip>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <Button
                            onClick={handleSendMessage}
                            disabled={isLoading || !inputMessage.trim()}
                            size="sm"
                            className={cn(
                              "h-8 w-8 rounded-lg p-0",
                              "bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700",
                              "text-white shadow-md hover:shadow-lg",
                              "disabled:opacity-50 disabled:cursor-not-allowed",
                              "transition-all duration-300"
                            )}
                          >
                            <motion.div
                              animate={isLoading ? { rotate: 360 } : {}}
                              transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
                            >
                              {isLoading ? (
                                <Clock className="h-4 w-4" />
                              ) : (
                                <ArrowUp className="h-4 w-4" />
                              )}
                            </motion.div>
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                <motion.div
                  className="flex items-center justify-between mt-3 text-xs text-slate-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="flex items-center gap-1"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        AI_PERSONAS[selectedPersona].bgColor
                      )} />
                      <span>
                        Using {AI_PERSONAS[selectedPersona].name} • {AI_PERSONAS[selectedPersona].creditCost} credit{AI_PERSONAS[selectedPersona].creditCost > 1 ? 's' : ''} per message
                      </span>
                    </motion.div>
                  </div>
                  <motion.kbd
                    className="px-2 py-1 bg-slate-100/80 dark:bg-slate-900/80 rounded text-xs border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm font-mono"
                    whileHover={{ scale: 1.02 }}
                  >
                    Enter to send
                  </motion.kbd>
                </motion.div>
              </div>
            </motion.div>
          </SidebarInset>

          {/* Command Palette */}
          <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
            <CommandInput placeholder="Search or change AI persona..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="AI Personas">
                {Object.entries(AI_PERSONAS).map(([key, persona]) => {
                  const Icon = persona.icon
                  const canUse = canUsePersona(key as keyof typeof AI_PERSONAS)

                  return (
                    <CommandItem
                      key={key}
                      onSelect={() => {
                        if (canUse) {
                          handlePersonaChange(key as keyof typeof AI_PERSONAS)
                          setCommandOpen(false)
                        }
                      }}
                      disabled={!canUse}
                      className={cn(!canUse && "opacity-50")}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-md flex items-center justify-center text-white mr-2",
                        persona.bgColor
                      )}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <span>{persona.name}</span>
                      {!canUse && <Lock className="h-3 w-3 ml-auto" />}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              <CommandGroup heading="Actions">
                <CommandItem onSelect={() => { handleNewChat(); setCommandOpen(false) }}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </CommandItem>
                <CommandItem onSelect={() => setCommandOpen(false)}>
                  <History className="h-4 w-4 mr-2" />
                  Chat History
                </CommandItem>
                <CommandItem onSelect={() => setCommandOpen(false)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </CommandDialog>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}
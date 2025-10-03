"use client"

import { useState } from "react"
import { ChatContainer } from "@/components/chat/ChatContainer"
import { ChatHeader, AI_PERSONAS } from "@/components/chat/ChatHeader"
import { ChatMessages } from "@/components/chat/ChatMessages"
import { ChatInput } from "@/components/chat/ChatInput"
import { ChatSidebar } from "@/components/chat/ChatSidebar"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import { UpgradeModal } from "@/components/UpgradeModal"

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  persona?: keyof typeof AI_PERSONAS
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  persona: keyof typeof AI_PERSONAS
  last_message_preview?: string
  message_count: number
  is_favorite: boolean
  updated_at: string
}

export default function AIPage() {
  const { profile } = useSupabaseAuth()
  const [selectedPersona, setSelectedPersona] = useState<keyof typeof AI_PERSONAS>('buddy')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Mock sessions - replace with real data from API
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: 'Bitcoin Analysis',
      persona: 'buddy',
      last_message_preview: 'What do you think about BTC?',
      message_count: 5,
      is_favorite: true,
      updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    {
      id: '2',
      title: 'Trading Strategy',
      persona: 'trader',
      last_message_preview: 'Show me some trading signals',
      message_count: 12,
      is_favorite: false,
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
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

  const [isLoading, setIsLoading] = useState(false)

  // Check if user can use a persona based on their tier
  const canUsePersona = (persona: keyof typeof AI_PERSONAS) => {
    const personaConfig = AI_PERSONAS[persona]
    const userTier = profile?.tier || 'free'

    if (personaConfig.tier === 'free') return true
    if (personaConfig.tier === 'pro') return ['pro', 'elite'].includes(userTier)
    if (personaConfig.tier === 'elite') return userTier === 'elite'
    return false
  }

  const handlePersonaChange = (persona: keyof typeof AI_PERSONAS) => {
    if (!canUsePersona(persona)) {
      setShowUpgradeModal(true)
      return
    }

    setSelectedPersona(persona)

    // Add transition message
    const transitionMessage: Message = {
      id: Date.now().toString(),
      content: `Switched to ${AI_PERSONAS[persona].name}. How can I help you?`,
      sender: 'ai',
      persona: persona,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, transitionMessage])
  }

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    const personaConfig = AI_PERSONAS[selectedPersona]
    const userCredits = profile?.credits || 0

    // Check credits
    if (userCredits < personaConfig.creditCost) {
      setShowUpgradeModal(true)
      return
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          persona: selectedPersona,
          sessionId: currentSessionId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'ai',
        persona: selectedPersona,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])

      // Update credits in profile
      if (profile && data.creditsRemaining !== undefined) {
        profile.credits = data.creditsRemaining
      }

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        persona: selectedPersona,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    const newSessionId = Date.now().toString()
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Chat',
      persona: selectedPersona,
      message_count: 1,
      is_favorite: false,
      updated_at: new Date().toISOString()
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

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId)
    // TODO: Load messages for this session from API
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      setSelectedPersona(session.persona)
      setMessages([{
        id: Date.now().toString(),
        content: `Loaded conversation. How can I help you?`,
        sender: 'ai',
        persona: session.persona,
        timestamp: new Date()
      }])
    }
  }

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    if (currentSessionId === sessionId) {
      handleNewChat()
    }
  }

  const handleToggleFavorite = (sessionId: string) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId ? { ...s, is_favorite: !s.is_favorite } : s
    ))
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 flex-shrink-0">
            <ChatSidebar
              sessions={sessions}
              currentSessionId={currentSessionId}
              onSessionSelect={handleSessionSelect}
              onNewChat={handleNewChat}
              onDeleteSession={handleDeleteSession}
              onToggleFavorite={handleToggleFavorite}
              isLoading={false}
            />
          </div>
        )}

        {/* Main Chat Area */}
        <ChatContainer className="flex-1">
          <ChatHeader
            selectedPersona={selectedPersona}
            onPersonaChange={handlePersonaChange}
            credits={profile?.credits || 0}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            canUsePersona={canUsePersona}
          />

          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            selectedPersona={selectedPersona}
          />

          <ChatInput
            onSend={handleSendMessage}
            isLoading={isLoading}
            selectedPersona={selectedPersona}
            disabled={!profile}
          />
        </ChatContainer>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  )
}

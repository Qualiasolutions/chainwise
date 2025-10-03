"use client"

import { useState, useEffect } from "react"
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
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load chat sessions from API
  useEffect(() => {
    const loadSessions = async () => {
      if (!profile) return

      setSessionsLoading(true)
      try {
        const response = await fetch('/api/chat')
        const data = await response.json()

        if (data.success && data.sessions) {
          // Transform API sessions to match our interface
          const transformedSessions = data.sessions.map((session: any) => {
            const messages = Array.isArray(session.messages) ? session.messages : []
            const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null

            return {
              id: session.id,
              title: session.title || 'New Chat',
              persona: session.persona || 'buddy',
              last_message_preview: lastMessage?.content?.slice(0, 50),
              message_count: messages.length,
              is_favorite: session.is_favorite || false,
              updated_at: session.updated_at
            }
          })

          setSessions(transformedSessions)

          // Load first session if available
          if (transformedSessions.length > 0 && !currentSessionId) {
            const firstSession = data.sessions[0]
            setCurrentSessionId(firstSession.id)
            setSelectedPersona(firstSession.persona || 'buddy')

            // Load messages for this session
            if (Array.isArray(firstSession.messages)) {
              const sessionMessages = firstSession.messages.map((msg: any) => ({
                id: msg.id || crypto.randomUUID(),
                content: msg.content,
                sender: msg.sender,
                persona: msg.persona,
                timestamp: new Date(msg.timestamp)
              }))
              setMessages(sessionMessages)
            }
          }
        }
      } catch (error) {
        console.error('Failed to load chat sessions:', error)
      } finally {
        setSessionsLoading(false)
      }
    }

    loadSessions()
  }, [profile])

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

      // Update current session ID if new session was created
      if (data.session && !currentSessionId) {
        setCurrentSessionId(data.session.id)
      }

      // Reload sessions to update sidebar
      const sessionsResponse = await fetch('/api/chat')
      const sessionsData = await sessionsResponse.json()
      if (sessionsData.success && sessionsData.sessions) {
        const transformedSessions = sessionsData.sessions.map((session: any) => {
          const msgs = Array.isArray(session.messages) ? session.messages : []
          const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null
          return {
            id: session.id,
            title: session.title || 'New Chat',
            persona: session.persona || 'buddy',
            last_message_preview: lastMsg?.content?.slice(0, 50),
            message_count: msgs.length,
            is_favorite: session.is_favorite || false,
            updated_at: session.updated_at
          }
        })
        setSessions(transformedSessions)
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
    setCurrentSessionId(null)
    setMessages([])
  }

  const handleSessionSelect = async (sessionId: string) => {
    setCurrentSessionId(sessionId)

    // Load messages from API
    try {
      const response = await fetch('/api/chat')
      const data = await response.json()

      if (data.success && data.sessions) {
        const session = data.sessions.find((s: any) => s.id === sessionId)
        if (session) {
          setSelectedPersona(session.persona || 'buddy')

          if (Array.isArray(session.messages)) {
            const sessionMessages = session.messages.map((msg: any) => ({
              id: msg.id || crypto.randomUUID(),
              content: msg.content,
              sender: msg.sender,
              persona: msg.persona,
              timestamp: new Date(msg.timestamp)
            }))
            setMessages(sessionMessages)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load session messages:', error)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    // TODO: Add API endpoint to delete session
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
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden -m-2">
      <div className="flex h-full w-full overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 flex-shrink-0 h-full overflow-hidden">
            <ChatSidebar
              sessions={sessions}
              currentSessionId={currentSessionId}
              onSessionSelect={handleSessionSelect}
              onNewChat={handleNewChat}
              onDeleteSession={handleDeleteSession}
              onToggleFavorite={handleToggleFavorite}
              isLoading={sessionsLoading}
            />
          </div>
        )}

        {/* Main Chat Area */}
        <ChatContainer className="flex-1 h-full overflow-hidden">
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
    </div>
  )
}

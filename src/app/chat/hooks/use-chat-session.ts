'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { ChatMessage } from '@/types'
import { AIService, type AIResponse } from '@/lib/ai-service'
import { type AIPersona } from '@/lib/openai-service'
import { generateId } from '@/lib/utils'
import { useSubscription } from '@/hooks/use-subscription'

export interface ChatSession {
  id: string
  messages: ChatMessage[]
  persona: AIPersona
  isTyping: boolean
  title?: string
  createdAt: Date
  updatedAt: Date
}

export function useChatSession() {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { creditBalance, canUseFeature, refetchBalance } = useSubscription()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const createNewSession = useCallback((persona: AIPersona = 'buddy') => {
    const welcomeMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: getWelcomeMessage(persona),
      timestamp: new Date(),
    }

    const newSession: ChatSession = {
      id: generateId(),
      messages: [welcomeMessage],
      persona,
      isTyping: false,
      title: 'New Chat',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setCurrentSession(newSession)
    setSessions(prev => [newSession, ...prev])
    setError(null)
    
    return newSession
  }, [])

  const switchSession = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      setCurrentSession(session)
      setError(null)
    }
  }, [sessions])

  const switchPersona = useCallback((persona: AIPersona) => {
    if (!currentSession) {
      createNewSession(persona)
      return
    }

    const updatedSession = {
      ...currentSession,
      persona,
      updatedAt: new Date()
    }

    setCurrentSession(updatedSession)
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s))

    // Add persona switch message
    const switchMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: `I've switched to ${getPersonaName(persona)} mode. How can I assist you with your crypto journey?`,
      timestamp: new Date(),
    }

    addMessage(switchMessage)
  }, [currentSession])

  const addMessage = useCallback((message: ChatMessage) => {
    if (!currentSession) return

    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, message],
      updatedAt: new Date()
    }

    setCurrentSession(updatedSession)
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s))
    
    setTimeout(scrollToBottom, 100)
  }, [currentSession, scrollToBottom])

  const sendMessage = useCallback(async (content: string) => {
    if (!currentSession || !content.trim() || isLoading) return

    const personaCosts = { buddy: 5, professor: 10, trader: 15 }
    const cost = personaCosts[currentSession.persona]
    
    if (!canUseFeature(`chat_${currentSession.persona}`, cost)) {
      setError(`You need ${cost} credits to use this persona. Please upgrade your subscription to continue chatting.`)
      return
    }

    setIsLoading(true)
    setError(null)

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    addMessage(userMessage)

    // Update session to show typing
    const typingSession = {
      ...currentSession,
      isTyping: true,
      messages: [...currentSession.messages, userMessage]
    }
    setCurrentSession(typingSession)

    try {
      const response: AIResponse = await AIService.generateResponse(
        typingSession.messages,
        currentSession.persona,
        currentSession.id
      )
      
      if (response.error) {
        if (response.error.includes('Insufficient credits')) {
          setError(response.error)
          // Remove the user message since it wasn't processed
          const revertedSession = {
            ...typingSession,
            isTyping: false,
            messages: typingSession.messages.slice(0, -1)
          }
          setCurrentSession(revertedSession)
          return
        }
        throw new Error(response.error)
      }

      // Refresh credit balance
      if (response.newBalance !== undefined) {
        refetchBalance()
      }
      
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      }
      
      const finalSession = {
        ...typingSession,
        isTyping: false,
        messages: [...typingSession.messages, assistantMessage],
        updatedAt: new Date()
      }

      setCurrentSession(finalSession)
      setSessions(prev => prev.map(s => s.id === finalSession.id ? finalSession : s))
      
    } catch (error) {
      console.error('Error sending message:', error)
      setError('I apologize, but I encountered an error. Please try again.')
      
      const errorSession = {
        ...typingSession,
        isTyping: false
      }
      setCurrentSession(errorSession)
    } finally {
      setIsLoading(false)
      setTimeout(scrollToBottom, 100)
    }
  }, [currentSession, isLoading, canUseFeature, refetchBalance, addMessage, scrollToBottom, createNewSession])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    if (currentSession?.id === sessionId) {
      const remainingSessions = sessions.filter(s => s.id !== sessionId)
      setCurrentSession(remainingSessions[0] || null)
    }
  }, [currentSession, sessions])

  const updateSessionTitle = useCallback((sessionId: string, title: string) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, title, updatedAt: new Date() } : s
    ))
    if (currentSession?.id === sessionId) {
      setCurrentSession(prev => prev ? { ...prev, title, updatedAt: new Date() } : null)
    }
  }, [currentSession])

  // Don't auto-create session - let user choose persona first
  // useEffect(() => {
  //   if (sessions.length === 0 && !currentSession) {
  //     createNewSession('buddy')
  //   }
  // }, [sessions.length, currentSession, createNewSession])

  return {
    currentSession,
    sessions,
    isLoading,
    error,
    messagesEndRef,
    creditBalance,
    createNewSession,
    switchSession,
    switchPersona,
    sendMessage,
    clearError,
    deleteSession,
    updateSessionTitle,
    scrollToBottom
  }
}

function getWelcomeMessage(persona: AIPersona): string {
  const messages = {
    buddy: "Hey there! 👋 I'm Crypto Buddy, your friendly crypto companion! I'm here to make your crypto journey fun and easy to understand. Whether you're just starting out or looking to learn more, I'll break everything down into simple terms. What would you like to explore today?",
    professor: "Greetings. I am the Crypto Professor, your analytical guide to the cryptocurrency ecosystem. I provide comprehensive technical analysis, in-depth blockchain education, and data-driven market insights. I'm here to deepen your understanding of this fascinating intersection of technology and finance. What would you like to analyze today?",
    trader: "What's up, trader! 📈 I'm your Crypto Trader persona, focused on market analysis, trading strategies, and risk management. I'll help you understand market trends, technical indicators, and trading opportunities. Remember: this is educational content, not financial advice. DYOR and manage your risk! What's on your trading mind today?"
  }
  
  return messages[persona]
}

function getPersonaName(persona: AIPersona): string {
  const names = {
    buddy: 'Crypto Buddy',
    professor: 'Crypto Professor', 
    trader: 'Crypto Trader'
  }
  return names[persona]
}
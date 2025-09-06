'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Sparkles, Zap, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChatSession } from '../hooks/use-chat-session'
import { useChatCredits } from '../hooks/use-chat-credits'
import { MessageThread } from './message-thread'
import { ChatInput } from './chat-input'
import { PersonaSelector } from './persona-selector'
import { CreditDisplay } from './credit-display'
import { SessionSidebar, SessionSidebarToggle } from './session-sidebar'

export function ChatInterface() {
  const [showPersonaSelector, setShowPersonaSelector] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showInitialPersonaSelector, setShowInitialPersonaSelector] = useState(true)

  const {
    currentSession,
    sessions,
    isLoading,
    error,
    messagesEndRef,
    createNewSession,
    switchSession,
    switchPersona,
    sendMessage,
    clearError,
    deleteSession,
    updateSessionTitle
  } = useChatSession()

  const { isInitializing } = useChatCredits()

  // Hide initial persona selector after first message
  useEffect(() => {
    if (currentSession && currentSession.messages.length > 1) {
      setShowInitialPersonaSelector(false)
    }
  }, [currentSession?.messages.length])

  const handlePersonaSelect = (persona: any) => {
    if (currentSession && currentSession.messages.length <= 1) {
      // If it's a new session, switch persona immediately
      switchPersona(persona)
    } else {
      // If there are existing messages, create a new session
      createNewSession(persona)
    }
    setShowPersonaSelector(false)
    setShowInitialPersonaSelector(false)
  }

  const handleSendMessage = (message: string) => {
    sendMessage(message)
    setShowInitialPersonaSelector(false)
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-300/30 border-t-purple-300 rounded-full mx-auto mb-4"
          />
          <p className="text-white/70">Initializing ChainWise AI...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-normal filter blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-500/8 rounded-full mix-blend-normal filter blur-[100px] animate-pulse delay-700" />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-violet-500/6 rounded-full mix-blend-normal filter blur-[80px] animate-pulse delay-1000" />
      </div>

      {/* Session Sidebar */}
      <SessionSidebar
        sessions={sessions}
        currentSession={currentSession}
        onSessionSelect={switchSession}
        onNewSession={createNewSession}
        onDeleteSession={deleteSession}
        onUpdateTitle={updateSessionTitle}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile Sidebar Toggle */}
        <SessionSidebarToggle 
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Header */}
        <motion.div 
          className="flex-shrink-0 backdrop-blur-xl bg-white/5 border-b border-purple-300/20 p-4 lg:p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Title */}
            <div className="flex-1 min-w-0 ml-0 lg:ml-0">
              <motion.h1 
                className="text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                ChainWise AI
              </motion.h1>
              {currentSession && (
                <motion.div 
                  className="flex items-center space-x-2 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-white/70">
                    Connected to {
                      currentSession.persona === 'buddy' ? 'Crypto Buddy' :
                      currentSession.persona === 'professor' ? 'Crypto Professor' : 'Crypto Trader'
                    }
                  </span>
                </motion.div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* Persona Switch Button */}
              {currentSession && (
                <motion.button
                  onClick={() => setShowPersonaSelector(true)}
                  className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-purple-300/20 rounded-xl text-white text-sm font-medium transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Switch Persona</span>
                </motion.button>
              )}

              {/* Credit Display */}
              <CreditDisplay />
            </div>
          </div>
        </motion.div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="flex-shrink-0 bg-red-500/10 border-b border-red-400/20 p-4"
            >
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-3 text-red-300">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
                <button 
                  onClick={clearError}
                  className="text-red-300/60 hover:text-red-300 transition-colors"
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {showInitialPersonaSelector ? (
            /* Initial Persona Selection */
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="w-full max-w-4xl">
                <PersonaSelector
                  selectedPersona={currentSession?.persona || 'buddy'}
                  onPersonaSelect={handlePersonaSelect}
                />
              </div>
            </div>
          ) : currentSession ? (
            /* Message Thread */
            <>
              <MessageThread
                messages={currentSession.messages}
                isTyping={currentSession.isTyping}
                persona={currentSession.persona}
                className="flex-1"
              />
              <div ref={messagesEndRef} />
            </>
          ) : (
            /* No Session State */
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center max-w-md">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-white/70"
                >
                  <Zap className="w-16 h-16 mx-auto mb-4 text-purple-300/50" />
                  <h3 className="text-xl font-semibold mb-2">Welcome to ChainWise AI</h3>
                  <p className="text-sm mb-6">
                    Choose an AI persona to start your crypto conversation
                  </p>
                  <button 
                    onClick={() => createNewSession()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    Start New Chat
                  </button>
                </motion.div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        {currentSession && !showInitialPersonaSelector && (
          <motion.div 
            className="flex-shrink-0 p-4 lg:p-6 backdrop-blur-xl bg-white/5"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="max-w-4xl mx-auto">
              <ChatInput
                onSend={handleSendMessage}
                persona={currentSession.persona}
                disabled={isLoading}
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Persona Selector Modal */}
      <AnimatePresence>
        {showPersonaSelector && (
          <>
            <motion.div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPersonaSelector(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                className="w-full max-w-4xl backdrop-blur-2xl bg-gradient-to-br from-purple-900/90 to-indigo-900/90 rounded-3xl border border-purple-300/20 p-6 shadow-2xl"
                initial={{ opacity: 0, scale: 0.95, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 50 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <PersonaSelector
                  selectedPersona={currentSession?.persona || 'buddy'}
                  onPersonaSelect={handlePersonaSelect}
                />
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowPersonaSelector(false)}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-purple-300/20 rounded-xl text-white text-sm transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
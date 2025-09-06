'use client'

import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, User, Copy, ThumbsUp, ThumbsDown, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChatMessage } from '@/types'
import { type AIPersona } from '@/lib/openai-service'

interface MessageThreadProps {
  messages: ChatMessage[]
  isTyping: boolean
  persona: AIPersona
  className?: string
}

export function MessageThread({ messages, isTyping, persona, className }: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const getPersonaColor = (persona: AIPersona) => {
    const colors = {
      buddy: 'from-chainwise-accent-500/20 to-chainwise-accent-600/20 border-chainwise-accent-400/20',
      professor: 'from-chainwise-secondary-500/20 to-chainwise-secondary-600/20 border-chainwise-secondary-400/20',
      trader: 'from-chainwise-success-500/20 to-chainwise-success-600/20 border-chainwise-success-400/20'
    }
    return colors[persona]
  }

  const getPersonaAvatarColor = (persona: AIPersona) => {
    const colors = {
      buddy: 'from-chainwise-accent-500 to-chainwise-accent-600',
      professor: 'from-chainwise-secondary-500 to-chainwise-secondary-600',
      trader: 'from-chainwise-success-500 to-chainwise-success-600'
    }
    return colors[persona]
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  return (
    <div className={cn("flex-1 overflow-hidden", className)}>
      <div className="h-full overflow-y-auto scrollbar-hide scroll-smooth">
        <div className="p-4 md:p-6 lg:p-8 space-y-8 chat-mobile-spacing">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex message-max-width ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                } space-x-4 group`}>
                  {/* Enhanced Avatar */}
                  <motion.div 
                    className={cn(
                      "flex-shrink-0 w-12 h-12 rounded-2xl shadow-brand flex items-center justify-center border",
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-chainwise-primary-500 to-chainwise-secondary-500 border-chainwise-primary-400/30' 
                        : `bg-gradient-to-br ${getPersonaAvatarColor(persona)} border-chainwise-neutral-400/20 backdrop-blur-xl`
                    )}
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {message.role === 'user' ? (
                      <User className="w-6 h-6 text-white" />
                    ) : (
                      <Bot className="w-6 h-6 text-white" />
                    )}
                  </motion.div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <motion.div 
                      className={cn(
                        "rounded-3xl shadow-brand backdrop-blur-xl border relative overflow-hidden",
                        message.role === 'user' 
                          ? 'bg-gradient-to-br from-chainwise-primary-500 to-chainwise-secondary-500 text-white ml-14 border-chainwise-primary-400/30' 
                          : `bg-gradient-to-br ${getPersonaColor(persona)} text-white mr-14 border-chainwise-neutral-400/20`
                      )}
                      whileHover={{ scale: 1.01, y: -1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {/* Message Text */}
                      <div className="p-4 md:p-5">
                        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        
                        {/* Timestamp */}
                        <p className="text-xs mt-3 opacity-60 font-medium">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>

                      {/* Message Actions */}
                      {message.role === 'assistant' && (
                        <motion.div 
                          className="absolute -bottom-10 right-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 0, y: 5 }}
                          whileHover={{ opacity: 1, y: 0 }}
                        >
                          <button 
                            onClick={() => copyToClipboard(message.content)}
                            className="p-2 bg-black/20 backdrop-blur-xl rounded-lg border border-white/10 hover:bg-black/40 transition-colors group/btn"
                            title="Copy message"
                          >
                            <Copy className="w-4 h-4 text-white/70 group-hover/btn:text-white" />
                          </button>
                          <button className="p-2 bg-black/20 backdrop-blur-xl rounded-lg border border-white/10 hover:bg-black/40 transition-colors group/btn">
                            <ThumbsUp className="w-4 h-4 text-white/70 group-hover/btn:text-white" />
                          </button>
                          <button className="p-2 bg-black/20 backdrop-blur-xl rounded-lg border border-white/10 hover:bg-black/40 transition-colors group/btn">
                            <ThumbsDown className="w-4 h-4 text-white/70 group-hover/btn:text-white" />
                          </button>
                          <button className="p-2 bg-black/20 backdrop-blur-xl rounded-lg border border-white/10 hover:bg-black/40 transition-colors group/btn">
                            <MoreHorizontal className="w-4 h-4 text-white/70 group-hover/btn:text-white" />
                          </button>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-3">
                  <motion.div 
                    className={cn(
                      "w-10 h-10 rounded-full shadow-lg flex items-center justify-center backdrop-blur-xl border",
                      `bg-gradient-to-br ${getPersonaColor(persona).replace('/20', '/40').replace('border-', 'from-').split(' ')[0]} to-indigo-500/40`,
                      getPersonaColor(persona).split(' ')[1]
                    )}
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      rotate: { repeat: Infinity, duration: 2 },
                      scale: { repeat: Infinity, duration: 1.5 }
                    }}
                  >
                    <Bot className="w-5 h-5 text-white" />
                  </motion.div>
                  
                  <div className={cn(
                    "rounded-2xl shadow-lg backdrop-blur-xl border p-4",
                    `bg-gradient-to-br ${getPersonaColor(persona)}`
                  )}>
                    <div className="flex items-center space-x-2">
                      <span className="text-white text-sm font-medium">
                        {persona === 'buddy' ? 'Crypto Buddy' : 
                         persona === 'professor' ? 'Crypto Professor' : 
                         'Crypto Trader'} is thinking
                      </span>
                      <div className="flex items-center space-x-1">
                        {[0, 1, 2].map((dot) => (
                          <motion.div
                            key={dot}
                            className="w-2 h-2 bg-white/60 rounded-full"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: dot * 0.2
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scroll Anchor */}
          <div ref={messagesEndRef} className="h-0" />
        </div>
      </div>
    </div>
  )
}
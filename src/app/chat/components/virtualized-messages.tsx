'use client'

import { useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FixedSizeList as List, ListChildComponentProps } from 'react-window'
import { Bot, User, Copy, ThumbsUp, ThumbsDown, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChatMessage } from '@/types'
import { type AIPersona } from '@/lib/openai-service'

interface VirtualizedMessagesProps {
  messages: ChatMessage[]
  isTyping: boolean
  persona: AIPersona
  className?: string
}

interface MessageItemProps extends ListChildComponentProps {
  data: {
    messages: ChatMessage[]
    persona: AIPersona
    onCopy: (text: string) => void
  }
}

const ITEM_HEIGHT = 120 // Approximate height per message

function MessageItem({ index, style, data }: MessageItemProps) {
  const { messages, persona, onCopy } = data
  const message = messages[index]

  if (!message) return null

  const getPersonaColor = (persona: AIPersona) => {
    const colors = {
      buddy: 'from-blue-500/20 to-cyan-500/20 border-blue-400/20',
      professor: 'from-purple-500/20 to-pink-500/20 border-purple-400/20',
      trader: 'from-green-500/20 to-emerald-500/20 border-green-400/20'
    }
    return colors[persona]
  }

  return (
    <div style={style} className="px-4 md:px-6 py-3">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        <div className={`flex max-w-[85%] md:max-w-[75%] ${
          message.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
        } space-x-3 group`}>
          {/* Avatar */}
          <div 
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full shadow-lg flex items-center justify-center",
              message.role === 'user' 
                ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                : `bg-gradient-to-br ${getPersonaColor(persona).replace('/20', '/40').replace('border-', 'from-').split(' ')[0]} to-indigo-500/40 backdrop-blur-xl border ${getPersonaColor(persona).split(' ')[1]}`
            )}
          >
            {message.role === 'user' ? (
              <User className="w-5 h-5 text-white" />
            ) : (
              <Bot className="w-5 h-5 text-white" />
            )}
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0">
            <div 
              className={cn(
                "rounded-2xl shadow-lg backdrop-blur-xl border relative",
                message.role === 'user' 
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white ml-12' 
                  : `bg-gradient-to-br ${getPersonaColor(persona)} text-white mr-12`
              )}
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
                <div className="absolute -bottom-10 right-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button 
                    onClick={() => onCopy(message.content)}
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
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export function VirtualizedMessages({ messages, isTyping, persona, className }: VirtualizedMessagesProps) {
  const listRef = useRef<List>(null)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // TODO: Add toast notification
  }

  const itemData = useMemo(() => ({
    messages,
    persona,
    onCopy: copyToClipboard
  }), [messages, persona])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (listRef.current && messages.length > 0) {
      listRef.current.scrollToItem(messages.length - 1, 'end')
    }
  }, [messages.length])

  // Use regular rendering for small message counts (better UX)
  if (messages.length < 50) {
    return (
      <div className={cn("flex-1 overflow-hidden", className)}>
        <div className="h-full overflow-y-auto scrollbar-hide scroll-smooth">
          <div className="p-4 md:p-6 space-y-6">
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
                  <MessageItem 
                    index={index}
                    style={{}}
                    data={itemData}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <TypingIndicator persona={persona} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    )
  }

  // Use virtualization for large message counts (better performance)
  return (
    <div className={cn("flex-1 overflow-hidden", className)}>
      <List
        ref={listRef}
        height={600} // This should be dynamic based on container
        itemCount={messages.length}
        itemSize={ITEM_HEIGHT}
        itemData={itemData}
        overscanCount={5}
        className="scrollbar-hide"
      >
        {MessageItem}
      </List>

      {/* Typing Indicator */}
      <AnimatePresence>
        {isTyping && (
          <div className="p-4 md:p-6">
            <TypingIndicator persona={persona} />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TypingIndicator({ persona }: { persona: AIPersona }) {
  const getPersonaColor = (persona: AIPersona) => {
    const colors = {
      buddy: 'from-blue-500/20 to-cyan-500/20 border-blue-400/20',
      professor: 'from-purple-500/20 to-pink-500/20 border-purple-400/20',
      trader: 'from-green-500/20 to-emerald-500/20 border-green-400/20'
    }
    return colors[persona]
  }

  return (
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
  )
}
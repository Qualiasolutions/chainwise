'use client'

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Message } from 'ai'
import { Bot, User, Copy, ThumbsUp, ThumbsDown, MoreHorizontal, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface ChatMessageListProps {
  messages: Message[]
  isLoading: boolean
  persona: {
    name: string
    icon: React.ComponentType<any>
    color: string
    creditCost: number
  }
}

interface MessageBubbleProps {
  message: Message
  persona: ChatMessageListProps['persona']
  isLast: boolean
}

function MessageBubble({ message, persona, isLast }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Message copied to clipboard')
    } catch (err) {
      toast.error('Failed to copy message')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex gap-4 group',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div className={cn(
        'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
        isUser 
          ? 'bg-gradient-to-r from-purple-500 to-pink-600'
          : `bg-gradient-to-r ${persona.color}`
      )}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <persona.icon className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        'flex-1 max-w-[80%]',
        isUser ? 'flex flex-col items-end' : 'flex flex-col items-start'
      )}>
        {/* Header */}
        <div className={cn(
          'flex items-center gap-2 mb-2',
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}>
          <span className="text-sm font-medium text-slate-300">
            {isUser ? 'You' : persona.name}
          </span>
          {isAssistant && (
            <Badge variant="secondary" className="bg-slate-800 text-xs">
              -{persona.creditCost} credits
            </Badge>
          )}
        </div>

        {/* Message Card */}
        <Card className={cn(
          'p-4 border-0 shadow-lg transition-all duration-200',
          isUser
            ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20'
            : 'bg-slate-800/50 backdrop-blur-sm border-slate-700/30',
          'group-hover:shadow-xl'
        )}>
          <div className="text-slate-100 leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {/* Actions */}
          <div className={cn(
            'flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/30 opacity-0 group-hover:opacity-100 transition-opacity',
            isUser ? 'justify-start' : 'justify-start'
          )}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              onClick={() => copyToClipboard(message.content)}
            >
              <Copy className="w-3 h-3" />
            </Button>
            {isAssistant && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-slate-400 hover:text-green-400 hover:bg-slate-700/50"
                >
                  <ThumbsUp className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50"
                >
                  <ThumbsDown className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  )
}

function TypingIndicator({ persona }: { persona: ChatMessageListProps['persona'] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex gap-4"
    >
      {/* Avatar */}
      <div className={cn(
        'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r',
        persona.color
      )}>
        <persona.icon className="w-5 h-5 text-white" />
      </div>

      {/* Typing Content */}
      <div className="flex flex-col items-start">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-slate-300">
            {persona.name}
          </span>
          <Badge variant="secondary" className="bg-slate-800 text-xs animate-pulse">
            thinking...
          </Badge>
        </div>

        <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700/30">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
            </div>
            <span className="text-slate-400 text-sm">Processing your request</span>
          </div>
        </Card>
      </div>
    </motion.div>
  )
}

export function ChatMessageList({ messages, isLoading, persona }: ChatMessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <ScrollArea className="h-full px-6" ref={scrollAreaRef}>
      <div className="space-y-6 py-6">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              persona={persona}
              isLast={index === messages.length - 1}
            />
          ))}
          
          {isLoading && (
            <TypingIndicator persona={persona} />
          )}
        </AnimatePresence>
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
}
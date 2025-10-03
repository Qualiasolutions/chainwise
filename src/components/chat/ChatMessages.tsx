"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageBubble } from "./MessageBubble"
import { AI_PERSONAS } from "./ChatHeader"

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  persona?: keyof typeof AI_PERSONAS
  timestamp: Date
}

interface ChatMessagesProps {
  messages: Message[]
  isLoading?: boolean
  selectedPersona: keyof typeof AI_PERSONAS
}

export function ChatMessages({ messages, isLoading, selectedPersona }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <ScrollArea className="flex-1 px-4 md:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            content={message.content}
            sender={message.sender}
            persona={message.persona}
            timestamp={message.timestamp}
            index={index}
          />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r ${AI_PERSONAS[selectedPersona].color}`}>
              {(() => {
                const Icon = AI_PERSONAS[selectedPersona].icon
                return <Icon className="h-4 w-4 text-white" />
              })()}
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1">
                <motion.div
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
}

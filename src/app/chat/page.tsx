'use client'

import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { ChatInterface } from './components/chat-interface'

// Loading component for suspense
function ChatLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto mb-6"
        >
          <Loader2 className="w-16 h-16 text-purple-300" />
        </motion.div>
        
        <motion.h2 
          className="text-2xl font-bold text-white mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Loading ChainWise AI
        </motion.h2>
        
        <motion.p 
          className="text-purple-200/70"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Preparing your crypto AI companion...
        </motion.p>
      </motion.div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <div className="h-screen overflow-hidden">
        <Suspense fallback={<ChatLoading />}>
          <ChatInterface />
        </Suspense>
      </div>
    </ProtectedRoute>
  )
}
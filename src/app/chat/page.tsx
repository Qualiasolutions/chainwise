'use client'

import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { ChatInterface } from './components/chat-interface'

// Enhanced loading component for suspense
function ChatLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <motion.div 
        className="text-center relative"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 -m-20">
          <div className="absolute top-10 left-10 w-40 h-40 bg-chainwise-primary-500/20 rounded-full blur-3xl animate-background-pulse-1" />
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-chainwise-accent-500/15 rounded-full blur-3xl animate-background-pulse-2" />
        </div>
        
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 mx-auto mb-8 relative z-10"
        >
          <div className="w-20 h-20 rounded-full border-4 border-chainwise-primary-400/30 border-t-chainwise-primary-400 shadow-glow" />
        </motion.div>
        
        <motion.h2 
          className="text-3xl font-bold bg-gradient-to-r from-chainwise-primary-400 via-chainwise-accent-400 to-chainwise-primary-500 bg-clip-text text-transparent mb-3 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Loading ChainWise AI
        </motion.h2>
        
        <motion.p 
          className="text-gray-300 text-lg relative z-10"
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
      <div className="min-h-screen overflow-hidden">
        <Suspense fallback={<ChatLoading />}>
          <ChatInterface />
        </Suspense>
      </div>
    </ProtectedRoute>
  )
}
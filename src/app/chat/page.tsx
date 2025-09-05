'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import { AnimatedAIChat } from '@/components/ui/animated-ai-chat'

export default function ChatPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 pt-20">
        <AnimatedAIChat />
      </div>
    </ProtectedRoute>
  )
}
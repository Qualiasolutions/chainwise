'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import { AnimatedAIChat } from '@/components/ui/animated-ai-chat'

export default function ChatPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <AnimatedAIChat />
    </ProtectedRoute>
  )
}
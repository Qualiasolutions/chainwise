'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/dashboard-layout'
import { AnimatedAIChat } from '@/components/ui/animated-ai-chat'

export default function ChatPage() {
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "AI Chat" }
  ]

  return (
    <ProtectedRoute requireAuth={true}>
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <div className="min-h-[calc(100vh-12rem)] bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-xl overflow-hidden">
          <AnimatedAIChat />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
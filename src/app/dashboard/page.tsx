'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import { ModernChainWiseDashboard } from '@/components/ui/modern-chainwise-dashboard'

export default function DashboardPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <ModernChainWiseDashboard />
    </ProtectedRoute>
  )
}
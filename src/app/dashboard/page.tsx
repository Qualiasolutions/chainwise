'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import UnifiedDashboard from '@/components/dashboard/unified-dashboard'

export default function DashboardPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <UnifiedDashboard />
    </ProtectedRoute>
  )
}
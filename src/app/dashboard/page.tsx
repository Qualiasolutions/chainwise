'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import ProfessionalDashboard from '@/components/dashboard/professional-dashboard'

export default function DashboardPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <ProfessionalDashboard />
    </ProtectedRoute>
  )
}
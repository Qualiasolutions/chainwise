'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/dashboard-layout'
import { DashboardContent } from '@/components/ui/dashboard-content'

export default function DashboardPage() {
  const breadcrumbs = [
    { label: "Dashboard" }
  ]

  return (
    <ProtectedRoute requireAuth={true}>
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <DashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
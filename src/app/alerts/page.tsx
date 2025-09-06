import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/dashboard-layout'
import AlertsPage from '@/components/alerts/alerts-page'

export default function Alerts() {
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Alerts" }
  ]

  return (
    <ProtectedRoute requireAuth={true}>
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <AlertsPage />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

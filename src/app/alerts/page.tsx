import ProtectedRoute from '@/components/ProtectedRoute'
import AlertsPage from '@/components/alerts/alerts-page'

export default function Alerts() {
  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-gray-900">
        <AlertsPage />
      </div>
    </ProtectedRoute>
  )
}

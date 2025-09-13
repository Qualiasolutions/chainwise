'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Bell, Plus, BarChart3, Settings } from 'lucide-react'
import AlertForm from './alert-form'
import AlertList from './alert-list'
import { useSubscription } from '@/hooks/use-subscription'
import { Alert } from '@/types/alerts'

export default function AlertsPage() {
  const { creditBalance } = useSubscription()
  const subscriptionTier = creditBalance?.tier || 'free'
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleCreateAlert = () => {
    setEditingAlert(null)
    setShowCreateModal(true)
  }

  const handleEditAlert = (alert: Alert) => {
    setEditingAlert(alert)
    setShowEditModal(true)
  }

  const handleAlertSuccess = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setEditingAlert(null)
    setRefreshTrigger(prev => prev + 1) // Trigger refresh
  }

  const handleCancel = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setEditingAlert(null)
  }

  const getTierLimits = () => {
    switch (subscriptionTier) {
      case 'free':
        return { maxAlerts: 3, name: 'Free' }
      case 'pro':
        return { maxAlerts: 10, name: 'Pro' }
      case 'elite':
        return { maxAlerts: -1, name: 'Elite' } // Unlimited
      default:
        return { maxAlerts: 3, name: 'Free' }
    }
  }

  const tierLimits = getTierLimits()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Price Alerts
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Stay informed about market movements with customizable alerts
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Tier Badge */}
          <Badge variant="outline" className="px-3 py-1">
            {tierLimits.name} Plan
            {tierLimits.maxAlerts !== -1 && (
              <span className="ml-1">({tierLimits.maxAlerts} alerts max)</span>
            )}
          </Badge>

          {/* Create Alert Button */}
          <Button onClick={handleCreateAlert} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Alert
          </Button>
        </div>
      </div>

      {/* Credit Balance */}
      {creditBalance && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900 dark:text-blue-100">
                AI Credits Available
              </span>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {creditBalance.balance}
            </Badge>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            Credits are used for advanced AI features and premium alerts
          </p>
        </div>
      )}

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="alerts" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>My Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Alert Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-6">
          <AlertList
            onEditAlert={handleEditAlert}
            onCreateAlert={handleCreateAlert}
            refreshTrigger={refreshTrigger}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
              <div className="flex items-center">
                <Bell className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Alerts
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {/* This would come from API */}
                    0
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
              <div className="flex items-center">
                <Bell className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Alerts
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {/* This would come from API */}
                    0
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Triggers Today
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {/* This would come from API */}
                    0
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
              <div className="flex items-center">
                <Settings className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Success Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {/* This would come from API */}
                    0%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Alert Analytics Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Detailed analytics and insights about your alert performance will be available here.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Alert Settings Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Configure notification preferences and alert delivery settings.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Alert Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Alert</DialogTitle>
          </DialogHeader>
          <AlertForm
            onSuccess={handleAlertSuccess}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Alert Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Alert</DialogTitle>
          </DialogHeader>
          {editingAlert && (
            <AlertForm
              onSuccess={handleAlertSuccess}
              onCancel={handleCancel}
              initialData={editingAlert}
              isEditing={true}
              alertId={editingAlert.id}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

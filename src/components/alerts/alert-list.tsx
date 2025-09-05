'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertTriangle,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Bell,
  BellOff
} from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/lib/utils'

interface Alert {
  id: string
  cryptoId: string
  symbol: string
  alertType: string
  targetValue: number
  message?: string
  isActive: boolean
  lastTriggered?: string
  createdAt: string
  updatedAt: string
}

interface AlertListProps {
  onEditAlert: (alert: Alert) => void
  onCreateAlert: () => void
  refreshTrigger?: number
}

export default function AlertList({
  onEditAlert,
  onCreateAlert,
  refreshTrigger
}: AlertListProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Load alerts
  useEffect(() => {
    loadAlerts()
  }, [refreshTrigger])

  const loadAlerts = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/alerts?active=false')
      if (!response.ok) {
        throw new Error('Failed to load alerts')
      }

      const data = await response.json()
      setAlerts(data.alerts || [])
    } catch (error) {
      console.error('Error loading alerts:', error)
      setError(error instanceof Error ? error.message : 'Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }

  const toggleAlertStatus = async (alertId: string, currentStatus: boolean) => {
    setTogglingId(alertId)

    try {
      const response = await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: alertId,
          isActive: !currentStatus
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update alert')
      }

      // Update local state
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId
          ? { ...alert, isActive: !currentStatus }
          : alert
      ))
    } catch (error) {
      console.error('Error toggling alert:', error)
      setError('Failed to update alert status')
    } finally {
      setTogglingId(null)
    }
  }

  const deleteAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts?id=${alertId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete alert')
      }

      // Remove from local state
      setAlerts(prev => prev.filter(alert => alert.id !== alertId))
    } catch (error) {
      console.error('Error deleting alert:', error)
      setError('Failed to delete alert')
    }
  }

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'price_above':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'price_below':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      case 'volume_spike':
        return <BarChart3 className="w-4 h-4 text-blue-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
    }
  }

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'price_above':
        return 'Price Above'
      case 'price_below':
        return 'Price Below'
      case 'volume_spike':
        return 'Volume Spike'
      case 'percentage_change':
        return 'Percentage Change'
      case 'market_cap_change':
        return 'Market Cap Change'
      default:
        return type
    }
  }

  const formatAlertValue = (alert: Alert) => {
    switch (alert.alertType) {
      case 'price_above':
      case 'price_below':
        return formatCurrency(alert.targetValue)
      case 'percentage_change':
        return `${alert.targetValue}%`
      case 'volume_spike':
        return `$${alert.targetValue.toLocaleString()}`
      case 'market_cap_change':
        return `$${(alert.targetValue / 1000000).toFixed(1)}M`
      default:
        return alert.targetValue.toString()
    }
  }

  const getTimeSinceTriggered = (lastTriggered?: string) => {
    if (!lastTriggered) return null

    const now = new Date()
    const triggered = new Date(lastTriggered)
    const diffMs = now.getTime() - triggered.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)

    if (diffHours < 1) {
      return 'Just now'
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`
    } else {
      return `${Math.floor(diffHours / 24)}d ago`
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button
            variant="outline"
            size="sm"
            onClick={loadAlerts}
            className="ml-4"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  const activeAlerts = alerts.filter(alert => alert.isActive)
  const inactiveAlerts = alerts.filter(alert => !alert.isActive)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Price Alerts</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {activeAlerts.length} active, {inactiveAlerts.length} inactive
          </p>
        </div>
        <Button onClick={onCreateAlert}>
          <Bell className="w-4 h-4 mr-2" />
          Create Alert
        </Button>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-green-500" />
            Active Alerts
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeAlerts.map((alert) => (
              <Card key={alert.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      {getAlertTypeIcon(alert.alertType)}
                      <div>
                        <CardTitle className="text-base">{alert.symbol}</CardTitle>
                        <CardDescription className="text-sm">
                          {getAlertTypeLabel(alert.alertType)}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditAlert(alert)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleAlertStatus(alert.id, alert.isActive)}
                          disabled={togglingId === alert.id}
                        >
                          <EyeOff className="w-4 h-4 mr-2" />
                          Pause
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteAlert(alert.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Target:</span>
                      <span className="font-semibold">{formatAlertValue(alert)}</span>
                    </div>
                    {alert.lastTriggered && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Last triggered:</span>
                        <span className="text-sm">{getTimeSinceTriggered(alert.lastTriggered)}</span>
                      </div>
                    )}
                    {alert.message && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        &ldquo;{alert.message}&rdquo;
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Inactive Alerts */}
      {inactiveAlerts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <BellOff className="w-5 h-5 mr-2 text-gray-500" />
            Inactive Alerts
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inactiveAlerts.map((alert) => (
              <Card key={alert.id} className="opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      {getAlertTypeIcon(alert.alertType)}
                      <div>
                        <CardTitle className="text-base text-gray-500">{alert.symbol}</CardTitle>
                        <CardDescription className="text-sm">
                          {getAlertTypeLabel(alert.alertType)}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditAlert(alert)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleAlertStatus(alert.id, alert.isActive)}
                          disabled={togglingId === alert.id}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Activate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteAlert(alert.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Target:</span>
                      <span className="font-semibold">{formatAlertValue(alert)}</span>
                    </div>
                    {alert.lastTriggered && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Last triggered:</span>
                        <span className="text-sm">{getTimeSinceTriggered(alert.lastTriggered)}</span>
                      </div>
                    )}
                    {alert.message && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        &ldquo;{alert.message}&rdquo;
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {alerts.length === 0 && (
        <Card className="text-center p-12">
          <CardContent>
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <CardTitle className="mb-2">No Alerts Created</CardTitle>
            <CardDescription className="mb-6">
              Create your first price alert to stay informed about market movements
            </CardDescription>
            <Button onClick={onCreateAlert}>
              <Bell className="w-4 h-4 mr-2" />
              Create Your First Alert
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

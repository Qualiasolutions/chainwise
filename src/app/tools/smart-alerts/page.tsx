'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertTriangle, Bell, BellRing, Plus, Settings, Trash2, Edit, TrendingUp, Activity, Wallet, Brain } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

interface SmartAlert {
  id: string
  alert_name: string
  alert_type: 'price_movement' | 'volume_spike' | 'whale_activity' | 'narrative_change'
  target_symbol?: string
  conditions: Record<string, any>
  notification_methods: {
    email: boolean
    push: boolean
    sms: boolean
  }
  is_active: boolean
  last_triggered_at?: string
  trigger_count: number
  created_at: string
}

interface AlertTemplate {
  alert_type: string
  template_name: string
  description: string
  default_conditions: Record<string, any>
}

interface AlertLimits {
  tier: string
  max_alerts: number
  alert_types: string[]
  advanced_conditions: boolean
  real_time_alerts: boolean
}

interface AlertTrigger {
  id: string
  trigger_data: Record<string, any>
  message: string
  triggered_at: string
  delivery_status: string
}

export default function SmartAlertsPage() {
  const [alerts, setAlerts] = useState<SmartAlert[]>([])
  const [templates, setTemplates] = useState<AlertTemplate[]>([])
  const [limits, setLimits] = useState<AlertLimits | null>(null)
  const [recentTriggers, setRecentTriggers] = useState<AlertTrigger[]>([])
  const [userTier, setUserTier] = useState<'free' | 'pro' | 'elite'>('free')
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newAlert, setNewAlert] = useState({
    alertName: '',
    alertType: '' as 'price_movement' | 'volume_spike' | 'whale_activity' | 'narrative_change',
    targetSymbol: '',
    conditions: {} as Record<string, any>,
    notificationMethods: {
      email: true,
      push: false,
      sms: false
    }
  })
  const router = useRouter()

  useEffect(() => {
    fetchAlertsData()
  }, [])

  const fetchAlertsData = async () => {
    try {
      const response = await fetch('/api/tools/smart-alerts')
      const data = await response.json()

      if (data.success) {
        setAlerts(data.alerts)
        setTemplates(data.templates)
        setLimits(data.limits)
        setRecentTriggers(data.recentTriggers)
        setUserTier(data.userTier)
      } else {
        toast.error('Failed to load alerts data')
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
      toast.error('Failed to load alerts')
    } finally {
      setIsLoading(false)
    }
  }

  const createAlert = async () => {
    if (!newAlert.alertName || !newAlert.alertType) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const response = await fetch('/api/tools/smart-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertName: newAlert.alertName,
          alertType: newAlert.alertType,
          targetSymbol: newAlert.targetSymbol || undefined,
          conditions: newAlert.conditions,
          notificationMethods: newAlert.notificationMethods
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Smart alert created successfully!')
        setShowCreateDialog(false)
        setNewAlert({
          alertName: '',
          alertType: '' as any,
          targetSymbol: '',
          conditions: {},
          notificationMethods: { email: true, push: false, sms: false }
        })
        await fetchAlertsData()
      } else {
        toast.error(data.error || 'Failed to create alert')
      }
    } catch (error) {
      console.error('Error creating alert:', error)
      toast.error('Failed to create alert')
    }
  }

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/tools/smart-alerts/${alertId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Alert ${isActive ? 'activated' : 'deactivated'}`)
        await fetchAlertsData()
      } else {
        toast.error(data.error || 'Failed to update alert')
      }
    } catch (error) {
      console.error('Error toggling alert:', error)
      toast.error('Failed to update alert')
    }
  }

  const deleteAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/tools/smart-alerts/${alertId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Alert deleted successfully')
        await fetchAlertsData()
      } else {
        toast.error(data.error || 'Failed to delete alert')
      }
    } catch (error) {
      console.error('Error deleting alert:', error)
      toast.error('Failed to delete alert')
    }
  }

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'price_movement':
        return <TrendingUp className="h-5 w-5" />
      case 'volume_spike':
        return <Activity className="h-5 w-5" />
      case 'whale_activity':
        return <Wallet className="h-5 w-5" />
      case 'narrative_change':
        return <Brain className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getAlertTypeLabel = (alertType: string) => {
    switch (alertType) {
      case 'price_movement':
        return 'Price Movement'
      case 'volume_spike':
        return 'Volume Spike'
      case 'whale_activity':
        return 'Whale Activity'
      case 'narrative_change':
        return 'Narrative Change'
      default:
        return 'Smart Alert'
    }
  }

  const canCreateAlert = () => {
    return limits && alerts.length < limits.max_alerts
  }

  const canUseAlertType = (alertType: string) => {
    return limits && limits.alert_types.includes(alertType)
  }

  const handleAlertTypeChange = (alertType: string) => {
    const template = templates.find(t => t.alert_type === alertType)
    setNewAlert(prev => ({
      ...prev,
      alertType: alertType as any,
      conditions: template?.default_conditions || {}
    }))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Smart Alerts</h1>
          <p className="text-muted-foreground mt-1">
            Get notified about important market movements and opportunities
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary">
            {userTier.charAt(0).toUpperCase() + userTier.slice(1)} Tier
          </Badge>
          {limits && (
            <Badge variant="outline">
              {alerts.length}/{limits.max_alerts} Alerts
            </Badge>
          )}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button disabled={!canCreateAlert()}>
                <Plus className="h-4 w-4 mr-2" />
                New Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create Smart Alert</DialogTitle>
                <DialogDescription>
                  Set up a new alert to monitor market conditions and get notified when your criteria are met.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="alertName">Alert Name *</Label>
                  <Input
                    id="alertName"
                    placeholder="e.g., Bitcoin Price Alert"
                    value={newAlert.alertName}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, alertName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alertType">Alert Type *</Label>
                  <Select
                    value={newAlert.alertType}
                    onValueChange={handleAlertTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select alert type" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem
                          key={template.alert_type}
                          value={template.alert_type}
                          disabled={!canUseAlertType(template.alert_type)}
                        >
                          <div className="flex items-center gap-2">
                            {getAlertIcon(template.alert_type)}
                            <div>
                              <div className="font-medium">{template.template_name}</div>
                              <div className="text-xs text-muted-foreground">{template.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {newAlert.alertType && !canUseAlertType(newAlert.alertType) && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        This alert type requires {newAlert.alertType === 'narrative_change' ? 'Elite' : 'Pro'} tier.
                        <Button variant="link" className="p-0 h-auto ml-1" onClick={() => router.push('/pricing')}>
                          Upgrade now
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {['price_movement', 'volume_spike', 'whale_activity'].includes(newAlert.alertType) && (
                  <div className="space-y-2">
                    <Label htmlFor="targetSymbol">Target Symbol</Label>
                    <Input
                      id="targetSymbol"
                      placeholder="e.g., BTC, ETH (leave empty for all)"
                      value={newAlert.targetSymbol}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, targetSymbol: e.target.value.toUpperCase() }))}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Notification Methods</Label>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="email"
                        checked={newAlert.notificationMethods.email}
                        onCheckedChange={(checked) => setNewAlert(prev => ({
                          ...prev,
                          notificationMethods: { ...prev.notificationMethods, email: checked }
                        }))}
                      />
                      <Label htmlFor="email">Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="push"
                        checked={newAlert.notificationMethods.push}
                        onCheckedChange={(checked) => setNewAlert(prev => ({
                          ...prev,
                          notificationMethods: { ...prev.notificationMethods, push: checked }
                        }))}
                        disabled={userTier === 'free'}
                      />
                      <Label htmlFor="push" className={userTier === 'free' ? 'text-muted-foreground' : ''}>
                        Push {userTier === 'free' && '(Pro+)'}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="sms"
                        checked={newAlert.notificationMethods.sms}
                        onCheckedChange={(checked) => setNewAlert(prev => ({
                          ...prev,
                          notificationMethods: { ...prev.notificationMethods, sms: checked }
                        }))}
                        disabled={userTier !== 'elite'}
                      />
                      <Label htmlFor="sms" className={userTier !== 'elite' ? 'text-muted-foreground' : ''}>
                        SMS {userTier !== 'elite' && '(Elite)'}
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createAlert}>
                  Create Alert
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!canCreateAlert() && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You've reached your alert limit ({limits?.max_alerts} alerts for {userTier} tier).
            <Button variant="link" className="p-0 h-auto ml-1" onClick={() => router.push('/pricing')}>
              Upgrade for more alerts
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="alerts">My Alerts</TabsTrigger>
          <TabsTrigger value="history">Alert History</TabsTrigger>
        </TabsList>

        {/* My Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          {alerts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alerts.map((alert) => (
                <Card key={alert.id} className="relative">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getAlertIcon(alert.alert_type)}
                        <CardTitle className="text-lg">{alert.alert_name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={alert.is_active}
                          onCheckedChange={(checked) => toggleAlert(alert.id, checked)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAlert(alert.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      {getAlertTypeLabel(alert.alert_type)}
                      {alert.target_symbol && ` • ${alert.target_symbol.toUpperCase()}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant={alert.is_active ? "default" : "secondary"}>
                        {alert.is_active ? "Active" : "Paused"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Triggers</span>
                      <span className="font-medium">{alert.trigger_count}</span>
                    </div>
                    {alert.last_triggered_at && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Triggered</span>
                        <span className="font-medium">
                          {new Date(alert.last_triggered_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Notifications</span>
                      <div className="flex gap-1">
                        {alert.notification_methods.email && <Badge variant="outline" className="text-xs">Email</Badge>}
                        {alert.notification_methods.push && <Badge variant="outline" className="text-xs">Push</Badge>}
                        {alert.notification_methods.sms && <Badge variant="outline" className="text-xs">SMS</Badge>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <div className="text-lg font-medium mb-2">No alerts yet</div>
              <div className="text-muted-foreground mb-4">Create your first smart alert to get notified about market opportunities</div>
              <Button onClick={() => setShowCreateDialog(true)} disabled={!canCreateAlert()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Alert
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Alert History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Triggers</CardTitle>
              <CardDescription>
                Your alert notifications from the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentTriggers.length > 0 ? (
                <div className="space-y-4">
                  {recentTriggers.map((trigger) => (
                    <div
                      key={trigger.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{trigger.message}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(trigger.triggered_at).toLocaleString()}
                        </div>
                      </div>
                      <Badge variant={
                        trigger.delivery_status === 'delivered' ? 'default' :
                        trigger.delivery_status === 'failed' ? 'destructive' :
                        'secondary'
                      }>
                        {trigger.delivery_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BellRing className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <div className="text-lg font-medium mb-2">No triggers yet</div>
                  <div className="text-muted-foreground">Your alert notifications will appear here</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
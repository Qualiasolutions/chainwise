'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertTriangle, Bell, BellRing, Plus, Trash2, TrendingUp, TrendingDown, Percent } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"

interface UserAlert {
  id: string
  symbol: string
  alert_type: 'price_above' | 'price_below' | 'percentage_change'
  target_value: number
  is_active: boolean
  triggered_at?: string
  created_at: string
}

interface UserProfile {
  tier: 'free' | 'pro' | 'elite'
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<UserAlert[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    alertType: '' as 'price_above' | 'price_below' | 'percentage_change',
    targetValue: ''
  })
  const router = useRouter()
  const { user, loading: authLoading } = useSupabaseAuth()

  const alertLimits = {
    free: 3,
    pro: 10,
    elite: 999999
  }

  useEffect(() => {
    if (!authLoading && user) {
      fetchUserData()
    } else if (!authLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, authLoading, router])

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const profileResponse = await fetch('/api/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setUserProfile(profileData.profile)
      }

      // Fetch alerts
      const alertsResponse = await fetch('/api/alerts')
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json()
        setAlerts(alertsData.alerts || [])
      } else {
        toast.error('Failed to load alerts')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const createAlert = async () => {
    if (!newAlert.symbol || !newAlert.alertType || !newAlert.targetValue) {
      toast.error('Please fill in all fields')
      return
    }

    const targetValue = parseFloat(newAlert.targetValue)
    if (isNaN(targetValue) || targetValue <= 0) {
      toast.error('Please enter a valid target value')
      return
    }

    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: newAlert.symbol.toLowerCase(),
          alertType: newAlert.alertType,
          targetValue: targetValue
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Price alert created successfully!')
        setShowCreateDialog(false)
        setNewAlert({ symbol: '', alertType: '' as any, targetValue: '' })
        await fetchUserData()
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
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Alert ${isActive ? 'activated' : 'deactivated'}`)
        await fetchUserData()
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
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Alert deleted successfully')
        await fetchUserData()
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
      case 'price_above':
        return <TrendingUp className="h-5 w-5 text-green-500" />
      case 'price_below':
        return <TrendingDown className="h-5 w-5 text-red-500" />
      case 'percentage_change':
        return <Percent className="h-5 w-5 text-blue-500" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getAlertTypeLabel = (alertType: string) => {
    switch (alertType) {
      case 'price_above':
        return 'Price Above'
      case 'price_below':
        return 'Price Below'
      case 'percentage_change':
        return 'Percentage Change'
      default:
        return 'Alert'
    }
  }

  const canCreateAlert = () => {
    if (!userProfile) return false
    const limit = alertLimits[userProfile.tier]
    return alerts.length < limit
  }

  const formatTargetValue = (alert: UserAlert) => {
    if (alert.alert_type === 'percentage_change') {
      return `${alert.target_value}%`
    }
    return `$${alert.target_value.toLocaleString()}`
  }

  if (authLoading || isLoading) {
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

  const userLimit = userProfile ? alertLimits[userProfile.tier] : 3

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
          <h1 className="text-3xl font-bold tracking-tight">Price Alerts</h1>
          <p className="text-muted-foreground mt-1">
            Get notified when cryptocurrencies reach your target prices
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary">
            {userProfile?.tier.charAt(0).toUpperCase() + userProfile?.tier.slice(1)} Tier
          </Badge>
          <Badge variant="outline">
            {alerts.length}/{userLimit === 999999 ? '∞' : userLimit} Alerts
          </Badge>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button disabled={!canCreateAlert()}>
                <Plus className="h-4 w-4 mr-2" />
                New Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Price Alert</DialogTitle>
                <DialogDescription>
                  Set up a new alert to monitor cryptocurrency prices and get notified when your conditions are met.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="symbol">Cryptocurrency Symbol *</Label>
                  <Input
                    id="symbol"
                    placeholder="e.g., BTC, ETH, XRP"
                    value={newAlert.symbol}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alertType">Alert Type *</Label>
                  <Select
                    value={newAlert.alertType}
                    onValueChange={(value) => setNewAlert(prev => ({ ...prev, alertType: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select alert type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price_above">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <div>
                            <div className="font-medium">Price Above</div>
                            <div className="text-xs text-muted-foreground">Alert when price goes above target</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="price_below">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-red-500" />
                          <div>
                            <div className="font-medium">Price Below</div>
                            <div className="text-xs text-muted-foreground">Alert when price goes below target</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="percentage_change">
                        <div className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-blue-500" />
                          <div>
                            <div className="font-medium">Percentage Change</div>
                            <div className="text-xs text-muted-foreground">Alert on 24h percentage change</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetValue">
                    Target Value *
                    {newAlert.alertType === 'percentage_change' ? ' (%)' : ' ($)'}
                  </Label>
                  <Input
                    id="targetValue"
                    type="number"
                    step="any"
                    placeholder={newAlert.alertType === 'percentage_change' ? "e.g., 5" : "e.g., 50000"}
                    value={newAlert.targetValue}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, targetValue: e.target.value }))}
                  />
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
            You've reached your alert limit ({userLimit} alerts for {userProfile?.tier} tier).
            <Button variant="link" className="p-0 h-auto ml-1" onClick={() => router.push('/checkout')}>
              Upgrade for more alerts
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Alerts</TabsTrigger>
          <TabsTrigger value="all">All Alerts</TabsTrigger>
        </TabsList>

        {/* Active Alerts Tab */}
        <TabsContent value="active" className="space-y-6">
          {alerts.filter(alert => alert.is_active).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alerts.filter(alert => alert.is_active).map((alert) => (
                <Card key={alert.id} className="relative">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getAlertIcon(alert.alert_type)}
                        <CardTitle className="text-lg">{alert.symbol.toUpperCase()}</CardTitle>
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
                      {getAlertTypeLabel(alert.alert_type)} {formatTargetValue(alert)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Created</span>
                      <span className="font-medium">
                        {new Date(alert.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {alert.triggered_at && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Triggered</span>
                        <span className="font-medium">
                          {new Date(alert.triggered_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <div className="text-lg font-medium mb-2">No active alerts</div>
              <div className="text-muted-foreground mb-4">Create your first price alert to get notified about market opportunities</div>
              <Button onClick={() => setShowCreateDialog(true)} disabled={!canCreateAlert()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Alert
              </Button>
            </div>
          )}
        </TabsContent>

        {/* All Alerts Tab */}
        <TabsContent value="all" className="space-y-6">
          {alerts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alerts.map((alert) => (
                <Card key={alert.id} className="relative">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getAlertIcon(alert.alert_type)}
                        <CardTitle className="text-lg">{alert.symbol.toUpperCase()}</CardTitle>
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
                      {getAlertTypeLabel(alert.alert_type)} {formatTargetValue(alert)}
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
                      <span className="text-muted-foreground">Created</span>
                      <span className="font-medium">
                        {new Date(alert.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {alert.triggered_at && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Triggered</span>
                        <span className="font-medium">
                          {new Date(alert.triggered_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BellRing className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <div className="text-lg font-medium mb-2">No alerts yet</div>
              <div className="text-muted-foreground mb-4">Create your first price alert to get started</div>
              <Button onClick={() => setShowCreateDialog(true)} disabled={!canCreateAlert()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Alert
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
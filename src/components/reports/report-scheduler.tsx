'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { useSupabase } from '@/components/providers/supabase-provider'
import { useSubscription } from '@/hooks/use-subscription'
import { 
  Calendar, 
  Clock, 
  Plus,
  Trash2,
  Settings,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ReportSchedule {
  id: string
  report_type: string
  frequency: string
  parameters: any
  is_active: boolean
  next_run_at: string
  last_run_at?: string
  created_at: string
}

const reportTypeNames: Record<string, string> = {
  'pro_weekly': 'Pro Weekly Report',
  'elite_monthly': 'Elite Monthly Report',
  'deep_dive': 'Deep Dive Analysis'
}

const frequencyNames: Record<string, string> = {
  'daily': 'Daily',
  'weekly': 'Weekly', 
  'monthly': 'Monthly'
}

export function ReportScheduler() {
  const [schedules, setSchedules] = useState<ReportSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newSchedule, setNewSchedule] = useState({
    reportType: 'deep_dive',
    frequency: 'weekly'
  })
  
  const { session } = useSupabase()
  const { creditBalance } = useSubscription()
  const { toast } = useToast()

  useEffect(() => {
    if (session) {
      fetchSchedules()
    }
  }, [session])

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/reports/schedule')
      const data = await response.json()
      
      if (data.success) {
        setSchedules(data.schedules)
      } else {
        throw new Error(data.error || 'Failed to fetch schedules')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load scheduled reports',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const createSchedule = async () => {
    if (!canCreateSchedule(newSchedule.reportType)) {
      return
    }

    setActionLoading('create')
    
    try {
      const response = await fetch('/api/reports/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportType: newSchedule.reportType,
          frequency: newSchedule.frequency,
          isActive: true
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSchedules([data.schedule, ...schedules])
        setShowCreateDialog(false)
        toast({
          title: 'Success!',
          description: data.message,
        })
      } else {
        throw new Error(data.error || 'Failed to create schedule')
      }
    } catch (error: any) {
      toast({
        title: 'Failed to Create Schedule',
        description: error.message || 'Something went wrong',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(null)
    }
  }

  const deleteSchedule = async (scheduleId: string) => {
    setActionLoading(scheduleId)
    
    try {
      const response = await fetch(`/api/reports/schedule?id=${scheduleId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        setSchedules(schedules.filter(s => s.id !== scheduleId))
        toast({
          title: 'Success!',
          description: 'Schedule deleted successfully',
        })
      } else {
        throw new Error(data.error || 'Failed to delete schedule')
      }
    } catch (error: any) {
      toast({
        title: 'Failed to Delete',
        description: error.message || 'Something went wrong',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(null)
    }
  }

  const canCreateSchedule = (reportType: string) => {
    const tier = creditBalance?.tier || 'free'
    
    switch (reportType) {
      case 'pro_weekly':
        return ['pro', 'elite'].includes(tier)
      case 'elite_monthly':
        return tier === 'elite'
      case 'deep_dive':
        return true
      default:
        return false
    }
  }

  const getStatusColor = (schedule: ReportSchedule) => {
    if (!schedule.is_active) return 'bg-gray-100 text-gray-800'
    
    const nextRun = new Date(schedule.next_run_at)
    const now = new Date()
    const hoursUntilRun = (nextRun.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    if (hoursUntilRun < 24) return 'bg-green-100 text-green-800'
    if (hoursUntilRun < 72) return 'bg-yellow-100 text-yellow-800'
    return 'bg-blue-100 text-blue-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Report Scheduler</h2>
          <p className="text-gray-600">Automate your AI report generation</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Schedule Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Report</DialogTitle>
              <DialogDescription>
                Set up automatic generation of AI reports
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reportType">Report Type</Label>
                <Select 
                  value={newSchedule.reportType} 
                  onValueChange={(value) => setNewSchedule({...newSchedule, reportType: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deep_dive" disabled={!canCreateSchedule('deep_dive')}>
                      Deep Dive Analysis (All tiers)
                    </SelectItem>
                    <SelectItem value="pro_weekly" disabled={!canCreateSchedule('pro_weekly')}>
                      Pro Weekly Report (Pro/Elite)
                    </SelectItem>
                    <SelectItem value="elite_monthly" disabled={!canCreateSchedule('elite_monthly')}>
                      Elite Monthly Report (Elite only)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select 
                  value={newSchedule.frequency} 
                  onValueChange={(value) => setNewSchedule({...newSchedule, frequency: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-4 flex gap-2">
                <Button onClick={createSchedule} disabled={!canCreateSchedule(newSchedule.reportType) || actionLoading === 'create'}>
                  {actionLoading === 'create' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Calendar className="w-4 h-4 mr-2" />
                  )}
                  Create Schedule
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Scheduled Reports */}
      {schedules.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Scheduled Reports</h3>
            <p className="text-gray-600 mb-4">
              Set up automatic generation of your favorite reports
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Schedule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <Card key={schedule.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {reportTypeNames[schedule.report_type]}
                    </CardTitle>
                    <CardDescription>
                      {frequencyNames[schedule.frequency]} • 
                      Next run: {new Date(schedule.next_run_at).toLocaleString()}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(schedule)}>
                      {schedule.is_active ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Paused
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Created {new Date(schedule.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {schedule.last_run_at && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">
                          Last run {new Date(schedule.last_run_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSchedule(schedule.id)}
                      disabled={actionLoading === schedule.id}
                    >
                      {actionLoading === schedule.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">How Scheduling Works</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Reports are generated automatically based on your schedule</li>
                <li>• Credits are deducted when reports are generated</li>
                <li>• You&apos;ll receive notifications when reports are ready</li>
                <li>• Schedules pause automatically if you run out of credits</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
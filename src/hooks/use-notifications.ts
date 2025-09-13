'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSupabase } from '@/components/providers/supabase-provider'
import { toast } from 'sonner'

interface Notification {
  id: string
  user_id: string
  type: 'alert_triggered' | 'portfolio_update' | 'system_notification' | 'trading_signal' | 'ai_insight'
  channel: 'email' | 'in_app' | 'push'
  title: string
  message: string
  status: 'pending' | 'sent' | 'failed' | 'delivered'
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  metadata: Record<string, any>
  expires_at: string | null
  created_at: string
  updated_at: string
}

interface UseNotificationsOptions {
  channel?: 'email' | 'in_app' | 'push' | 'all'
  read?: boolean | 'all'
  type?: 'alert_triggered' | 'portfolio_update' | 'system_notification' | 'trading_signal' | 'ai_insight' | 'all'
  limit?: number
  realTime?: boolean
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  hasMore: boolean
  refresh: () => Promise<void>
  loadMore: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const {
    channel = 'all',
    read = 'all',
    type = 'all',
    limit = 20,
    realTime = true
  } = options

  const { user } = useSupabase()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)

  const supabase = createClient()

  // Fetch notifications
  const fetchNotifications = useCallback(async (newOffset = 0, append = false) => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setError(null)
      
      const params = new URLSearchParams({
        channel,
        read: read.toString(),
        type,
        limit: limit.toString(),
        offset: newOffset.toString()
      })

      const response = await fetch(`/api/notifications?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data = await response.json()
      
      if (append) {
        setNotifications(prev => [...prev, ...data.notifications])
      } else {
        setNotifications(data.notifications)
      }
      
      setHasMore(data.pagination.hasMore)
      setOffset(newOffset + data.notifications.length)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load notifications'
      setError(errorMessage)
      console.error('Error fetching notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [user, channel, read, type, limit])

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return

    try {
      const response = await fetch('/api/notifications/unread-count')
      
      if (!response.ok) {
        throw new Error('Failed to fetch unread count')
      }

      const data = await response.json()
      setUnreadCount(data.unreadCount)

    } catch (err) {
      console.error('Error fetching unread count:', err)
    }
  }, [user])

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ read: true })
      })

      if (!response.ok) {
        throw new Error('Failed to mark notification as read')
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true }
            : notification
        )
      )

      // Update unread count
      await fetchUnreadCount()

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark as read'
      toast.error(errorMessage)
      console.error('Error marking as read:', err)
    }
  }, [fetchUnreadCount])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH'
      })

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read')
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      )

      setUnreadCount(0)
      toast.success('All notifications marked as read')

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all as read'
      toast.error(errorMessage)
      console.error('Error marking all as read:', err)
    }
  }, [])

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete notification')
      }

      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== id))
      
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n.id === id)
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }

      toast.success('Notification deleted')

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete notification'
      toast.error(errorMessage)
      console.error('Error deleting notification:', err)
    }
  }, [notifications])

  // Refresh notifications
  const refresh = useCallback(async () => {
    setLoading(true)
    setOffset(0)
    await Promise.all([
      fetchNotifications(0, false),
      fetchUnreadCount()
    ])
  }, [fetchNotifications, fetchUnreadCount])

  // Load more notifications
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return
    await fetchNotifications(offset, true)
  }, [fetchNotifications, hasMore, loading, offset])

  // Initial load
  useEffect(() => {
    if (user) {
      refresh()
    }
  }, [user, refresh])

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user || !realTime) return

    // Subscribe to new notifications for the current user
    const notificationChannel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification
          
          // Add to notifications list if it matches current filters
          const matchesChannel = channel === 'all' || newNotification.channel === channel
          const matchesType = type === 'all' || newNotification.type === type
          const matchesRead = read === 'all' || newNotification.read === (read === true)

          if (matchesChannel && matchesType && matchesRead) {
            setNotifications(prev => [newNotification, ...prev])
          }

          // Update unread count for in-app notifications
          if (newNotification.channel === 'in_app' && !newNotification.read) {
            setUnreadCount(prev => prev + 1)
            
            // Show toast notification for high priority items
            if (newNotification.priority === 'high' || newNotification.priority === 'urgent') {
              toast.info(newNotification.title, {
                description: newNotification.message
              })
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedNotification = payload.new as Notification
          
          // Update notification in list
          setNotifications(prev => 
            prev.map(n => 
              n.id === updatedNotification.id ? updatedNotification : n
            )
          )

          // Update unread count if read status changed
          if (updatedNotification.channel === 'in_app') {
            fetchUnreadCount()
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const deletedNotification = payload.old as Notification
          
          // Remove from notifications list
          setNotifications(prev => prev.filter(n => n.id !== deletedNotification.id))
          
          // Update unread count if deleted notification was unread
          if (deletedNotification.channel === 'in_app' && !deletedNotification.read) {
            setUnreadCount(prev => Math.max(0, prev - 1))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(notificationChannel)
    }
  }, [user, supabase, realTime, channel, type, read, fetchUnreadCount])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification
  }
}
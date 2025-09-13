'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Zap, 
  MoreHorizontal,
  RefreshCw,
  Settings,
  Trash2,
  Eye,
  Filter
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useNotifications } from '@/hooks/use-notifications'
import { cn } from '@/lib/utils'

// Helper function to get notification icon and color based on type
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'alert_triggered':
      return { icon: AlertCircle, color: 'text-red-500' }
    case 'portfolio_update':
      return { icon: TrendingUp, color: 'text-green-500' }
    case 'ai_insight':
      return { icon: Zap, color: 'text-blue-500' }
    case 'system_notification':
      return { icon: CheckCircle, color: 'text-purple-500' }
    case 'trading_signal':
      return { icon: TrendingUp, color: 'text-indigo-500' }
    default:
      return { icon: Bell, color: 'text-gray-500' }
  }
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'alert_triggered' | 'portfolio_update' | 'system_notification' | 'trading_signal' | 'ai_insight'>('all')
  
  const { 
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
  } = useNotifications({ 
    read: filter === 'all' ? 'all' : filter === 'unread' ? false : true,
    type: typeFilter,
    limit: 50,
    realTime: true 
  })

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const handleDeleteNotification = async (id: string) => {
    await deleteNotification(id)
  }

  const handleRefresh = async () => {
    await refresh()
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen chainwise-gradient">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
              <p className="text-gray-300">Stay updated with your portfolio and AI insights</p>
            </div>
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                  {unreadCount} new
                </Badge>
              )}
              <Button 
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="text-gray-300 hover:text-white hover:bg-white/10"
              >
                <RefreshCw className={cn("h-4 w-4 mr-1", loading && "animate-spin")} />
                Refresh
              </Button>
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="border-purple-400/30 text-purple-300 hover:bg-purple-500/10"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Filter by:</span>
            </div>
            
            {/* Read Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-white/5">
                  {filter === 'all' ? 'All' : filter === 'unread' ? 'Unread' : 'Read'}
                  <Filter className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/90 backdrop-blur-md border-white/10">
                <DropdownMenuItem onClick={() => setFilter('all')} className="text-gray-300 hover:text-white">
                  All notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('unread')} className="text-gray-300 hover:text-white">
                  Unread only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('read')} className="text-gray-300 hover:text-white">
                  Read only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-white/5">
                  {typeFilter === 'all' ? 'All Types' : typeFilter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  <Filter className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/90 backdrop-blur-md border-white/10">
                <DropdownMenuItem onClick={() => setTypeFilter('all')} className="text-gray-300 hover:text-white">
                  All Types
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter('alert_triggered')} className="text-gray-300 hover:text-white">
                  🚨 Alerts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter('portfolio_update')} className="text-gray-300 hover:text-white">
                  📊 Portfolio Updates
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter('ai_insight')} className="text-gray-300 hover:text-white">
                  🤖 AI Insights
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter('trading_signal')} className="text-gray-300 hover:text-white">
                  📈 Trading Signals
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter('system_notification')} className="text-gray-300 hover:text-white">
                  ℹ️ System Notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Error State */}
          {error && (
            <Card className="border-red-500/30 bg-red-900/20 backdrop-blur-sm mb-6">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <div>
                    <h3 className="font-semibold">Error loading notifications</h3>
                    <p className="text-sm text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && notifications.length === 0 && (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4 animate-pulse">
                      <div className="w-2 h-2 bg-gray-600 rounded-full mt-2"></div>
                      <div className="p-2 rounded-lg bg-gray-800">
                        <div className="w-5 h-5 bg-gray-600 rounded"></div>
                      </div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-600 rounded mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-24"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Notifications List */}
          {!loading && notifications.length > 0 && (
            <div className="space-y-4">
              {notifications.map((notification) => {
                const { icon: Icon, color } = getNotificationIcon(notification.type)
                
                return (
                  <Card 
                    key={notification.id}
                    className={cn(
                      "transition-all duration-200 hover:shadow-lg cursor-pointer border-gray-700/50 bg-gray-900/50 backdrop-blur-sm",
                      !notification.read 
                        ? "border-purple-400/30 shadow-purple-500/10" 
                        : "border-gray-600/30"
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Status Indicator */}
                        <div className="flex-shrink-0">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse mt-2"></div>
                          )}
                          {notification.read && (
                            <div className="w-2 h-2 bg-gray-500 rounded-full mt-2"></div>
                          )}
                        </div>

                        {/* Icon */}
                        <div className={cn("flex-shrink-0 p-2 rounded-lg bg-gray-800/50", color)}>
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className={cn(
                                  "text-sm font-semibold",
                                  !notification.read ? "text-white" : "text-gray-300"
                                )}>
                                  {notification.title}
                                </h3>
                                <Badge 
                                  variant="secondary" 
                                  className={cn(
                                    "text-xs px-2 py-1",
                                    notification.priority === 'urgent' && "bg-red-500/20 text-red-400 border-red-500/30",
                                    notification.priority === 'high' && "bg-orange-500/20 text-orange-400 border-orange-500/30",
                                    notification.priority === 'medium' && "bg-blue-500/20 text-blue-400 border-blue-500/30",
                                    notification.priority === 'low' && "bg-gray-500/20 text-gray-400 border-gray-500/30"
                                  )}
                                >
                                  {notification.priority?.toUpperCase()}
                                </Badge>
                              </div>
                              <p className={cn(
                                "text-sm mb-2",
                                !notification.read ? "text-gray-300" : "text-gray-400"
                              )}>
                                {notification.message}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <time>
                                  {new Date(notification.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </time>
                                <span className="capitalize">
                                  {notification.type.replace('_', ' ')}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2 ml-4">
                              {!notification.read && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Mark read
                                </Button>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 h-8 w-8 p-0"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-black/90 backdrop-blur-md border-white/10" align="end">
                                  {!notification.read && (
                                    <DropdownMenuItem 
                                      onClick={() => handleMarkAsRead(notification.id)}
                                      className="text-gray-300 hover:text-white"
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      Mark as read
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator className="bg-white/10" />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteNotification(notification.id)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && !loading && (
            <div className="text-center mt-8">
              <Button 
                variant="outline"
                onClick={loadMore}
                className="border-purple-400/30 text-purple-300 hover:bg-purple-500/10"
              >
                Load More Notifications
              </Button>
            </div>
          )}

          {/* Empty State (if no notifications) */}
          {!loading && notifications.length === 0 && !error && (
            <Card className="border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {filter === 'all' ? 'No notifications yet' : 
                   filter === 'unread' ? 'No unread notifications' :
                   'No read notifications'}
                </h3>
                <p className="text-gray-400 mb-4">
                  {filter === 'all' 
                    ? "You&apos;ll see portfolio updates, AI insights, and system notifications here."
                    : `No ${filter} notifications found. Try adjusting your filters.`
                  }
                </p>
                {filter !== 'all' && (
                  <Button 
                    variant="ghost"
                    onClick={() => setFilter('all')}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    Show all notifications
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Footer Actions */}
          <div className="mt-8 text-center space-x-4">
            <Button 
              variant="outline"
              className="border-purple-400/30 text-purple-300 hover:bg-purple-500/10"
              onClick={() => window.location.href = '/settings?tab=notifications'}
            >
              <Settings className="h-4 w-4 mr-2" />
              Notification Settings
            </Button>
            {notifications.length > 0 && (
              <Button 
                variant="ghost"
                onClick={handleRefresh}
                disabled={loading}
                className="text-gray-400 hover:text-gray-300"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                Refresh
              </Button>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

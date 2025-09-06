'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, CheckCircle, AlertCircle, TrendingUp, Zap } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'

const notifications = [
  {
    id: '1',
    title: 'Portfolio Alert',
    message: 'Your BTC holdings increased by 5.2% today',
    type: 'portfolio',
    time: '2 minutes ago',
    read: false,
    icon: TrendingUp,
    color: 'text-green-500'
  },
  {
    id: '2',
    title: 'AI Analysis Ready',
    message: 'New market analysis available for your portfolio',
    type: 'ai',
    time: '15 minutes ago',
    read: false,
    icon: Zap,
    color: 'text-blue-500'
  },
  {
    id: '3',
    title: 'Credits Refilled',
    message: 'Your monthly credits have been restored',
    type: 'system',
    time: '1 hour ago',
    read: false,
    icon: CheckCircle,
    color: 'text-purple-500'
  },
  {
    id: '4',
    title: 'Price Alert Triggered',
    message: 'ETH has reached your target price of $2,500',
    type: 'alert',
    time: '3 hours ago',
    read: true,
    icon: AlertCircle,
    color: 'text-orange-500'
  },
  {
    id: '5',
    title: 'Weekly Report Ready',
    message: 'Your portfolio performance report is available',
    type: 'report',
    time: '1 day ago',
    read: true,
    icon: TrendingUp,
    color: 'text-indigo-500'
  }
]

export default function NotificationsPage() {
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen chainwise-gradient">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
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
                variant="outline" 
                size="sm"
                className="border-purple-400/30 text-purple-300 hover:bg-purple-500/10"
              >
                Mark all as read
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {notifications.map((notification) => {
              const Icon = notification.icon
              
              return (
                <Card 
                  key={notification.id}
                  className={`transition-all duration-200 hover:shadow-lg cursor-pointer border-gray-700/50 bg-gray-900/50 backdrop-blur-sm ${
                    !notification.read 
                      ? 'border-purple-400/30 shadow-purple-500/10' 
                      : 'border-gray-600/30'
                  }`}
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
                      <div className={`flex-shrink-0 p-2 rounded-lg bg-gray-800/50 ${notification.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className={`text-sm font-semibold ${
                              !notification.read ? 'text-white' : 'text-gray-300'
                            }`}>
                              {notification.title}
                            </h3>
                            <p className={`text-sm mt-1 ${
                              !notification.read ? 'text-gray-300' : 'text-gray-400'
                            }`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {notification.time}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.read && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                              >
                                Mark read
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-gray-400 hover:text-gray-300 hover:bg-gray-700/50"
                            >
                              •••
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Empty State (if no notifications) */}
          {notifications.length === 0 && (
            <Card className="border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No notifications yet</h3>
                <p className="text-gray-400">
                  You'll see portfolio updates, AI insights, and system notifications here.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Footer Actions */}
          <div className="mt-8 text-center">
            <Button 
              variant="outline"
              className="border-purple-400/30 text-purple-300 hover:bg-purple-500/10"
            >
              Notification Settings
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

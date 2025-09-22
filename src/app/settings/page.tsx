"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Settings, CreditCard, Bell, Shield, HelpCircle, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface OverviewData {
  user: {
    id: string;
    email: string;
    tier: string;
    full_name: string;
  };
  badges: {
    subscription: string | null;
    notifications: string | null;
    sessions: string | null;
    connected_accounts: string | null;
  };
  recent_activities: Array<{
    id: string;
    type: string;
    description: string;
    displayText: string;
    timestamp: string;
    color: string;
  }>;
  stats: {
    total_notifications: number;
    active_sessions: number;
    connected_accounts: number;
    two_factor_enabled: boolean;
    security_notifications: boolean;
  };
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings/overview');

      if (!response.ok) {
        throw new Error('Failed to fetch overview data');
      }

      const data = await response.json();
      setOverviewData(data);
    } catch (error: any) {
      console.error('Error fetching overview data:', error);
      toast.error('Failed to load settings overview');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading settings overview...</span>
        </div>
      </div>
    );
  }

  if (!overviewData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-lg font-medium">Failed to load settings</div>
          <div className="text-sm text-muted-foreground mt-1">
            Please refresh the page to try again
          </div>
          <Button onClick={fetchOverviewData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      title: "Update Profile",
      description: "Change your name, email, and profile picture",
      href: "/settings/profile",
      icon: User,
      badge: null,
    },
    {
      title: "Manage Subscription",
      description: "View your current plan and billing information",
      href: "/settings/billing",
      icon: CreditCard,
      badge: overviewData.badges.subscription,
    },
    {
      title: "Notification Settings",
      description: "Configure your email and push notifications",
      href: "/settings/notifications",
      icon: Bell,
      badge: overviewData.badges.notifications,
    },
    {
      title: "Privacy & Security",
      description: "Manage your privacy settings and security options",
      href: "/settings/account",
      icon: Shield,
      badge: overviewData.stats.two_factor_enabled ? "2FA Enabled" : null,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Account Overview
          </CardTitle>
          <CardDescription>
            Quick access to your most important settings for {overviewData.user.full_name || overviewData.user.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card key={action.href} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <Button
                      variant="ghost"
                      className="w-full h-auto p-0 justify-start"
                      asChild
                    >
                      <Link href={action.href}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-sm">{action.title}</div>
                              <div className="text-xs text-muted-foreground line-clamp-2">
                                {action.description}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {action.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {action.badge}
                              </Badge>
                            )}
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest account activities and changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {overviewData.recent_activities.length > 0 ? (
              overviewData.recent_activities.map((activity) => (
                <div key={activity.id} className={`flex items-center gap-3 p-3 bg-${activity.color}-50 dark:bg-${activity.color}-950/30 rounded-lg`}>
                  <div className={`w-2 h-2 bg-${activity.color}-500 rounded-full`}></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{activity.displayText}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <div className="text-sm">No recent activity</div>
                <div className="text-xs mt-1">Your account activities will appear here</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
          <CardDescription>
            Overview of your ChainWise account status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {overviewData.stats.total_notifications}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Active Notifications
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {overviewData.stats.active_sessions}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Active Sessions
              </div>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {overviewData.stats.connected_accounts}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                Connected Accounts
              </div>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {overviewData.stats.two_factor_enabled ? 'ON' : 'OFF'}
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">
                Two-Factor Auth
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Need Help?
          </CardTitle>
          <CardDescription>
            Get support and learn more about ChainWise features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" asChild>
              <Link href="/settings/support">
                Contact Support
              </Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/help">
                Help Center
              </Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/contact">
                Send Feedback
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
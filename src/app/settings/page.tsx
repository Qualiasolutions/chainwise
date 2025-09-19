"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Settings, CreditCard, Bell, Shield, HelpCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

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
    badge: "Pro Plan",
  },
  {
    title: "Notification Settings",
    description: "Configure your email and push notifications",
    href: "/settings/notifications",
    icon: Bell,
    badge: "3 Active",
  },
  {
    title: "Privacy & Security",
    description: "Manage your privacy settings and security options",
    href: "/settings/privacy",
    icon: Shield,
    badge: null,
  },
];

export default function SettingsPage() {
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
            Quick access to your most important settings
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
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">Profile updated</div>
                <div className="text-xs text-muted-foreground">2 hours ago</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">Subscription renewed</div>
                <div className="text-xs text-muted-foreground">Yesterday</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">New device login</div>
                <div className="text-xs text-muted-foreground">3 days ago</div>
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
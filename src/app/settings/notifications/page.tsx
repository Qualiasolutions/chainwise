"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, Smartphone, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  price_alerts: boolean;
  portfolio_updates: boolean;
  market_news: boolean;
  security_alerts: boolean;
  marketing_emails: boolean;
  weekly_digest: boolean;
  weekly_reports: boolean;
}

export default function NotificationsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: false,
    price_alerts: true,
    portfolio_updates: true,
    market_news: false,
    security_alerts: true,
    marketing_emails: false,
    weekly_digest: true,
    weekly_reports: true,
  });

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/settings/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.preferences) {
        // Map backend response to frontend interface
        const prefs = data.preferences;
        setSettings({
          email_notifications: prefs.email_notifications ?? true,
          push_notifications: prefs.push_notifications ?? false,
          price_alerts: prefs.price_alerts ?? true,
          portfolio_updates: prefs.portfolio_updates ?? true,
          market_news: prefs.market_news ?? false,
          security_alerts: prefs.security_alerts ?? true,
          marketing_emails: prefs.marketing_emails ?? false,
          weekly_digest: prefs.weekly_digest ?? true,
          weekly_reports: prefs.weekly_reports ?? true,
        });
      }

    } catch (error) {
      console.error("Failed to load notification settings:", error);
      toast({
        title: "Error",
        description: "Failed to load notification settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof NotificationSettings, value: boolean) => {
    try {
      setSaving(true);

      // Update local state optimistically
      setSettings(prev => ({ ...prev, [key]: value }));

      // Send update to API
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [key]: value
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update settings');
      }

      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved.",
      });

    } catch (error) {
      console.error("Failed to update notification setting:", error);
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      });

      // Revert local state on error
      setSettings(prev => ({ ...prev, [key]: !value }));
    } finally {
      setSaving(false);
    }
  };

  const notificationCategories = [
    {
      title: "Communication",
      icon: Mail,
      settings: [
        {
          key: "email_notifications" as keyof NotificationSettings,
          label: "Email Notifications",
          description: "Receive notifications via email",
        },
        {
          key: "push_notifications" as keyof NotificationSettings,
          label: "Push Notifications",
          description: "Receive push notifications in your browser",
        },
      ],
    },
    {
      title: "Portfolio & Trading",
      icon: TrendingUp,
      settings: [
        {
          key: "price_alerts" as keyof NotificationSettings,
          label: "Price Alerts",
          description: "Get notified when your cryptocurrencies hit target prices",
        },
        {
          key: "portfolio_updates" as keyof NotificationSettings,
          label: "Portfolio Updates",
          description: "Receive updates about your portfolio performance",
        },
      ],
    },
    {
      title: "Market & News",
      icon: DollarSign,
      settings: [
        {
          key: "market_news" as keyof NotificationSettings,
          label: "Market News",
          description: "Stay updated with the latest cryptocurrency news",
        },
        {
          key: "weekly_digest" as keyof NotificationSettings,
          label: "Weekly Digest",
          description: "Receive a weekly summary of your portfolio and market trends",
        },
      ],
    },
    {
      title: "Security & Account",
      icon: AlertTriangle,
      settings: [
        {
          key: "security_alerts" as keyof NotificationSettings,
          label: "Security Alerts",
          description: "Important security notifications and login alerts",
        },
        {
          key: "marketing_emails" as keyof NotificationSettings,
          label: "Marketing Emails",
          description: "Receive promotional emails and product updates",
        },
      ],
    },
  ];

  if (loading) {
    return (
      <EnhancedCard>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </EnhancedCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <EnhancedCard>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Bell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle>Notification Settings</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage how you receive notifications and updates
              </p>
            </div>
          </div>
        </CardHeader>
      </EnhancedCard>

      {/* Notification Categories */}
      {notificationCategories.map((category, index) => {
        const Icon = category.icon;
        return (
          <EnhancedCard key={category.title}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-muted-foreground" />
                <CardTitle className="text-lg">{category.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {category.settings.map((setting, settingIndex) => (
                <div key={setting.key}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <Label htmlFor={setting.key} className="text-sm font-medium">
                        {setting.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {setting.description}
                      </p>
                    </div>
                    <Switch
                      id={setting.key}
                      checked={settings[setting.key]}
                      onCheckedChange={(checked) => updateSetting(setting.key, checked)}
                      disabled={saving}
                    />
                  </div>
                  {settingIndex < category.settings.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </CardContent>
          </EnhancedCard>
        );
      })}

      {/* Notification Methods */}
      <EnhancedCard>
        <CardHeader>
          <CardTitle>Notification Methods</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure how you want to receive different types of notifications
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Email</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email at your registered email address
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Smartphone className="w-5 h-5 text-green-600" />
                <span className="font-medium">Browser Push</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Get instant notifications in your browser when the app is open
              </p>
            </div>
          </div>
        </CardContent>
      </EnhancedCard>

      {/* Test Notification */}
      <EnhancedCard>
        <CardHeader>
          <CardTitle>Test Notifications</CardTitle>
          <p className="text-sm text-muted-foreground">
            Send a test notification to verify your settings are working
          </p>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => {
              toast({
                title: "Test Notification",
                description: "This is a test notification to verify your settings are working correctly.",
              });
            }}
            disabled={saving}
          >
            <Bell className="w-4 h-4 mr-2" />
            Send Test Notification
          </Button>
        </CardContent>
      </EnhancedCard>
    </div>
  );
}
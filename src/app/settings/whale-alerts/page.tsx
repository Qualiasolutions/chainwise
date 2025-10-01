'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Bell, Waves, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface WhaleAlertPreferences {
  min_usd_value: number;
  blockchains: string[];
  notification_channels: string[];
  transaction_types: string[];
  quiet_hours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface SubscriptionData {
  is_active: boolean;
  notification_preferences: WhaleAlertPreferences;
  has_access: boolean;
  user_tier?: string;
}

export default function WhaleAlertsSettings() {
  const router = useRouter();
  const { user, loading: authLoading } = useSupabaseAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [preferences, setPreferences] = useState<WhaleAlertPreferences>({
    min_usd_value: 100000,
    blockchains: ['bitcoin', 'ethereum'],
    notification_channels: ['in_app'],
    transaction_types: ['transfer'],
    quiet_hours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    } else if (user) {
      fetchSubscription();
    }
  }, [user, authLoading, router]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/whale-alerts/subscribe');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
        setIsActive(data.subscription.is_active);
        setPreferences(data.subscription.notification_preferences);
      } else if (response.status === 401) {
        // Unauthorized - redirect to signin
        router.push('/auth/signin');
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (checked: boolean) => {
    if (!subscription?.has_access) {
      alert('Whale Alerts require an Elite tier subscription. Please upgrade to enable this feature.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/whale-alerts/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: checked,
          notification_preferences: preferences
        })
      });

      if (response.ok) {
        setIsActive(checked);
        const data = await response.json();
        setSubscription(data.subscription);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update subscription');
      }
    } catch (error) {
      console.error('Failed to toggle active:', error);
      alert('Failed to update subscription');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/whale-alerts/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        alert('Preferences updated successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update preferences');
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
      alert('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    setTesting(true);
    setTestSuccess(false);
    try {
      const response = await fetch('/api/whale-alerts/test', {
        method: 'POST'
      });

      if (response.ok) {
        setTestSuccess(true);
        setTimeout(() => setTestSuccess(false), 3000);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to send test notification');
      }
    } catch (error) {
      console.error('Failed to send test:', error);
      alert('Failed to send test notification');
    } finally {
      setTesting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const hasAccess = subscription?.has_access ?? false;
  const userTier = subscription?.user_tier || 'buddy';

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Waves className="h-8 w-8 text-purple-500" />
          Whale Alerts
        </h1>
        <p className="text-muted-foreground mt-2">
          Get real-time notifications for significant cryptocurrency transactions
        </p>
      </div>

      {!hasAccess && (
        <Card className="mb-6 border-purple-500/50 bg-purple-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-500" />
              Elite Feature
            </CardTitle>
            <CardDescription>
              Whale Alerts are exclusive to Elite tier subscribers. Upgrade to unlock real-time whale transaction tracking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/checkout')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Upgrade to Elite
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className={!hasAccess ? 'opacity-50 pointer-events-none' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Enable Whale Alerts</CardTitle>
              <CardDescription>
                Receive notifications when large cryptocurrency transactions occur
              </CardDescription>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={handleToggleActive}
              disabled={saving || !hasAccess}
            />
          </div>
        </CardHeader>
      </Card>

      {isActive && hasAccess && (
        <>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Minimum Transaction Value</CardTitle>
              <CardDescription>
                Only notify for transactions above this USD value
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Minimum Value</Label>
                  <span className="text-sm font-semibold text-purple-600">
                    {formatCurrency(preferences.min_usd_value)}
                  </span>
                </div>
                <Slider
                  value={[preferences.min_usd_value]}
                  onValueChange={([value]) => setPreferences({ ...preferences, min_usd_value: value })}
                  min={100000}
                  max={10000000}
                  step={100000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$100K</span>
                  <span>$10M</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Blockchains</CardTitle>
              <CardDescription>
                Select which blockchains to monitor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['bitcoin', 'ethereum', 'tron'].map((blockchain) => (
                <div key={blockchain} className="flex items-center space-x-2">
                  <Checkbox
                    id={blockchain}
                    checked={preferences.blockchains.includes(blockchain)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setPreferences({
                          ...preferences,
                          blockchains: [...preferences.blockchains, blockchain]
                        });
                      } else {
                        setPreferences({
                          ...preferences,
                          blockchains: preferences.blockchains.filter(b => b !== blockchain)
                        });
                      }
                    }}
                  />
                  <Label htmlFor={blockchain} className="capitalize cursor-pointer">
                    {blockchain}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>
                Choose how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: 'in_app', label: 'In-App Notifications' },
                { id: 'email', label: 'Email Notifications' }
              ].map((channel) => (
                <div key={channel.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={channel.id}
                    checked={preferences.notification_channels.includes(channel.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setPreferences({
                          ...preferences,
                          notification_channels: [...preferences.notification_channels, channel.id]
                        });
                      } else {
                        setPreferences({
                          ...preferences,
                          notification_channels: preferences.notification_channels.filter(c => c !== channel.id)
                        });
                      }
                    }}
                  />
                  <Label htmlFor={channel.id} className="cursor-pointer">
                    {channel.label}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quiet Hours</CardTitle>
              <CardDescription>
                Pause notifications during specific times
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Quiet Hours</Label>
                <Switch
                  checked={preferences.quiet_hours.enabled}
                  onCheckedChange={(checked) => setPreferences({
                    ...preferences,
                    quiet_hours: { ...preferences.quiet_hours, enabled: checked }
                  })}
                />
              </div>
              {preferences.quiet_hours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <input
                      type="time"
                      value={preferences.quiet_hours.start}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        quiet_hours: { ...preferences.quiet_hours, start: e.target.value }
                      })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <input
                      type="time"
                      value={preferences.quiet_hours.end}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        quiet_hours: { ...preferences.quiet_hours, end: e.target.value }
                      })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4 mt-6">
            <Button
              onClick={handleUpdatePreferences}
              disabled={saving}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Preferences'
              )}
            </Button>
            <Button
              onClick={handleTestNotification}
              disabled={testing}
              variant="outline"
              className="border-purple-500 text-purple-600 hover:bg-purple-50"
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : testSuccess ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Sent!
                </>
              ) : (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  Test Notification
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

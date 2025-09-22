"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Eye,
  EyeOff,
  Database,
  Download,
  Trash2,
  AlertTriangle,
  Lock,
  Globe,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PrivacySettings {
  profile_visibility: "public" | "private" | "friends";
  portfolio_visibility: "public" | "private" | "anonymous";
  activity_tracking: boolean;
  analytics_sharing: boolean;
  marketing_personalization: boolean;
  data_retention: "1year" | "2years" | "forever";
  third_party_sharing: boolean;
}

export default function PrivacyPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PrivacySettings>({
    profile_visibility: "private",
    portfolio_visibility: "private",
    activity_tracking: true,
    analytics_sharing: false,
    marketing_personalization: false,
    data_retention: "2years",
    third_party_sharing: false,
  });

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to load privacy settings
      // For now, use default settings
      setLoading(false);
    } catch (error) {
      console.error("Failed to load privacy settings:", error);
      toast({
        title: "Error",
        description: "Failed to load privacy settings",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof PrivacySettings, value: any) => {
    try {
      setSaving(true);

      // Update local state
      setSettings(prev => ({ ...prev, [key]: value }));

      // TODO: Implement API call to save settings
      await new Promise(resolve => setTimeout(resolve, 500)); // Mock delay

      toast({
        title: "Privacy Settings Updated",
        description: "Your privacy preferences have been saved.",
      });

    } catch (error) {
      console.error("Failed to update privacy setting:", error);
      toast({
        title: "Error",
        description: "Failed to update privacy settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const requestDataExport = async () => {
    try {
      setSaving(true);
      // TODO: Implement data export API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Mock delay

      toast({
        title: "Data Export Requested",
        description: "We'll email you a link to download your data within 24 hours.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request data export",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const requestAccountDeletion = async () => {
    if (!confirm("Are you sure you want to request account deletion? This action cannot be undone.")) {
      return;
    }

    try {
      setSaving(true);
      // TODO: Implement account deletion request API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Mock delay

      toast({
        title: "Account Deletion Requested",
        description: "Your account deletion request has been submitted. You'll receive a confirmation email.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request account deletion",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

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
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle>Privacy Settings</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Control your privacy and data sharing preferences
              </p>
            </div>
          </div>
        </CardHeader>
      </EnhancedCard>

      {/* Profile Visibility */}
      <EnhancedCard>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-lg">Profile Visibility</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Who can see your profile?</Label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { value: "public", label: "Public", desc: "Anyone can see your profile" },
                { value: "private", label: "Private", desc: "Only you can see your profile" },
                { value: "friends", label: "Friends Only", desc: "Only your connections can see your profile" }
              ].map((option) => (
                <div
                  key={option.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    settings.profile_visibility === option.value
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                  onClick={() => updateSetting("profile_visibility", option.value)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.desc}</div>
                    </div>
                    {settings.profile_visibility === option.value && (
                      <Badge variant="secondary">Selected</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-medium">Portfolio Visibility</Label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { value: "public", label: "Public", desc: "Anyone can see your portfolio performance" },
                { value: "anonymous", label: "Anonymous", desc: "Portfolio visible but without personal details" },
                { value: "private", label: "Private", desc: "Only you can see your portfolio" }
              ].map((option) => (
                <div
                  key={option.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    settings.portfolio_visibility === option.value
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                  onClick={() => updateSetting("portfolio_visibility", option.value)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.desc}</div>
                    </div>
                    {settings.portfolio_visibility === option.value && (
                      <Badge variant="secondary">Selected</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </EnhancedCard>

      {/* Data & Analytics */}
      <EnhancedCard>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-lg">Data & Analytics</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Activity Tracking</Label>
              <p className="text-sm text-muted-foreground">
                Allow ChainWise to track your activity to improve your experience
              </p>
            </div>
            <Switch
              checked={settings.activity_tracking}
              onCheckedChange={(checked) => updateSetting("activity_tracking", checked)}
              disabled={saving}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Analytics Sharing</Label>
              <p className="text-sm text-muted-foreground">
                Share anonymized usage data to help improve ChainWise
              </p>
            </div>
            <Switch
              checked={settings.analytics_sharing}
              onCheckedChange={(checked) => updateSetting("analytics_sharing", checked)}
              disabled={saving}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Marketing Personalization</Label>
              <p className="text-sm text-muted-foreground">
                Use your data to personalize marketing content and recommendations
              </p>
            </div>
            <Switch
              checked={settings.marketing_personalization}
              onCheckedChange={(checked) => updateSetting("marketing_personalization", checked)}
              disabled={saving}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Third-party Data Sharing</Label>
              <p className="text-sm text-muted-foreground">
                Allow sharing anonymized data with trusted partners
              </p>
            </div>
            <Switch
              checked={settings.third_party_sharing}
              onCheckedChange={(checked) => updateSetting("third_party_sharing", checked)}
              disabled={saving}
            />
          </div>
        </CardContent>
      </EnhancedCard>

      {/* Data Management */}
      <EnhancedCard>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-lg">Data Management</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Data Retention Period</Label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { value: "1year", label: "1 Year", desc: "Delete inactive data after 1 year" },
                { value: "2years", label: "2 Years", desc: "Delete inactive data after 2 years" },
                { value: "forever", label: "Keep Forever", desc: "Never automatically delete data" }
              ].map((option) => (
                <div
                  key={option.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    settings.data_retention === option.value
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                  onClick={() => updateSetting("data_retention", option.value)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.desc}</div>
                    </div>
                    {settings.data_retention === option.value && (
                      <Badge variant="secondary">Selected</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={requestDataExport}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export My Data
            </Button>

            <Button
              variant="destructive"
              onClick={requestAccountDeletion}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </Button>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Data Export & Deletion
                </p>
                <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                  Data exports will be emailed to you within 24 hours. Account deletion requests
                  require email confirmation and are permanent.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </EnhancedCard>

      {/* Privacy Information */}
      <EnhancedCard>
        <CardHeader>
          <CardTitle className="text-lg">Privacy Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-green-600" />
                <span className="font-medium">Data Encryption</span>
              </div>
              <p className="text-muted-foreground">
                All your data is encrypted in transit and at rest using industry-standard encryption.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="font-medium">GDPR Compliant</span>
              </div>
              <p className="text-muted-foreground">
                We comply with GDPR and other international privacy regulations.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="link" className="p-0 h-auto">
              Read our Privacy Policy →
            </Button>
          </div>
        </CardContent>
      </EnhancedCard>
    </div>
  );
}
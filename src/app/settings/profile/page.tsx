"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Camera, Save, Mail, Calendar, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

export default function ProfilePage() {
  const { user: authUser, profile, loading: authLoading, refreshProfile } = useSupabaseAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    location: "",
    website: ""
  });

  useEffect(() => {
    // Initialize form data with real user data
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || ""
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      toast.success("Profile updated successfully!");

      // Refresh the profile data
      await refreshProfile();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getSubscriptionBadge = (tier: string) => {
    switch (tier) {
      case "pro":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">PRO</Badge>;
      case "elite":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">ELITE</Badge>;
      default:
        return <Badge variant="secondary">FREE</Badge>;
    }
  };

  if (authLoading || !profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Manage your personal information and how others see you on ChainWise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-3">
              <Avatar className="w-24 h-24">
                <AvatarImage src={authUser?.user_metadata?.avatar_url} alt={profile.full_name || authUser?.email} />
                <AvatarFallback className="text-lg">
                  {profile.full_name?.split(' ').map(n => n[0]).join('') || authUser?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" className="text-xs">
                <Camera className="w-3 h-3 mr-1" />
                Change Photo
              </Button>
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold">{profile.full_name || authUser?.email}</h3>
                {getSubscriptionBadge(profile.tier)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {authUser?.email}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Member since {new Date(profile.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {profile.location || "Location not set"}
                </div>
              </div>

              {/* Credits Info */}
              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">AI Credits</span>
                  <span className="text-purple-600 dark:text-purple-400">
                    {profile.credits} remaining
                  </span>
                </div>
                <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2 mt-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, (profile.credits / profile.monthly_credits) * 100))}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>
            Update your profile information below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange("full_name", e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Tell us about yourself..."
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Your location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => setFormData({
                full_name: profile.full_name || "",
                bio: profile.bio || "",
                location: profile.location || "",
                website: profile.website || ""
              })}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
          <CardDescription>
            Your ChainWise usage and activity overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {profile.monthly_credits - profile.credits}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Credits Used This Month
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {profile.credits}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Credits Remaining
              </div>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.ceil((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                Days Since Joining
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
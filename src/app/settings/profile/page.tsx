"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Camera, Save, Mail, Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    id: "user_123",
    email: "user@example.com",
    name: "John Doe",
    username: "johndoe",
    bio: "Crypto enthusiast and AI technology advocate",
    location: "New York, USA",
    website: "https://johndoe.com",
    avatar_url: "",
    created_at: "2024-01-15T10:30:00Z",
    subscription_tier: "pro",
    total_credits: 1500,
    credits_used: 450
  });

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
    location: "",
    website: ""
  });

  useEffect(() => {
    // Initialize form data with user data
    setFormData({
      name: user.name || "",
      username: user.username || "",
      bio: user.bio || "",
      location: user.location || "",
      website: user.website || ""
    });
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Integrate with Supabase MCP to update user profile
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setUser(prev => ({
        ...prev,
        ...formData
      }));

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
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
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Professor</Badge>;
      case "elite":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Trader</Badge>;
      default:
        return <Badge variant="secondary">Buddy</Badge>;
    }
  };

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
                <AvatarImage src={user.avatar_url} alt={user.name} />
                <AvatarFallback className="text-lg">
                  {user.name?.split(' ').map(n => n[0]).join('') || 'JD'}
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
                <h3 className="text-xl font-semibold">{user.name}</h3>
                {getSubscriptionBadge(user.subscription_tier)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {user.location || "Location not set"}
                </div>
              </div>

              {/* Credits Info */}
              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">AI Credits</span>
                  <span className="text-purple-600 dark:text-purple-400">
                    {user.total_credits - user.credits_used} remaining
                  </span>
                </div>
                <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2 mt-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((user.total_credits - user.credits_used) / user.total_credits) * 100}%` }}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="Your username"
              />
            </div>
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
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
                name: user.name || "",
                username: user.username || "",
                bio: user.bio || "",
                location: user.location || "",
                website: user.website || ""
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
                {user.credits_used}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Credits Used
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                42
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                AI Conversations
              </div>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                7
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                Days Active
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
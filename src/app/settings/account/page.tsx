"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Shield,
  Key,
  Smartphone,
  Mail,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";

export default function AccountPage() {
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Mock account data
  const [accountData, setAccountData] = useState({
    email: "user@example.com",
    two_factor_enabled: true,
    email_verified: true,
    last_login: "2024-09-19T14:30:00Z",
    created_at: "2024-01-15T10:30:00Z",
    login_count: 127
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });

  const connectedAccounts = [
    {
      provider: "Google",
      email: "user@gmail.com",
      connected_at: "2024-01-15",
      status: "active"
    }
  ];

  const loginSessions = [
    {
      id: "session_1",
      device: "Chrome on MacOS",
      location: "New York, USA",
      last_active: "2024-09-19T14:30:00Z",
      is_current: true
    },
    {
      id: "session_2",
      device: "Safari on iPhone",
      location: "New York, USA",
      last_active: "2024-09-18T09:15:00Z",
      is_current: false
    }
  ];

  const handleUpdateEmail = async () => {
    setLoading(true);
    try {
      // TODO: Integrate with Supabase Auth to update email
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Verification email sent to new address");
    } catch (error) {
      console.error("Error updating email:", error);
      toast.error("Failed to update email");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("New passwords don't match");
      return;
    }

    setLoading(true);
    try {
      // TODO: Integrate with Supabase Auth to update password
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Password updated successfully");
      setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    setLoading(true);
    try {
      // TODO: Integrate with Supabase Auth for 2FA
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAccountData(prev => ({ ...prev, two_factor_enabled: !prev.two_factor_enabled }));
      toast.success(`Two-factor authentication ${!accountData.two_factor_enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error("Error toggling 2FA:", error);
      toast.error("Failed to update two-factor authentication");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setLoading(true);
    try {
      // TODO: Revoke session via Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Session revoked successfully");
    } catch (error) {
      console.error("Error revoking session:", error);
      toast.error("Failed to revoke session");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // This should show a confirmation dialog first
    const confirmed = confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!confirmed) return;

    setLoading(true);
    try {
      // TODO: Implement account deletion with Supabase
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Account deletion initiated");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Account Overview
          </CardTitle>
          <CardDescription>
            Basic information about your ChainWise account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Email Address</Label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm">{accountData.email}</span>
                  {accountData.email_verified ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">Unverified</Badge>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Member Since</Label>
                <div className="text-sm text-muted-foreground mt-1">
                  {new Date(accountData.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Last Login</Label>
                <div className="text-sm text-muted-foreground mt-1">
                  {new Date(accountData.last_login).toLocaleString()}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Total Logins</Label>
                <div className="text-sm text-muted-foreground mt-1">
                  {accountData.login_count} times
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Change Email Address
          </CardTitle>
          <CardDescription>
            Update your email address for login and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-email">New Email Address</Label>
            <Input
              id="new-email"
              type="email"
              placeholder="Enter your new email address"
            />
          </div>
          <Button onClick={handleUpdateEmail} disabled={loading}>
            Update Email Address
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your account password for better security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                value={passwordData.current_password}
                onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                placeholder="Enter your current password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <Button onClick={handleUpdatePassword} disabled={loading}>
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Two-Factor Authentication</div>
              <div className="text-sm text-muted-foreground">
                {accountData.two_factor_enabled
                  ? "Your account is protected with 2FA"
                  : "Secure your account with an authenticator app"
                }
              </div>
            </div>
            <Switch
              checked={accountData.two_factor_enabled}
              onCheckedChange={handleToggle2FA}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>
            Manage your social login connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {connectedAccounts.map((account, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-red-600 dark:text-red-400">G</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">{account.provider}</div>
                    <div className="text-xs text-muted-foreground">{account.email}</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Disconnect
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            Manage your active login sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loginSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{session.device}</span>
                      {session.is_current && (
                        <Badge variant="secondary" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {session.location} • {new Date(session.last_active).toLocaleString()}
                    </div>
                  </div>
                </div>
                {!session.is_current && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                    disabled={loading}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-red-700 dark:text-red-300">
            Actions in this section cannot be undone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-red-800 dark:text-red-200">Delete Account</div>
              <div className="text-sm text-red-700 dark:text-red-300">
                Permanently delete your account and all associated data
              </div>
            </div>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={loading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
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
  EyeOff,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

interface SecuritySettings {
  two_factor_enabled: boolean;
  security_notifications: boolean;
  login_notifications: boolean;
  password_changed_at: string;
  last_security_audit: string;
  has_backup_codes: boolean;
}

interface ConnectedAccount {
  id: string;
  provider: string;
  email: string;
  display_name: string;
  is_primary: boolean;
  connected_at: string;
  last_used: string;
}

interface UserSession {
  id: string;
  device: string;
  location: string;
  ip_address: string;
  last_active: string;
  is_current: boolean;
  created_at: string;
}

interface AccountData {
  security: SecuritySettings;
  connected_accounts: ConnectedAccount[];
  recent_security_activities: Array<{
    id: string;
    type: string;
    description: string;
    created_at: string;
    ip_address: string;
  }>;
}

export default function AccountPage() {
  const { user: authUser, profile } = useSupabaseAuth();
  const [loading, setLoading] = useState(true);
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });

  const [emailData, setEmailData] = useState({
    new_email: ""
  });

  useEffect(() => {
    if (authUser && profile) {
      fetchAccountData();
      fetchSessions();
    }
  }, [authUser, profile]);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings/security');

      if (!response.ok) {
        throw new Error('Failed to fetch account data');
      }

      const data = await response.json();
      setAccountData(data);
    } catch (error: any) {
      console.error('Error fetching account data:', error);
      toast.error('Failed to load account information');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/settings/sessions');

      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleUpdateEmail = async () => {
    if (!emailData.new_email) {
      toast.error('Please enter a new email address');
      return;
    }

    setActionLoading('email');
    try {
      const response = await fetch('/api/settings/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_email: emailData.new_email })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update email');
      }

      const result = await response.json();
      toast.success(result.message);
      setEmailData({ new_email: "" });
    } catch (error: any) {
      console.error("Error updating email:", error);
      toast.error(error.message || "Failed to update email");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setActionLoading('password');
    try {
      const response = await fetch('/api/settings/security', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update password');
      }

      toast.success("Password updated successfully");
      setPasswordData({ current_password: "", new_password: "", confirm_password: "" });

      // Refresh account data to update password changed timestamp
      await fetchAccountData();
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error(error.message || "Failed to update password");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggle2FA = async () => {
    if (!accountData) return;

    setActionLoading('2fa');
    try {
      const response = await fetch('/api/settings/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: accountData.security.two_factor_enabled ? 'disable_2fa' : 'enable_2fa'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update 2FA');
      }

      const result = await response.json();
      toast.success(result.message);

      // Refresh account data
      await fetchAccountData();
    } catch (error: any) {
      console.error("Error toggling 2FA:", error);
      toast.error(error.message || "Failed to update two-factor authentication");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setActionLoading(`session-${sessionId}`);
    try {
      const response = await fetch('/api/settings/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to revoke session');
      }

      toast.success("Session revoked successfully");

      // Refresh sessions
      await fetchSessions();
    } catch (error: any) {
      console.error("Error revoking session:", error);
      toast.error(error.message || "Failed to revoke session");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnectAccount = async (accountId: string, provider: string) => {
    const confirmed = confirm(
      `Are you sure you want to disconnect your ${provider} account? You may lose access if this is your only login method.`
    );
    if (!confirmed) return;

    setActionLoading(`account-${accountId}`);
    try {
      const response = await fetch('/api/settings/connected-accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: accountId, provider })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to disconnect account');
      }

      const result = await response.json();
      toast.success(result.message);

      // Refresh account data
      await fetchAccountData();
    } catch (error: any) {
      console.error("Error disconnecting account:", error);
      toast.error(error.message || "Failed to disconnect account");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmationText = prompt(
      'To confirm account deletion, please type "DELETE MY ACCOUNT" (case sensitive):'
    );

    if (confirmationText !== 'DELETE MY ACCOUNT') {
      toast.error('Account deletion cancelled');
      return;
    }

    setActionLoading('delete');
    try {
      const response = await fetch('/api/settings/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation_text: confirmationText })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      toast.success("Account deletion initiated");

      // Redirect to homepage after successful deletion
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error(error.message || "Failed to delete account");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading account settings...</span>
        </div>
      </div>
    );
  }

  if (!accountData || !authUser || !profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-lg font-medium">Failed to load account settings</div>
          <div className="text-sm text-muted-foreground mt-1">
            Please refresh the page to try again
          </div>
          <Button onClick={fetchAccountData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

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
                  <span className="text-sm">{authUser.email}</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                    Verified
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Member Since</Label>
                <div className="text-sm text-muted-foreground mt-1">
                  {new Date(profile.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Last Password Change</Label>
                <div className="text-sm text-muted-foreground mt-1">
                  {new Date(accountData.security.password_changed_at).toLocaleDateString()}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Security Status</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={accountData.security.two_factor_enabled ? "default" : "secondary"} className="text-xs">
                    {accountData.security.two_factor_enabled ? "2FA Enabled" : "2FA Disabled"}
                  </Badge>
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
              value={emailData.new_email}
              onChange={(e) => setEmailData({ new_email: e.target.value })}
              placeholder="Enter your new email address"
            />
          </div>
          <Button
            onClick={handleUpdateEmail}
            disabled={actionLoading === 'email' || !emailData.new_email}
          >
            {actionLoading === 'email' ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </div>
            ) : (
              'Update Email Address'
            )}
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

          <Button
            onClick={handleUpdatePassword}
            disabled={actionLoading === 'password' || !passwordData.current_password || !passwordData.new_password}
          >
            {actionLoading === 'password' ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </div>
            ) : (
              'Update Password'
            )}
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
                {accountData.security.two_factor_enabled
                  ? "Your account is protected with 2FA"
                  : "Secure your account with an authenticator app"
                }
              </div>
            </div>
            <Switch
              checked={accountData.security.two_factor_enabled}
              onCheckedChange={handleToggle2FA}
              disabled={actionLoading === '2fa'}
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
            {accountData.connected_accounts.length > 0 ? (
              accountData.connected_accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-red-600 dark:text-red-400">
                        {account.provider[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm capitalize">{account.provider}</span>
                        {account.is_primary && (
                          <Badge variant="secondary" className="text-xs">Primary</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{account.email || account.display_name}</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnectAccount(account.id, account.provider)}
                    disabled={actionLoading === `account-${account.id}`}
                  >
                    {actionLoading === `account-${account.id}` ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Disconnect'
                    )}
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <div className="text-sm">No connected accounts</div>
                <div className="text-xs mt-1">Connect social accounts for easier login</div>
              </div>
            )}
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
            {sessions.length > 0 ? (
              sessions.map((session) => (
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
                      disabled={actionLoading === `session-${session.id}`}
                    >
                      {actionLoading === `session-${session.id}` ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Revoke'
                      )}
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <div className="text-sm">No active sessions found</div>
                <div className="text-xs mt-1">Your login sessions will appear here</div>
              </div>
            )}
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
              disabled={actionLoading === 'delete'}
            >
              {actionLoading === 'delete' ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </div>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
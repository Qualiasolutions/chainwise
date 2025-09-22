-- Settings Backend Integration Schema
-- Created: 2025-09-22
-- Purpose: Add tables and functions for complete settings page functionality

-- User Sessions table for login tracking
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB DEFAULT '{}', -- browser, os, device type
    ip_address INET,
    location VARCHAR(255), -- city, country
    user_agent TEXT,
    is_current BOOLEAN DEFAULT false,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Activities table for recent activity tracking
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'login', 'profile_update', 'subscription_change', etc.
    activity_description TEXT NOT NULL,
    activity_metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Account Security Settings table
CREATE TABLE IF NOT EXISTS account_security (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255), -- encrypted TOTP secret
    backup_codes TEXT[], -- encrypted backup codes
    password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_security_audit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    security_notifications BOOLEAN DEFAULT true,
    login_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,
    price_alerts BOOLEAN DEFAULT true,
    portfolio_updates BOOLEAN DEFAULT true,
    weekly_reports BOOLEAN DEFAULT true,
    security_alerts BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Connected Social Accounts table
CREATE TABLE IF NOT EXISTS connected_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'google', 'facebook', 'twitter', etc.
    provider_id VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    display_name VARCHAR(255),
    avatar_url TEXT,
    is_primary BOOLEAN DEFAULT false,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(user_id, is_current);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_account_security_user_id ON account_security(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_id ON connected_accounts(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_security ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (user_id IN (
        SELECT u.id FROM users u WHERE u.auth_id = auth.uid()
    ));

CREATE POLICY "Users can update their own sessions" ON user_sessions
    FOR UPDATE USING (user_id IN (
        SELECT u.id FROM users u WHERE u.auth_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own sessions" ON user_sessions
    FOR DELETE USING (user_id IN (
        SELECT u.id FROM users u WHERE u.auth_id = auth.uid()
    ));

-- RLS Policies for user_activities
CREATE POLICY "Users can view their own activities" ON user_activities
    FOR SELECT USING (user_id IN (
        SELECT u.id FROM users u WHERE u.auth_id = auth.uid()
    ));

-- RLS Policies for account_security
CREATE POLICY "Users can view their own security settings" ON account_security
    FOR SELECT USING (user_id IN (
        SELECT u.id FROM users u WHERE u.auth_id = auth.uid()
    ));

CREATE POLICY "Users can update their own security settings" ON account_security
    FOR UPDATE USING (user_id IN (
        SELECT u.id FROM users u WHERE u.auth_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own security settings" ON account_security
    FOR INSERT WITH CHECK (user_id IN (
        SELECT u.id FROM users u WHERE u.auth_id = auth.uid()
    ));

-- RLS Policies for notification_preferences
CREATE POLICY "Users can view their own notification preferences" ON notification_preferences
    FOR SELECT USING (user_id IN (
        SELECT u.id FROM users u WHERE u.auth_id = auth.uid()
    ));

CREATE POLICY "Users can update their own notification preferences" ON notification_preferences
    FOR UPDATE USING (user_id IN (
        SELECT u.id FROM users u WHERE u.auth_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own notification preferences" ON notification_preferences
    FOR INSERT WITH CHECK (user_id IN (
        SELECT u.id FROM users u WHERE u.auth_id = auth.uid()
    ));

-- RLS Policies for connected_accounts
CREATE POLICY "Users can view their own connected accounts" ON connected_accounts
    FOR SELECT USING (user_id IN (
        SELECT u.id FROM users u WHERE u.auth_id = auth.uid()
    ));

CREATE POLICY "Users can update their own connected accounts" ON connected_accounts
    FOR UPDATE USING (user_id IN (
        SELECT u.id FROM users u WHERE u.auth_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own connected accounts" ON connected_accounts
    FOR DELETE USING (user_id IN (
        SELECT u.id FROM users u WHERE u.auth_id = auth.uid()
    ));

-- Database Functions

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
    user_uuid UUID,
    activity_type VARCHAR(50),
    activity_description TEXT,
    activity_metadata JSONB DEFAULT '{}',
    user_ip INET DEFAULT NULL,
    user_agent_string TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO user_activities (
        user_id,
        activity_type,
        activity_description,
        activity_metadata,
        ip_address,
        user_agent
    ) VALUES (
        user_uuid,
        activity_type,
        activity_description,
        activity_metadata,
        user_ip,
        user_agent_string
    ) RETURNING id INTO activity_id;

    RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's recent activities
CREATE OR REPLACE FUNCTION get_user_recent_activities(
    user_uuid UUID,
    activity_limit INTEGER DEFAULT 10
) RETURNS TABLE (
    id UUID,
    activity_type VARCHAR(50),
    activity_description TEXT,
    activity_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ua.id,
        ua.activity_type,
        ua.activity_description,
        ua.activity_metadata,
        ua.created_at
    FROM user_activities ua
    WHERE ua.user_id = user_uuid
    ORDER BY ua.created_at DESC
    LIMIT activity_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user security settings
CREATE OR REPLACE FUNCTION update_user_security_settings(
    user_uuid UUID,
    enable_2fa BOOLEAN DEFAULT NULL,
    totp_secret VARCHAR(255) DEFAULT NULL,
    security_notifications BOOLEAN DEFAULT NULL,
    login_notifications BOOLEAN DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    security_record account_security%ROWTYPE;
BEGIN
    -- Get existing security record or create default
    SELECT * INTO security_record FROM account_security WHERE user_id = user_uuid;

    IF NOT FOUND THEN
        INSERT INTO account_security (user_id) VALUES (user_uuid);
        SELECT * INTO security_record FROM account_security WHERE user_id = user_uuid;
    END IF;

    -- Update fields if provided
    UPDATE account_security SET
        two_factor_enabled = COALESCE(enable_2fa, two_factor_enabled),
        two_factor_secret = COALESCE(totp_secret, two_factor_secret),
        security_notifications = COALESCE(security_notifications, account_security.security_notifications),
        login_notifications = COALESCE(login_notifications, account_security.login_notifications),
        updated_at = NOW()
    WHERE user_id = user_uuid;

    -- Log the security change
    PERFORM log_user_activity(
        user_uuid,
        'security_update',
        'Security settings updated',
        jsonb_build_object('two_factor_enabled', enable_2fa)
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user notification preferences
CREATE OR REPLACE FUNCTION get_user_notification_preferences(user_uuid UUID)
RETURNS TABLE (
    email_notifications BOOLEAN,
    push_notifications BOOLEAN,
    marketing_emails BOOLEAN,
    price_alerts BOOLEAN,
    portfolio_updates BOOLEAN,
    weekly_reports BOOLEAN,
    security_alerts BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(np.email_notifications, true),
        COALESCE(np.push_notifications, true),
        COALESCE(np.marketing_emails, false),
        COALESCE(np.price_alerts, true),
        COALESCE(np.portfolio_updates, true),
        COALESCE(np.weekly_reports, true),
        COALESCE(np.security_alerts, true)
    FROM notification_preferences np
    WHERE np.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update notification preferences
CREATE OR REPLACE FUNCTION update_notification_preferences(
    user_uuid UUID,
    prefs JSONB
) RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO notification_preferences (
        user_id,
        email_notifications,
        push_notifications,
        marketing_emails,
        price_alerts,
        portfolio_updates,
        weekly_reports,
        security_alerts,
        updated_at
    ) VALUES (
        user_uuid,
        COALESCE((prefs->>'email_notifications')::BOOLEAN, true),
        COALESCE((prefs->>'push_notifications')::BOOLEAN, true),
        COALESCE((prefs->>'marketing_emails')::BOOLEAN, false),
        COALESCE((prefs->>'price_alerts')::BOOLEAN, true),
        COALESCE((prefs->>'portfolio_updates')::BOOLEAN, true),
        COALESCE((prefs->>'weekly_reports')::BOOLEAN, true),
        COALESCE((prefs->>'security_alerts')::BOOLEAN, true),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email_notifications = COALESCE((prefs->>'email_notifications')::BOOLEAN, notification_preferences.email_notifications),
        push_notifications = COALESCE((prefs->>'push_notifications')::BOOLEAN, notification_preferences.push_notifications),
        marketing_emails = COALESCE((prefs->>'marketing_emails')::BOOLEAN, notification_preferences.marketing_emails),
        price_alerts = COALESCE((prefs->>'price_alerts')::BOOLEAN, notification_preferences.price_alerts),
        portfolio_updates = COALESCE((prefs->>'portfolio_updates')::BOOLEAN, notification_preferences.portfolio_updates),
        weekly_reports = COALESCE((prefs->>'weekly_reports')::BOOLEAN, notification_preferences.weekly_reports),
        security_alerts = COALESCE((prefs->>'security_alerts')::BOOLEAN, notification_preferences.security_alerts),
        updated_at = NOW();

    -- Log the preference change
    PERFORM log_user_activity(
        user_uuid,
        'preferences_update',
        'Notification preferences updated',
        prefs
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Initialize security and notification settings for existing users
INSERT INTO account_security (user_id)
SELECT id FROM users
WHERE id NOT IN (SELECT user_id FROM account_security WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO notification_preferences (user_id)
SELECT id FROM users
WHERE id NOT IN (SELECT user_id FROM notification_preferences WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;
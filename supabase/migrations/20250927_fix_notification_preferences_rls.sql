-- Fix Notification Preferences RLS Policies to use profiles table
-- Created: 2025-09-27
-- Purpose: Update RLS policies and functions to use profiles table instead of users

-- Drop existing RLS policies for notification_preferences
DROP POLICY IF EXISTS "Users can view their own notification preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can update their own notification preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can insert their own notification preferences" ON notification_preferences;

-- Create new RLS policies using profiles table
CREATE POLICY "Users can view their own notification preferences" ON notification_preferences
FOR SELECT USING (user_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.auth_id = auth.uid()
));

CREATE POLICY "Users can update their own notification preferences" ON notification_preferences
FOR UPDATE USING (user_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.auth_id = auth.uid()
));

CREATE POLICY "Users can insert their own notification preferences" ON notification_preferences
FOR INSERT WITH CHECK (user_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.auth_id = auth.uid()
));

-- Update the get_user_notification_preferences function to handle missing records better
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
    -- First check if the record exists
    IF EXISTS (SELECT 1 FROM notification_preferences WHERE user_id = user_uuid) THEN
        -- Return existing preferences
        RETURN QUERY
        SELECT
            np.email_notifications,
            np.push_notifications,
            np.marketing_emails,
            np.price_alerts,
            np.portfolio_updates,
            np.weekly_reports,
            np.security_alerts
        FROM notification_preferences np
        WHERE np.user_id = user_uuid;
    ELSE
        -- Create default preferences and return them
        INSERT INTO notification_preferences (
            user_id,
            email_notifications,
            push_notifications,
            marketing_emails,
            price_alerts,
            portfolio_updates,
            weekly_reports,
            security_alerts
        ) VALUES (
            user_uuid,
            true,
            false,
            false,
            true,
            true,
            true,
            true
        );

        -- Return the defaults
        RETURN QUERY
        SELECT
            true::BOOLEAN,
            false::BOOLEAN,
            false::BOOLEAN,
            true::BOOLEAN,
            true::BOOLEAN,
            true::BOOLEAN,
            true::BOOLEAN;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update notification preferences for existing profiles that don't have them
INSERT INTO notification_preferences (
    user_id,
    email_notifications,
    push_notifications,
    marketing_emails,
    price_alerts,
    portfolio_updates,
    weekly_reports,
    security_alerts
)
SELECT
    p.id,
    true,
    false,
    false,
    true,
    true,
    true,
    true
FROM profiles p
WHERE p.id NOT IN (
    SELECT user_id FROM notification_preferences WHERE user_id IS NOT NULL
)
ON CONFLICT (user_id) DO NOTHING;

-- Add missing columns to notification_preferences if they don't exist
DO $$
BEGIN
    -- Add market_news column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notification_preferences' AND column_name = 'market_news'
    ) THEN
        ALTER TABLE notification_preferences ADD COLUMN market_news BOOLEAN DEFAULT false;
    END IF;

    -- Add weekly_digest column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notification_preferences' AND column_name = 'weekly_digest'
    ) THEN
        ALTER TABLE notification_preferences ADD COLUMN weekly_digest BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Update the function to include the new columns
CREATE OR REPLACE FUNCTION get_user_notification_preferences(user_uuid UUID)
RETURNS TABLE (
    email_notifications BOOLEAN,
    push_notifications BOOLEAN,
    marketing_emails BOOLEAN,
    price_alerts BOOLEAN,
    portfolio_updates BOOLEAN,
    weekly_reports BOOLEAN,
    security_alerts BOOLEAN,
    market_news BOOLEAN,
    weekly_digest BOOLEAN
) AS $$
BEGIN
    -- First check if the record exists
    IF EXISTS (SELECT 1 FROM notification_preferences WHERE user_id = user_uuid) THEN
        -- Return existing preferences
        RETURN QUERY
        SELECT
            np.email_notifications,
            np.push_notifications,
            np.marketing_emails,
            np.price_alerts,
            np.portfolio_updates,
            np.weekly_reports,
            np.security_alerts,
            COALESCE(np.market_news, false),
            COALESCE(np.weekly_digest, true)
        FROM notification_preferences np
        WHERE np.user_id = user_uuid;
    ELSE
        -- Create default preferences and return them
        INSERT INTO notification_preferences (
            user_id,
            email_notifications,
            push_notifications,
            marketing_emails,
            price_alerts,
            portfolio_updates,
            weekly_reports,
            security_alerts,
            market_news,
            weekly_digest
        ) VALUES (
            user_uuid,
            true,
            false,
            false,
            true,
            true,
            true,
            true,
            false,
            true
        );

        -- Return the defaults
        RETURN QUERY
        SELECT
            true::BOOLEAN,
            false::BOOLEAN,
            false::BOOLEAN,
            true::BOOLEAN,
            true::BOOLEAN,
            true::BOOLEAN,
            true::BOOLEAN,
            false::BOOLEAN,
            true::BOOLEAN;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the update_notification_preferences function
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
        market_news,
        weekly_digest,
        updated_at
    ) VALUES (
        user_uuid,
        COALESCE((prefs->>'email_notifications')::BOOLEAN, true),
        COALESCE((prefs->>'push_notifications')::BOOLEAN, false),
        COALESCE((prefs->>'marketing_emails')::BOOLEAN, false),
        COALESCE((prefs->>'price_alerts')::BOOLEAN, true),
        COALESCE((prefs->>'portfolio_updates')::BOOLEAN, true),
        COALESCE((prefs->>'weekly_reports')::BOOLEAN, true),
        COALESCE((prefs->>'security_alerts')::BOOLEAN, true),
        COALESCE((prefs->>'market_news')::BOOLEAN, false),
        COALESCE((prefs->>'weekly_digest')::BOOLEAN, true),
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
        market_news = COALESCE((prefs->>'market_news')::BOOLEAN, notification_preferences.market_news),
        weekly_digest = COALESCE((prefs->>'weekly_digest')::BOOLEAN, notification_preferences.weekly_digest),
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
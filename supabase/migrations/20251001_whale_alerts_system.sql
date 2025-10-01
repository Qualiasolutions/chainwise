-- Whale Alerts System Migration
-- Real-time whale transaction notifications for elite users
-- Created: 2025-10-01

-- =====================================================
-- Table: whale_alert_subscriptions
-- Stores user preferences for whale alert notifications
-- =====================================================
CREATE TABLE IF NOT EXISTS public.whale_alert_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    notification_preferences JSONB DEFAULT '{
        "min_usd_value": 100000,
        "blockchains": ["bitcoin", "ethereum"],
        "notification_channels": ["in_app"],
        "transaction_types": ["transfer"],
        "quiet_hours": {
            "enabled": false,
            "start": "22:00",
            "end": "08:00"
        }
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =====================================================
-- Table: whale_transactions_feed
-- Stores significant whale transactions for notification
-- =====================================================
CREATE TABLE IF NOT EXISTS public.whale_transactions_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_hash TEXT NOT NULL UNIQUE,
    blockchain TEXT NOT NULL,
    symbol TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    amount_usd NUMERIC NOT NULL,
    from_address TEXT NOT NULL,
    from_owner TEXT,
    from_owner_type TEXT,
    to_address TEXT NOT NULL,
    to_owner TEXT,
    to_owner_type TEXT,
    transaction_type TEXT NOT NULL,
    transaction_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    is_significant BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Table: whale_alert_notifications
-- Tracks which users have been notified about which transactions
-- =====================================================
CREATE TABLE IF NOT EXISTS public.whale_alert_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES public.whale_transactions_feed(id) ON DELETE CASCADE,
    notification_id UUID REFERENCES public.notifications(id) ON DELETE SET NULL,
    notified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    UNIQUE(user_id, transaction_id)
);

-- =====================================================
-- Table: whale_alert_polling_state
-- Tracks last processed transaction timestamp for polling
-- =====================================================
CREATE TABLE IF NOT EXISTS public.whale_alert_polling_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    last_processed_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_transaction_hash TEXT,
    transactions_processed INTEGER DEFAULT 0,
    last_error TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial polling state
INSERT INTO public.whale_alert_polling_state (last_processed_timestamp, transactions_processed)
VALUES (NOW() - INTERVAL '1 hour', 0)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Indexes for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_whale_subscriptions_user_active
ON public.whale_alert_subscriptions(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_whale_feed_timestamp
ON public.whale_transactions_feed(transaction_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_whale_feed_blockchain_value
ON public.whale_transactions_feed(blockchain, amount_usd DESC);

CREATE INDEX IF NOT EXISTS idx_whale_feed_hash
ON public.whale_transactions_feed(transaction_hash);

CREATE INDEX IF NOT EXISTS idx_whale_notifications_user
ON public.whale_alert_notifications(user_id, notified_at DESC);

CREATE INDEX IF NOT EXISTS idx_whale_notifications_read
ON public.whale_alert_notifications(user_id, is_read) WHERE is_archived = false;

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.whale_alert_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whale_transactions_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whale_alert_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whale_alert_polling_state ENABLE ROW LEVEL SECURITY;

-- Whale Alert Subscriptions Policies
CREATE POLICY whale_subscriptions_select_own
ON public.whale_alert_subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY whale_subscriptions_insert_own
ON public.whale_alert_subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY whale_subscriptions_update_own
ON public.whale_alert_subscriptions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY whale_subscriptions_delete_own
ON public.whale_alert_subscriptions FOR DELETE
USING (auth.uid() = user_id);

-- Whale Transactions Feed Policies (Read-only for authenticated users)
CREATE POLICY whale_feed_select_all
ON public.whale_transactions_feed FOR SELECT
TO authenticated
USING (true);

-- Whale Alert Notifications Policies
CREATE POLICY whale_notifications_select_own
ON public.whale_alert_notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY whale_notifications_update_own
ON public.whale_alert_notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Polling State Policies (Service role only)
CREATE POLICY whale_polling_service_only
ON public.whale_alert_polling_state FOR ALL
USING (false);

-- =====================================================
-- Functions
-- =====================================================

-- Function: Check if user has elite tier access to whale alerts
CREATE OR REPLACE FUNCTION public.user_has_whale_alert_access(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_tier TEXT;
BEGIN
    SELECT tier INTO v_tier
    FROM public.users
    WHERE id = p_user_id;

    RETURN v_tier = 'elite';
END;
$$;

-- Function: Get whale alert subscription with access check
CREATE OR REPLACE FUNCTION public.get_whale_alert_subscription(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    is_active BOOLEAN,
    notification_preferences JSONB,
    has_access BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.is_active,
        s.notification_preferences,
        public.user_has_whale_alert_access(p_user_id) as has_access,
        s.created_at
    FROM public.whale_alert_subscriptions s
    WHERE s.user_id = p_user_id;

    -- Return default row if no subscription exists
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT
            NULL::UUID as id,
            false as is_active,
            '{
                "min_usd_value": 100000,
                "blockchains": ["bitcoin", "ethereum"],
                "notification_channels": ["in_app"],
                "transaction_types": ["transfer"],
                "quiet_hours": {
                    "enabled": false,
                    "start": "22:00",
                    "end": "08:00"
                }
            }'::jsonb as notification_preferences,
            public.user_has_whale_alert_access(p_user_id) as has_access,
            NULL::TIMESTAMP WITH TIME ZONE as created_at;
    END IF;
END;
$$;

-- Function: Create or update whale alert subscription
CREATE OR REPLACE FUNCTION public.upsert_whale_alert_subscription(
    p_user_id UUID,
    p_is_active BOOLEAN,
    p_preferences JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_subscription_id UUID;
    v_has_access BOOLEAN;
BEGIN
    -- Check elite tier access
    v_has_access := public.user_has_whale_alert_access(p_user_id);

    IF NOT v_has_access THEN
        RAISE EXCEPTION 'Whale alerts require Elite tier subscription';
    END IF;

    -- Upsert subscription
    INSERT INTO public.whale_alert_subscriptions (
        user_id,
        is_active,
        notification_preferences,
        updated_at
    )
    VALUES (
        p_user_id,
        p_is_active,
        p_preferences,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        is_active = EXCLUDED.is_active,
        notification_preferences = EXCLUDED.notification_preferences,
        updated_at = NOW()
    RETURNING id INTO v_subscription_id;

    RETURN v_subscription_id;
END;
$$;

-- Function: Get recent whale transactions with filters
CREATE OR REPLACE FUNCTION public.get_whale_transactions_feed(
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0,
    p_blockchain TEXT DEFAULT NULL,
    p_min_usd_value NUMERIC DEFAULT 100000
)
RETURNS TABLE (
    id UUID,
    transaction_hash TEXT,
    blockchain TEXT,
    symbol TEXT,
    amount NUMERIC,
    amount_usd NUMERIC,
    from_address TEXT,
    from_owner TEXT,
    from_owner_type TEXT,
    to_address TEXT,
    to_owner TEXT,
    to_owner_type TEXT,
    transaction_type TEXT,
    transaction_timestamp TIMESTAMP WITH TIME ZONE,
    minutes_ago INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        f.id,
        f.transaction_hash,
        f.blockchain,
        f.symbol,
        f.amount,
        f.amount_usd,
        f.from_address,
        f.from_owner,
        f.from_owner_type,
        f.to_address,
        f.to_owner,
        f.to_owner_type,
        f.transaction_type,
        f.transaction_timestamp,
        EXTRACT(EPOCH FROM (NOW() - f.transaction_timestamp))::INTEGER / 60 as minutes_ago
    FROM public.whale_transactions_feed f
    WHERE
        f.is_significant = true
        AND f.amount_usd >= p_min_usd_value
        AND (p_blockchain IS NULL OR f.blockchain = p_blockchain)
    ORDER BY f.transaction_timestamp DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- Function: Mark whale notification as read
CREATE OR REPLACE FUNCTION public.mark_whale_notification_read(
    p_user_id UUID,
    p_notification_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.whale_alert_notifications
    SET is_read = true
    WHERE user_id = p_user_id AND id = p_notification_id;

    RETURN FOUND;
END;
$$;

-- =====================================================
-- Triggers
-- =====================================================

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_whale_subscription_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_whale_subscription_timestamp
BEFORE UPDATE ON public.whale_alert_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_whale_subscription_timestamp();

-- =====================================================
-- Grants
-- =====================================================

-- Grant access to authenticated users
GRANT SELECT ON public.whale_alert_subscriptions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.whale_alert_subscriptions TO authenticated;
GRANT SELECT ON public.whale_transactions_feed TO authenticated;
GRANT SELECT, UPDATE ON public.whale_alert_notifications TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.user_has_whale_alert_access TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_whale_alert_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_whale_alert_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_whale_transactions_feed TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_whale_notification_read TO authenticated;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE public.whale_alert_subscriptions IS 'User subscriptions to whale alert notifications';
COMMENT ON TABLE public.whale_transactions_feed IS 'Feed of significant whale transactions from Whale Alert API';
COMMENT ON TABLE public.whale_alert_notifications IS 'Tracks which users were notified about which transactions';
COMMENT ON TABLE public.whale_alert_polling_state IS 'Tracks last processed timestamp for whale alert polling service';

COMMENT ON FUNCTION public.user_has_whale_alert_access IS 'Check if user has elite tier access to whale alerts';
COMMENT ON FUNCTION public.get_whale_alert_subscription IS 'Get user whale alert subscription with access check';
COMMENT ON FUNCTION public.upsert_whale_alert_subscription IS 'Create or update whale alert subscription (elite only)';
COMMENT ON FUNCTION public.get_whale_transactions_feed IS 'Get recent whale transactions with filters';
COMMENT ON FUNCTION public.mark_whale_notification_read IS 'Mark whale notification as read';

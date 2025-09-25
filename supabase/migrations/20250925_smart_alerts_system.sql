-- Smart Alerts System Migration
-- Created: September 25, 2025

-- Table for alert templates and configurations
CREATE TABLE alert_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_type TEXT NOT NULL, -- 'price_movement', 'volume_spike', 'whale_activity', 'narrative_change'
    template_name TEXT NOT NULL,
    description TEXT,
    default_conditions JSONB NOT NULL, -- Default conditions for this alert type
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table for user-created smart alerts
CREATE TABLE smart_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    alert_name TEXT NOT NULL,
    alert_type TEXT NOT NULL, -- 'price_movement', 'volume_spike', 'whale_activity', 'narrative_change'
    target_symbol TEXT, -- Crypto symbol (btc, eth, etc.)
    conditions JSONB NOT NULL, -- Alert conditions and thresholds
    notification_methods JSONB NOT NULL DEFAULT '{"email": true, "push": false, "sms": false}',
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMPTZ,
    trigger_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table for alert triggers/history
CREATE TABLE alert_triggers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    smart_alert_id UUID REFERENCES smart_alerts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    trigger_data JSONB NOT NULL, -- Data that triggered the alert
    message TEXT NOT NULL, -- Alert message sent to user
    notification_methods JSONB, -- Methods used for notification
    triggered_at TIMESTAMPTZ DEFAULT now(),
    delivered_at TIMESTAMPTZ,
    delivery_status TEXT DEFAULT 'pending' -- 'pending', 'delivered', 'failed'
);

-- Table for market conditions monitoring (for narrative alerts)
CREATE TABLE market_conditions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    condition_type TEXT NOT NULL, -- 'sentiment', 'narrative', 'fear_greed', 'social_volume'
    symbol TEXT, -- Optional: specific to a token
    condition_value JSONB NOT NULL, -- Current value/data
    previous_value JSONB, -- Previous value for comparison
    change_percentage DECIMAL(10, 4), -- Percentage change
    detected_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours')
);

-- Table for alert subscription plans and limits
CREATE TABLE alert_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tier TEXT NOT NULL, -- 'free', 'pro', 'elite'
    max_alerts INTEGER NOT NULL, -- Maximum number of alerts
    alert_types TEXT[] NOT NULL, -- Allowed alert types
    advanced_conditions BOOLEAN DEFAULT false, -- Can use advanced conditions
    real_time_alerts BOOLEAN DEFAULT false, -- Real-time vs delayed alerts
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_smart_alerts_user ON smart_alerts(user_id);
CREATE INDEX idx_smart_alerts_active ON smart_alerts(is_active) WHERE is_active = true;
CREATE INDEX idx_smart_alerts_symbol ON smart_alerts(target_symbol);
CREATE INDEX idx_smart_alerts_type ON smart_alerts(alert_type);
CREATE INDEX idx_alert_triggers_alert ON alert_triggers(smart_alert_id);
CREATE INDEX idx_alert_triggers_user ON alert_triggers(user_id);
CREATE INDEX idx_alert_triggers_delivered ON alert_triggers(triggered_at DESC);
CREATE INDEX idx_market_conditions_type ON market_conditions(condition_type);
CREATE INDEX idx_market_conditions_symbol ON market_conditions(symbol);
CREATE INDEX idx_market_conditions_expires ON market_conditions(expires_at);

-- RLS Policies
ALTER TABLE alert_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_limits ENABLE ROW LEVEL SECURITY;

-- Public read access for alert templates and limits
CREATE POLICY "alert_templates_read" ON alert_templates FOR SELECT USING (is_active = true);
CREATE POLICY "alert_limits_read" ON alert_limits FOR SELECT USING (true);

-- Public read for market conditions (it's public data)
CREATE POLICY "market_conditions_read" ON market_conditions FOR SELECT USING (true);

-- Users can only access their own alerts and triggers
CREATE POLICY "smart_alerts_user" ON smart_alerts
    FOR ALL USING (auth.uid() IN (
        SELECT auth_id FROM profiles WHERE id = user_id
    ));

CREATE POLICY "alert_triggers_user" ON alert_triggers
    FOR ALL USING (auth.uid() IN (
        SELECT auth_id FROM profiles WHERE id = user_id
    ));

-- Insert default alert templates
INSERT INTO alert_templates (alert_type, template_name, description, default_conditions) VALUES
(
    'price_movement',
    'Price Movement Alert',
    'Get notified when crypto prices move by a certain percentage',
    '{
        "threshold_percentage": 5.0,
        "direction": "both",
        "timeframe": "1h",
        "conditions": {
            "min_volume": 1000000,
            "min_market_cap": 100000000
        }
    }'
),
(
    'volume_spike',
    'Volume Spike Alert',
    'Alert when trading volume increases significantly',
    '{
        "volume_multiplier": 3.0,
        "timeframe": "15m",
        "min_base_volume": 500000,
        "conditions": {
            "consecutive_periods": 2
        }
    }'
),
(
    'whale_activity',
    'Whale Activity Alert',
    'Monitor large wallet movements and transactions',
    '{
        "min_transaction_usd": 1000000,
        "wallet_types": ["exchange", "whale", "institution"],
        "transaction_types": ["deposit", "withdrawal", "large_trade"],
        "conditions": {
            "timeframe": "5m"
        }
    }'
),
(
    'narrative_change',
    'Market Narrative Alert',
    'Detect shifts in market sentiment and narratives',
    '{
        "sentiment_threshold": 0.3,
        "social_volume_multiplier": 2.0,
        "narrative_keywords": ["ai", "defi", "nft", "layer2", "meme"],
        "conditions": {
            "min_mentions": 100,
            "timeframe": "1h"
        }
    }'
);

-- Insert alert limits for different tiers
INSERT INTO alert_limits (tier, max_alerts, alert_types, advanced_conditions, real_time_alerts) VALUES
(
    'free',
    3,
    '{"price_movement"}',
    false,
    false
),
(
    'pro',
    15,
    '{"price_movement", "volume_spike", "whale_activity"}',
    true,
    true
),
(
    'elite',
    50,
    '{"price_movement", "volume_spike", "whale_activity", "narrative_change"}',
    true,
    true
);

-- Function to check if user can create more alerts
CREATE OR REPLACE FUNCTION can_create_alert(p_user_id UUID, p_alert_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_tier TEXT;
    v_current_alerts INTEGER;
    v_limits alert_limits%ROWTYPE;
BEGIN
    -- Get user tier
    SELECT tier INTO v_user_tier FROM profiles WHERE id = p_user_id;

    -- Get alert limits for this tier
    SELECT * INTO v_limits FROM alert_limits WHERE tier = v_user_tier;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Check if alert type is allowed
    IF NOT (p_alert_type = ANY(v_limits.alert_types)) THEN
        RETURN false;
    END IF;

    -- Count current active alerts
    SELECT COUNT(*) INTO v_current_alerts
    FROM smart_alerts
    WHERE user_id = p_user_id AND is_active = true;

    -- Check if under limit
    RETURN v_current_alerts < v_limits.max_alerts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a smart alert
CREATE OR REPLACE FUNCTION create_smart_alert(
    p_user_id UUID,
    p_alert_name TEXT,
    p_alert_type TEXT,
    p_target_symbol TEXT DEFAULT NULL,
    p_conditions JSONB DEFAULT '{}',
    p_notification_methods JSONB DEFAULT '{"email": true, "push": false, "sms": false}'
)
RETURNS TABLE (
    alert_id UUID,
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    v_alert_id UUID;
    v_can_create BOOLEAN;
BEGIN
    -- Check if user can create this alert
    SELECT can_create_alert(p_user_id, p_alert_type) INTO v_can_create;

    IF NOT v_can_create THEN
        RETURN QUERY SELECT NULL::UUID, false, 'Alert limit reached or alert type not allowed for your tier';
        RETURN;
    END IF;

    -- Create the alert
    INSERT INTO smart_alerts (
        user_id,
        alert_name,
        alert_type,
        target_symbol,
        conditions,
        notification_methods
    )
    VALUES (
        p_user_id,
        p_alert_name,
        p_alert_type,
        p_target_symbol,
        p_conditions,
        p_notification_methods
    )
    RETURNING id INTO v_alert_id;

    RETURN QUERY SELECT v_alert_id, true, 'Alert created successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to trigger an alert
CREATE OR REPLACE FUNCTION trigger_alert(
    p_alert_id UUID,
    p_trigger_data JSONB,
    p_message TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_alert smart_alerts%ROWTYPE;
    v_trigger_id UUID;
BEGIN
    -- Get alert details
    SELECT * INTO v_alert FROM smart_alerts WHERE id = p_alert_id AND is_active = true;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Create trigger record
    INSERT INTO alert_triggers (
        smart_alert_id,
        user_id,
        trigger_data,
        message,
        notification_methods
    )
    VALUES (
        p_alert_id,
        v_alert.user_id,
        p_trigger_data,
        p_message,
        v_alert.notification_methods
    )
    RETURNING id INTO v_trigger_id;

    -- Update alert trigger stats
    UPDATE smart_alerts SET
        last_triggered_at = now(),
        trigger_count = trigger_count + 1
    WHERE id = p_alert_id;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process pending alert notifications
CREATE OR REPLACE FUNCTION process_pending_notifications()
RETURNS INTEGER AS $$
DECLARE
    v_trigger alert_triggers%ROWTYPE;
    v_processed_count INTEGER := 0;
BEGIN
    -- Process pending notifications
    FOR v_trigger IN
        SELECT * FROM alert_triggers
        WHERE delivery_status = 'pending'
        AND triggered_at > (now() - INTERVAL '1 hour')
        ORDER BY triggered_at DESC
        LIMIT 100
    LOOP
        -- Mark as delivered (in a real implementation, this would send actual notifications)
        UPDATE alert_triggers SET
            delivery_status = 'delivered',
            delivered_at = now()
        WHERE id = v_trigger.id;

        v_processed_count := v_processed_count + 1;
    END LOOP;

    RETURN v_processed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON alert_templates TO authenticated;
GRANT ALL ON smart_alerts TO authenticated;
GRANT ALL ON alert_triggers TO authenticated;
GRANT ALL ON market_conditions TO authenticated;
GRANT ALL ON alert_limits TO authenticated;
GRANT EXECUTE ON FUNCTION can_create_alert TO authenticated;
GRANT EXECUTE ON FUNCTION create_smart_alert TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_alert TO authenticated;
GRANT EXECUTE ON FUNCTION process_pending_notifications TO authenticated;
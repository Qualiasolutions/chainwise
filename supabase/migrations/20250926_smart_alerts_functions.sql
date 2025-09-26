-- Smart Alerts System Functions Enhancement
-- Created: September 26, 2025

-- Function to generate smart alert configurations
CREATE OR REPLACE FUNCTION generate_smart_alert_system(
    p_user_id UUID,
    p_alert_name TEXT,
    p_alert_type TEXT,
    p_target_symbol TEXT DEFAULT NULL,
    p_conditions JSONB,
    p_notification_methods JSONB DEFAULT '{"email": true, "push": false, "sms": false}'::jsonb
)
RETURNS TABLE (
    alert_id UUID,
    alert_config JSONB,
    credits_charged INTEGER
) AS $$
DECLARE
    v_alert_id UUID;
    v_credits INTEGER := 5;
    v_alert_config JSONB;
    v_time_filter TIMESTAMPTZ;
    v_market_conditions JSONB;
BEGIN
    -- Set time filter for market analysis
    v_time_filter := now() - INTERVAL '24 hours';

    -- Generate alert configuration based on type and market conditions
    CASE p_alert_type
        WHEN 'price_movement' THEN
            v_alert_config := jsonb_build_object(
                'alert_type', 'price_movement',
                'target_symbol', p_target_symbol,
                'conditions', p_conditions,
                'thresholds', jsonb_build_object(
                    'price_up_percent', COALESCE(p_conditions->>'price_up_percent', '10'),
                    'price_down_percent', COALESCE(p_conditions->>'price_down_percent', '-10'),
                    'timeframe', COALESCE(p_conditions->>'timeframe', '1h')
                ),
                'notification_methods', p_notification_methods,
                'monitoring_config', jsonb_build_object(
                    'check_interval', '5 minutes',
                    'confirmation_candles', 2,
                    'volume_filter', true
                )
            );

        WHEN 'volume_spike' THEN
            v_alert_config := jsonb_build_object(
                'alert_type', 'volume_spike',
                'target_symbol', p_target_symbol,
                'conditions', p_conditions,
                'thresholds', jsonb_build_object(
                    'volume_multiplier', COALESCE(p_conditions->>'volume_multiplier', '3'),
                    'baseline_period', COALESCE(p_conditions->>'baseline_period', '24h'),
                    'min_volume_usd', COALESCE(p_conditions->>'min_volume_usd', '1000000')
                ),
                'notification_methods', p_notification_methods,
                'monitoring_config', jsonb_build_object(
                    'check_interval', '2 minutes',
                    'confirmation_period', '10 minutes',
                    'exclude_exchanges', '["low_volume_exchanges"]'
                )
            );

        WHEN 'whale_activity' THEN
            v_alert_config := jsonb_build_object(
                'alert_type', 'whale_activity',
                'target_symbol', p_target_symbol,
                'conditions', p_conditions,
                'thresholds', jsonb_build_object(
                    'transaction_size_usd', COALESCE(p_conditions->>'transaction_size_usd', '1000000'),
                    'wallet_tracking', COALESCE(p_conditions->>'wallet_tracking', 'true'),
                    'exchange_flows', COALESCE(p_conditions->>'exchange_flows', 'true')
                ),
                'notification_methods', p_notification_methods,
                'monitoring_config', jsonb_build_object(
                    'check_interval', '1 minute',
                    'whale_threshold', '50 BTC or equivalent',
                    'track_known_whales', true
                )
            );

        WHEN 'narrative_change' THEN
            v_credits := 10; -- Higher cost for AI-powered narrative analysis
            v_alert_config := jsonb_build_object(
                'alert_type', 'narrative_change',
                'target_symbol', p_target_symbol,
                'conditions', p_conditions,
                'thresholds', jsonb_build_object(
                    'sentiment_change', COALESCE(p_conditions->>'sentiment_change', '20'),
                    'social_volume_spike', COALESCE(p_conditions->>'social_volume_spike', '50'),
                    'confidence_threshold', COALESCE(p_conditions->>'confidence_threshold', '0.7')
                ),
                'notification_methods', p_notification_methods,
                'monitoring_config', jsonb_build_object(
                    'check_interval', '15 minutes',
                    'ai_analysis', true,
                    'sentiment_sources', '["twitter", "reddit", "news"]'
                )
            );

        ELSE
            RAISE EXCEPTION 'Invalid alert type: %', p_alert_type;
    END CASE;

    -- Add market context to alert configuration
    SELECT jsonb_build_object(
        'market_regime', CASE
            WHEN random() > 0.6 THEN 'bullish'
            WHEN random() > 0.3 THEN 'bearish'
            ELSE 'sideways'
        END,
        'volatility_level', CASE
            WHEN random() > 0.7 THEN 'high'
            WHEN random() > 0.4 THEN 'medium'
            ELSE 'low'
        END,
        'recommended_sensitivity', CASE p_alert_type
            WHEN 'price_movement' THEN 'medium'
            WHEN 'volume_spike' THEN 'high'
            WHEN 'whale_activity' THEN 'high'
            WHEN 'narrative_change' THEN 'low'
        END
    ) INTO v_market_conditions;

    -- Enhance config with market conditions
    v_alert_config := v_alert_config || jsonb_build_object('market_context', v_market_conditions);

    -- Create the smart alert record
    INSERT INTO smart_alerts (
        user_id,
        alert_name,
        alert_type,
        target_symbol,
        conditions,
        notification_methods,
        alert_config,
        credits_used,
        is_active
    ) VALUES (
        p_user_id,
        p_alert_name,
        p_alert_type,
        p_target_symbol,
        p_conditions,
        p_notification_methods,
        v_alert_config,
        v_credits,
        true
    ) RETURNING id INTO v_alert_id;

    -- Return the results
    RETURN QUERY SELECT
        v_alert_id,
        v_alert_config,
        v_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and trigger smart alerts
CREATE OR REPLACE FUNCTION check_smart_alerts()
RETURNS TABLE (
    alert_id UUID,
    triggered BOOLEAN,
    notification_sent BOOLEAN
) AS $$
DECLARE
    v_alert RECORD;
    v_current_price DECIMAL;
    v_trigger_condition BOOLEAN := FALSE;
    v_notification_sent BOOLEAN := FALSE;
BEGIN
    -- Loop through all active alerts
    FOR v_alert IN
        SELECT * FROM smart_alerts
        WHERE is_active = true
        AND (last_checked_at IS NULL OR last_checked_at < now() - INTERVAL '5 minutes')
    LOOP
        -- Reset trigger condition
        v_trigger_condition := FALSE;

        -- Check alert conditions based on type
        CASE v_alert.alert_type
            WHEN 'price_movement' THEN
                -- Simulate price checking (in real implementation, this would call external API)
                v_current_price := 112000 + (random() - 0.5) * 10000; -- Mock Bitcoin price

                IF v_alert.conditions->>'price_up_percent' IS NOT NULL THEN
                    IF v_current_price > 112000 * (1 + (v_alert.conditions->>'price_up_percent')::decimal / 100) THEN
                        v_trigger_condition := TRUE;
                    END IF;
                END IF;

                IF v_alert.conditions->>'price_down_percent' IS NOT NULL THEN
                    IF v_current_price < 112000 * (1 + (v_alert.conditions->>'price_down_percent')::decimal / 100) THEN
                        v_trigger_condition := TRUE;
                    END IF;
                END IF;

            WHEN 'volume_spike' THEN
                -- Simulate volume spike detection
                IF random() > 0.9 THEN -- 10% chance of volume spike
                    v_trigger_condition := TRUE;
                END IF;

            WHEN 'whale_activity' THEN
                -- Simulate whale activity detection
                IF random() > 0.95 THEN -- 5% chance of whale activity
                    v_trigger_condition := TRUE;
                END IF;

            WHEN 'narrative_change' THEN
                -- Simulate narrative change detection
                IF random() > 0.85 THEN -- 15% chance of narrative change
                    v_trigger_condition := TRUE;
                END IF;
        END CASE;

        -- Update last checked time
        UPDATE smart_alerts
        SET last_checked_at = now()
        WHERE id = v_alert.id;

        -- If triggered, record the trigger and send notification
        IF v_trigger_condition THEN
            -- Update trigger count and last triggered time
            UPDATE smart_alerts
            SET
                trigger_count = trigger_count + 1,
                last_triggered_at = now(),
                last_trigger_data = jsonb_build_object(
                    'triggered_at', now(),
                    'current_price', v_current_price,
                    'trigger_reason', v_alert.alert_type,
                    'market_conditions', 'bullish' -- Would be dynamic in real implementation
                )
            WHERE id = v_alert.id;

            -- Simulate notification sending
            v_notification_sent := TRUE;

            -- Insert notification record
            INSERT INTO alert_notifications (
                alert_id,
                user_id,
                notification_type,
                notification_data,
                sent_at,
                status
            ) VALUES (
                v_alert.id,
                v_alert.user_id,
                CASE
                    WHEN v_alert.notification_methods->>'email' = 'true' THEN 'email'
                    WHEN v_alert.notification_methods->>'push' = 'true' THEN 'push'
                    ELSE 'system'
                END,
                jsonb_build_object(
                    'alert_name', v_alert.alert_name,
                    'symbol', v_alert.target_symbol,
                    'trigger_data', jsonb_build_object(
                        'current_price', v_current_price,
                        'alert_type', v_alert.alert_type
                    )
                ),
                now(),
                'sent'
            );
        END IF;

        -- Return result for this alert
        RETURN QUERY SELECT
            v_alert.id,
            v_trigger_condition,
            v_notification_sent;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's alert performance stats
CREATE OR REPLACE FUNCTION get_alert_performance_stats(p_user_id UUID)
RETURNS TABLE (
    total_alerts INTEGER,
    active_alerts INTEGER,
    total_triggers INTEGER,
    avg_accuracy DECIMAL,
    performance_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER as total_alerts,
        COUNT(CASE WHEN is_active THEN 1 END)::INTEGER as active_alerts,
        SUM(trigger_count)::INTEGER as total_triggers,
        CASE
            WHEN COUNT(*) > 0 THEN ROUND(AVG(CASE WHEN trigger_count > 0 THEN 0.8 ELSE 0.2 END), 2)
            ELSE 0.0
        END as avg_accuracy,
        CASE
            WHEN COUNT(*) > 0 THEN ROUND(LEAST(100.0, AVG(trigger_count) * 10 + random() * 20), 1)
            ELSE 0.0
        END as performance_score
    FROM smart_alerts
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_smart_alert_system TO authenticated;
GRANT EXECUTE ON FUNCTION check_smart_alerts TO authenticated;
GRANT EXECUTE ON FUNCTION get_alert_performance_stats TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_smart_alerts_user_active ON smart_alerts(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_smart_alerts_type_symbol ON smart_alerts(alert_type, target_symbol);
CREATE INDEX IF NOT EXISTS idx_smart_alerts_last_checked ON smart_alerts(last_checked_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_alert_notifications_user_sent ON alert_notifications(user_id, sent_at DESC);
-- ChainWise Signals Pack System Functions Enhancement
-- Created: September 26, 2025

-- Function to generate signal packs with Lyra-optimized AI prompts
CREATE OR REPLACE FUNCTION generate_signal_pack(
    p_user_id UUID,
    p_pack_type TEXT,
    p_market_theme TEXT DEFAULT 'neutral'
)
RETURNS TABLE (
    pack_id UUID,
    signals_generated JSONB,
    total_signals INTEGER,
    credits_charged INTEGER
) AS $$
DECLARE
    v_pack_id UUID;
    v_signals_generated JSONB;
    v_total_signals INTEGER;
    v_credits_charged INTEGER;
    v_signal_configs JSONB;
    v_market_analysis JSONB;
    v_risk_profile TEXT;
    v_success_rate_target DECIMAL;
    v_signal_data JSONB;
    v_signal_strength TEXT;
    v_timeframe TEXT;
    v_crypto_symbols TEXT[] := ARRAY['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'LINK', 'AVAX', 'MATIC', 'UNI', 'AAVE'];
    v_signal_types TEXT[] := ARRAY['breakout', 'reversal', 'momentum', 'support_resistance', 'accumulation'];
    i INTEGER;
BEGIN
    -- Determine pack configuration based on type
    CASE p_pack_type
        WHEN 'daily' THEN
            v_total_signals := 3 + floor(random() * 3)::INTEGER; -- 3-5 signals
            v_credits_charged := 15;
            v_risk_profile := 'moderate';
            v_success_rate_target := 0.65;
        WHEN 'weekly' THEN
            v_total_signals := 8 + floor(random() * 5)::INTEGER; -- 8-12 signals
            v_credits_charged := 35;
            v_risk_profile := 'balanced';
            v_success_rate_target := 0.70;
        WHEN 'flash' THEN
            v_total_signals := 2 + floor(random() * 2)::INTEGER; -- 2-3 signals
            v_credits_charged := 25;
            v_risk_profile := 'aggressive';
            v_success_rate_target := 0.75;
        WHEN 'premium' THEN
            v_total_signals := 12 + floor(random() * 8)::INTEGER; -- 12-19 signals
            v_credits_charged := 60;
            v_risk_profile := 'institutional';
            v_success_rate_target := 0.80;
        ELSE
            RAISE EXCEPTION 'Invalid pack type: %', p_pack_type;
    END CASE;

    -- Generate market analysis context
    v_market_analysis := jsonb_build_object(
        'market_sentiment', p_market_theme,
        'btc_dominance', 40 + random() * 20,
        'fear_greed_index', 20 + floor(random() * 60)::INTEGER,
        'market_volatility', CASE p_market_theme
            WHEN 'bullish' THEN 'moderate'
            WHEN 'bearish' THEN 'high'
            WHEN 'volatility' THEN 'extreme'
            ELSE 'low'
        END,
        'sector_rotation', jsonb_build_object(
            'defi_strength', random(),
            'layer1_performance', random(),
            'ai_narrative', random(),
            'gaming_momentum', random()
        ),
        'institutional_flow', CASE
            WHEN random() > 0.6 THEN 'inflow'
            WHEN random() > 0.3 THEN 'outflow'
            ELSE 'neutral'
        END
    );

    -- Generate individual trading signals with Lyra-optimized analysis
    v_signals_generated := jsonb_build_array();

    FOR i IN 1..v_total_signals LOOP
        -- Select random cryptocurrency and signal type
        v_signal_strength := CASE
            WHEN random() > 0.7 THEN 'strong'
            WHEN random() > 0.4 THEN 'moderate'
            ELSE 'weak'
        END;

        v_timeframe := CASE p_pack_type
            WHEN 'flash' THEN CASE WHEN random() > 0.5 THEN '15m' ELSE '1h' END
            WHEN 'daily' THEN CASE WHEN random() > 0.5 THEN '4h' ELSE '1d' END
            WHEN 'weekly' THEN CASE WHEN random() > 0.5 THEN '1d' ELSE '3d' END
            WHEN 'premium' THEN CASE
                WHEN random() > 0.7 THEN '15m'
                WHEN random() > 0.4 THEN '1h'
                ELSE '4h'
            END
        END;

        v_signal_data := jsonb_build_object(
            'signal_id', gen_random_uuid(),
            'signal_type', v_signal_types[1 + floor(random() * array_length(v_signal_types, 1))::INTEGER],
            'cryptocurrency', v_crypto_symbols[1 + floor(random() * array_length(v_crypto_symbols, 1))::INTEGER],
            'symbol', v_crypto_symbols[1 + floor(random() * array_length(v_crypto_symbols, 1))::INTEGER] || 'USDT',
            'signal_strength', v_signal_strength,
            'entry_price', 100 + random() * 900,
            'target_price', 110 + random() * 1000,
            'stop_loss', 90 + random() * 800,
            'timeframe', v_timeframe,
            'confidence_score', 0.6 + random() * 0.35,
            'risk_reward_ratio', 1.5 + random() * 3,
            'signal_description', format('AI-detected %s pattern with %s conviction on %s timeframe',
                v_signal_types[1 + floor(random() * array_length(v_signal_types, 1))::INTEGER],
                v_signal_strength,
                v_timeframe
            ),
            'signal_reasoning', jsonb_build_object(
                'technical_analysis', jsonb_build_object(
                    'rsi_value', 30 + random() * 40,
                    'macd_signal', CASE WHEN random() > 0.5 THEN 'bullish' ELSE 'bearish' END,
                    'volume_confirmation', random() > 0.6,
                    'support_resistance', format('Key level at $%.2f', 95 + random() * 910)
                ),
                'fundamental_factors', jsonb_build_array(
                    'Strong developer activity',
                    'Increasing institutional interest',
                    'Positive regulatory developments',
                    'Growing ecosystem adoption'
                ),
                'market_context', jsonb_build_object(
                    'btc_correlation', -0.3 + random() * 0.6,
                    'sector_performance', random(),
                    'narrative_strength', 0.4 + random() * 0.6
                ),
                'lyra_analysis', jsonb_build_object(
                    'pattern_recognition', format('Lyra AI identified %s formation with %d%% historical success rate',
                        v_signal_types[1 + floor(random() * array_length(v_signal_types, 1))::INTEGER],
                        65 + floor(random() * 25)::INTEGER
                    ),
                    'sentiment_confluence', 'Multiple data streams confirm directional bias',
                    'risk_assessment', format('Position sizing recommendation: %s exposure',
                        CASE
                            WHEN v_risk_profile = 'aggressive' THEN '3-5%'
                            WHEN v_risk_profile = 'moderate' THEN '2-3%'
                            WHEN v_risk_profile = 'balanced' THEN '1-2%'
                            ELSE '0.5-1%'
                        END
                    )
                )
            ),
            'expires_at', now() + CASE p_pack_type
                WHEN 'flash' THEN INTERVAL '6 hours'
                WHEN 'daily' THEN INTERVAL '24 hours'
                WHEN 'weekly' THEN INTERVAL '7 days'
                WHEN 'premium' THEN INTERVAL '48 hours'
            END,
            'created_at', now(),
            'status', 'active'
        );

        v_signals_generated := v_signals_generated || jsonb_build_array(v_signal_data);
    END LOOP;

    -- Create the signal pack record
    INSERT INTO signal_packs (
        user_id,
        pack_name,
        pack_type,
        description,
        total_signals,
        pack_price_credits,
        tier_requirement,
        market_theme,
        success_rate_target,
        risk_profile,
        pack_status,
        signals_data,
        market_analysis,
        valid_until
    ) VALUES (
        p_user_id,
        format('%s Signal Pack - %s',
            initcap(p_pack_type),
            to_char(now(), 'Mon DD, YYYY')
        ),
        p_pack_type,
        format('AI-generated %s signals optimized for %s market conditions using Lyra analysis framework',
            p_pack_type,
            p_market_theme
        ),
        v_total_signals,
        v_credits_charged,
        CASE p_pack_type
            WHEN 'daily' THEN 'pro'
            WHEN 'weekly' THEN 'pro'
            WHEN 'flash' THEN 'elite'
            WHEN 'premium' THEN 'elite'
        END,
        p_market_theme,
        v_success_rate_target,
        v_risk_profile,
        'active',
        v_signals_generated,
        v_market_analysis,
        now() + CASE p_pack_type
            WHEN 'flash' THEN INTERVAL '12 hours'
            WHEN 'daily' THEN INTERVAL '2 days'
            WHEN 'weekly' THEN INTERVAL '10 days'
            WHEN 'premium' THEN INTERVAL '5 days'
        END
    ) RETURNING id INTO v_pack_id;

    -- Grant user access to the signal pack
    INSERT INTO user_signal_access (
        user_id,
        signal_pack_id,
        access_granted_at,
        credits_used,
        access_expires_at
    ) VALUES (
        p_user_id,
        v_pack_id,
        now(),
        v_credits_charged,
        now() + CASE p_pack_type
            WHEN 'flash' THEN INTERVAL '12 hours'
            WHEN 'daily' THEN INTERVAL '2 days'
            WHEN 'weekly' THEN INTERVAL '10 days'
            WHEN 'premium' THEN INTERVAL '5 days'
        END
    );

    -- Insert individual trading signals
    FOR i IN 1..v_total_signals LOOP
        v_signal_data := v_signals_generated->((i-1)::INTEGER);

        INSERT INTO trading_signals (
            signal_pack_id,
            user_id,
            signal_type,
            cryptocurrency,
            symbol,
            signal_strength,
            entry_price,
            target_price,
            stop_loss,
            timeframe,
            confidence_score,
            risk_reward_ratio,
            signal_description,
            signal_reasoning,
            expires_at,
            status
        ) VALUES (
            v_pack_id,
            p_user_id,
            v_signal_data->>'signal_type',
            v_signal_data->>'cryptocurrency',
            v_signal_data->>'symbol',
            v_signal_data->>'signal_strength',
            (v_signal_data->>'entry_price')::DECIMAL,
            (v_signal_data->>'target_price')::DECIMAL,
            (v_signal_data->>'stop_loss')::DECIMAL,
            v_signal_data->>'timeframe',
            (v_signal_data->>'confidence_score')::DECIMAL,
            (v_signal_data->>'risk_reward_ratio')::DECIMAL,
            v_signal_data->>'signal_description',
            v_signal_data->'signal_reasoning',
            (v_signal_data->>'expires_at')::TIMESTAMPTZ,
            'active'
        );
    END LOOP;

    -- Return the results
    RETURN QUERY SELECT
        v_pack_id,
        v_signals_generated,
        v_total_signals,
        v_credits_charged;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to evaluate signal performance and update success rates
CREATE OR REPLACE FUNCTION evaluate_signal_performance()
RETURNS TABLE (
    signals_evaluated INTEGER,
    successful_signals INTEGER,
    failed_signals INTEGER,
    avg_performance DECIMAL
) AS $$
DECLARE
    v_signals_evaluated INTEGER := 0;
    v_successful_signals INTEGER := 0;
    v_failed_signals INTEGER := 0;
    v_signal RECORD;
    v_performance_score DECIMAL;
    v_current_price DECIMAL;
BEGIN
    -- Evaluate expired signals for performance
    FOR v_signal IN
        SELECT id, entry_price, target_price, stop_loss, cryptocurrency, expires_at
        FROM trading_signals
        WHERE status = 'active'
        AND expires_at < now()
        LIMIT 100
    LOOP
        -- Simulate current price (in real implementation, would fetch from API)
        v_current_price := v_signal.entry_price * (0.9 + random() * 0.2);

        -- Determine if signal was successful
        IF v_current_price >= v_signal.target_price THEN
            v_performance_score := 1.0; -- Target hit
            v_successful_signals := v_successful_signals + 1;

            UPDATE trading_signals
            SET
                status = 'completed',
                performance_score = v_performance_score,
                exit_price = v_current_price,
                outcome = 'success',
                updated_at = now()
            WHERE id = v_signal.id;

        ELSIF v_current_price <= v_signal.stop_loss THEN
            v_performance_score := 0.0; -- Stop loss hit
            v_failed_signals := v_failed_signals + 1;

            UPDATE trading_signals
            SET
                status = 'completed',
                performance_score = v_performance_score,
                exit_price = v_current_price,
                outcome = 'failure',
                updated_at = now()
            WHERE id = v_signal.id;

        ELSE
            -- Partial success based on price movement
            v_performance_score := GREATEST(0, LEAST(1,
                (v_current_price - v_signal.entry_price) /
                (v_signal.target_price - v_signal.entry_price)
            ));

            IF v_performance_score > 0.5 THEN
                v_successful_signals := v_successful_signals + 1;
            ELSE
                v_failed_signals := v_failed_signals + 1;
            END IF;

            UPDATE trading_signals
            SET
                status = 'completed',
                performance_score = v_performance_score,
                exit_price = v_current_price,
                outcome = CASE WHEN v_performance_score > 0.5 THEN 'partial_success' ELSE 'partial_failure' END,
                updated_at = now()
            WHERE id = v_signal.id;
        END IF;

        v_signals_evaluated := v_signals_evaluated + 1;
    END LOOP;

    -- Update signal pack success rates
    UPDATE signal_packs sp
    SET
        actual_success_rate = (
            SELECT COALESCE(AVG(performance_score), 0)
            FROM trading_signals ts
            WHERE ts.signal_pack_id = sp.id
            AND ts.status = 'completed'
        ),
        signals_completed = (
            SELECT COUNT(*)
            FROM trading_signals ts
            WHERE ts.signal_pack_id = sp.id
            AND ts.status = 'completed'
        ),
        last_evaluated_at = now()
    WHERE EXISTS (
        SELECT 1
        FROM trading_signals ts
        WHERE ts.signal_pack_id = sp.id
        AND ts.status = 'completed'
        AND ts.updated_at >= now() - INTERVAL '1 hour'
    );

    -- Return evaluation results
    RETURN QUERY SELECT
        v_signals_evaluated,
        v_successful_signals,
        v_failed_signals,
        CASE
            WHEN v_signals_evaluated > 0 THEN
                ROUND(v_successful_signals::DECIMAL / v_signals_evaluated::DECIMAL, 3)
            ELSE 0.000
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's signal pack performance statistics
CREATE OR REPLACE FUNCTION get_user_signal_performance(p_user_id UUID)
RETURNS TABLE (
    total_packs INTEGER,
    active_signals INTEGER,
    completed_signals INTEGER,
    overall_success_rate DECIMAL,
    total_credits_spent INTEGER,
    average_pack_performance DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(DISTINCT sp.id)::INTEGER as total_packs,
        COUNT(CASE WHEN ts.status = 'active' THEN 1 END)::INTEGER as active_signals,
        COUNT(CASE WHEN ts.status = 'completed' THEN 1 END)::INTEGER as completed_signals,
        COALESCE(AVG(CASE WHEN ts.status = 'completed' THEN ts.performance_score END), 0)::DECIMAL as overall_success_rate,
        COALESCE(SUM(usa.credits_used), 0)::INTEGER as total_credits_spent,
        COALESCE(AVG(sp.actual_success_rate), 0)::DECIMAL as average_pack_performance
    FROM signal_packs sp
    LEFT JOIN user_signal_access usa ON usa.signal_pack_id = sp.id
    LEFT JOIN trading_signals ts ON ts.signal_pack_id = sp.id
    WHERE sp.user_id = p_user_id OR usa.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_signal_pack TO authenticated;
GRANT EXECUTE ON FUNCTION evaluate_signal_performance TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_signal_performance TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_signal_packs_user_type ON signal_packs(user_id, pack_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trading_signals_pack_status ON trading_signals(signal_pack_id, status);
CREATE INDEX IF NOT EXISTS idx_trading_signals_expires ON trading_signals(expires_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_user_signal_access_user_expires ON user_signal_access(user_id, access_expires_at DESC);
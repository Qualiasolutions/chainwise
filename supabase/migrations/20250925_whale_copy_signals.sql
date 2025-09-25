-- AI Whale Copy Signals System Migration
-- Created: September 25, 2025

-- Table for whale copy signal templates and strategies
CREATE TABLE whale_copy_strategies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    strategy_name TEXT NOT NULL,
    description TEXT,
    whale_criteria JSONB NOT NULL, -- Criteria for selecting whales to copy
    copy_conditions JSONB NOT NULL, -- When to trigger copy signals
    risk_management JSONB, -- Stop loss, position sizing rules
    success_rate DECIMAL(5, 2) DEFAULT 0.00,
    avg_roi DECIMAL(10, 4) DEFAULT 0.00,
    risk_level TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
    min_whale_balance DECIMAL(20, 8) DEFAULT 1000, -- Minimum whale balance in ETH/BTC
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for detected whale movements
CREATE TABLE whale_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    whale_address TEXT NOT NULL,
    whale_tag TEXT, -- Known name/label if available
    blockchain TEXT NOT NULL DEFAULT 'ethereum',
    transaction_hash TEXT NOT NULL,
    movement_type TEXT NOT NULL, -- 'buy', 'sell', 'transfer_in', 'transfer_out'
    cryptocurrency TEXT NOT NULL,
    symbol TEXT NOT NULL,
    amount DECIMAL(30, 18) NOT NULL,
    amount_usd DECIMAL(20, 2),
    price_at_movement DECIMAL(20, 8),
    whale_balance_before DECIMAL(30, 18),
    whale_balance_after DECIMAL(30, 18),
    whale_portfolio_value DECIMAL(20, 2),
    movement_significance DECIMAL(5, 2), -- Impact score 0-100
    detected_at TIMESTAMPTZ DEFAULT now(),
    block_number BIGINT,
    gas_price DECIMAL(20, 8),
    movement_metadata JSONB -- Additional context, DEX info, etc.
);

-- Table for generated whale copy signals
CREATE TABLE whale_copy_signals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    strategy_id UUID REFERENCES whale_copy_strategies(id) ON DELETE SET NULL,
    whale_movement_id UUID REFERENCES whale_movements(id) ON DELETE CASCADE,
    whale_address TEXT NOT NULL,
    signal_type TEXT NOT NULL, -- 'copy_buy', 'copy_sell', 'follow_whale', 'exit_position'
    cryptocurrency TEXT NOT NULL,
    symbol TEXT NOT NULL,
    signal_strength TEXT NOT NULL, -- 'weak', 'moderate', 'strong', 'urgent'
    whale_action TEXT NOT NULL, -- What the whale did
    copy_recommendation TEXT NOT NULL, -- What users should do
    entry_price DECIMAL(20, 8),
    suggested_amount_usd DECIMAL(20, 2), -- Suggested position size
    position_sizing_ratio DECIMAL(5, 4), -- % of portfolio to allocate
    stop_loss_price DECIMAL(20, 8),
    take_profit_price DECIMAL(20, 8),
    timeframe TEXT DEFAULT '24h', -- How long signal is valid
    confidence_score INTEGER DEFAULT 50, -- 0-100
    whale_track_record JSONB, -- Whale's historical performance
    risk_assessment JSONB, -- Risk factors analysis
    signal_reasoning TEXT,
    whale_portfolio_impact DECIMAL(5, 2), -- % impact on whale's portfolio
    market_conditions JSONB, -- Current market context
    expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '24 hours',
    created_at TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'active' -- 'active', 'triggered', 'expired', 'cancelled'
);

-- Table for user whale copy subscriptions
CREATE TABLE whale_copy_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    subscription_type TEXT NOT NULL, -- 'single_whale', 'top_whales', 'custom_strategy'
    whale_addresses TEXT[], -- Specific whales to follow
    strategy_ids UUID[], -- Strategies to use
    auto_execute BOOLEAN DEFAULT false, -- Auto-execute trades (future feature)
    position_size_limit DECIMAL(20, 2) DEFAULT 1000, -- Max position size in USD
    min_confidence_score INTEGER DEFAULT 70,
    risk_tolerance TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
    notification_preferences JSONB, -- How to be notified
    is_active BOOLEAN DEFAULT true,
    total_signals_received INTEGER DEFAULT 0,
    successful_signals INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for tracking whale copy signal performance
CREATE TABLE whale_signal_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    signal_id UUID REFERENCES whale_copy_signals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    followed_signal BOOLEAN DEFAULT false, -- Did user act on signal
    entry_price DECIMAL(20, 8),
    exit_price DECIMAL(20, 8),
    position_size_usd DECIMAL(20, 2),
    roi_percentage DECIMAL(10, 4),
    holding_duration_hours INTEGER,
    outcome TEXT, -- 'profit', 'loss', 'breakeven', 'ongoing'
    max_gain DECIMAL(10, 4),
    max_loss DECIMAL(10, 4),
    whale_outcome DECIMAL(10, 4), -- How the whale's position performed
    user_notes TEXT,
    recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Table for whale analytics and reputation tracking
CREATE TABLE whale_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    whale_address TEXT NOT NULL UNIQUE,
    whale_name TEXT, -- Known name/tag
    blockchain TEXT NOT NULL DEFAULT 'ethereum',
    total_balance_usd DECIMAL(20, 2),
    portfolio_tokens JSONB, -- Token holdings breakdown
    tracking_since TIMESTAMPTZ DEFAULT now(),
    total_movements INTEGER DEFAULT 0,
    successful_calls INTEGER DEFAULT 0,
    failed_calls INTEGER DEFAULT 0,
    success_rate DECIMAL(5, 2) DEFAULT 0.00,
    avg_roi DECIMAL(10, 4) DEFAULT 0.00,
    risk_score INTEGER DEFAULT 50, -- 0-100, lower is safer
    influence_score INTEGER DEFAULT 50, -- 0-100, market influence
    copy_worthiness INTEGER DEFAULT 50, -- 0-100, overall rating
    recent_performance JSONB, -- Last 30 days stats
    specialty_tokens TEXT[], -- Tokens whale is best at trading
    last_significant_move TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_whale_movements_address ON whale_movements(whale_address);
CREATE INDEX idx_whale_movements_crypto ON whale_movements(cryptocurrency);
CREATE INDEX idx_whale_movements_detected ON whale_movements(detected_at DESC);
CREATE INDEX idx_whale_movements_significance ON whale_movements(movement_significance DESC);
CREATE INDEX idx_whale_copy_signals_crypto ON whale_copy_signals(cryptocurrency);
CREATE INDEX idx_whale_copy_signals_status ON whale_copy_signals(status);
CREATE INDEX idx_whale_copy_signals_created ON whale_copy_signals(created_at DESC);
CREATE INDEX idx_whale_copy_signals_confidence ON whale_copy_signals(confidence_score DESC);
CREATE INDEX idx_whale_copy_subscriptions_user ON whale_copy_subscriptions(user_id);
CREATE INDEX idx_whale_signal_performance_signal ON whale_signal_performance(signal_id);
CREATE INDEX idx_whale_analytics_address ON whale_analytics(whale_address);
CREATE INDEX idx_whale_analytics_success ON whale_analytics(success_rate DESC);

-- RLS Policies
ALTER TABLE whale_copy_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE whale_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE whale_copy_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE whale_copy_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE whale_signal_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE whale_analytics ENABLE ROW LEVEL SECURITY;

-- Public read access for strategies, movements, signals, and analytics
CREATE POLICY "whale_copy_strategies_read" ON whale_copy_strategies FOR SELECT USING (is_active = true);
CREATE POLICY "whale_movements_read" ON whale_movements FOR SELECT USING (true);
CREATE POLICY "whale_copy_signals_read" ON whale_copy_signals FOR SELECT USING (status = 'active');
CREATE POLICY "whale_analytics_read" ON whale_analytics FOR SELECT USING (true);

-- Users can manage their own subscriptions and performance tracking
CREATE POLICY "whale_copy_subscriptions_user" ON whale_copy_subscriptions
    FOR ALL USING (auth.uid() IN (
        SELECT auth_id FROM profiles WHERE id = user_id
    ));

CREATE POLICY "whale_signal_performance_user" ON whale_signal_performance
    FOR ALL USING (auth.uid() IN (
        SELECT auth_id FROM profiles WHERE id = user_id
    ));

-- Insert default whale copy strategies
INSERT INTO whale_copy_strategies (strategy_name, description, whale_criteria, copy_conditions, risk_management, success_rate, risk_level, min_whale_balance) VALUES
(
    'Top Whale Mimicking',
    'Copy trades from the most successful whale wallets',
    '{
        "min_balance_usd": 10000000,
        "min_success_rate": 70,
        "track_record_days": 90,
        "specializes_in": ["bitcoin", "ethereum"]
    }',
    '{
        "min_position_size_usd": 100000,
        "max_position_size_percent": 5,
        "min_confidence": 80,
        "exclude_micro_moves": true
    }',
    '{
        "stop_loss_percent": 15,
        "take_profit_percent": 25,
        "max_position_size_percent": 3,
        "diversification_required": true
    }',
    78.50,
    'medium',
    1000
),
(
    'Whale Accumulation Signals',
    'Detect when whales are accumulating specific tokens',
    '{
        "min_balance_usd": 5000000,
        "accumulation_timeframe": "7d",
        "min_accumulation_percent": 20
    }',
    '{
        "accumulation_threshold": 1000000,
        "consistency_required": true,
        "multiple_whales": false
    }',
    '{
        "stop_loss_percent": 20,
        "take_profit_percent": 40,
        "position_hold_time": "30d"
    }',
    72.30,
    'low',
    500
),
(
    'Whale Exit Signals',
    'Alert when whales are exiting positions for profit taking',
    '{
        "min_balance_usd": 8000000,
        "exit_threshold_percent": 25,
        "min_holding_period": "14d"
    }',
    '{
        "exit_volume_threshold": 500000,
        "profit_taking_pattern": true,
        "market_impact_consideration": true
    }',
    '{
        "immediate_exit": true,
        "partial_exit_allowed": true,
        "trail_stop_percent": 5
    }',
    82.70,
    'high',
    1500
),
(
    'Smart Money DeFi Plays',
    'Follow whale movements in DeFi protocols and yield farming',
    '{
        "defi_specialist": true,
        "min_defi_balance": 2000000,
        "protocol_diversity": 3
    }',
    '{
        "new_protocol_entry": true,
        "yield_opportunity": true,
        "liquidity_provision": true
    }',
    '{
        "protocol_risk_assessment": true,
        "impermanent_loss_protection": true,
        "exit_conditions": "yield_drop_50_percent"
    }',
    68.90,
    'high',
    200
);

-- Insert sample whale movements (for testing)
INSERT INTO whale_movements (whale_address, whale_tag, blockchain, transaction_hash, movement_type, cryptocurrency, symbol, amount, amount_usd, price_at_movement, movement_significance) VALUES
(
    '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503',
    'Ethereum Whale #1',
    'ethereum',
    '0x1234567890abcdef1234567890abcdef12345678',
    'buy',
    'bitcoin',
    'BTC',
    157.83,
    18500000.00,
    117200.00,
    95.5
),
(
    '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a',
    'Smart Money Wallet',
    'ethereum',
    '0x2345678901bcdef12345678901bcdef123456789',
    'buy',
    'ethereum',
    'ETH',
    4250.67,
    18750000.00,
    4412.50,
    88.2
),
(
    '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8',
    'DeFi Whale',
    'ethereum',
    '0x3456789012cdef123456789012cdef1234567890',
    'sell',
    'solana',
    'SOL',
    72500.00,
    18900000.00,
    260.69,
    91.7
);

-- Insert sample whale analytics
INSERT INTO whale_analytics (whale_address, whale_name, blockchain, total_balance_usd, success_rate, avg_roi, influence_score, copy_worthiness, specialty_tokens) VALUES
(
    '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503',
    'Ethereum Whale #1',
    'ethereum',
    125000000.00,
    78.5,
    23.4,
    92,
    85,
    ARRAY['bitcoin', 'ethereum']
),
(
    '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a',
    'Smart Money Wallet',
    'ethereum',
    89000000.00,
    72.3,
    18.7,
    88,
    82,
    ARRAY['ethereum', 'chainlink', 'uniswap']
),
(
    '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8',
    'DeFi Whale',
    'ethereum',
    67500000.00,
    82.7,
    31.2,
    85,
    87,
    ARRAY['solana', 'avalanche', 'polygon']
);

-- Function to generate whale copy signal
CREATE OR REPLACE FUNCTION generate_whale_copy_signal(
    p_user_id UUID,
    p_whale_address TEXT,
    p_cryptocurrency TEXT DEFAULT 'bitcoin'
)
RETURNS TABLE (
    signal_id UUID,
    signal_data JSONB,
    whale_data JSONB,
    credits_charged INTEGER
) AS $$
DECLARE
    v_signal_id UUID;
    v_credits INTEGER := 25;
    v_whale_analytics RECORD;
    v_strategy RECORD;
    v_signal_data JSONB;
    v_whale_data JSONB;
    v_recent_movement RECORD;
BEGIN
    -- Get whale analytics
    SELECT * INTO v_whale_analytics
    FROM whale_analytics
    WHERE whale_address = p_whale_address;

    IF v_whale_analytics IS NULL THEN
        RAISE EXCEPTION 'Whale address not found in analytics';
    END IF;

    -- Select appropriate strategy
    SELECT * INTO v_strategy
    FROM whale_copy_strategies
    WHERE is_active = true
    AND (whale_criteria->>'min_balance_usd')::DECIMAL <= v_whale_analytics.total_balance_usd
    ORDER BY success_rate DESC
    LIMIT 1;

    -- Get most recent whale movement
    SELECT * INTO v_recent_movement
    FROM whale_movements
    WHERE whale_address = p_whale_address
    AND cryptocurrency = p_cryptocurrency
    ORDER BY detected_at DESC
    LIMIT 1;

    -- Generate whale copy signal
    INSERT INTO whale_copy_signals (
        strategy_id,
        whale_address,
        signal_type,
        cryptocurrency,
        symbol,
        signal_strength,
        whale_action,
        copy_recommendation,
        entry_price,
        suggested_amount_usd,
        position_sizing_ratio,
        stop_loss_price,
        take_profit_price,
        confidence_score,
        whale_track_record,
        risk_assessment,
        signal_reasoning,
        whale_portfolio_impact,
        market_conditions
    )
    VALUES (
        v_strategy.id,
        p_whale_address,
        CASE
            WHEN v_recent_movement.movement_type = 'buy' THEN 'copy_buy'
            WHEN v_recent_movement.movement_type = 'sell' THEN 'copy_sell'
            ELSE 'follow_whale'
        END,
        p_cryptocurrency,
        CASE p_cryptocurrency
            WHEN 'bitcoin' THEN 'BTC'
            WHEN 'ethereum' THEN 'ETH'
            WHEN 'solana' THEN 'SOL'
            ELSE upper(substring(p_cryptocurrency from 1 for 3))
        END,
        CASE
            WHEN v_whale_analytics.success_rate >= 80 THEN 'strong'
            WHEN v_whale_analytics.success_rate >= 65 THEN 'moderate'
            ELSE 'weak'
        END,
        COALESCE(v_recent_movement.movement_type, 'accumulating') || ' ' || p_cryptocurrency,
        CASE
            WHEN v_recent_movement.movement_type = 'buy' THEN 'Consider following whale''s buy signal'
            WHEN v_recent_movement.movement_type = 'sell' THEN 'Consider profit taking like the whale'
            ELSE 'Monitor whale''s ' || p_cryptocurrency || ' positions'
        END,
        COALESCE(v_recent_movement.price_at_movement, 50000 + random() * 50000),
        (1000 + random() * 9000)::DECIMAL(20,2),
        (0.01 + random() * 0.04)::DECIMAL(5,4),
        COALESCE(v_recent_movement.price_at_movement * 0.85, 42500),
        COALESCE(v_recent_movement.price_at_movement * 1.25, 62500),
        GREATEST(v_whale_analytics.success_rate::INTEGER, 60),
        jsonb_build_object(
            'success_rate', v_whale_analytics.success_rate,
            'avg_roi', v_whale_analytics.avg_roi,
            'total_balance', v_whale_analytics.total_balance_usd,
            'influence_score', v_whale_analytics.influence_score,
            'specialty_tokens', v_whale_analytics.specialty_tokens
        ),
        jsonb_build_object(
            'whale_risk_score', v_whale_analytics.risk_score,
            'market_volatility', 'medium',
            'position_impact', 'significant',
            'timing_risk', 'low'
        ),
        'Whale ' || COALESCE(v_whale_analytics.whale_name, 'Unknown') || ' with ' ||
        v_whale_analytics.success_rate || '% success rate ' ||
        COALESCE('recently ' || v_recent_movement.movement_type || ' ' || v_recent_movement.amount_usd || ' USD worth', 'shows strong position in ' || p_cryptocurrency),
        COALESCE((v_recent_movement.amount_usd / v_whale_analytics.total_balance_usd * 100), 2.5),
        jsonb_build_object(
            'market_trend', 'bullish',
            'volatility', 'medium',
            'whale_confidence', 'high',
            'follow_recommendation', 'strong'
        )
    )
    RETURNING id INTO v_signal_id;

    -- Prepare response data
    v_signal_data := jsonb_build_object(
        'signal_id', v_signal_id,
        'signal_type', CASE
            WHEN v_recent_movement.movement_type = 'buy' THEN 'copy_buy'
            WHEN v_recent_movement.movement_type = 'sell' THEN 'copy_sell'
            ELSE 'follow_whale'
        END,
        'cryptocurrency', p_cryptocurrency,
        'confidence_score', GREATEST(v_whale_analytics.success_rate::INTEGER, 60),
        'whale_action', COALESCE(v_recent_movement.movement_type, 'monitoring'),
        'suggested_amount', (1000 + random() * 9000)::DECIMAL(20,2),
        'entry_price', COALESCE(v_recent_movement.price_at_movement, 50000 + random() * 50000)
    );

    v_whale_data := jsonb_build_object(
        'whale_address', p_whale_address,
        'whale_name', COALESCE(v_whale_analytics.whale_name, 'Unknown Whale'),
        'success_rate', v_whale_analytics.success_rate,
        'portfolio_value', v_whale_analytics.total_balance_usd,
        'influence_score', v_whale_analytics.influence_score,
        'copy_worthiness', v_whale_analytics.copy_worthiness
    );

    RETURN QUERY SELECT v_signal_id, v_signal_data, v_whale_data, v_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON whale_copy_strategies TO authenticated;
GRANT SELECT ON whale_movements TO authenticated;
GRANT SELECT ON whale_copy_signals TO authenticated;
GRANT SELECT ON whale_analytics TO authenticated;
GRANT ALL ON whale_copy_subscriptions TO authenticated;
GRANT ALL ON whale_signal_performance TO authenticated;
GRANT EXECUTE ON FUNCTION generate_whale_copy_signal TO authenticated;
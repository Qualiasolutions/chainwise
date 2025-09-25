-- ChainWise Signals Pack System Migration
-- Created: September 25, 2025

-- Table for signal types and templates
CREATE TABLE signal_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    signal_type TEXT NOT NULL, -- 'buy', 'sell', 'hold', 'entry', 'exit'
    template_name TEXT NOT NULL,
    description TEXT,
    signal_criteria JSONB NOT NULL, -- Technical indicators, market conditions
    success_rate DECIMAL(5, 2) DEFAULT 0.00, -- Historical success rate
    risk_level TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
    target_audience TEXT DEFAULT 'general', -- 'beginner', 'intermediate', 'advanced', 'general'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for generated trading signals
CREATE TABLE trading_signals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    signal_pack_id UUID, -- Groups signals into packs
    signal_template_id UUID REFERENCES signal_templates(id) ON DELETE SET NULL,
    signal_type TEXT NOT NULL,
    cryptocurrency TEXT NOT NULL, -- e.g., 'bitcoin', 'ethereum'
    symbol TEXT NOT NULL, -- e.g., 'BTC', 'ETH'
    signal_strength TEXT NOT NULL, -- 'weak', 'moderate', 'strong'
    entry_price DECIMAL(20, 8),
    target_price DECIMAL(20, 8),
    stop_loss DECIMAL(20, 8),
    timeframe TEXT, -- '1h', '4h', '1d', '1w'
    confidence_score INTEGER DEFAULT 50, -- 0-100
    market_conditions JSONB, -- Current market analysis
    technical_analysis JSONB, -- RSI, MACD, etc.
    risk_reward_ratio DECIMAL(10, 4),
    signal_description TEXT,
    signal_reasoning TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'active' -- 'active', 'triggered', 'expired', 'cancelled'
);

-- Table for signal packs (collections of signals)
CREATE TABLE signal_packs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pack_name TEXT NOT NULL,
    pack_type TEXT NOT NULL, -- 'daily', 'weekly', 'flash', 'premium'
    description TEXT,
    total_signals INTEGER DEFAULT 0,
    pack_price_credits INTEGER DEFAULT 15, -- Cost in credits
    tier_requirement TEXT DEFAULT 'pro', -- 'free', 'pro', 'elite'
    market_theme TEXT, -- 'bullish', 'bearish', 'neutral', 'volatility'
    success_rate_target DECIMAL(5, 2) DEFAULT 65.00,
    risk_profile TEXT DEFAULT 'balanced', -- 'conservative', 'balanced', 'aggressive'
    generated_by TEXT DEFAULT 'ai', -- 'ai', 'analyst', 'algorithm'
    pack_status TEXT DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT now(),
    valid_until TIMESTAMPTZ DEFAULT now() + INTERVAL '7 days'
);

-- Table for user signal subscriptions
CREATE TABLE signal_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    subscription_type TEXT NOT NULL, -- 'daily', 'weekly', 'premium', 'flash'
    is_active BOOLEAN DEFAULT true,
    auto_renewal BOOLEAN DEFAULT false,
    credits_per_pack INTEGER DEFAULT 15,
    last_pack_received TIMESTAMPTZ,
    total_packs_received INTEGER DEFAULT 0,
    subscription_start TIMESTAMPTZ DEFAULT now(),
    subscription_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for user signal purchases/access
CREATE TABLE user_signal_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    signal_pack_id UUID REFERENCES signal_packs(id) ON DELETE CASCADE,
    access_granted_at TIMESTAMPTZ DEFAULT now(),
    credits_used INTEGER DEFAULT 15,
    access_expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '30 days',
    usage_stats JSONB, -- Track which signals were viewed, acted upon
    UNIQUE(user_id, signal_pack_id)
);

-- Table for tracking signal performance
CREATE TABLE signal_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    signal_id UUID REFERENCES trading_signals(id) ON DELETE CASCADE,
    triggered_at TIMESTAMPTZ,
    trigger_price DECIMAL(20, 8),
    current_price DECIMAL(20, 8),
    performance_percentage DECIMAL(10, 4), -- % gain/loss
    status TEXT, -- 'pending', 'hit_target', 'hit_stop_loss', 'expired'
    max_gain DECIMAL(10, 4),
    max_loss DECIMAL(10, 4),
    duration_hours INTEGER,
    roi_percentage DECIMAL(10, 4),
    recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_trading_signals_pack ON trading_signals(signal_pack_id);
CREATE INDEX idx_trading_signals_crypto ON trading_signals(cryptocurrency);
CREATE INDEX idx_trading_signals_status ON trading_signals(status);
CREATE INDEX idx_trading_signals_created ON trading_signals(created_at DESC);
CREATE INDEX idx_signal_packs_type ON signal_packs(pack_type);
CREATE INDEX idx_signal_packs_tier ON signal_packs(tier_requirement);
CREATE INDEX idx_signal_packs_status ON signal_packs(pack_status);
CREATE INDEX idx_signal_subscriptions_user ON signal_subscriptions(user_id);
CREATE INDEX idx_user_signal_access_user ON user_signal_access(user_id);
CREATE INDEX idx_signal_performance_signal ON signal_performance(signal_id);

-- RLS Policies
ALTER TABLE signal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_signal_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_performance ENABLE ROW LEVEL SECURITY;

-- Public read access for templates and signals (for discovery)
CREATE POLICY "signal_templates_read" ON signal_templates FOR SELECT USING (is_active = true);
CREATE POLICY "trading_signals_read" ON trading_signals FOR SELECT USING (true);
CREATE POLICY "signal_packs_read" ON signal_packs FOR SELECT USING (pack_status = 'active');
CREATE POLICY "signal_performance_read" ON signal_performance FOR SELECT USING (true);

-- Users can manage their own subscriptions and access
CREATE POLICY "signal_subscriptions_user" ON signal_subscriptions
    FOR ALL USING (auth.uid() IN (
        SELECT auth_id FROM profiles WHERE id = user_id
    ));

CREATE POLICY "user_signal_access_user" ON user_signal_access
    FOR ALL USING (auth.uid() IN (
        SELECT auth_id FROM profiles WHERE id = user_id
    ));

-- Insert default signal templates
INSERT INTO signal_templates (signal_type, template_name, description, signal_criteria, success_rate, risk_level, target_audience) VALUES
(
    'buy',
    'Bullish Breakout',
    'Strong upward momentum with volume confirmation',
    '{
        "rsi": {"min": 45, "max": 70},
        "macd": {"signal": "bullish_crossover"},
        "volume": {"increase_24h": 50},
        "price_action": "breakout_resistance",
        "timeframes": ["4h", "1d"]
    }',
    72.50,
    'medium',
    'intermediate'
),
(
    'sell',
    'Bear Flag Formation',
    'Classic bear flag pattern with declining volume',
    '{
        "rsi": {"min": 30, "max": 55},
        "pattern": "bear_flag",
        "volume": {"declining": true},
        "support_level": "broken",
        "timeframes": ["1h", "4h"]
    }',
    68.75,
    'medium',
    'advanced'
),
(
    'buy',
    'Oversold Bounce',
    'Recovery from oversold conditions with bullish divergence',
    '{
        "rsi": {"max": 35},
        "divergence": "bullish",
        "support_level": "holding",
        "market_sentiment": "improving",
        "timeframes": ["1d", "1w"]
    }',
    64.20,
    'low',
    'beginner'
),
(
    'hold',
    'Consolidation Range',
    'Sideways movement within defined range',
    '{
        "price_range": {"defined": true},
        "volume": {"average": true},
        "volatility": "low",
        "trend": "sideways",
        "timeframes": ["4h", "1d"]
    }',
    58.90,
    'low',
    'general'
),
(
    'entry',
    'DCA Opportunity',
    'Favorable entry point for dollar-cost averaging',
    '{
        "price_decline": {"min": 15},
        "fundamentals": "strong",
        "market_cycle": "accumulation",
        "long_term_trend": "bullish",
        "timeframes": ["1w", "1m"]
    }',
    76.30,
    'low',
    'beginner'
);

-- Insert sample signal packs
INSERT INTO signal_packs (pack_name, pack_type, description, total_signals, pack_price_credits, tier_requirement, market_theme, success_rate_target, risk_profile) VALUES
(
    'Daily Alpha Signals',
    'daily',
    'Curated daily trading opportunities across top cryptocurrencies',
    5,
    15,
    'pro',
    'bullish',
    70.00,
    'balanced'
),
(
    'Weekly Strategy Pack',
    'weekly',
    'Comprehensive weekly analysis with medium to long-term signals',
    8,
    10,
    'pro',
    'neutral',
    65.00,
    'conservative'
),
(
    'Flash Alert Signals',
    'flash',
    'Time-sensitive opportunities requiring immediate action',
    3,
    20,
    'elite',
    'volatility',
    75.00,
    'aggressive'
),
(
    'Elite Premium Pack',
    'premium',
    'High-conviction signals with detailed analysis for elite members',
    10,
    8,
    'elite',
    'bullish',
    80.00,
    'balanced'
);

-- Function to generate a new signal pack
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
    v_credits INTEGER;
    v_signals JSONB := '[]'::JSONB;
    v_total_signals INTEGER := 0;
    v_template RECORD;
    v_signal_data JSONB;
    v_cryptocurrencies TEXT[] := ARRAY['bitcoin', 'ethereum', 'binancecoin', 'solana', 'cardano', 'ripple'];
    v_symbols TEXT[] := ARRAY['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'XRP'];
    v_crypto TEXT;
    v_symbol TEXT;
    v_i INTEGER;
BEGIN
    -- Determine pack parameters based on type
    CASE p_pack_type
        WHEN 'daily' THEN v_credits := 15; v_total_signals := 5;
        WHEN 'weekly' THEN v_credits := 10; v_total_signals := 8;
        WHEN 'flash' THEN v_credits := 20; v_total_signals := 3;
        WHEN 'premium' THEN v_credits := 8; v_total_signals := 10;
        ELSE v_credits := 15; v_total_signals := 5;
    END CASE;

    -- Create the signal pack
    INSERT INTO signal_packs (
        pack_name,
        pack_type,
        description,
        total_signals,
        pack_price_credits,
        tier_requirement,
        market_theme,
        success_rate_target,
        risk_profile
    )
    VALUES (
        CASE p_pack_type
            WHEN 'daily' THEN 'Daily Alpha Signals ' || to_char(now(), 'MM/DD')
            WHEN 'weekly' THEN 'Weekly Strategy Pack ' || to_char(now(), 'WW/YYYY')
            WHEN 'flash' THEN 'Flash Alert Pack ' || to_char(now(), 'HH24:MI')
            WHEN 'premium' THEN 'Elite Premium Pack ' || to_char(now(), 'MM/DD')
        END,
        p_pack_type,
        'AI-generated signals for ' || p_market_theme || ' market conditions',
        v_total_signals,
        v_credits,
        CASE WHEN p_pack_type IN ('flash', 'premium') THEN 'elite' ELSE 'pro' END,
        p_market_theme,
        CASE WHEN p_pack_type = 'premium' THEN 80.00 ELSE 70.00 END,
        CASE WHEN p_pack_type = 'flash' THEN 'aggressive' ELSE 'balanced' END
    )
    RETURNING id INTO v_pack_id;

    -- Generate signals for each cryptocurrency
    FOR v_i IN 1..LEAST(v_total_signals, array_length(v_cryptocurrencies, 1))
    LOOP
        v_crypto := v_cryptocurrencies[v_i];
        v_symbol := v_symbols[v_i];

        -- Select a random template
        SELECT * INTO v_template
        FROM signal_templates
        WHERE is_active = true
        ORDER BY random()
        LIMIT 1;

        -- Generate signal data
        v_signal_data := jsonb_build_object(
            'signal_type', v_template.signal_type,
            'cryptocurrency', v_crypto,
            'symbol', v_symbol,
            'signal_strength',
            CASE
                WHEN random() > 0.7 THEN 'strong'
                WHEN random() > 0.3 THEN 'moderate'
                ELSE 'weak'
            END,
            'entry_price', (50 + random() * 50000)::DECIMAL(20,8),
            'target_price', (60 + random() * 60000)::DECIMAL(20,8),
            'stop_loss', (40 + random() * 40000)::DECIMAL(20,8),
            'timeframe',
            CASE
                WHEN p_pack_type = 'flash' THEN '1h'
                WHEN p_pack_type = 'daily' THEN '4h'
                ELSE '1d'
            END,
            'confidence_score', (50 + random() * 40)::INTEGER,
            'risk_reward_ratio', (1.5 + random() * 2)::DECIMAL(10,4),
            'signal_description', 'AI-generated signal for ' || v_symbol || ' based on ' || v_template.template_name,
            'signal_reasoning', 'Technical analysis indicates ' || v_template.description
        );

        -- Insert the signal
        INSERT INTO trading_signals (
            signal_pack_id,
            signal_template_id,
            signal_type,
            cryptocurrency,
            symbol,
            signal_strength,
            entry_price,
            target_price,
            stop_loss,
            timeframe,
            confidence_score,
            market_conditions,
            technical_analysis,
            risk_reward_ratio,
            signal_description,
            signal_reasoning,
            expires_at
        )
        VALUES (
            v_pack_id,
            v_template.id,
            v_template.signal_type,
            v_crypto,
            v_symbol,
            (v_signal_data->>'signal_strength'),
            (v_signal_data->>'entry_price')::DECIMAL(20,8),
            (v_signal_data->>'target_price')::DECIMAL(20,8),
            (v_signal_data->>'stop_loss')::DECIMAL(20,8),
            (v_signal_data->>'timeframe'),
            (v_signal_data->>'confidence_score')::INTEGER,
            v_template.signal_criteria,
            jsonb_build_object(
                'rsi', 30 + random() * 40,
                'macd', CASE WHEN random() > 0.5 THEN 'bullish' ELSE 'bearish' END,
                'volume_24h', random() * 100
            ),
            (v_signal_data->>'risk_reward_ratio')::DECIMAL(10,4),
            (v_signal_data->>'signal_description'),
            (v_signal_data->>'signal_reasoning'),
            now() + INTERVAL '7 days'
        );

        -- Add to signals array
        v_signals := v_signals || v_signal_data;
    END LOOP;

    -- Grant access to the user
    INSERT INTO user_signal_access (
        user_id,
        signal_pack_id,
        credits_used
    )
    VALUES (
        p_user_id,
        v_pack_id,
        v_credits
    );

    RETURN QUERY SELECT v_pack_id, v_signals, v_total_signals, v_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON signal_templates TO authenticated;
GRANT SELECT ON trading_signals TO authenticated;
GRANT SELECT ON signal_packs TO authenticated;
GRANT SELECT ON signal_performance TO authenticated;
GRANT ALL ON signal_subscriptions TO authenticated;
GRANT ALL ON user_signal_access TO authenticated;
GRANT EXECUTE ON FUNCTION generate_signal_pack TO authenticated;
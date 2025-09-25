-- Altcoin Early Detector System Migration
-- Created: September 25, 2025

-- Table for tracking discovered altcoins and emerging tokens
CREATE TABLE discovered_altcoins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token_symbol TEXT NOT NULL,
    token_name TEXT NOT NULL,
    contract_address TEXT NOT NULL,
    blockchain TEXT NOT NULL DEFAULT 'ethereum', -- 'ethereum', 'bsc', 'polygon', 'arbitrum', 'base'
    discovery_timestamp TIMESTAMPTZ DEFAULT now(),
    market_cap DECIMAL(20, 2),
    price_usd DECIMAL(20, 8),
    volume_24h DECIMAL(20, 2),
    holders_count INTEGER DEFAULT 0,
    liquidity_usd DECIMAL(20, 2),
    age_days INTEGER DEFAULT 0, -- How old the token is
    social_score INTEGER DEFAULT 0, -- Social media presence score
    risk_score INTEGER DEFAULT 50, -- 0-100, lower is safer
    gem_score INTEGER DEFAULT 50, -- 0-100, higher is better potential
    detection_criteria JSONB, -- What criteria flagged this token
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(contract_address, blockchain)
);

-- Table for altcoin detection scans performed by users
CREATE TABLE altcoin_scans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    scan_name TEXT NOT NULL,
    scan_criteria JSONB NOT NULL, -- Scan parameters and filters
    discovered_tokens JSONB, -- Array of discovered token IDs and data
    total_discovered INTEGER DEFAULT 0,
    scan_summary TEXT,
    credits_used INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for tracking token performance after discovery
CREATE TABLE token_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    altcoin_id UUID REFERENCES discovered_altcoins(id) ON DELETE CASCADE,
    price_change_1h DECIMAL(10, 4),
    price_change_24h DECIMAL(10, 4),
    price_change_7d DECIMAL(10, 4),
    volume_change_24h DECIMAL(10, 4),
    market_cap_change_24h DECIMAL(10, 4),
    holders_change_24h INTEGER DEFAULT 0,
    all_time_high DECIMAL(20, 8),
    all_time_low DECIMAL(20, 8),
    performance_score INTEGER, -- 0-100 based on overall performance
    recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Table for detection criteria templates
CREATE TABLE detection_criteria (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    criteria_name TEXT NOT NULL,
    description TEXT,
    criteria_config JSONB NOT NULL,
    success_rate DECIMAL(5, 2) DEFAULT 0.00, -- Historical success rate
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for user watchlists of discovered tokens
CREATE TABLE altcoin_watchlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    altcoin_id UUID REFERENCES discovered_altcoins(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT now(),
    notes TEXT,
    target_price DECIMAL(20, 8),
    stop_loss DECIMAL(20, 8),
    UNIQUE(user_id, altcoin_id)
);

-- Indexes for performance
CREATE INDEX idx_discovered_altcoins_symbol ON discovered_altcoins(token_symbol);
CREATE INDEX idx_discovered_altcoins_blockchain ON discovered_altcoins(blockchain);
CREATE INDEX idx_discovered_altcoins_discovery ON discovered_altcoins(discovery_timestamp DESC);
CREATE INDEX idx_discovered_altcoins_gem_score ON discovered_altcoins(gem_score DESC);
CREATE INDEX idx_discovered_altcoins_risk_score ON discovered_altcoins(risk_score ASC);
CREATE INDEX idx_discovered_altcoins_active ON discovered_altcoins(is_active) WHERE is_active = true;
CREATE INDEX idx_altcoin_scans_user ON altcoin_scans(user_id);
CREATE INDEX idx_altcoin_scans_created ON altcoin_scans(created_at DESC);
CREATE INDEX idx_token_performance_altcoin ON token_performance(altcoin_id);
CREATE INDEX idx_token_performance_recorded ON token_performance(recorded_at DESC);
CREATE INDEX idx_altcoin_watchlist_user ON altcoin_watchlist(user_id);

-- RLS Policies
ALTER TABLE discovered_altcoins ENABLE ROW LEVEL SECURITY;
ALTER TABLE altcoin_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE detection_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE altcoin_watchlist ENABLE ROW LEVEL SECURITY;

-- Public read access for discovered altcoins and criteria (public data)
CREATE POLICY "discovered_altcoins_read" ON discovered_altcoins FOR SELECT USING (is_active = true);
CREATE POLICY "token_performance_read" ON token_performance FOR SELECT USING (true);
CREATE POLICY "detection_criteria_read" ON detection_criteria FOR SELECT USING (is_active = true);

-- Users can only access their own scans and watchlists
CREATE POLICY "altcoin_scans_user" ON altcoin_scans
    FOR ALL USING (auth.uid() IN (
        SELECT auth_id FROM profiles WHERE id = user_id
    ));

CREATE POLICY "altcoin_watchlist_user" ON altcoin_watchlist
    FOR ALL USING (auth.uid() IN (
        SELECT auth_id FROM profiles WHERE id = user_id
    ));

-- Insert default detection criteria
INSERT INTO detection_criteria (criteria_name, description, criteria_config) VALUES
(
    'New Token Discovery',
    'Detect newly launched tokens with initial liquidity',
    '{
        "max_age_days": 7,
        "min_liquidity_usd": 10000,
        "min_holders": 100,
        "max_risk_score": 70,
        "required_properties": ["verified_contract", "locked_liquidity"]
    }'
),
(
    'Volume Surge Detection',
    'Find tokens experiencing unusual volume spikes',
    '{
        "min_volume_increase_24h": 300,
        "min_volume_usd": 50000,
        "max_market_cap": 10000000,
        "min_holder_growth": 20
    }'
),
(
    'Under-the-Radar Gems',
    'Low market cap tokens with strong fundamentals',
    '{
        "max_market_cap": 1000000,
        "min_holders": 500,
        "min_age_days": 30,
        "max_risk_score": 60,
        "min_social_score": 30
    }'
),
(
    'Breakout Candidates',
    'Tokens showing technical breakout patterns',
    '{
        "min_price_increase_7d": 50,
        "min_volume_increase_7d": 200,
        "min_holder_growth_7d": 30,
        "max_risk_score": 50
    }'
);

-- Function to generate altcoin detection scan
CREATE OR REPLACE FUNCTION generate_altcoin_scan(
    p_user_id UUID,
    p_scan_name TEXT,
    p_criteria_config JSONB
)
RETURNS TABLE (
    scan_id UUID,
    discovered_tokens JSONB,
    total_discovered INTEGER,
    credits_charged INTEGER
) AS $$
DECLARE
    v_scan_id UUID;
    v_credits INTEGER := 5;
    v_discovered_tokens JSONB := '[]'::JSONB;
    v_total_discovered INTEGER := 0;
    v_scan_summary TEXT;
    v_token RECORD;
    v_token_data JSONB;
BEGIN
    -- Extract scan criteria parameters
    DECLARE
        v_max_market_cap DECIMAL := COALESCE((p_criteria_config->>'max_market_cap')::DECIMAL, 50000000);
        v_min_volume_24h DECIMAL := COALESCE((p_criteria_config->>'min_volume_24h')::DECIMAL, 10000);
        v_min_holders INTEGER := COALESCE((p_criteria_config->>'min_holders')::INTEGER, 100);
        v_max_age_days INTEGER := COALESCE((p_criteria_config->>'max_age_days')::INTEGER, 365);
        v_max_risk_score INTEGER := COALESCE((p_criteria_config->>'max_risk_score')::INTEGER, 70);
        v_min_gem_score INTEGER := COALESCE((p_criteria_config->>'min_gem_score')::INTEGER, 40);
    BEGIN
        -- Query discovered altcoins based on criteria
        FOR v_token IN
            SELECT
                da.*,
                COALESCE(tp.price_change_24h, 0) as price_change_24h,
                COALESCE(tp.volume_change_24h, 0) as volume_change_24h,
                COALESCE(tp.performance_score, 50) as performance_score
            FROM discovered_altcoins da
            LEFT JOIN LATERAL (
                SELECT * FROM token_performance tp2
                WHERE tp2.altcoin_id = da.id
                ORDER BY tp2.recorded_at DESC
                LIMIT 1
            ) tp ON true
            WHERE da.is_active = true
            AND da.market_cap <= v_max_market_cap
            AND da.volume_24h >= v_min_volume_24h
            AND da.holders_count >= v_min_holders
            AND da.age_days <= v_max_age_days
            AND da.risk_score <= v_max_risk_score
            AND da.gem_score >= v_min_gem_score
            ORDER BY da.gem_score DESC, da.discovery_timestamp DESC
            LIMIT 50
        LOOP
            -- Build token data object
            v_token_data := jsonb_build_object(
                'id', v_token.id,
                'symbol', v_token.token_symbol,
                'name', v_token.token_name,
                'contract_address', v_token.contract_address,
                'blockchain', v_token.blockchain,
                'market_cap', v_token.market_cap,
                'price_usd', v_token.price_usd,
                'volume_24h', v_token.volume_24h,
                'holders_count', v_token.holders_count,
                'liquidity_usd', v_token.liquidity_usd,
                'age_days', v_token.age_days,
                'social_score', v_token.social_score,
                'risk_score', v_token.risk_score,
                'gem_score', v_token.gem_score,
                'price_change_24h', v_token.price_change_24h,
                'volume_change_24h', v_token.volume_change_24h,
                'performance_score', v_token.performance_score,
                'discovery_timestamp', v_token.discovery_timestamp,
                'potential_rating',
                CASE
                    WHEN v_token.gem_score >= 80 AND v_token.risk_score <= 30 THEN 'exceptional'
                    WHEN v_token.gem_score >= 70 AND v_token.risk_score <= 40 THEN 'high'
                    WHEN v_token.gem_score >= 60 AND v_token.risk_score <= 50 THEN 'good'
                    WHEN v_token.gem_score >= 50 AND v_token.risk_score <= 60 THEN 'moderate'
                    ELSE 'speculative'
                END,
                'risk_level',
                CASE
                    WHEN v_token.risk_score <= 30 THEN 'low'
                    WHEN v_token.risk_score <= 50 THEN 'medium'
                    WHEN v_token.risk_score <= 70 THEN 'high'
                    ELSE 'very_high'
                END
            );

            -- Add to discovered tokens array
            v_discovered_tokens := v_discovered_tokens || v_token_data;
            v_total_discovered := v_total_discovered + 1;
        END LOOP;
    END;

    -- Generate scan summary
    v_scan_summary := 'Discovered ' || v_total_discovered || ' potential altcoins matching your criteria. ';

    IF v_total_discovered > 0 THEN
        v_scan_summary := v_scan_summary || 'Top recommendations include high gem score tokens with favorable risk profiles. ';
    ELSE
        v_scan_summary := v_scan_summary || 'Consider adjusting criteria for broader results. ';
    END IF;

    v_scan_summary := v_scan_summary || 'Scan completed with ' || v_total_discovered || ' matches found.';

    -- Save the scan
    INSERT INTO altcoin_scans (
        user_id,
        scan_name,
        scan_criteria,
        discovered_tokens,
        total_discovered,
        scan_summary,
        credits_used
    )
    VALUES (
        p_user_id,
        p_scan_name,
        p_criteria_config,
        v_discovered_tokens,
        v_total_discovered,
        v_scan_summary,
        v_credits
    )
    RETURNING id INTO v_scan_id;

    RETURN QUERY SELECT v_scan_id, v_discovered_tokens, v_total_discovered, v_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add sample altcoins for testing
CREATE OR REPLACE FUNCTION populate_sample_altcoins()
RETURNS INTEGER AS $$
DECLARE
    v_inserted_count INTEGER := 0;
BEGIN
    -- Insert sample altcoins for testing
    INSERT INTO discovered_altcoins (
        token_symbol, token_name, contract_address, blockchain, market_cap, price_usd,
        volume_24h, holders_count, liquidity_usd, age_days, social_score, risk_score, gem_score, detection_criteria
    ) VALUES
    ('GEMS', 'Hidden Gems Token', '0x1234...5678', 'ethereum', 250000, 0.000123, 45000, 1250, 85000, 15, 65, 35, 78,
     '{"criteria": "new_token_discovery", "volume_spike": true, "holder_growth": 45}'),
    ('MOON', 'MoonShot Protocol', '0x2345...6789', 'bsc', 180000, 0.000087, 32000, 890, 62000, 8, 52, 45, 72,
     '{"criteria": "volume_surge", "price_increase": 150, "social_growth": true}'),
    ('EARLY', 'Early Bird Finance', '0x3456...7890', 'polygon', 95000, 0.000034, 18000, 654, 28000, 22, 38, 55, 68,
     '{"criteria": "under_radar_gem", "fundamentals": "strong", "community": "active"}'),
    ('SURGE', 'Surge Coin', '0x4567...8901', 'arbitrum', 420000, 0.000156, 78000, 2100, 125000, 12, 71, 40, 75,
     '{"criteria": "breakout_candidate", "technical_analysis": "bullish", "volume_breakout": true}'),
    ('NOVA', 'Nova Protocol', '0x5678...9012', 'base', 320000, 0.000098, 56000, 1680, 94000, 18, 58, 38, 70,
     '{"criteria": "new_token_discovery", "liquidity_locked": true, "audit_passed": true}'),
    ('ALPHA', 'Alpha Gems', '0x6789...0123', 'ethereum', 150000, 0.000067, 25000, 725, 45000, 5, 43, 65, 65,
     '{"criteria": "volume_surge", "early_stage": true, "holder_concentration": "distributed"}'),
    ('BETA', 'Beta Finance', '0x7890...1234', 'bsc', 380000, 0.000145, 89000, 2850, 156000, 35, 67, 42, 73,
     '{"criteria": "breakout_candidate", "price_consolidation": "completed", "volume_confirmation": true}'),
    ('GAMMA', 'Gamma Protocol', '0x8901...2345', 'polygon', 75000, 0.000023, 12000, 456, 18000, 3, 29, 75, 62,
     '{"criteria": "under_radar_gem", "very_early": true, "dev_team": "experienced"}')
    ON CONFLICT (contract_address, blockchain) DO NOTHING;

    GET DIAGNOSTICS v_inserted_count = ROW_COUNT;

    -- Update performance data for sample tokens
    INSERT INTO token_performance (
        altcoin_id, price_change_1h, price_change_24h, price_change_7d, volume_change_24h,
        market_cap_change_24h, holders_change_24h, performance_score
    )
    SELECT
        da.id,
        (random() * 20 - 10)::DECIMAL(10,4), -- -10% to +10%
        (random() * 100 - 50)::DECIMAL(10,4), -- -50% to +50%
        (random() * 300 - 100)::DECIMAL(10,4), -- -100% to +200%
        (random() * 500 - 100)::DECIMAL(10,4), -- -100% to +400%
        (random() * 150 - 50)::DECIMAL(10,4), -- -50% to +100%
        (random() * 100)::INTEGER, -- 0 to 100 new holders
        (50 + random() * 50)::INTEGER -- 50-100 performance score
    FROM discovered_altcoins da
    WHERE da.token_symbol IN ('GEMS', 'MOON', 'EARLY', 'SURGE', 'NOVA', 'ALPHA', 'BETA', 'GAMMA')
    ON CONFLICT DO NOTHING;

    RETURN v_inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON discovered_altcoins TO authenticated;
GRANT SELECT ON token_performance TO authenticated;
GRANT SELECT ON detection_criteria TO authenticated;
GRANT ALL ON altcoin_scans TO authenticated;
GRANT ALL ON altcoin_watchlist TO authenticated;
GRANT EXECUTE ON FUNCTION generate_altcoin_scan TO authenticated;
GRANT EXECUTE ON FUNCTION populate_sample_altcoins TO authenticated;

-- Populate sample data
SELECT populate_sample_altcoins();
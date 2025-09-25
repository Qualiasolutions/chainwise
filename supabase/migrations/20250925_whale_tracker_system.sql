-- Whale Tracker System Migration
-- Created: September 25, 2025

-- Table for tracking whale wallets
CREATE TABLE whale_wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT NOT NULL UNIQUE,
    wallet_label TEXT, -- e.g., "a16z", "Vitalik Buterin", "Unknown Whale"
    balance_btc DECIMAL(20, 8),
    balance_eth DECIMAL(20, 8),
    total_usd_value DECIMAL(20, 2),
    is_active BOOLEAN DEFAULT true,
    last_activity_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table for whale transactions
CREATE TABLE whale_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    whale_wallet_id UUID REFERENCES whale_wallets(id) ON DELETE CASCADE,
    transaction_hash TEXT NOT NULL,
    blockchain TEXT NOT NULL, -- 'ethereum', 'bitcoin', etc.
    transaction_type TEXT NOT NULL, -- 'buy', 'sell', 'transfer'
    token_symbol TEXT NOT NULL,
    token_address TEXT,
    amount DECIMAL(30, 18) NOT NULL,
    usd_value DECIMAL(20, 2),
    from_address TEXT,
    to_address TEXT,
    exchange TEXT, -- 'uniswap', 'binance', etc.
    transaction_timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for whale tracker reports (user-generated)
CREATE TABLE whale_tracker_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL DEFAULT 'standard', -- 'standard', 'detailed'
    whale_wallets TEXT[], -- Array of whale wallet IDs
    time_period TEXT NOT NULL DEFAULT '24h', -- '1h', '24h', '7d', '30d'
    report_data JSONB NOT NULL, -- Structured report data
    credits_used INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for whale alerts (user subscriptions)
CREATE TABLE whale_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    whale_wallet_id UUID REFERENCES whale_wallets(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL, -- 'large_transaction', 'new_token', 'exchange_deposit'
    threshold_usd DECIMAL(20, 2), -- Minimum USD value to trigger alert
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, whale_wallet_id, alert_type)
);

-- Indexes for performance
CREATE INDEX idx_whale_wallets_address ON whale_wallets(wallet_address);
CREATE INDEX idx_whale_wallets_active ON whale_wallets(is_active) WHERE is_active = true;
CREATE INDEX idx_whale_transactions_wallet ON whale_transactions(whale_wallet_id);
CREATE INDEX idx_whale_transactions_timestamp ON whale_transactions(transaction_timestamp DESC);
CREATE INDEX idx_whale_transactions_symbol ON whale_transactions(token_symbol);
CREATE INDEX idx_whale_tracker_reports_user ON whale_tracker_reports(user_id);
CREATE INDEX idx_whale_tracker_reports_created ON whale_tracker_reports(created_at DESC);
CREATE INDEX idx_whale_alerts_user ON whale_alerts(user_id);
CREATE INDEX idx_whale_alerts_active ON whale_alerts(is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE whale_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE whale_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE whale_tracker_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE whale_alerts ENABLE ROW LEVEL SECURITY;

-- Public read access for whale data (it's public blockchain data)
CREATE POLICY "whale_wallets_read" ON whale_wallets FOR SELECT USING (true);
CREATE POLICY "whale_transactions_read" ON whale_transactions FOR SELECT USING (true);

-- Users can only access their own reports and alerts
CREATE POLICY "whale_tracker_reports_user" ON whale_tracker_reports
    FOR ALL USING (auth.uid() IN (
        SELECT auth_id FROM profiles WHERE id = user_id
    ));

CREATE POLICY "whale_alerts_user" ON whale_alerts
    FOR ALL USING (auth.uid() IN (
        SELECT auth_id FROM profiles WHERE id = user_id
    ));

-- Function to update whale wallet data
CREATE OR REPLACE FUNCTION update_whale_wallet_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE whale_wallets
    SET
        last_activity_at = NEW.transaction_timestamp,
        updated_at = now()
    WHERE id = NEW.whale_wallet_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update whale wallet activity
CREATE TRIGGER whale_transaction_activity_trigger
    AFTER INSERT ON whale_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_whale_wallet_activity();

-- Insert some sample whale wallets for testing
INSERT INTO whale_wallets (wallet_address, wallet_label, balance_btc, balance_eth, total_usd_value) VALUES
('1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ', 'Satoshi Nakamoto (estimated)', 1000000.00000000, 0.00000000, 112000000000.00),
('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', 'Vitalik Buterin', 0.00000000, 325000.00000000, 1440000000.00),
('0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503', 'Binance Hot Wallet', 0.00000000, 4200000.00000000, 18600000000.00),
('1FeexV6bAHb8ybZjqQMjJrcCrHGW9sb6uF', 'BitFinex Cold Storage', 168000.00000000, 0.00000000, 18800000000.00),
('0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a', 'a16z Wallet', 0.00000000, 150000.00000000, 665000000.00);

-- Function to generate whale tracker report
CREATE OR REPLACE FUNCTION generate_whale_tracker_report(
    p_user_id UUID,
    p_whale_wallets TEXT[],
    p_time_period TEXT DEFAULT '24h',
    p_report_type TEXT DEFAULT 'standard'
)
RETURNS TABLE (
    report_id UUID,
    report_data JSONB,
    credits_charged INTEGER
) AS $$
DECLARE
    v_report_id UUID;
    v_credits INTEGER := 5;
    v_report_data JSONB;
    v_time_filter TIMESTAMPTZ;
BEGIN
    -- Set time filter based on period
    CASE p_time_period
        WHEN '1h' THEN v_time_filter := now() - INTERVAL '1 hour';
        WHEN '24h' THEN v_time_filter := now() - INTERVAL '24 hours';
        WHEN '7d' THEN v_time_filter := now() - INTERVAL '7 days';
        WHEN '30d' THEN v_time_filter := now() - INTERVAL '30 days';
        ELSE v_time_filter := now() - INTERVAL '24 hours';
    END CASE;

    -- Adjust credits based on report type
    IF p_report_type = 'detailed' THEN
        v_credits := 10;
    END IF;

    -- Generate report data
    SELECT jsonb_build_object(
        'whale_wallets', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'wallet_address', w.wallet_address,
                    'wallet_label', w.wallet_label,
                    'balance_btc', w.balance_btc,
                    'balance_eth', w.balance_eth,
                    'total_usd_value', w.total_usd_value,
                    'recent_transactions', (
                        SELECT jsonb_agg(
                            jsonb_build_object(
                                'transaction_hash', t.transaction_hash,
                                'transaction_type', t.transaction_type,
                                'token_symbol', t.token_symbol,
                                'amount', t.amount,
                                'usd_value', t.usd_value,
                                'exchange', t.exchange,
                                'timestamp', t.transaction_timestamp
                            ) ORDER BY t.transaction_timestamp DESC
                        )
                        FROM whale_transactions t
                        WHERE t.whale_wallet_id = w.id
                        AND t.transaction_timestamp >= v_time_filter
                        LIMIT CASE WHEN p_report_type = 'detailed' THEN 50 ELSE 10 END
                    )
                )
            )
            FROM whale_wallets w
            WHERE w.wallet_address = ANY(p_whale_wallets)
            AND w.is_active = true
        ),
        'summary', jsonb_build_object(
            'total_transactions', (
                SELECT COUNT(*)::INTEGER
                FROM whale_transactions t
                JOIN whale_wallets w ON t.whale_wallet_id = w.id
                WHERE w.wallet_address = ANY(p_whale_wallets)
                AND t.transaction_timestamp >= v_time_filter
            ),
            'total_volume_usd', (
                SELECT COALESCE(SUM(t.usd_value), 0)
                FROM whale_transactions t
                JOIN whale_wallets w ON t.whale_wallet_id = w.id
                WHERE w.wallet_address = ANY(p_whale_wallets)
                AND t.transaction_timestamp >= v_time_filter
            ),
            'time_period', p_time_period,
            'report_type', p_report_type,
            'generated_at', now()
        )
    ) INTO v_report_data;

    -- Save the report
    INSERT INTO whale_tracker_reports (user_id, report_type, whale_wallets, time_period, report_data, credits_used)
    VALUES (p_user_id, p_report_type, p_whale_wallets, p_time_period, v_report_data, v_credits)
    RETURNING id INTO v_report_id;

    RETURN QUERY SELECT v_report_id, v_report_data, v_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON whale_wallets TO authenticated;
GRANT ALL ON whale_transactions TO authenticated;
GRANT ALL ON whale_tracker_reports TO authenticated;
GRANT ALL ON whale_alerts TO authenticated;
GRANT EXECUTE ON FUNCTION generate_whale_tracker_report TO authenticated;
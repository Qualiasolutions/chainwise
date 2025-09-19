-- Premium Features Database Schema
-- Created: 2025-09-19
-- Purpose: Add tables for premium features, reports, and analytics

-- AI Reports table
CREATE TABLE IF NOT EXISTS ai_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('pro_weekly', 'elite_monthly', 'custom')),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    credits_cost INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market Signals table
CREATE TABLE IF NOT EXISTS market_signals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    signal_type VARCHAR(50) NOT NULL CHECK (signal_type IN ('trading', 'whale', 'dca', 'risk', 'altcoin')),
    coin_symbol VARCHAR(20) NOT NULL,
    coin_name VARCHAR(100),
    signal_strength INTEGER CHECK (signal_strength BETWEEN 1 AND 100),
    action VARCHAR(20) CHECK (action IN ('buy', 'sell', 'hold', 'watch')),
    price_target DECIMAL(20,8),
    risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high')),
    confidence_score INTEGER CHECK (confidence_score BETWEEN 1 AND 100),
    reasoning TEXT,
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Whale Activities tracking
CREATE TABLE IF NOT EXISTS whale_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    whale_address VARCHAR(100) NOT NULL,
    transaction_hash VARCHAR(100),
    action VARCHAR(20) CHECK (action IN ('buy', 'sell', 'transfer')),
    coin_symbol VARCHAR(20) NOT NULL,
    amount DECIMAL(30,18) NOT NULL,
    usd_value DECIMAL(20,2),
    exchange VARCHAR(50),
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    significance_score INTEGER CHECK (significance_score BETWEEN 1 AND 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit Packages for purchase
CREATE TABLE IF NOT EXISTS credit_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    credits INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    stripe_price_id VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DCA Plans table
CREATE TABLE IF NOT EXISTS dca_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    coin_symbol VARCHAR(20) NOT NULL,
    total_investment DECIMAL(20,2) NOT NULL,
    frequency VARCHAR(20) CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    duration_weeks INTEGER NOT NULL,
    risk_tolerance VARCHAR(20) CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
    plan_data JSONB NOT NULL, -- Contains the full DCA schedule
    exit_strategy JSONB, -- Contains exit plan details
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio Analysis results
CREATE TABLE IF NOT EXISTS portfolio_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    analysis_type VARCHAR(50) DEFAULT 'allocation',
    recommendations JSONB NOT NULL, -- AI recommendations
    risk_score INTEGER CHECK (risk_score BETWEEN 1 AND 100),
    diversification_score INTEGER CHECK (diversification_score BETWEEN 1 AND 100),
    market_conditions JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    credits_used INTEGER DEFAULT 20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scam Detection results
CREATE TABLE IF NOT EXISTS scam_detections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    coin_symbol VARCHAR(20) NOT NULL,
    contract_address VARCHAR(100),
    risk_score INTEGER CHECK (risk_score BETWEEN 1 AND 100),
    risk_factors JSONB NOT NULL, -- Array of detected risks
    social_sentiment JSONB, -- Social media analysis
    developer_activity JSONB, -- GitHub/development metrics
    overall_verdict VARCHAR(20) CHECK (overall_verdict IN ('safe', 'caution', 'high_risk', 'scam')),
    analysis_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature Usage Analytics
CREATE TABLE IF NOT EXISTS feature_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    feature_type VARCHAR(50) NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    credits_used INTEGER DEFAULT 0,
    success BOOLEAN DEFAULT true,
    execution_time INTERVAL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default credit packages
INSERT INTO credit_packages (name, credits, price, description) VALUES
('Starter Pack', 50, 4.99, 'Perfect for trying premium features'),
('Power User', 200, 14.99, 'Great value for regular users'),
('Professional', 500, 29.99, 'Best value for power users')
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_reports_user_type ON ai_reports(user_id, report_type);
CREATE INDEX IF NOT EXISTS idx_ai_reports_generated_at ON ai_reports(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_signals_type_created ON market_signals(signal_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_signals_coin ON market_signals(coin_symbol);
CREATE INDEX IF NOT EXISTS idx_whale_activities_detected_at ON whale_activities(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_whale_activities_coin ON whale_activities(coin_symbol);
CREATE INDEX IF NOT EXISTS idx_dca_plans_user_status ON dca_plans(user_id, status);
CREATE INDEX IF NOT EXISTS idx_portfolio_analyses_user_portfolio ON portfolio_analyses(user_id, portfolio_id);
CREATE INDEX IF NOT EXISTS idx_scam_detections_coin ON scam_detections(coin_symbol);
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_feature ON feature_usage(user_id, feature_type);
CREATE INDEX IF NOT EXISTS idx_feature_usage_created_at ON feature_usage(created_at DESC);

-- Enable RLS on all tables
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE whale_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE dca_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE scam_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own reports" ON ai_reports
    FOR SELECT USING (auth.uid()::text = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can insert their own reports" ON ai_reports
    FOR INSERT WITH CHECK (auth.uid()::text = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can view market signals" ON market_signals
    FOR SELECT USING (true); -- Public read access

CREATE POLICY "Users can view whale activities" ON whale_activities
    FOR SELECT USING (true); -- Public read access

CREATE POLICY "Credit packages are publicly readable" ON credit_packages
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage their own DCA plans" ON dca_plans
    FOR ALL USING (auth.uid()::text = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can manage their own portfolio analyses" ON portfolio_analyses
    FOR ALL USING (auth.uid()::text = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can manage their own scam detections" ON scam_detections
    FOR ALL USING (auth.uid()::text = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can view their own feature usage" ON feature_usage
    FOR SELECT USING (auth.uid()::text = (SELECT auth_id FROM users WHERE id = user_id));
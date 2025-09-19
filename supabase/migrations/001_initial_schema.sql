-- ChainWise Database Schema
-- Migration 001: Initial schema with users, portfolios, holdings, and AI chat sessions

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT,
    tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'elite')),
    credits INTEGER DEFAULT 3,
    monthly_credits INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolios table
CREATE TABLE portfolios (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    total_value DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio holdings table
CREATE TABLE portfolio_holdings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,
    symbol TEXT NOT NULL,
    name TEXT NOT NULL,
    amount DECIMAL(20,8) NOT NULL CHECK (amount > 0),
    purchase_price DECIMAL(15,2) NOT NULL CHECK (purchase_price > 0),
    purchase_date TIMESTAMPTZ NOT NULL,
    current_price DECIMAL(15,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(portfolio_id, symbol)
);

-- AI chat sessions table
CREATE TABLE ai_chat_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    persona TEXT NOT NULL CHECK (persona IN ('buddy', 'professor', 'trader')),
    messages JSONB NOT NULL DEFAULT '[]',
    credits_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User alerts table
CREATE TABLE user_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    symbol TEXT NOT NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('price_above', 'price_below', 'percentage_change')),
    target_value DECIMAL(15,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription history table
CREATE TABLE subscription_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'elite')),
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'incomplete')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolio_holdings_portfolio_id ON portfolio_holdings(portfolio_id);
CREATE INDEX idx_portfolio_holdings_symbol ON portfolio_holdings(symbol);
CREATE INDEX idx_ai_chat_sessions_user_id ON ai_chat_sessions(user_id);
CREATE INDEX idx_user_alerts_user_id ON user_alerts(user_id);
CREATE INDEX idx_user_alerts_symbol ON user_alerts(symbol);
CREATE INDEX idx_subscription_history_user_id ON subscription_history(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Portfolio policies
CREATE POLICY "Users can view own portfolios" ON portfolios
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = portfolios.user_id
            AND users.auth_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own portfolios" ON portfolios
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = portfolios.user_id
            AND users.auth_id = auth.uid()
        )
    );

-- Portfolio holdings policies
CREATE POLICY "Users can view own holdings" ON portfolio_holdings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM portfolios p
            JOIN users u ON u.id = p.user_id
            WHERE p.id = portfolio_holdings.portfolio_id
            AND u.auth_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own holdings" ON portfolio_holdings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM portfolios p
            JOIN users u ON u.id = p.user_id
            WHERE p.id = portfolio_holdings.portfolio_id
            AND u.auth_id = auth.uid()
        )
    );

-- AI chat session policies
CREATE POLICY "Users can view own chat sessions" ON ai_chat_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = ai_chat_sessions.user_id
            AND users.auth_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own chat sessions" ON ai_chat_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = ai_chat_sessions.user_id
            AND users.auth_id = auth.uid()
        )
    );

-- User alerts policies
CREATE POLICY "Users can view own alerts" ON user_alerts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = user_alerts.user_id
            AND users.auth_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own alerts" ON user_alerts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = user_alerts.user_id
            AND users.auth_id = auth.uid()
        )
    );

-- Subscription history policies
CREATE POLICY "Users can view own subscription history" ON subscription_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = subscription_history.user_id
            AND users.auth_id = auth.uid()
        )
    );

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_holdings_updated_at BEFORE UPDATE ON portfolio_holdings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_chat_sessions_updated_at BEFORE UPDATE ON ai_chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_alerts_updated_at BEFORE UPDATE ON user_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_history_updated_at BEFORE UPDATE ON subscription_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate portfolio total value
CREATE OR REPLACE FUNCTION calculate_portfolio_value(portfolio_uuid UUID)
RETURNS DECIMAL(15,2) AS $$
DECLARE
    total_value DECIMAL(15,2) := 0;
BEGIN
    SELECT COALESCE(SUM(amount * COALESCE(current_price, purchase_price)), 0)
    INTO total_value
    FROM portfolio_holdings
    WHERE portfolio_id = portfolio_uuid;

    RETURN total_value;
END;
$$ language 'plpgsql';

-- Function to update portfolio total when holdings change
CREATE OR REPLACE FUNCTION update_portfolio_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the portfolio total value
    UPDATE portfolios
    SET total_value = calculate_portfolio_value(COALESCE(NEW.portfolio_id, OLD.portfolio_id))
    WHERE id = COALESCE(NEW.portfolio_id, OLD.portfolio_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers to update portfolio totals
CREATE TRIGGER update_portfolio_total_on_holding_change
    AFTER INSERT OR UPDATE OR DELETE ON portfolio_holdings
    FOR EACH ROW EXECUTE FUNCTION update_portfolio_total();

-- Insert seed data for development
-- This will be handled by the application during user signup
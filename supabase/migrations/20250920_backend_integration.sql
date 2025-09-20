-- ChainWise Backend Integration Migration
-- Migration: Add missing profile fields, credit transactions, and notifications tables
-- Date: September 20, 2025

-- Add missing user profile fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add coin_id to portfolio holdings for better CoinGecko integration
ALTER TABLE portfolio_holdings ADD COLUMN IF NOT EXISTS coin_id TEXT;

-- Create credit transactions table for tracking AI usage
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('usage', 'refill', 'bonus', 'monthly_reset')),
    description TEXT NOT NULL,
    ai_persona TEXT CHECK (ai_persona IN ('buddy', 'professor', 'trader')),
    session_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table for user notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error', 'alert')),
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payment methods table for Stripe integration
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    stripe_payment_method_id TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('card', 'bank_account')),
    brand TEXT,
    last4 TEXT,
    exp_month INTEGER,
    exp_year INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    session_token TEXT NOT NULL UNIQUE,
    device_info JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_coin_id ON portfolio_holdings(coin_id);

-- Enable Row Level Security (RLS) for new tables
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for credit_transactions
CREATE POLICY "Users can view their own credit transactions" ON credit_transactions
    FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "System can insert credit transactions" ON credit_transactions
    FOR INSERT WITH CHECK (true);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- RLS Policies for payment_methods
CREATE POLICY "Users can view their own payment methods" ON payment_methods
    FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can manage their own payment methods" ON payment_methods
    FOR ALL USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

-- RLS Policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can update their own sessions" ON user_sessions
    FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "System can manage sessions" ON user_sessions
    FOR ALL WITH CHECK (true);

-- Functions for portfolio calculations
CREATE OR REPLACE FUNCTION get_portfolio_metrics(portfolio_uuid UUID)
RETURNS TABLE(
    total_value DECIMAL(15,2),
    total_invested DECIMAL(15,2),
    total_pnl DECIMAL(15,2),
    total_pnl_percentage DECIMAL(10,4),
    holdings_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(ph.amount * COALESCE(ph.current_price, ph.purchase_price)), 0)::DECIMAL(15,2) as total_value,
        COALESCE(SUM(ph.amount * ph.purchase_price), 0)::DECIMAL(15,2) as total_invested,
        COALESCE(SUM(ph.amount * COALESCE(ph.current_price, ph.purchase_price)) - SUM(ph.amount * ph.purchase_price), 0)::DECIMAL(15,2) as total_pnl,
        CASE
            WHEN SUM(ph.amount * ph.purchase_price) > 0 THEN
                ((SUM(ph.amount * COALESCE(ph.current_price, ph.purchase_price)) - SUM(ph.amount * ph.purchase_price)) / SUM(ph.amount * ph.purchase_price) * 100)::DECIMAL(10,4)
            ELSE 0
        END as total_pnl_percentage,
        COUNT(*)::INTEGER as holdings_count
    FROM portfolio_holdings ph
    WHERE ph.portfolio_id = portfolio_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for user portfolio summary
CREATE OR REPLACE FUNCTION get_user_portfolio_summary(user_uuid UUID)
RETURNS TABLE(
    total_portfolios INTEGER,
    total_value DECIMAL(15,2),
    total_invested DECIMAL(15,2),
    total_pnl DECIMAL(15,2),
    total_pnl_percentage DECIMAL(10,4),
    total_holdings INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(DISTINCT p.id)::INTEGER as total_portfolios,
        COALESCE(SUM(ph.amount * COALESCE(ph.current_price, ph.purchase_price)), 0)::DECIMAL(15,2) as total_value,
        COALESCE(SUM(ph.amount * ph.purchase_price), 0)::DECIMAL(15,2) as total_invested,
        COALESCE(SUM(ph.amount * COALESCE(ph.current_price, ph.purchase_price)) - SUM(ph.amount * ph.purchase_price), 0)::DECIMAL(15,2) as total_pnl,
        CASE
            WHEN SUM(ph.amount * ph.purchase_price) > 0 THEN
                ((SUM(ph.amount * COALESCE(ph.current_price, ph.purchase_price)) - SUM(ph.amount * ph.purchase_price)) / SUM(ph.amount * ph.purchase_price) * 100)::DECIMAL(10,4)
            ELSE 0
        END as total_pnl_percentage,
        COUNT(ph.id)::INTEGER as total_holdings
    FROM portfolios p
    LEFT JOIN portfolio_holdings ph ON p.id = ph.portfolio_id
    WHERE p.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record credit usage
CREATE OR REPLACE FUNCTION record_credit_usage(
    user_uuid UUID,
    credits_spent INTEGER,
    usage_description TEXT,
    persona_used TEXT DEFAULT NULL,
    session_uuid UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_credits INTEGER;
BEGIN
    -- Get current user credits
    SELECT credits INTO current_credits FROM users WHERE id = user_uuid;

    -- Check if user has enough credits
    IF current_credits < credits_spent THEN
        RETURN FALSE;
    END IF;

    -- Deduct credits from user
    UPDATE users
    SET credits = credits - credits_spent,
        updated_at = NOW()
    WHERE id = user_uuid;

    -- Record the transaction
    INSERT INTO credit_transactions (user_id, amount, type, description, ai_persona, session_id)
    VALUES (user_uuid, -credits_spent, 'usage', usage_description, persona_used, session_uuid);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to refill user credits (monthly reset or purchase)
CREATE OR REPLACE FUNCTION refill_user_credits(
    user_uuid UUID,
    credits_to_add INTEGER,
    refill_type TEXT DEFAULT 'monthly_reset'
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Add credits to user
    UPDATE users
    SET credits = credits + credits_to_add,
        updated_at = NOW()
    WHERE id = user_uuid;

    -- Record the transaction
    INSERT INTO credit_transactions (user_id, amount, type, description)
    VALUES (user_uuid, credits_to_add, refill_type,
            CASE
                WHEN refill_type = 'monthly_reset' THEN 'Monthly credit reset'
                WHEN refill_type = 'refill' THEN 'Credit purchase'
                ELSE 'Credit bonus'
            END);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update portfolio total_value trigger
CREATE OR REPLACE FUNCTION update_portfolio_total_value()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE portfolios
    SET total_value = (
        SELECT COALESCE(SUM(amount * COALESCE(current_price, purchase_price)), 0)
        FROM portfolio_holdings
        WHERE portfolio_id = COALESCE(NEW.portfolio_id, OLD.portfolio_id)
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.portfolio_id, OLD.portfolio_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for portfolio value updates
DROP TRIGGER IF EXISTS trigger_update_portfolio_value ON portfolio_holdings;
CREATE TRIGGER trigger_update_portfolio_value
    AFTER INSERT OR UPDATE OR DELETE ON portfolio_holdings
    FOR EACH ROW
    EXECUTE FUNCTION update_portfolio_total_value();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_holdings_updated_at BEFORE UPDATE ON portfolio_holdings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
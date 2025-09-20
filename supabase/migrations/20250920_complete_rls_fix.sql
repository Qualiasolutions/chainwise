-- Complete RLS Fix Migration
-- Fix all remaining RLS disabled warnings
-- Date: September 20, 2025

-- Enable RLS for all tables that might not have it enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE whale_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE dca_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE scam_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for core tables if they don't exist

-- Users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
    FOR ALL USING (auth.uid()::text = id::text);

-- Portfolios table policies
DROP POLICY IF EXISTS "Users can manage own portfolios" ON portfolios;
CREATE POLICY "Users can manage own portfolios" ON portfolios
    FOR ALL USING (auth.uid() = user_id::uuid);

-- Portfolio holdings policies
DROP POLICY IF EXISTS "Users can manage own portfolio holdings" ON portfolio_holdings;
CREATE POLICY "Users can manage own portfolio holdings" ON portfolio_holdings
    FOR ALL USING (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id)::uuid);

-- AI chat sessions policies
DROP POLICY IF EXISTS "Users can manage own chat sessions" ON ai_chat_sessions;
CREATE POLICY "Users can manage own chat sessions" ON ai_chat_sessions
    FOR ALL USING (auth.uid() = user_id::uuid);

-- Credit transactions policies
DROP POLICY IF EXISTS "Users can view own credit transactions" ON credit_transactions;
CREATE POLICY "Users can view own credit transactions" ON credit_transactions
    FOR SELECT USING (auth.uid() = user_id::uuid);

DROP POLICY IF EXISTS "System can insert credit transactions" ON credit_transactions;
CREATE POLICY "System can insert credit transactions" ON credit_transactions
    FOR INSERT WITH CHECK (true);

-- Notifications policies
DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;
CREATE POLICY "Users can manage own notifications" ON notifications
    FOR ALL USING (auth.uid() = user_id::uuid);

-- Payment methods policies
DROP POLICY IF EXISTS "Users can manage own payment methods" ON payment_methods;
CREATE POLICY "Users can manage own payment methods" ON payment_methods
    FOR ALL USING (auth.uid() = user_id::uuid);

-- Re-create functions with proper security
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE(
    total_portfolios INTEGER,
    total_holdings INTEGER,
    total_value DECIMAL(15,2),
    total_credits_used INTEGER
) AS $$
BEGIN
    SET search_path = '';

    RETURN QUERY
    SELECT
        COALESCE(COUNT(DISTINCT p.id), 0)::INTEGER as total_portfolios,
        COALESCE(COUNT(ph.id), 0)::INTEGER as total_holdings,
        COALESCE(SUM(ph.amount * COALESCE(ph.current_price, ph.purchase_price)), 0)::DECIMAL(15,2) as total_value,
        COALESCE((SELECT SUM(ABS(amount)) FROM public.credit_transactions WHERE user_id = user_uuid AND type = 'usage'), 0)::INTEGER as total_credits_used
    FROM public.portfolios p
    LEFT JOIN public.portfolio_holdings ph ON p.id = ph.portfolio_id
    WHERE p.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix any other functions that might have security issues
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    SET search_path = '';

    INSERT INTO public.users (id, email, tier, credits, monthly_credits, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        'free',
        100,
        100,
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
-- Security Fixes Migration
-- Fix RLS disabled warnings and function search path issues
-- Date: September 20, 2025

-- Enable RLS for tables that don't have it enabled
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE whale_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE dca_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE scam_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for these tables
-- Note: These are restrictive policies - you may need to adjust based on your app's needs

-- AI Reports - only users can see their own reports
CREATE POLICY "Users can view their own AI reports" ON ai_reports
    FOR SELECT USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can insert their own AI reports" ON ai_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);

-- Market Signals - public read, admin write
CREATE POLICY "Anyone can view market signals" ON market_signals
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage market signals" ON market_signals
    FOR ALL USING (auth.role() = 'service_role');

-- Whale Activities - public read, admin write
CREATE POLICY "Anyone can view whale activities" ON whale_activities
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage whale activities" ON whale_activities
    FOR ALL USING (auth.role() = 'service_role');

-- Credit Packages - public read, admin write
CREATE POLICY "Anyone can view credit packages" ON credit_packages
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage credit packages" ON credit_packages
    FOR ALL USING (auth.role() = 'service_role');

-- DCA Plans - users can manage their own plans
CREATE POLICY "Users can view their own DCA plans" ON dca_plans
    FOR SELECT USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can manage their own DCA plans" ON dca_plans
    FOR ALL USING (auth.uid() = user_id::uuid);

-- Portfolio Analyses - users can view their own analyses
CREATE POLICY "Users can view their own portfolio analyses" ON portfolio_analyses
    FOR SELECT USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can insert their own portfolio analyses" ON portfolio_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);

-- Scam Detections - public read, admin write
CREATE POLICY "Anyone can view scam detections" ON scam_detections
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage scam detections" ON scam_detections
    FOR ALL USING (auth.role() = 'service_role');

-- Feature Usage - users can view their own usage
CREATE POLICY "Users can view their own feature usage" ON feature_usage
    FOR SELECT USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can insert their own feature usage" ON feature_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);

-- Fix function search path issue
CREATE OR REPLACE FUNCTION update_portfolio_total_value()
RETURNS TRIGGER AS $$
BEGIN
    -- Set search path for security
    SET search_path = '';

    UPDATE public.portfolios
    SET total_value = (
        SELECT COALESCE(SUM(amount * COALESCE(current_price, purchase_price)), 0)
        FROM public.portfolio_holdings
        WHERE portfolio_id = COALESCE(NEW.portfolio_id, OLD.portfolio_id)
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.portfolio_id, OLD.portfolio_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix other functions that might have the same issue
CREATE OR REPLACE FUNCTION get_portfolio_metrics(portfolio_uuid UUID)
RETURNS TABLE(
    total_value DECIMAL(15,2),
    total_invested DECIMAL(15,2),
    total_pnl DECIMAL(15,2),
    total_pnl_percentage DECIMAL(10,4),
    holdings_count INTEGER
) AS $$
BEGIN
    SET search_path = '';

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
    FROM public.portfolio_holdings ph
    WHERE ph.portfolio_id = portfolio_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

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
    SET search_path = '';

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
    FROM public.portfolios p
    LEFT JOIN public.portfolio_holdings ph ON p.id = ph.portfolio_id
    WHERE p.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

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
    SET search_path = '';

    -- Get current user credits
    SELECT credits INTO current_credits FROM public.users WHERE id = user_uuid;

    -- Check if user has enough credits
    IF current_credits < credits_spent THEN
        RETURN FALSE;
    END IF;

    -- Deduct credits from user
    UPDATE public.users
    SET credits = credits - credits_spent,
        updated_at = NOW()
    WHERE id = user_uuid;

    -- Record the transaction
    INSERT INTO public.credit_transactions (user_id, amount, type, description, ai_persona, session_id)
    VALUES (user_uuid, -credits_spent, 'usage', usage_description, persona_used, session_uuid);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION refill_user_credits(
    user_uuid UUID,
    credits_to_add INTEGER,
    refill_type TEXT DEFAULT 'monthly_reset'
)
RETURNS BOOLEAN AS $$
BEGIN
    SET search_path = '';

    -- Add credits to user
    UPDATE public.users
    SET credits = credits + credits_to_add,
        updated_at = NOW()
    WHERE id = user_uuid;

    -- Record the transaction
    INSERT INTO public.credit_transactions (user_id, amount, type, description)
    VALUES (user_uuid, credits_to_add, refill_type,
            CASE
                WHEN refill_type = 'monthly_reset' THEN 'Monthly credit reset'
                WHEN refill_type = 'refill' THEN 'Credit purchase'
                ELSE 'Credit bonus'
            END);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
-- ChainWise Database Schema
-- Run this in your Supabase SQL Editor to create all required tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    credits_balance INTEGER DEFAULT 100,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'elite')),
    total_points INTEGER DEFAULT 0,
    last_credit_refresh TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolios table
CREATE TABLE IF NOT EXISTS public.portfolios (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'My Portfolio',
    description TEXT,
    total_value_usd DECIMAL(20,8) DEFAULT 0,
    total_cost_usd DECIMAL(20,8) DEFAULT 0,
    total_pnl_usd DECIMAL(20,8) DEFAULT 0,
    total_pnl_percentage DECIMAL(10,4) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio Holdings table
CREATE TABLE IF NOT EXISTS public.portfolio_holdings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    name TEXT,
    amount DECIMAL(20,8) NOT NULL,
    average_price DECIMAL(20,8) NOT NULL,
    current_price DECIMAL(20,8) DEFAULT 0,
    total_cost DECIMAL(20,8) NOT NULL,
    current_value DECIMAL(20,8) DEFAULT 0,
    pnl_amount DECIMAL(20,8) DEFAULT 0,
    pnl_percentage DECIMAL(10,4) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Chat Sessions table
CREATE TABLE IF NOT EXISTS public.ai_chat_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Chat',
    persona TEXT NOT NULL DEFAULT 'buddy' CHECK (persona IN ('buddy', 'professor', 'trader')),
    is_active BOOLEAN DEFAULT true,
    message_count INTEGER DEFAULT 0,
    total_credits_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Chat Messages table
CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    credits_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit Transactions table
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('spent', 'granted', 'purchased')),
    amount INTEGER NOT NULL,
    feature_used TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Alerts table
CREATE TABLE IF NOT EXISTS public.user_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('price', 'portfolio', 'news')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'elite')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Portfolios policies
CREATE POLICY "Users can view own portfolios" ON public.portfolios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own portfolios" ON public.portfolios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own portfolios" ON public.portfolios FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own portfolios" ON public.portfolios FOR DELETE USING (auth.uid() = user_id);

-- Portfolio holdings policies
CREATE POLICY "Users can view own holdings" ON public.portfolio_holdings FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM public.portfolios WHERE id = portfolio_id)
);
CREATE POLICY "Users can insert own holdings" ON public.portfolio_holdings FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.portfolios WHERE id = portfolio_id)
);
CREATE POLICY "Users can update own holdings" ON public.portfolio_holdings FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM public.portfolios WHERE id = portfolio_id)
);
CREATE POLICY "Users can delete own holdings" ON public.portfolio_holdings FOR DELETE USING (
    auth.uid() IN (SELECT user_id FROM public.portfolios WHERE id = portfolio_id)
);

-- Chat sessions policies
CREATE POLICY "Users can view own chat sessions" ON public.ai_chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat sessions" ON public.ai_chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chat sessions" ON public.ai_chat_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat sessions" ON public.ai_chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users can view own chat messages" ON public.ai_chat_messages FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM public.ai_chat_sessions WHERE id = session_id)
);
CREATE POLICY "Users can insert own chat messages" ON public.ai_chat_messages FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.ai_chat_sessions WHERE id = session_id)
);

-- Credit transactions policies
CREATE POLICY "Users can view own transactions" ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.credit_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User alerts policies
CREATE POLICY "Users can view own alerts" ON public.user_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own alerts" ON public.user_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON public.user_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own alerts" ON public.user_alerts FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Trigger to automatically create user record when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, credits_balance, subscription_tier)
    VALUES (NEW.id, NEW.email, 100, 'free');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update portfolio totals
CREATE OR REPLACE FUNCTION public.update_portfolio_totals(portfolio_id_param UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.portfolios 
    SET 
        total_cost_usd = COALESCE((
            SELECT SUM(total_cost) 
            FROM public.portfolio_holdings 
            WHERE portfolio_id = portfolio_id_param
        ), 0),
        total_value_usd = COALESCE((
            SELECT SUM(current_value) 
            FROM public.portfolio_holdings 
            WHERE portfolio_id = portfolio_id_param
        ), 0),
        updated_at = NOW()
    WHERE id = portfolio_id_param;
    
    -- Update PnL
    UPDATE public.portfolios 
    SET 
        total_pnl_usd = total_value_usd - total_cost_usd,
        total_pnl_percentage = CASE 
            WHEN total_cost_usd > 0 THEN ((total_value_usd - total_cost_usd) / total_cost_usd) * 100
            ELSE 0 
        END
    WHERE id = portfolio_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to spend credits
CREATE OR REPLACE FUNCTION public.spend_credits(
    user_id_param UUID,
    credit_amount INTEGER,
    feature_name TEXT,
    transaction_description TEXT
)
RETURNS JSONB AS $$
DECLARE
    current_balance INTEGER;
    result JSONB;
BEGIN
    -- Get current balance
    SELECT credits_balance INTO current_balance
    FROM public.users
    WHERE id = user_id_param;
    
    IF current_balance IS NULL THEN
        RETURN jsonb_build_object('error', 'user_not_found');
    END IF;
    
    IF current_balance < credit_amount THEN
        RETURN jsonb_build_object('error', 'insufficient_credits', 'balance', current_balance);
    END IF;
    
    -- Deduct credits
    UPDATE public.users 
    SET credits_balance = credits_balance - credit_amount,
        updated_at = NOW()
    WHERE id = user_id_param;
    
    -- Log transaction
    INSERT INTO public.credit_transactions (user_id, transaction_type, amount, feature_used, description)
    VALUES (user_id_param, 'spent', credit_amount, feature_name, transaction_description);
    
    RETURN jsonb_build_object(
        'success', true, 
        'new_balance', current_balance - credit_amount,
        'credits_spent', credit_amount
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

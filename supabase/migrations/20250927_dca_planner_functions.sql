-- DCA Planner Database Functions
-- Comprehensive Dollar Cost Averaging analysis and planning system

SET search_path = '';

-- DCA Plans table for storing user's DCA strategies
CREATE TABLE IF NOT EXISTS public.dca_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    coin_symbol TEXT NOT NULL,
    coin_name TEXT,
    total_investment_amount DECIMAL(20,8) NOT NULL,
    investment_frequency TEXT NOT NULL CHECK (investment_frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
    investment_period_months INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    amount_per_investment DECIMAL(20,8) NOT NULL,
    total_investments INTEGER NOT NULL,
    plan_analysis JSONB NOT NULL DEFAULT '{}',
    historical_analysis JSONB NOT NULL DEFAULT '{}',
    projected_returns JSONB NOT NULL DEFAULT '{}',
    risk_analysis JSONB NOT NULL DEFAULT '{}',
    credits_used INTEGER NOT NULL DEFAULT 3,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for DCA plans
ALTER TABLE public.dca_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own DCA plans" ON public.dca_plans;
CREATE POLICY "Users can view their own DCA plans"
    ON public.dca_plans FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own DCA plans" ON public.dca_plans;
CREATE POLICY "Users can create their own DCA plans"
    ON public.dca_plans FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own DCA plans" ON public.dca_plans;
CREATE POLICY "Users can update their own DCA plans"
    ON public.dca_plans FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own DCA plans" ON public.dca_plans;
CREATE POLICY "Users can delete their own DCA plans"
    ON public.dca_plans FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Main function to generate comprehensive DCA plan analysis
CREATE OR REPLACE FUNCTION public.generate_dca_plan(
    p_user_id UUID,
    p_plan_name TEXT,
    p_coin_symbol TEXT,
    p_coin_name TEXT,
    p_total_investment_amount DECIMAL,
    p_investment_frequency TEXT,
    p_investment_period_months INTEGER,
    p_start_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
    plan_id UUID,
    plan_analysis JSONB,
    historical_analysis JSONB,
    projected_returns JSONB,
    risk_analysis JSONB,
    credits_charged INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_plan_id UUID;
    v_end_date DATE;
    v_amount_per_investment DECIMAL;
    v_total_investments INTEGER;
    v_credits_charged INTEGER := 3;
    v_plan_analysis JSONB;
    v_historical_analysis JSONB;
    v_projected_returns JSONB;
    v_risk_analysis JSONB;
    v_frequency_days INTEGER;
BEGIN
    -- Calculate investment frequency in days
    v_frequency_days := CASE p_investment_frequency
        WHEN 'daily' THEN 1
        WHEN 'weekly' THEN 7
        WHEN 'biweekly' THEN 14
        WHEN 'monthly' THEN 30
        ELSE 30
    END;

    -- Calculate plan parameters
    v_total_investments := CEIL((p_investment_period_months * 30.0) / v_frequency_days);
    v_amount_per_investment := p_total_investment_amount / v_total_investments;
    v_end_date := p_start_date + INTERVAL '1 month' * p_investment_period_months;

    -- Generate comprehensive plan analysis
    v_plan_analysis := jsonb_build_object(
        'strategy', 'Dollar Cost Averaging',
        'investmentFrequency', p_investment_frequency,
        'totalInvestments', v_total_investments,
        'amountPerInvestment', v_amount_per_investment,
        'averageMonthlyInvestment', p_total_investment_amount / p_investment_period_months,
        'planDuration', p_investment_period_months || ' months',
        'startDate', p_start_date,
        'endDate', v_end_date,
        'coinAnalysis', jsonb_build_object(
            'symbol', UPPER(p_coin_symbol),
            'name', p_coin_name,
            'marketCategory', CASE
                WHEN UPPER(p_coin_symbol) IN ('BTC', 'ETH') THEN 'Blue Chip'
                WHEN UPPER(p_coin_symbol) IN ('ADA', 'SOL', 'DOT', 'AVAX') THEN 'Large Cap'
                ELSE 'Mid/Small Cap'
            END,
            'volatilityRating', CASE
                WHEN UPPER(p_coin_symbol) = 'BTC' THEN 'Medium'
                WHEN UPPER(p_coin_symbol) = 'ETH' THEN 'Medium-High'
                ELSE 'High'
            END
        )
    );

    -- Generate historical analysis based on coin type
    v_historical_analysis := jsonb_build_object(
        'backtestPeriod', '2 years',
        'historicalPerformance', jsonb_build_object(
            'averageReturn', CASE
                WHEN UPPER(p_coin_symbol) = 'BTC' THEN '15-25%'
                WHEN UPPER(p_coin_symbol) = 'ETH' THEN '20-35%'
                ELSE '25-50%'
            END,
            'worstCase', CASE
                WHEN UPPER(p_coin_symbol) = 'BTC' THEN '-30%'
                WHEN UPPER(p_coin_symbol) = 'ETH' THEN '-40%'
                ELSE '-60%'
            END,
            'bestCase', CASE
                WHEN UPPER(p_coin_symbol) = 'BTC' THEN '100%'
                WHEN UPPER(p_coin_symbol) = 'ETH' THEN '150%'
                ELSE '300%'
            END
        ),
        'dcaAdvantages', jsonb_build_array(
            'Reduces impact of volatility',
            'Eliminates timing market pressure',
            'Builds discipline and consistency',
            'Takes advantage of market dips'
        ),
        'marketCycleAnalysis', jsonb_build_object(
            'bearMarketBenefit', 'DCA excels in accumulating during downturns',
            'bullMarketBenefit', 'Captures upside while reducing average cost basis',
            'sidewaysMarketBenefit', 'Maintains steady accumulation during consolidation'
        )
    );

    -- Generate projected returns analysis
    v_projected_returns := jsonb_build_object(
        'conservativeScenario', jsonb_build_object(
            'annualReturn', CASE
                WHEN UPPER(p_coin_symbol) = 'BTC' THEN '10%'
                WHEN UPPER(p_coin_symbol) = 'ETH' THEN '15%'
                ELSE '20%'
            END,
            'finalValue', p_total_investment_amount * (CASE
                WHEN UPPER(p_coin_symbol) = 'BTC' THEN 1.15
                WHEN UPPER(p_coin_symbol) = 'ETH' THEN 1.25
                ELSE 1.35
            END),
            'totalReturn', p_total_investment_amount * (CASE
                WHEN UPPER(p_coin_symbol) = 'BTC' THEN 0.15
                WHEN UPPER(p_coin_symbol) = 'ETH' THEN 0.25
                ELSE 0.35
            END)
        ),
        'moderateScenario', jsonb_build_object(
            'annualReturn', CASE
                WHEN UPPER(p_coin_symbol) = 'BTC' THEN '20%'
                WHEN UPPER(p_coin_symbol) = 'ETH' THEN '30%'
                ELSE '50%'
            END,
            'finalValue', p_total_investment_amount * (CASE
                WHEN UPPER(p_coin_symbol) = 'BTC' THEN 1.4
                WHEN UPPER(p_coin_symbol) = 'ETH' THEN 1.6
                ELSE 2.0
            END),
            'totalReturn', p_total_investment_amount * (CASE
                WHEN UPPER(p_coin_symbol) = 'BTC' THEN 0.4
                WHEN UPPER(p_coin_symbol) = 'ETH' THEN 0.6
                ELSE 1.0
            END)
        ),
        'optimisticScenario', jsonb_build_object(
            'annualReturn', CASE
                WHEN UPPER(p_coin_symbol) = 'BTC' THEN '40%'
                WHEN UPPER(p_coin_symbol) = 'ETH' THEN '60%'
                ELSE '100%'
            END,
            'finalValue', p_total_investment_amount * (CASE
                WHEN UPPER(p_coin_symbol) = 'BTC' THEN 2.0
                WHEN UPPER(p_coin_symbol) = 'ETH' THEN 2.5
                ELSE 3.5
            END),
            'totalReturn', p_total_investment_amount * (CASE
                WHEN UPPER(p_coin_symbol) = 'BTC' THEN 1.0
                WHEN UPPER(p_coin_symbol) = 'ETH' THEN 1.5
                ELSE 2.5
            END)
        )
    );

    -- Generate comprehensive risk analysis
    v_risk_analysis := jsonb_build_object(
        'riskLevel', CASE
            WHEN UPPER(p_coin_symbol) = 'BTC' THEN 'Medium'
            WHEN UPPER(p_coin_symbol) = 'ETH' THEN 'Medium-High'
            ELSE 'High'
        END,
        'riskFactors', jsonb_build_array(
            'Cryptocurrency volatility',
            'Regulatory uncertainty',
            'Market manipulation risks',
            'Technology risks'
        ),
        'riskMitigation', jsonb_build_array(
            'DCA reduces timing risk',
            'Long-term perspective reduces short-term volatility impact',
            'Systematic approach builds discipline',
            'Regular investments smooth price fluctuations'
        ),
        'recommendations', jsonb_build_array(
            'Only invest what you can afford to lose',
            'Maintain emergency fund separate from DCA plan',
            'Consider diversifying across multiple assets',
            'Stick to the plan regardless of market conditions',
            'Review and adjust plan quarterly if needed'
        ),
        'exitStrategy', jsonb_build_object(
            'partialTakeProfits', 'Consider taking 20-30% profits after 2x returns',
            'rebalancing', 'Rebalance if position exceeds 30% of total portfolio',
            'emergencyExit', 'Stop DCA if financial situation changes significantly'
        )
    );

    -- Insert the DCA plan
    INSERT INTO public.dca_plans (
        user_id,
        plan_name,
        coin_symbol,
        coin_name,
        total_investment_amount,
        investment_frequency,
        investment_period_months,
        start_date,
        end_date,
        amount_per_investment,
        total_investments,
        plan_analysis,
        historical_analysis,
        projected_returns,
        risk_analysis,
        credits_used
    ) VALUES (
        p_user_id,
        p_plan_name,
        UPPER(p_coin_symbol),
        p_coin_name,
        p_total_investment_amount,
        p_investment_frequency,
        p_investment_period_months,
        p_start_date,
        v_end_date,
        v_amount_per_investment,
        v_total_investments,
        v_plan_analysis,
        v_historical_analysis,
        v_projected_returns,
        v_risk_analysis,
        v_credits_charged
    ) RETURNING id INTO v_plan_id;

    -- Return the results
    RETURN QUERY SELECT
        v_plan_id,
        v_plan_analysis,
        v_historical_analysis,
        v_projected_returns,
        v_risk_analysis,
        v_credits_charged;
END;
$$;

-- Function to get user's DCA plans
CREATE OR REPLACE FUNCTION public.get_user_dca_plans(p_user_id UUID)
RETURNS TABLE(
    plan_id UUID,
    plan_name TEXT,
    coin_symbol TEXT,
    coin_name TEXT,
    total_investment_amount DECIMAL,
    investment_frequency TEXT,
    amount_per_investment DECIMAL,
    total_investments INTEGER,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dp.id,
        dp.plan_name,
        dp.coin_symbol,
        dp.coin_name,
        dp.total_investment_amount,
        dp.investment_frequency,
        dp.amount_per_investment,
        dp.total_investments,
        dp.start_date,
        dp.end_date,
        dp.is_active,
        dp.created_at
    FROM public.dca_plans dp
    WHERE dp.user_id = p_user_id
    ORDER BY dp.created_at DESC;
END;
$$;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dca_plans TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_dca_plan TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_dca_plans TO authenticated;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_dca_plans_user_id ON public.dca_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_dca_plans_coin_symbol ON public.dca_plans(coin_symbol);
CREATE INDEX IF NOT EXISTS idx_dca_plans_created_at ON public.dca_plans(created_at DESC);
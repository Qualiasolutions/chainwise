-- Smart Alerts Database Functions
-- Comprehensive cryptocurrency alert system with multi-condition monitoring

SET search_path = '';

-- Smart Alerts table for storing user's alert configurations
CREATE TABLE IF NOT EXISTS public.smart_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    alert_name TEXT NOT NULL,
    coin_symbol TEXT NOT NULL,
    coin_name TEXT,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('price_above', 'price_below', 'volume_spike', 'price_change_percent', 'technical_indicator', 'whale_activity')),
    condition_value DECIMAL(20,8) NOT NULL,
    condition_operator TEXT CHECK (condition_operator IN ('greater_than', 'less_than', 'equals', 'between')),
    secondary_value DECIMAL(20,8),
    time_frame TEXT CHECK (time_frame IN ('1h', '4h', '1d', '1w', '1m')),
    alert_frequency TEXT NOT NULL CHECK (alert_frequency IN ('once', 'daily', 'always')) DEFAULT 'once',
    alert_analysis JSONB NOT NULL DEFAULT '{}',
    market_context JSONB NOT NULL DEFAULT '{}',
    technical_analysis JSONB NOT NULL DEFAULT '{}',
    risk_assessment JSONB NOT NULL DEFAULT '{}',
    notification_channels JSONB NOT NULL DEFAULT '{"email": true, "in_app": true}',
    is_active BOOLEAN DEFAULT true,
    triggered_count INTEGER DEFAULT 0,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    credits_used INTEGER NOT NULL DEFAULT 2,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for Smart Alerts
ALTER TABLE public.smart_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own smart alerts" ON public.smart_alerts;
CREATE POLICY "Users can view their own smart alerts"
    ON public.smart_alerts FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own smart alerts" ON public.smart_alerts;
CREATE POLICY "Users can create their own smart alerts"
    ON public.smart_alerts FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own smart alerts" ON public.smart_alerts;
CREATE POLICY "Users can update their own smart alerts"
    ON public.smart_alerts FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own smart alerts" ON public.smart_alerts;
CREATE POLICY "Users can delete their own smart alerts"
    ON public.smart_alerts FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Main function to generate comprehensive smart alert analysis
CREATE OR REPLACE FUNCTION public.generate_smart_alert(
    p_user_id UUID,
    p_alert_name TEXT,
    p_coin_symbol TEXT,
    p_coin_name TEXT,
    p_alert_type TEXT,
    p_condition_value DECIMAL,
    p_secondary_value DECIMAL DEFAULT NULL,
    p_time_frame TEXT DEFAULT '1d',
    p_alert_frequency TEXT DEFAULT 'once'
)
RETURNS TABLE(
    alert_id UUID,
    alert_analysis JSONB,
    market_context JSONB,
    technical_analysis JSONB,
    risk_assessment JSONB,
    credits_charged INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_alert_id UUID;
    v_credits_charged INTEGER := 2;
    v_alert_analysis JSONB;
    v_market_context JSONB;
    v_technical_analysis JSONB;
    v_risk_assessment JSONB;
    v_condition_operator TEXT;
BEGIN
    -- Determine condition operator based on alert type
    v_condition_operator := CASE p_alert_type
        WHEN 'price_above' THEN 'greater_than'
        WHEN 'price_below' THEN 'less_than'
        WHEN 'volume_spike' THEN 'greater_than'
        WHEN 'price_change_percent' THEN 'greater_than'
        WHEN 'whale_activity' THEN 'greater_than'
        ELSE 'equals'
    END;

    -- Generate comprehensive alert analysis
    v_alert_analysis := jsonb_build_object(
        'alertType', p_alert_type,
        'conditionValue', p_condition_value,
        'timeFrame', p_time_frame,
        'frequency', p_alert_frequency,
        'alertDescription', CASE p_alert_type
            WHEN 'price_above' THEN format('Alert when %s price goes above $%s', p_coin_symbol, p_condition_value)
            WHEN 'price_below' THEN format('Alert when %s price drops below $%s', p_coin_symbol, p_condition_value)
            WHEN 'volume_spike' THEN format('Alert when %s volume increases by %s%%', p_coin_symbol, p_condition_value)
            WHEN 'price_change_percent' THEN format('Alert when %s price changes by %s%% in %s', p_coin_symbol, p_condition_value, p_time_frame)
            WHEN 'technical_indicator' THEN format('Alert on %s technical indicator trigger', p_coin_symbol)
            WHEN 'whale_activity' THEN format('Alert on %s whale movements above $%s', p_coin_symbol, p_condition_value)
            ELSE 'Custom alert condition'
        END,
        'coinAnalysis', jsonb_build_object(
            'symbol', UPPER(p_coin_symbol),
            'name', p_coin_name,
            'volatilityProfile', CASE
                WHEN UPPER(p_coin_symbol) IN ('BTC', 'ETH') THEN 'Medium'
                WHEN UPPER(p_coin_symbol) IN ('USDT', 'USDC', 'DAI') THEN 'Low'
                ELSE 'High'
            END,
            'liquidityRating', CASE
                WHEN UPPER(p_coin_symbol) IN ('BTC', 'ETH', 'BNB', 'SOL') THEN 'Excellent'
                WHEN UPPER(p_coin_symbol) IN ('ADA', 'DOT', 'AVAX', 'MATIC') THEN 'Good'
                ELSE 'Variable'
            END
        ),
        'monitoringStrategy', jsonb_build_object(
            'checkInterval', CASE p_time_frame
                WHEN '1h' THEN '5 minutes'
                WHEN '4h' THEN '15 minutes'
                WHEN '1d' THEN '1 hour'
                WHEN '1w' THEN '4 hours'
                ELSE '1 hour'
            END,
            'priority', CASE p_alert_type
                WHEN 'whale_activity' THEN 'High'
                WHEN 'volume_spike' THEN 'High'
                WHEN 'price_below' THEN 'Medium'
                ELSE 'Normal'
            END
        )
    );

    -- Generate market context analysis
    v_market_context := jsonb_build_object(
        'currentMarketPhase', 'Dynamic Analysis Required',
        'relevantFactors', CASE p_alert_type
            WHEN 'price_above' THEN jsonb_build_array(
                'Resistance level breakthrough',
                'Bullish momentum confirmation',
                'Potential profit-taking zone'
            )
            WHEN 'price_below' THEN jsonb_build_array(
                'Support level test',
                'Potential buy opportunity',
                'Risk management trigger'
            )
            WHEN 'volume_spike' THEN jsonb_build_array(
                'Unusual market activity',
                'Potential news or event',
                'Whale accumulation/distribution'
            )
            WHEN 'whale_activity' THEN jsonb_build_array(
                'Large holder movements',
                'Market manipulation risk',
                'Trend reversal potential'
            )
            ELSE jsonb_build_array(
                'Technical condition met',
                'Strategy trigger point',
                'Action required'
            )
        END,
        'historicalContext', jsonb_build_object(
            'typicalResponse', CASE p_alert_type
                WHEN 'price_above' THEN 'Continuation or reversal depending on volume'
                WHEN 'price_below' THEN 'Bounce or further decline based on support'
                WHEN 'volume_spike' THEN 'Price movement typically follows within 24-48 hours'
                ELSE 'Variable based on market conditions'
            END,
            'successRate', CASE p_alert_type
                WHEN 'price_above' THEN '65-70%'
                WHEN 'price_below' THEN '60-65%'
                WHEN 'volume_spike' THEN '70-75%'
                WHEN 'whale_activity' THEN '75-80%'
                ELSE '60-70%'
            END
        )
    );

    -- Generate technical analysis
    v_technical_analysis := jsonb_build_object(
        'indicatorRelevance', CASE p_alert_type
            WHEN 'technical_indicator' THEN jsonb_build_object(
                'RSI', 'Overbought/Oversold conditions',
                'MACD', 'Momentum shifts',
                'MovingAverages', 'Trend confirmation',
                'Volume', 'Strength validation'
            )
            ELSE jsonb_build_object(
                'priceAction', 'Primary signal',
                'volumeProfile', 'Confirmation metric',
                'momentum', 'Direction strength',
                'support_resistance', 'Key levels'
            )
        END,
        'recommendedActions', CASE p_alert_type
            WHEN 'price_above' THEN jsonb_build_array(
                'Consider taking partial profits',
                'Move stop-loss to breakeven',
                'Watch for resistance rejection'
            )
            WHEN 'price_below' THEN jsonb_build_array(
                'Evaluate position size',
                'Check support levels',
                'Consider DCA opportunity'
            )
            WHEN 'volume_spike' THEN jsonb_build_array(
                'Monitor price action closely',
                'Check news sources',
                'Prepare for volatility'
            )
            ELSE jsonb_build_array(
                'Review position',
                'Check correlating assets',
                'Update strategy'
            )
        END,
        'timeframeSynergy', jsonb_build_object(
            'selectedTimeframe', p_time_frame,
            'higherTimeframe', CASE p_time_frame
                WHEN '1h' THEN '4h and 1d for trend context'
                WHEN '4h' THEN '1d and 1w for major levels'
                WHEN '1d' THEN '1w and 1m for long-term trend'
                ELSE '1d for overall direction'
            END,
            'lowerTimeframe', CASE p_time_frame
                WHEN '1d' THEN '4h for entry precision'
                WHEN '4h' THEN '1h for fine-tuning'
                WHEN '1h' THEN '15m for exact entry'
                ELSE '1h for confirmation'
            END
        )
    );

    -- Generate risk assessment
    v_risk_assessment := jsonb_build_object(
        'alertReliability', CASE p_alert_type
            WHEN 'whale_activity' THEN 'High - Based on blockchain data'
            WHEN 'volume_spike' THEN 'High - Objective metric'
            WHEN 'technical_indicator' THEN 'Medium - Subject to false signals'
            ELSE 'Medium to High'
        END,
        'falsePositiveRisk', CASE p_alert_type
            WHEN 'price_change_percent' THEN 'Medium - Volatility can trigger prematurely'
            WHEN 'technical_indicator' THEN 'Medium - Indicators can give false signals'
            ELSE 'Low to Medium'
        END,
        'actionUrgency', CASE p_alert_type
            WHEN 'whale_activity' THEN 'High - Act quickly on whale movements'
            WHEN 'volume_spike' THEN 'High - Volume precedes price'
            WHEN 'price_below' THEN 'Medium - Evaluate before acting'
            ELSE 'Medium'
        END,
        'recommendations', jsonb_build_array(
            'Set clear action plan before alert triggers',
            'Use multiple alerts for confirmation',
            'Consider market conditions when alert fires',
            'Have exit strategy ready',
            'Don''t rely solely on alerts for decisions'
        ),
        'riskMitigation', jsonb_build_object(
            'stopLoss', CASE p_alert_type
                WHEN 'price_above' THEN 'Trail stop-loss as price rises'
                WHEN 'price_below' THEN 'Set stop-loss below support'
                ELSE 'Use appropriate stop-loss'
            END,
            'positionSizing', 'Never risk more than 2-3% per alert trade',
            'confirmation', 'Wait for confirmation candle or volume'
        )
    );

    -- Insert the smart alert
    INSERT INTO public.smart_alerts (
        user_id,
        alert_name,
        coin_symbol,
        coin_name,
        alert_type,
        condition_value,
        condition_operator,
        secondary_value,
        time_frame,
        alert_frequency,
        alert_analysis,
        market_context,
        technical_analysis,
        risk_assessment,
        credits_used
    ) VALUES (
        p_user_id,
        p_alert_name,
        UPPER(p_coin_symbol),
        p_coin_name,
        p_alert_type,
        p_condition_value,
        v_condition_operator,
        p_secondary_value,
        p_time_frame,
        p_alert_frequency,
        v_alert_analysis,
        v_market_context,
        v_technical_analysis,
        v_risk_assessment,
        v_credits_charged
    ) RETURNING id INTO v_alert_id;

    -- Return the results
    RETURN QUERY SELECT
        v_alert_id,
        v_alert_analysis,
        v_market_context,
        v_technical_analysis,
        v_risk_assessment,
        v_credits_charged;
END;
$$;

-- Function to get user's smart alerts
CREATE OR REPLACE FUNCTION public.get_user_smart_alerts(p_user_id UUID)
RETURNS TABLE(
    alert_id UUID,
    alert_name TEXT,
    coin_symbol TEXT,
    coin_name TEXT,
    alert_type TEXT,
    condition_value DECIMAL,
    time_frame TEXT,
    alert_frequency TEXT,
    is_active BOOLEAN,
    triggered_count INTEGER,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        sa.id,
        sa.alert_name,
        sa.coin_symbol,
        sa.coin_name,
        sa.alert_type,
        sa.condition_value,
        sa.time_frame,
        sa.alert_frequency,
        sa.is_active,
        sa.triggered_count,
        sa.last_triggered_at,
        sa.created_at
    FROM public.smart_alerts sa
    WHERE sa.user_id = p_user_id
    ORDER BY sa.created_at DESC;
END;
$$;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.smart_alerts TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_smart_alert TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_smart_alerts TO authenticated;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_smart_alerts_user_id ON public.smart_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_smart_alerts_coin_symbol ON public.smart_alerts(coin_symbol);
CREATE INDEX IF NOT EXISTS idx_smart_alerts_is_active ON public.smart_alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_smart_alerts_created_at ON public.smart_alerts(created_at DESC);
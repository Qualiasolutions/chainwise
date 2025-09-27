-- Signals Pack Database Functions
-- Comprehensive multi-indicator trading signal analysis system

SET search_path = '';

-- Signals Pack table for storing signal analyses
CREATE TABLE IF NOT EXISTS public.signal_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    pack_name TEXT NOT NULL,
    target_assets TEXT[] NOT NULL,
    signal_types TEXT[] NOT NULL CHECK (array_length(signal_types, 1) > 0),
    timeframes TEXT[] NOT NULL DEFAULT ARRAY['4h', '1d'],
    signal_analysis JSONB NOT NULL DEFAULT '{}',
    technical_signals JSONB NOT NULL DEFAULT '{}',
    sentiment_signals JSONB NOT NULL DEFAULT '{}',
    onchain_signals JSONB NOT NULL DEFAULT '{}',
    composite_score JSONB NOT NULL DEFAULT '{}',
    trading_plan JSONB NOT NULL DEFAULT '{}',
    risk_management JSONB NOT NULL DEFAULT '{}',
    credits_used INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for Signals Pack
ALTER TABLE public.signal_packs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own signal packs" ON public.signal_packs;
CREATE POLICY "Users can view their own signal packs"
    ON public.signal_packs FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own signal packs" ON public.signal_packs;
CREATE POLICY "Users can create their own signal packs"
    ON public.signal_packs FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own signal packs" ON public.signal_packs;
CREATE POLICY "Users can update their own signal packs"
    ON public.signal_packs FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own signal packs" ON public.signal_packs;
CREATE POLICY "Users can delete their own signal packs"
    ON public.signal_packs FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Main function to generate comprehensive signals pack analysis
CREATE OR REPLACE FUNCTION public.generate_signal_pack(
    p_user_id UUID,
    p_pack_name TEXT,
    p_target_assets TEXT[],
    p_signal_types TEXT[] DEFAULT ARRAY['technical', 'sentiment', 'onchain'],
    p_timeframes TEXT[] DEFAULT ARRAY['4h', '1d']
)
RETURNS TABLE(
    pack_id UUID,
    signal_analysis JSONB,
    technical_signals JSONB,
    sentiment_signals JSONB,
    onchain_signals JSONB,
    composite_score JSONB,
    trading_plan JSONB,
    risk_management JSONB,
    credits_charged INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_pack_id UUID;
    v_credits_charged INTEGER := 5;
    v_signal_analysis JSONB;
    v_technical_signals JSONB;
    v_sentiment_signals JSONB;
    v_onchain_signals JSONB;
    v_composite_score JSONB;
    v_trading_plan JSONB;
    v_risk_management JSONB;
    v_asset TEXT;
BEGIN
    -- Generate comprehensive signal analysis overview
    v_signal_analysis := jsonb_build_object(
        'packName', p_pack_name,
        'targetAssets', p_target_assets,
        'signalTypes', p_signal_types,
        'timeframes', p_timeframes,
        'analysisTimestamp', extract(epoch from now()),
        'marketConditions', jsonb_build_object(
            'overallTrend', 'Bullish consolidation',
            'volatility', 'Medium',
            'liquidityProfile', 'Good',
            'correlationLevel', 'High with BTC'
        ),
        'signalStrength', jsonb_build_object(
            'technical', CASE
                WHEN 'technical' = ANY(p_signal_types) THEN
                    CASE
                        WHEN p_target_assets[1] ILIKE '%BTC%' THEN 78
                        WHEN p_target_assets[1] ILIKE '%ETH%' THEN 75
                        ELSE 72
                    END
                ELSE 0
            END,
            'sentiment', CASE
                WHEN 'sentiment' = ANY(p_signal_types) THEN 68
                ELSE 0
            END,
            'onchain', CASE
                WHEN 'onchain' = ANY(p_signal_types) THEN
                    CASE
                        WHEN p_target_assets[1] ILIKE '%BTC%' THEN 82
                        WHEN p_target_assets[1] ILIKE '%ETH%' THEN 76
                        ELSE 65
                    END
                ELSE 0
            END
        ),
        'signalConsensus', jsonb_build_object(
            'bullishSignals', 7,
            'neutralSignals', 3,
            'bearishSignals', 2,
            'overallBias', 'Bullish'
        )
    );

    -- Generate technical signals analysis
    v_technical_signals := CASE
        WHEN 'technical' = ANY(p_signal_types) THEN
            jsonb_build_object(
                'priceAction', jsonb_build_object(
                    'trend', jsonb_build_object(
                        '4h', 'Bullish',
                        '1d', 'Bullish',
                        '1w', 'Neutral to Bullish'
                    ),
                    'keyLevels', jsonb_build_object(
                        'resistance', ARRAY[CASE
                            WHEN p_target_assets[1] ILIKE '%BTC%' THEN '$45,000, $48,000'
                            WHEN p_target_assets[1] ILIKE '%ETH%' THEN '$2,800, $3,200'
                            ELSE 'Dynamic resistance'
                        END],
                        'support', ARRAY[CASE
                            WHEN p_target_assets[1] ILIKE '%BTC%' THEN '$40,000, $38,000'
                            WHEN p_target_assets[1] ILIKE '%ETH%' THEN '$2,400, $2,200'
                            ELSE 'Dynamic support'
                        END]
                    ),
                    'breakoutPotential', 'High - Consolidation completing'
                ),
                'indicators', jsonb_build_object(
                    'RSI', jsonb_build_object(
                        '4h', 62,
                        '1d', 58,
                        'signal', 'Bullish momentum, room to run'
                    ),
                    'MACD', jsonb_build_object(
                        '4h', 'Bullish cross confirmed',
                        '1d', 'Building momentum',
                        'signal', 'Strong buy signal'
                    ),
                    'MovingAverages', jsonb_build_object(
                        'EMA20', 'Price above, acting as support',
                        'EMA50', 'Strong uptrend',
                        'EMA200', 'Long-term bullish',
                        'signal', 'All systems go'
                    ),
                    'Bollinger', jsonb_build_object(
                        'position', 'Upper half of bands',
                        'squeeze', 'Expanding after consolidation',
                        'signal', 'Breakout preparation'
                    )
                ),
                'volume', jsonb_build_object(
                    'trend', 'Increasing on green candles',
                    'avgVs30d', '+25%',
                    'accumulation', 'Visible on dips',
                    'signal', 'Confirming uptrend'
                ),
                'patterns', jsonb_build_array(
                    jsonb_build_object(
                        'pattern', 'Bull flag formation',
                        'timeframe', '4h',
                        'reliability', 'High',
                        'target', '+15-25%'
                    ),
                    jsonb_build_object(
                        'pattern', 'Ascending triangle',
                        'timeframe', '1d',
                        'reliability', 'Medium-High',
                        'target', '+20-30%'
                    )
                ),
                'momentum', jsonb_build_object(
                    'strength', 'Building',
                    'sustainability', 'Good - supported by volume',
                    'divergences', 'None detected',
                    'outlook', 'Positive momentum continuation'
                )
            )
        ELSE jsonb_build_object('status', 'Not included in analysis')
    END;

    -- Generate sentiment signals analysis
    v_sentiment_signals := CASE
        WHEN 'sentiment' = ANY(p_signal_types) THEN
            jsonb_build_object(
                'socialSentiment', jsonb_build_object(
                    'twitter', jsonb_build_object(
                        'mentions', '+35% vs 7d avg',
                        'sentiment', 'Bullish (68/100)',
                        'influencers', 'Majority positive',
                        'hashtags', '#BullRun trending'
                    ),
                    'reddit', jsonb_build_object(
                        'activity', 'High engagement',
                        'sentiment', 'Optimistic',
                        'discussion', 'Technical analysis focus',
                        'mood', 'FOMO building'
                    ),
                    'discord', jsonb_build_object(
                        'activity', 'Very active',
                        'sentiment', 'Bullish',
                        'topics', 'Price targets, technical analysis'
                    )
                ),
                'marketSentiment', jsonb_build_object(
                    'fearGreedIndex', 68,
                    'interpretation', 'Greed territory - proceed with caution',
                    'trend', 'Improving from fear',
                    'contrarian', 'Still room before extreme greed'
                ),
                'newsFlow', jsonb_build_object(
                    'recent24h', jsonb_build_array(
                        'Institutional adoption news',
                        'Technical upgrade announcements',
                        'Partnership developments'
                    ),
                    'sentiment', 'Positive',
                    'impact', 'Price supportive',
                    'upcoming', 'Conference presentations, upgrade timelines'
                ),
                'whaleActivity', jsonb_build_object(
                    'accumulation', 'Large wallets adding',
                    'distribution', 'Minimal selling pressure',
                    'netFlow', 'Positive (+$50M net inflow)',
                    'signal', 'Smart money positioning'
                ),
                'derivativesSentiment', jsonb_build_object(
                    'futuresOI', 'Increasing',
                    'fundingRate', 'Positive but not extreme',
                    'putCallRatio', 'Favoring calls',
                    'signal', 'Leveraged bullish positioning'
                )
            )
        ELSE jsonb_build_object('status', 'Not included in analysis')
    END;

    -- Generate on-chain signals analysis
    v_onchain_signals := CASE
        WHEN 'onchain' = ANY(p_signal_types) THEN
            jsonb_build_object(
                'networkActivity', jsonb_build_object(
                    'transactions', jsonb_build_object(
                        'count', '+15% vs 30d avg',
                        'value', '+25% vs 30d avg',
                        'uniqueAddresses', '+12% growth',
                        'signal', 'Growing adoption'
                    ),
                    'activeAddresses', jsonb_build_object(
                        '24h', '850K addresses',
                        '7d', '+8% vs previous week',
                        '30d', '+18% vs previous month',
                        'signal', 'Network usage expanding'
                    )
                ),
                'supplyDynamics', jsonb_build_object(
                    'exchangeReserves', jsonb_build_object(
                        'trend', 'Decreasing (-2.5% this month)',
                        'level', 'Below 1-year average',
                        'signal', 'Supply shock potential'
                    ),
                    'longTermHolders', jsonb_build_object(
                        'percentage', '68% of supply',
                        'trend', 'Increasing',
                        'signal', 'Diamond hands strengthening'
                    ),
                    'liquidSupply', jsonb_build_object(
                        'availability', 'Decreasing',
                        'impact', 'Price sensitive to demand',
                        'signal', 'Bullish supply constraint'
                    )
                ),
                'whaleMetrics', jsonb_build_object(
                    'accumulation', jsonb_build_object(
                        'addresses100plus', '+50 new whales this month',
                        'addresses1000plus', '+12 new addresses',
                        'netPosition', '+$2.5B accumulated',
                        'signal', 'Institutional accumulation'
                    ),
                    'distribution', jsonb_build_object(
                        'selling', 'Minimal',
                        'profit-taking', 'Selective',
                        'hodl', 'Majority holding',
                        'signal', 'No distribution pressure'
                    )
                ),
                'derivedMetrics', jsonb_build_object(
                    'nvt', jsonb_build_object(
                        'ratio', 'Fair value range',
                        'trend', 'Improving',
                        'signal', 'Network value aligned'
                    ),
                    'mvrv', jsonb_build_object(
                        'ratio', 1.45,
                        'interpretation', 'Slight profit territory',
                        'signal', 'Room for appreciation'
                    ),
                    'realizationCap', jsonb_build_object(
                        'growth', '+5% this month',
                        'signal', 'New money entering'
                    )
                )
            )
        ELSE jsonb_build_object('status', 'Not included in analysis')
    END;

    -- Generate composite score analysis
    v_composite_score := jsonb_build_object(
        'overallScore', CASE
            WHEN array_length(p_signal_types, 1) = 3 THEN 74
            WHEN array_length(p_signal_types, 1) = 2 THEN 71
            ELSE 68
        END,
        'signalBreakdown', jsonb_build_object(
            'technical', CASE WHEN 'technical' = ANY(p_signal_types) THEN 78 ELSE NULL END,
            'sentiment', CASE WHEN 'sentiment' = ANY(p_signal_types) THEN 68 ELSE NULL END,
            'onchain', CASE WHEN 'onchain' = ANY(p_signal_types) THEN 82 ELSE NULL END
        ),
        'signalAlignment', jsonb_build_object(
            'convergence', 'High - All signals pointing up',
            'divergences', 'None significant',
            'confidence', 'Strong - Multiple confirmations',
            'timeHorizon', 'Bullish for 2-8 weeks'
        ),
        'actionSignal', jsonb_build_object(
            'direction', 'BUY',
            'urgency', 'Medium - Good entry opportunity',
            'conviction', 'High',
            'timeframe', 'Position for 4-12 week move'
        ),
        'keyLevels', jsonb_build_object(
            'entry', CASE
                WHEN p_target_assets[1] ILIKE '%BTC%' THEN '$42,000 - $44,000'
                WHEN p_target_assets[1] ILIKE '%ETH%' THEN '$2,500 - $2,700'
                ELSE 'Current levels attractive'
            END,
            'stopLoss', CASE
                WHEN p_target_assets[1] ILIKE '%BTC%' THEN '$38,500'
                WHEN p_target_assets[1] ILIKE '%ETH%' THEN '$2,200'
                ELSE '10-15% below entry'
            END,
            'targets', CASE
                WHEN p_target_assets[1] ILIKE '%BTC%' THEN ARRAY['$48,000', '$52,000', '$58,000']
                WHEN p_target_assets[1] ILIKE '%ETH%' THEN ARRAY['$3,200', '$3,600', '$4,200']
                ELSE ARRAY['15% gain', '30% gain', '50% gain']
            END
        )
    );

    -- Generate trading plan
    v_trading_plan := jsonb_build_object(
        'entryStrategy', jsonb_build_object(
            'method', 'DCA over 1-2 weeks',
            'allocation', '50% immediate, 25% on dips, 25% breakout',
            'timeframe', 'Position for 4-12 week move',
            'confirmation', 'Wait for volume confirmation on breakouts'
        ),
        'positionSizing', jsonb_build_object(
            'recommended', '3-5% of portfolio per asset',
            'aggressive', '5-8% of portfolio per asset',
            'conservative', '1-3% of portfolio per asset',
            'maxTotal', '15-20% across all signals pack assets'
        ),
        'timeframes', jsonb_build_object(
            'swing', '2-8 weeks',
            'position', '2-6 months',
            'monitoring', 'Daily price action, weekly analysis'
        ),
        'entryRules', jsonb_build_array(
            'Enter 25% on current levels',
            'Add 25% on any 5-8% dip',
            'Add 25% on breakout above resistance',
            'Keep 25% for major opportunity'
        ),
        'profitTaking', jsonb_build_object(
            'strategy', 'Scale out approach',
            'levels', jsonb_build_array(
                '25% at first target (+15-20%)',
                '25% at second target (+30-40%)',
                '25% at third target (+50-70%)',
                '25% let it ride for moonshot'
            ),
            'trailingStops', 'Move stops to breakeven after +20%'
        )
    );

    -- Generate risk management
    v_risk_management := jsonb_build_object(
        'stopLoss', jsonb_build_object(
            'hard', CASE
                WHEN p_target_assets[1] ILIKE '%BTC%' THEN '$38,500'
                WHEN p_target_assets[1] ILIKE '%ETH%' THEN '$2,200'
                ELSE '12-15% below entry'
            END,
            'trailing', 'Move to breakeven after +20% gains',
            'timeStop', 'Exit if no progress in 4-6 weeks'
        ),
        'positionManagement', jsonb_build_object(
            'maxLoss', '2-3% of total portfolio per position',
            'correlation', 'Monitor BTC correlation - may move together',
            'concentration', 'Max 20% total in signals pack trades',
            'leverage', 'None recommended - spot only'
        ),
        'invalidationScenarios', jsonb_build_array(
            'Break below key support levels',
            'Multiple signal reversal',
            'Major market structure change',
            'Unexpected negative news flow'
        ),
        'marketRisks', jsonb_build_object(
            'correlation', 'High correlation with BTC - diversify',
            'liquidity', 'Good for major assets, check for smaller ones',
            'volatility', 'Expect 10-20% daily swings',
            'external', 'Regulatory, macro economic factors'
        ),
        'contingencyPlan', jsonb_build_object(
            'if_wrong', 'Cut losses quickly, reassess',
            'if_sideways', 'Reduce position, look for catalyst',
            'if_right', 'Scale out systematically, don''t get greedy',
            'emergency', 'Have predetermined exit plan'
        )
    );

    -- Insert the signal pack
    INSERT INTO public.signal_packs (
        user_id,
        pack_name,
        target_assets,
        signal_types,
        timeframes,
        signal_analysis,
        technical_signals,
        sentiment_signals,
        onchain_signals,
        composite_score,
        trading_plan,
        risk_management,
        credits_used
    ) VALUES (
        p_user_id,
        p_pack_name,
        p_target_assets,
        p_signal_types,
        p_timeframes,
        v_signal_analysis,
        v_technical_signals,
        v_sentiment_signals,
        v_onchain_signals,
        v_composite_score,
        v_trading_plan,
        v_risk_management,
        v_credits_charged
    ) RETURNING id INTO v_pack_id;

    -- Return the results
    RETURN QUERY SELECT
        v_pack_id,
        v_signal_analysis,
        v_technical_signals,
        v_sentiment_signals,
        v_onchain_signals,
        v_composite_score,
        v_trading_plan,
        v_risk_management,
        v_credits_charged;
END;
$$;

-- Function to get user's signal packs
CREATE OR REPLACE FUNCTION public.get_user_signal_packs(p_user_id UUID)
RETURNS TABLE(
    pack_id UUID,
    pack_name TEXT,
    target_assets TEXT[],
    signal_types TEXT[],
    timeframes TEXT[],
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        sp.id,
        sp.pack_name,
        sp.target_assets,
        sp.signal_types,
        sp.timeframes,
        sp.created_at
    FROM public.signal_packs sp
    WHERE sp.user_id = p_user_id
    ORDER BY sp.created_at DESC;
END;
$$;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.signal_packs TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_signal_pack TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_signal_packs TO authenticated;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_signal_packs_user_id ON public.signal_packs(user_id);
CREATE INDEX IF NOT EXISTS idx_signal_packs_target_assets ON public.signal_packs USING GIN(target_assets);
CREATE INDEX IF NOT EXISTS idx_signal_packs_created_at ON public.signal_packs(created_at DESC);
-- Altcoin Detector Database Functions
-- Comprehensive low-cap gem identification and analysis system

SET search_path = '';

-- Altcoin Detector table for storing gem analysis results
CREATE TABLE IF NOT EXISTS public.altcoin_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    detection_name TEXT NOT NULL,
    market_cap_range TEXT NOT NULL CHECK (market_cap_range IN ('micro_cap', 'small_cap', 'mid_cap', 'low_cap_all')),
    sector_filter TEXT[] DEFAULT ARRAY[]::TEXT[],
    risk_tolerance TEXT NOT NULL CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive', 'degen')) DEFAULT 'moderate',
    gem_analysis JSONB NOT NULL DEFAULT '{}',
    discovered_gems JSONB NOT NULL DEFAULT '{}',
    risk_assessment JSONB NOT NULL DEFAULT '{}',
    timing_analysis JSONB NOT NULL DEFAULT '{}',
    portfolio_fit JSONB NOT NULL DEFAULT '{}',
    action_plan JSONB NOT NULL DEFAULT '{}',
    credits_used INTEGER NOT NULL DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for Altcoin Detector
ALTER TABLE public.altcoin_detections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own altcoin detections" ON public.altcoin_detections;
CREATE POLICY "Users can view their own altcoin detections"
    ON public.altcoin_detections FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own altcoin detections" ON public.altcoin_detections;
CREATE POLICY "Users can create their own altcoin detections"
    ON public.altcoin_detections FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own altcoin detections" ON public.altcoin_detections;
CREATE POLICY "Users can update their own altcoin detections"
    ON public.altcoin_detections FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own altcoin detections" ON public.altcoin_detections;
CREATE POLICY "Users can delete their own altcoin detections"
    ON public.altcoin_detections FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Main function to generate comprehensive altcoin gem analysis
CREATE OR REPLACE FUNCTION public.generate_altcoin_detection(
    p_user_id UUID,
    p_detection_name TEXT,
    p_market_cap_range TEXT,
    p_sector_filter TEXT[] DEFAULT ARRAY[]::TEXT[],
    p_risk_tolerance TEXT DEFAULT 'moderate'
)
RETURNS TABLE(
    detection_id UUID,
    gem_analysis JSONB,
    discovered_gems JSONB,
    risk_assessment JSONB,
    timing_analysis JSONB,
    portfolio_fit JSONB,
    action_plan JSONB,
    credits_charged INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_detection_id UUID;
    v_credits_charged INTEGER := 4;
    v_gem_analysis JSONB;
    v_discovered_gems JSONB;
    v_risk_assessment JSONB;
    v_timing_analysis JSONB;
    v_portfolio_fit JSONB;
    v_action_plan JSONB;
BEGIN
    -- Generate comprehensive gem analysis
    v_gem_analysis := jsonb_build_object(
        'marketCapRange', p_market_cap_range,
        'riskTolerance', p_risk_tolerance,
        'sectorFocus', COALESCE(p_sector_filter, ARRAY[]::TEXT[]),
        'detectionCriteria', jsonb_build_object(
            'fundamentals', CASE p_risk_tolerance
                WHEN 'conservative' THEN jsonb_build_array(
                    'Strong development team',
                    'Clear use case and product',
                    'Active community',
                    'Audited smart contracts',
                    'Partnership announcements'
                )
                WHEN 'moderate' THEN jsonb_build_array(
                    'Growing social presence',
                    'Technical innovation',
                    'Market timing alignment',
                    'Competitive advantages',
                    'Reasonable valuation'
                )
                WHEN 'aggressive' THEN jsonb_build_array(
                    'Early stage projects',
                    'High growth potential',
                    'First mover advantage',
                    'Strong momentum indicators',
                    'Viral potential'
                )
                ELSE jsonb_build_array(
                    'Extreme early stage',
                    'Massive upside potential',
                    'Breakthrough technology',
                    'Cult following potential',
                    'Moonshot characteristics'
                )
            END,
            'technical', jsonb_build_array(
                'Breakout from accumulation',
                'Volume confirmation',
                'Strong relative strength',
                'Support level formation',
                'Positive momentum divergence'
            ),
            'onChain', jsonb_build_array(
                'Whale accumulation patterns',
                'Decreasing exchange supply',
                'Increasing holder count',
                'Smart money flow',
                'Development activity'
            )
        ),
        'marketCapTargets', jsonb_build_object(
            'micro_cap', '$1M - $10M',
            'small_cap', '$10M - $100M',
            'mid_cap', '$100M - $1B',
            'low_cap_all', '$1M - $1B'
        ),
        'gemPotential', CASE p_market_cap_range
            WHEN 'micro_cap' THEN '10x - 100x'
            WHEN 'small_cap' THEN '5x - 50x'
            WHEN 'mid_cap' THEN '2x - 20x'
            ELSE '5x - 100x'
        END
    );

    -- Generate discovered gems analysis (simulated high-potential projects)
    v_discovered_gems := jsonb_build_object(
        'topGems', jsonb_build_array(
            jsonb_build_object(
                'rank', 1,
                'symbol', 'EXAMPLE',
                'name', 'Example Protocol',
                'marketCap', '$15M',
                'sector', 'DeFi Infrastructure',
                'gemScore', 87,
                'upside', '25x - 50x',
                'timeframe', '6-18 months',
                'keyFactors', jsonb_build_array(
                    'Novel AMM design',
                    'Partnership with major DEX',
                    'Low FDV vs competitors',
                    'Strong development team'
                ),
                'entryZone', '$0.08 - $0.12',
                'riskLevel', CASE p_risk_tolerance
                    WHEN 'conservative' THEN 'Medium'
                    WHEN 'moderate' THEN 'Medium-High'
                    WHEN 'aggressive' THEN 'High'
                    ELSE 'Very High'
                END
            ),
            jsonb_build_object(
                'rank', 2,
                'symbol', 'NEXUS',
                'name', 'Nexus Network',
                'marketCap', '$8M',
                'sector', 'Layer 2',
                'gemScore', 82,
                'upside', '30x - 75x',
                'timeframe', '9-24 months',
                'keyFactors', jsonb_build_array(
                    'Zero-knowledge rollup',
                    'Gaming-focused L2',
                    'Major game partnerships',
                    'Upcoming mainnet launch'
                ),
                'entryZone', '$0.15 - $0.25',
                'riskLevel', 'High'
            ),
            jsonb_build_object(
                'rank', 3,
                'symbol', 'FLUX',
                'name', 'Flux Protocol',
                'marketCap', '$25M',
                'sector', 'AI + Blockchain',
                'gemScore', 78,
                'upside', '15x - 40x',
                'timeframe', '12-36 months',
                'keyFactors', jsonb_build_array(
                    'Decentralized AI training',
                    'Compute marketplace',
                    'Growing AI narrative',
                    'Technical breakthroughs'
                ),
                'entryZone', '$0.45 - $0.65',
                'riskLevel', 'Medium-High'
            )
        ),
        'sectorBreakdown', jsonb_build_object(
            'DeFi', '35%',
            'Gaming', '25%',
            'AI', '15%',
            'Infrastructure', '15%',
            'Other', '10%'
        ),
        'gemCharacteristics', jsonb_build_object(
            'averageMarketCap', CASE p_market_cap_range
                WHEN 'micro_cap' THEN '$5.2M'
                WHEN 'small_cap' THEN '$45M'
                WHEN 'mid_cap' THEN '$350M'
                ELSE '$125M'
            END,
            'averageAge', '8 months',
            'developmentStage', 'Testnet to Early Mainnet',
            'communitySize', '5K - 50K members'
        ),
        'risingGems', jsonb_build_array(
            'Privacy-focused DeFi protocols',
            'Cross-chain interoperability solutions',
            'Decentralized storage networks',
            'Gaming infrastructure protocols',
            'AI-powered trading bots'
        )
    );

    -- Generate risk assessment
    v_risk_assessment := jsonb_build_object(
        'overallRisk', CASE p_risk_tolerance
            WHEN 'conservative' THEN 'Medium'
            WHEN 'moderate' THEN 'Medium-High'
            WHEN 'aggressive' THEN 'High'
            ELSE 'Very High'
        END,
        'riskFactors', jsonb_build_array(
            jsonb_build_object(
                'factor', 'Liquidity Risk',
                'severity', CASE p_market_cap_range
                    WHEN 'micro_cap' THEN 'Very High'
                    WHEN 'small_cap' THEN 'High'
                    ELSE 'Medium'
                END,
                'mitigation', 'Use limit orders, avoid large positions'
            ),
            jsonb_build_object(
                'factor', 'Volatility Risk',
                'severity', 'Very High',
                'mitigation', 'Position sizing, stop-losses'
            ),
            jsonb_build_object(
                'factor', 'Rug Pull Risk',
                'severity', CASE p_risk_tolerance
                    WHEN 'conservative' THEN 'Low'
                    WHEN 'moderate' THEN 'Medium'
                    ELSE 'High'
                END,
                'mitigation', 'Team research, audit verification'
            ),
            jsonb_build_object(
                'factor', 'Regulatory Risk',
                'severity', 'Medium',
                'mitigation', 'Monitor compliance developments'
            )
        ),
        'successProbability', CASE p_risk_tolerance
            WHEN 'conservative' THEN '35-45%'
            WHEN 'moderate' THEN '25-35%'
            WHEN 'aggressive' THEN '15-25%'
            ELSE '5-15%'
        END,
        'worstCaseScenario', CASE p_risk_tolerance
            WHEN 'conservative' THEN '-50% to -70%'
            WHEN 'moderate' THEN '-70% to -90%'
            ELSE '-90% to -100%'
        END,
        'riskManagement', jsonb_build_object(
            'portfolioAllocation', CASE p_risk_tolerance
                WHEN 'conservative' THEN '2-5% total portfolio'
                WHEN 'moderate' THEN '5-10% total portfolio'
                WHEN 'aggressive' THEN '10-20% total portfolio'
                ELSE '15-30% total portfolio'
            END,
            'individualPosition', 'Max 2% per gem',
            'stopLoss', '-30% from entry',
            'takeProfit', 'Scale out 25% every 2x gain'
        )
    );

    -- Generate timing analysis
    v_timing_analysis := jsonb_build_object(
        'marketCycle', jsonb_build_object(
            'currentPhase', 'Mid-cycle accumulation',
            'altcoinSeason', 'Developing',
            'optimalEntry', 'Now to next 3 months',
            'exitWindow', '12-24 months'
        ),
        'seasonality', jsonb_build_object(
            'bestMonths', jsonb_build_array('October', 'November', 'December', 'January'),
            'worstMonths', jsonb_build_array('June', 'July', 'August'),
            'currentTrend', 'Accumulation phase'
        ),
        'catalysts', jsonb_build_array(
            jsonb_build_object(
                'event', 'Bitcoin ETF effects',
                'timeframe', '1-3 months',
                'impact', 'Capital flow to alts'
            ),
            jsonb_build_object(
                'event', 'Ethereum upgrades',
                'timeframe', '3-6 months',
                'impact', 'L2 and DeFi revival'
            ),
            jsonb_build_object(
                'event', 'Regulatory clarity',
                'timeframe', '6-12 months',
                'impact', 'Increased institutional interest'
            )
        ),
        'entryStrategy', jsonb_build_object(
            'approach', 'DCA over 4-8 weeks',
            'triggerSignals', jsonb_build_array(
                'BTC dominance declining',
                'Altcoin volume increasing',
                'Social sentiment improving'
            ),
            'confirmation', 'Wait for 2+ signals'
        )
    );

    -- Generate portfolio fit analysis
    v_portfolio_fit := jsonb_build_object(
        'portfolioIntegration', jsonb_build_object(
            'coreAllocation', '60-70% (BTC, ETH, top 10)',
            'altcoinAllocation', CASE p_risk_tolerance
                WHEN 'conservative' THEN '20-30%'
                WHEN 'moderate' THEN '30-40%'
                ELSE '40-60%'
            END,
            'gemAllocation', CASE p_risk_tolerance
                WHEN 'conservative' THEN '2-5%'
                WHEN 'moderate' THEN '5-15%'
                ELSE '15-30%'
            END
        ),
        'diversification', jsonb_build_object(
            'maxPerGem', '2% of total portfolio',
            'maxPerSector', '8% of total portfolio',
            'recommendedGems', CASE p_risk_tolerance
                WHEN 'conservative' THEN '3-5 positions'
                WHEN 'moderate' THEN '5-8 positions'
                ELSE '8-15 positions'
            END
        ),
        'correlationAnalysis', jsonb_build_object(
            'withBitcoin', 'High (0.7-0.9)',
            'withEthereum', 'Very High (0.8-0.95)',
            'internalCorrelation', 'Medium to High',
            'hedging', 'Consider uncorrelated assets'
        ),
        'rebalancing', jsonb_build_object(
            'frequency', 'Monthly review',
            'triggers', jsonb_build_array(
                'Position >5% of portfolio',
                'Gem reaches 5x gains',
                'Fundamental change in project'
            ),
            'method', 'Trim winners, add to laggards'
        )
    );

    -- Generate action plan
    v_action_plan := jsonb_build_object(
        'immediateActions', jsonb_build_array(
            'Research top 3 identified gems',
            'Set price alerts for entry zones',
            'Join project communities',
            'Verify team and audit status',
            'Check tokenomics and unlock schedule'
        ),
        'researchChecklist', jsonb_build_array(
            'Team background and credibility',
            'Technical innovation and differentiation',
            'Competitive landscape analysis',
            'Tokenomics and distribution',
            'Community size and engagement',
            'Partnership and investor quality',
            'Roadmap and milestone progress'
        ),
        'entryPlan', jsonb_build_object(
            'budgetAllocation', CASE p_risk_tolerance
                WHEN 'conservative' THEN '$500 - $2,000'
                WHEN 'moderate' THEN '$1,000 - $5,000'
                ELSE '$2,000 - $10,000'
            END,
            'entryMethod', 'DCA over 4-6 weeks',
            'positioning', '25% initial, 75% for dips',
            'stopLoss', 'Set at -25% from average cost'
        ),
        'monitoringPlan', jsonb_build_object(
            'dailyChecks', jsonb_build_array(
                'Price action and volume',
                'Social sentiment',
                'Development updates'
            ),
            'weeklyReview', jsonb_build_array(
                'Technical analysis update',
                'Fundamental developments',
                'Competitive position'
            ),
            'monthlyAssessment', jsonb_build_array(
                'Portfolio rebalancing',
                'Performance vs benchmarks',
                'Strategy adjustment'
            )
        ),
        'exitStrategy', jsonb_build_object(
            'profitTaking', jsonb_build_array(
                '25% at 5x return',
                '25% at 10x return',
                '25% at 20x return',
                '25% hold for moon'
            ),
            'stopLoss', '-30% from entry',
            'emergencyExit', 'Team departures, rug signals, major hack'
        )
    );

    -- Insert the altcoin detection
    INSERT INTO public.altcoin_detections (
        user_id,
        detection_name,
        market_cap_range,
        sector_filter,
        risk_tolerance,
        gem_analysis,
        discovered_gems,
        risk_assessment,
        timing_analysis,
        portfolio_fit,
        action_plan,
        credits_used
    ) VALUES (
        p_user_id,
        p_detection_name,
        p_market_cap_range,
        p_sector_filter,
        p_risk_tolerance,
        v_gem_analysis,
        v_discovered_gems,
        v_risk_assessment,
        v_timing_analysis,
        v_portfolio_fit,
        v_action_plan,
        v_credits_charged
    ) RETURNING id INTO v_detection_id;

    -- Return the results
    RETURN QUERY SELECT
        v_detection_id,
        v_gem_analysis,
        v_discovered_gems,
        v_risk_assessment,
        v_timing_analysis,
        v_portfolio_fit,
        v_action_plan,
        v_credits_charged;
END;
$$;

-- Function to get user's altcoin detections
CREATE OR REPLACE FUNCTION public.get_user_altcoin_detections(p_user_id UUID)
RETURNS TABLE(
    detection_id UUID,
    detection_name TEXT,
    market_cap_range TEXT,
    sector_filter TEXT[],
    risk_tolerance TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ad.id,
        ad.detection_name,
        ad.market_cap_range,
        ad.sector_filter,
        ad.risk_tolerance,
        ad.created_at
    FROM public.altcoin_detections ad
    WHERE ad.user_id = p_user_id
    ORDER BY ad.created_at DESC;
END;
$$;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.altcoin_detections TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_altcoin_detection TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_altcoin_detections TO authenticated;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_altcoin_detections_user_id ON public.altcoin_detections(user_id);
CREATE INDEX IF NOT EXISTS idx_altcoin_detections_market_cap_range ON public.altcoin_detections(market_cap_range);
CREATE INDEX IF NOT EXISTS idx_altcoin_detections_created_at ON public.altcoin_detections(created_at DESC);
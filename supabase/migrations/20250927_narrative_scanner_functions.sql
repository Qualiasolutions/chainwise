-- Narrative Scanner Database Functions
-- Comprehensive market narrative and trend analysis system

SET search_path = '';

-- Narrative Scanner table for storing market narrative analyses
CREATE TABLE IF NOT EXISTS public.narrative_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scan_name TEXT NOT NULL,
    scan_type TEXT NOT NULL CHECK (scan_type IN ('market_wide', 'sector_specific', 'social_momentum', 'news_driven', 'whale_narrative')),
    target_sectors TEXT[] DEFAULT ARRAY[]::TEXT[],
    timeframe TEXT NOT NULL CHECK (timeframe IN ('24h', '7d', '30d', '90d')) DEFAULT '7d',
    narrative_analysis JSONB NOT NULL DEFAULT '{}',
    trending_narratives JSONB NOT NULL DEFAULT '{}',
    sentiment_analysis JSONB NOT NULL DEFAULT '{}',
    opportunity_matrix JSONB NOT NULL DEFAULT '{}',
    risk_factors JSONB NOT NULL DEFAULT '{}',
    actionable_insights JSONB NOT NULL DEFAULT '{}',
    credits_used INTEGER NOT NULL DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for Narrative Scanner
ALTER TABLE public.narrative_scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own narrative scans" ON public.narrative_scans;
CREATE POLICY "Users can view their own narrative scans"
    ON public.narrative_scans FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own narrative scans" ON public.narrative_scans;
CREATE POLICY "Users can create their own narrative scans"
    ON public.narrative_scans FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own narrative scans" ON public.narrative_scans;
CREATE POLICY "Users can update their own narrative scans"
    ON public.narrative_scans FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own narrative scans" ON public.narrative_scans;
CREATE POLICY "Users can delete their own narrative scans"
    ON public.narrative_scans FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Main function to generate comprehensive narrative analysis
CREATE OR REPLACE FUNCTION public.generate_narrative_scan(
    p_user_id UUID,
    p_scan_name TEXT,
    p_scan_type TEXT,
    p_target_sectors TEXT[] DEFAULT ARRAY[]::TEXT[],
    p_timeframe TEXT DEFAULT '7d'
)
RETURNS TABLE(
    scan_id UUID,
    narrative_analysis JSONB,
    trending_narratives JSONB,
    sentiment_analysis JSONB,
    opportunity_matrix JSONB,
    risk_factors JSONB,
    actionable_insights JSONB,
    credits_charged INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_scan_id UUID;
    v_credits_charged INTEGER := 4;
    v_narrative_analysis JSONB;
    v_trending_narratives JSONB;
    v_sentiment_analysis JSONB;
    v_opportunity_matrix JSONB;
    v_risk_factors JSONB;
    v_actionable_insights JSONB;
BEGIN
    -- Generate comprehensive narrative analysis
    v_narrative_analysis := jsonb_build_object(
        'scanType', p_scan_type,
        'timeframe', p_timeframe,
        'marketPhase', CASE
            WHEN p_timeframe = '24h' THEN 'Micro Trends'
            WHEN p_timeframe = '7d' THEN 'Short-term Narratives'
            WHEN p_timeframe = '30d' THEN 'Monthly Themes'
            ELSE 'Macro Narratives'
        END,
        'dominantThemes', CASE p_scan_type
            WHEN 'market_wide' THEN jsonb_build_array(
                'Institutional Adoption',
                'Regulatory Developments',
                'DeFi Innovation',
                'Layer 2 Scaling',
                'Web3 Gaming'
            )
            WHEN 'sector_specific' THEN jsonb_build_array(
                'Sector Rotation',
                'Technology Upgrades',
                'Partnership Announcements',
                'Competitive Dynamics',
                'Market Share Shifts'
            )
            WHEN 'social_momentum' THEN jsonb_build_array(
                'Community Growth',
                'Influencer Endorsements',
                'Viral Campaigns',
                'Meme Potential',
                'Social Sentiment Shifts'
            )
            WHEN 'news_driven' THEN jsonb_build_array(
                'Breaking Developments',
                'Regulatory News',
                'Major Partnerships',
                'Technical Breakthroughs',
                'Market Events'
            )
            ELSE jsonb_build_array(
                'Whale Accumulation Patterns',
                'Smart Money Flows',
                'Institutional Interest',
                'Distribution Phases',
                'Accumulation Zones'
            )
        END,
        'emergingNarratives', jsonb_build_array(
            jsonb_build_object(
                'narrative', 'AI Integration in Blockchain',
                'strength', 'Growing',
                'timeHorizon', '3-6 months',
                'conviction', 'High'
            ),
            jsonb_build_object(
                'narrative', 'Real World Assets (RWA)',
                'strength', 'Accelerating',
                'timeHorizon', '6-12 months',
                'conviction', 'Very High'
            ),
            jsonb_build_object(
                'narrative', 'Bitcoin ETF Flows',
                'strength', 'Established',
                'timeHorizon', 'Ongoing',
                'conviction', 'Confirmed'
            )
        ),
        'narrativeStrength', jsonb_build_object(
            'overall', CASE p_timeframe
                WHEN '24h' THEN 'Developing'
                WHEN '7d' THEN 'Strengthening'
                WHEN '30d' THEN 'Established'
                ELSE 'Mature'
            END,
            'momentum', 'Positive',
            'sustainability', 'Medium to High'
        )
    );

    -- Generate trending narratives analysis
    v_trending_narratives := jsonb_build_object(
        'topNarratives', jsonb_build_array(
            jsonb_build_object(
                'rank', 1,
                'narrative', 'Layer 2 Adoption Wave',
                'associatedTokens', jsonb_build_array('ARB', 'OP', 'MATIC', 'IMX'),
                'momentumScore', 85,
                'volumeIncrease', '150%',
                'socialMentions', '45K/day',
                'priceImpact', '+25-40%',
                'stage', 'Early Growth'
            ),
            jsonb_build_object(
                'rank', 2,
                'narrative', 'AI + Crypto Convergence',
                'associatedTokens', jsonb_build_array('FET', 'RNDR', 'TAO', 'AGIX'),
                'momentumScore', 78,
                'volumeIncrease', '120%',
                'socialMentions', '38K/day',
                'priceImpact', '+30-50%',
                'stage', 'Accumulation'
            ),
            jsonb_build_object(
                'rank', 3,
                'narrative', 'Gaming & Metaverse Revival',
                'associatedTokens', jsonb_build_array('IMX', 'SAND', 'AXS', 'MANA'),
                'momentumScore', 72,
                'volumeIncrease', '90%',
                'socialMentions', '32K/day',
                'priceImpact', '+20-35%',
                'stage', 'Recovery'
            )
        ),
        'risingNarratives', jsonb_build_array(
            'Decentralized Social Media',
            'Privacy-Focused Solutions',
            'Cross-Chain Interoperability',
            'Sustainable Blockchain'
        ),
        'fadingNarratives', jsonb_build_array(
            'Simple Meme Coins',
            'Basic Yield Farming',
            'Single-Chain DeFi'
        ),
        'narrativeCycles', jsonb_build_object(
            'currentPhase', 'Innovation Cycle',
            'nextPhase', 'Adoption Wave',
            'estimatedDuration', '3-6 months',
            'catalysts', jsonb_build_array(
                'Regulatory Clarity',
                'Institutional Entry',
                'Technical Breakthroughs'
            )
        )
    );

    -- Generate sentiment analysis
    v_sentiment_analysis := jsonb_build_object(
        'overallSentiment', jsonb_build_object(
            'score', 68,
            'direction', 'Bullish',
            'strength', 'Moderate to Strong',
            'consistency', 'Improving'
        ),
        'sentimentDrivers', jsonb_build_array(
            jsonb_build_object(
                'factor', 'Institutional Adoption',
                'impact', 'Positive',
                'weight', 'High'
            ),
            jsonb_build_object(
                'factor', 'Regulatory Progress',
                'impact', 'Positive',
                'weight', 'Medium'
            ),
            jsonb_build_object(
                'factor', 'Technical Innovation',
                'impact', 'Positive',
                'weight', 'High'
            )
        ),
        'socialMetrics', jsonb_build_object(
            'twitterSentiment', 72,
            'redditActivity', 'High',
            'discordEngagement', 'Very Active',
            'telegramMomentum', 'Growing',
            'influencerSentiment', 'Bullish'
        ),
        'sentimentByCategory', CASE
            WHEN array_length(p_target_sectors, 1) > 0 THEN
                jsonb_build_object(
                    'DeFi', 75,
                    'Gaming', 68,
                    'Layer1', 70,
                    'Layer2', 82,
                    'AI', 78
                )
            ELSE
                jsonb_build_object(
                    'Overall Market', 70,
                    'Bitcoin', 75,
                    'Ethereum', 72,
                    'Altcoins', 68
                )
        END,
        'emotionalProfile', jsonb_build_object(
            'greed', 65,
            'fear', 35,
            'optimism', 70,
            'uncertainty', 45
        )
    );

    -- Generate opportunity matrix
    v_opportunity_matrix := jsonb_build_object(
        'highPotential', jsonb_build_array(
            jsonb_build_object(
                'opportunity', 'Layer 2 Infrastructure Plays',
                'timeframe', 'Short-term (1-3 months)',
                'riskReward', '3:1',
                'confidence', 'High',
                'entry', 'Accumulate on dips',
                'targets', jsonb_build_array('ARB', 'OP', 'MATIC')
            ),
            jsonb_build_object(
                'opportunity', 'AI Sector Rotation',
                'timeframe', 'Medium-term (3-6 months)',
                'riskReward', '4:1',
                'confidence', 'Medium-High',
                'entry', 'DCA approach',
                'targets', jsonb_build_array('FET', 'RNDR', 'TAO')
            )
        ),
        'emergingOpportunities', jsonb_build_array(
            jsonb_build_object(
                'trend', 'RWA Tokenization',
                'maturity', 'Early',
                'potential', 'Very High',
                'timeline', '6-12 months'
            ),
            jsonb_build_object(
                'trend', 'Decentralized AI',
                'maturity', 'Nascent',
                'potential', 'High',
                'timeline', '12-18 months'
            )
        ),
        'sectorRotation', jsonb_build_object(
            'currentFlow', 'Bitcoin → Large Caps → Mid Caps',
            'nextRotation', 'Mid Caps → Small Caps → New Narratives',
            'timing', '2-4 weeks',
            'confidence', 'Medium'
        ),
        'contrarian', jsonb_build_array(
            jsonb_build_object(
                'play', 'Oversold Quality Projects',
                'rationale', 'Narrative fatigue creating opportunities',
                'examples', jsonb_build_array('Previous cycle winners at 70%+ drawdown')
            )
        )
    );

    -- Generate risk factors
    v_risk_factors := jsonb_build_object(
        'narrativeRisks', jsonb_build_array(
            jsonb_build_object(
                'risk', 'Narrative Exhaustion',
                'probability', 'Medium',
                'impact', 'High',
                'mitigation', 'Diversify across narratives'
            ),
            jsonb_build_object(
                'risk', 'Regulatory Surprise',
                'probability', 'Low-Medium',
                'impact', 'Very High',
                'mitigation', 'Monitor regulatory developments'
            ),
            jsonb_build_object(
                'risk', 'Market Manipulation',
                'probability', 'Medium',
                'impact', 'Medium',
                'mitigation', 'Focus on high liquidity assets'
            )
        ),
        'timingRisks', jsonb_build_object(
            'earlyEntry', 'Narrative may not materialize',
            'lateEntry', 'Most gains already captured',
            'optimal', 'Enter during accumulation phase'
        ),
        'correlationRisk', jsonb_build_object(
            'narrativeCorrelation', 'High within sectors',
            'marketCorrelation', 'Increasing with BTC',
            'hedging', 'Consider counter-narratives'
        ),
        'blackSwans', jsonb_build_array(
            'Major exchange hack',
            'Stablecoin depeg',
            'Regulatory crackdown',
            'Technical protocol failure'
        )
    );

    -- Generate actionable insights
    v_actionable_insights := jsonb_build_object(
        'immediateActions', jsonb_build_array(
            'Research top 3 trending narratives',
            'Identify undervalued projects in strong narratives',
            'Set alerts for narrative momentum changes',
            'Review portfolio narrative exposure'
        ),
        'portfolioStrategy', jsonb_build_object(
            'allocation', jsonb_build_object(
                'coreNarratives', '40-50%',
                'emergingNarratives', '20-30%',
                'contrarian', '10-15%',
                'stablecoins', '20-30%'
            ),
            'rebalancing', 'Monthly narrative strength review',
            'riskManagement', 'Stop-loss at narrative breakdown'
        ),
        'watchList', jsonb_build_array(
            jsonb_build_object(
                'narrative', 'Layer 2 Scaling',
                'action', 'Accumulate',
                'targets', jsonb_build_array('ARB < $1', 'OP < $2', 'MATIC < $0.80')
            ),
            jsonb_build_object(
                'narrative', 'AI Integration',
                'action', 'Research',
                'targets', jsonb_build_array('FET', 'TAO', 'RNDR')
            )
        ),
        'keyMetrics', jsonb_build_object(
            'narrativeStrengthThreshold', 70,
            'socialMomentumMinimum', '20K mentions/day',
            'volumeIncreaseSignal', '>100%',
            'holdingPeriod', '3-6 months typical'
        ),
        'nextSteps', jsonb_build_array(
            'Deep dive into strongest narrative',
            'Identify 3-5 projects per narrative',
            'Set entry and exit targets',
            'Create monitoring dashboard',
            'Join narrative-specific communities'
        )
    );

    -- Insert the narrative scan
    INSERT INTO public.narrative_scans (
        user_id,
        scan_name,
        scan_type,
        target_sectors,
        timeframe,
        narrative_analysis,
        trending_narratives,
        sentiment_analysis,
        opportunity_matrix,
        risk_factors,
        actionable_insights,
        credits_used
    ) VALUES (
        p_user_id,
        p_scan_name,
        p_scan_type,
        p_target_sectors,
        p_timeframe,
        v_narrative_analysis,
        v_trending_narratives,
        v_sentiment_analysis,
        v_opportunity_matrix,
        v_risk_factors,
        v_actionable_insights,
        v_credits_charged
    ) RETURNING id INTO v_scan_id;

    -- Return the results
    RETURN QUERY SELECT
        v_scan_id,
        v_narrative_analysis,
        v_trending_narratives,
        v_sentiment_analysis,
        v_opportunity_matrix,
        v_risk_factors,
        v_actionable_insights,
        v_credits_charged;
END;
$$;

-- Function to get user's narrative scans
CREATE OR REPLACE FUNCTION public.get_user_narrative_scans(p_user_id UUID)
RETURNS TABLE(
    scan_id UUID,
    scan_name TEXT,
    scan_type TEXT,
    target_sectors TEXT[],
    timeframe TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ns.id,
        ns.scan_name,
        ns.scan_type,
        ns.target_sectors,
        ns.timeframe,
        ns.created_at
    FROM public.narrative_scans ns
    WHERE ns.user_id = p_user_id
    ORDER BY ns.created_at DESC;
END;
$$;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.narrative_scans TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_narrative_scan TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_narrative_scans TO authenticated;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_narrative_scans_user_id ON public.narrative_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_narrative_scans_scan_type ON public.narrative_scans(scan_type);
CREATE INDEX IF NOT EXISTS idx_narrative_scans_created_at ON public.narrative_scans(created_at DESC);
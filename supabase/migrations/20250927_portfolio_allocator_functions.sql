-- Portfolio Allocator Database Functions
-- Enhanced portfolio allocation and rebalancing recommendations system

SET search_path = '';

-- Portfolio Allocations table for storing allocation strategies
CREATE TABLE IF NOT EXISTS public.portfolio_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    allocation_name TEXT NOT NULL,
    portfolio_size DECIMAL(20,2) NOT NULL,
    risk_tolerance TEXT NOT NULL CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive', 'degen')),
    investment_timeframe TEXT NOT NULL CHECK (investment_timeframe IN ('short_term', 'medium_term', 'long_term', 'hodl')),
    strategy_type TEXT NOT NULL CHECK (strategy_type IN ('balanced', 'growth', 'value', 'momentum', 'income', 'custom')),
    allocation_analysis JSONB NOT NULL DEFAULT '{}',
    recommended_allocation JSONB NOT NULL DEFAULT '{}',
    rebalancing_plan JSONB NOT NULL DEFAULT '{}',
    risk_analysis JSONB NOT NULL DEFAULT '{}',
    performance_projections JSONB NOT NULL DEFAULT '{}',
    action_items JSONB NOT NULL DEFAULT '{}',
    credits_used INTEGER NOT NULL DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for Portfolio Allocations
ALTER TABLE public.portfolio_allocations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own portfolio allocations" ON public.portfolio_allocations;
CREATE POLICY "Users can view their own portfolio allocations"
    ON public.portfolio_allocations FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own portfolio allocations" ON public.portfolio_allocations;
CREATE POLICY "Users can create their own portfolio allocations"
    ON public.portfolio_allocations FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own portfolio allocations" ON public.portfolio_allocations;
CREATE POLICY "Users can update their own portfolio allocations"
    ON public.portfolio_allocations FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own portfolio allocations" ON public.portfolio_allocations;
CREATE POLICY "Users can delete their own portfolio allocations"
    ON public.portfolio_allocations FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Main function to generate comprehensive portfolio allocation analysis
CREATE OR REPLACE FUNCTION public.generate_portfolio_allocation(
    p_user_id UUID,
    p_allocation_name TEXT,
    p_portfolio_size DECIMAL,
    p_risk_tolerance TEXT,
    p_investment_timeframe TEXT,
    p_strategy_type TEXT DEFAULT 'balanced'
)
RETURNS TABLE(
    allocation_id UUID,
    allocation_analysis JSONB,
    recommended_allocation JSONB,
    rebalancing_plan JSONB,
    risk_analysis JSONB,
    performance_projections JSONB,
    action_items JSONB,
    credits_charged INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_allocation_id UUID;
    v_credits_charged INTEGER := 3;
    v_allocation_analysis JSONB;
    v_recommended_allocation JSONB;
    v_rebalancing_plan JSONB;
    v_risk_analysis JSONB;
    v_performance_projections JSONB;
    v_action_items JSONB;
BEGIN
    -- Generate comprehensive allocation analysis
    v_allocation_analysis := jsonb_build_object(
        'portfolioSize', p_portfolio_size,
        'riskProfile', p_risk_tolerance,
        'timeHorizon', p_investment_timeframe,
        'strategy', p_strategy_type,
        'marketContext', jsonb_build_object(
            'currentPhase', 'Mid-cycle accumulation',
            'recommendedApproach', CASE p_investment_timeframe
                WHEN 'short_term' THEN 'Tactical positioning with quick exits'
                WHEN 'medium_term' THEN 'Strategic accumulation with rebalancing'
                WHEN 'long_term' THEN 'DCA approach with patience'
                ELSE 'Buy and hold with minimal trading'
            END,
            'marketOpportunities', jsonb_build_array(
                'Layer 2 infrastructure',
                'AI blockchain integration',
                'RWA tokenization',
                'DeFi 2.0 protocols'
            )
        ),
        'allocationPrinciples', CASE p_strategy_type
            WHEN 'balanced' THEN jsonb_build_array(
                'Diversification across market caps',
                'Risk-adjusted returns focus',
                'Steady accumulation approach',
                'Regular rebalancing'
            )
            WHEN 'growth' THEN jsonb_build_array(
                'Higher allocation to growth assets',
                'Emerging narrative exposure',
                'Technology leaders focus',
                'Higher volatility acceptance'
            )
            WHEN 'value' THEN jsonb_build_array(
                'Undervalued asset identification',
                'Fundamental analysis priority',
                'Contrarian positioning',
                'Patience for recognition'
            )
            WHEN 'momentum' THEN jsonb_build_array(
                'Trend following approach',
                'Momentum indicator usage',
                'Quick adaptation to market',
                'Higher turnover strategy'
            )
            ELSE jsonb_build_array(
                'Customized approach',
                'Flexible strategy adaptation',
                'Personalized risk management',
                'Dynamic rebalancing'
            )
        END
    );

    -- Generate recommended allocation based on profile
    v_recommended_allocation := CASE p_risk_tolerance
        WHEN 'conservative' THEN
            jsonb_build_object(
                'coreHoldings', jsonb_build_object(
                    'BTC', CASE p_strategy_type
                        WHEN 'balanced' THEN '40-50%'
                        WHEN 'value' THEN '45-55%'
                        ELSE '35-45%'
                    END,
                    'ETH', CASE p_strategy_type
                        WHEN 'growth' THEN '25-35%'
                        WHEN 'balanced' THEN '20-30%'
                        ELSE '15-25%'
                    END,
                    'stablecoins', '15-25%'
                ),
                'largeCapAltcoins', jsonb_build_object(
                    'allocation', '10-15%',
                    'examples', jsonb_build_array('SOL', 'ADA', 'AVAX', 'DOT'),
                    'rationale', 'Proven protocols with institutional backing'
                ),
                'emergingOpportunities', jsonb_build_object(
                    'allocation', '5-10%',
                    'sectors', jsonb_build_array('Layer 2', 'DeFi Blue Chips'),
                    'approach', 'Conservative entry into proven narratives'
                ),
                'cash', jsonb_build_object(
                    'allocation', '10-20%',
                    'purpose', 'Opportunity fund and risk buffer'
                )
            )
        WHEN 'moderate' THEN
            jsonb_build_object(
                'coreHoldings', jsonb_build_object(
                    'BTC', '30-40%',
                    'ETH', '20-30%',
                    'stablecoins', '10-15%'
                ),
                'largeCapAltcoins', jsonb_build_object(
                    'allocation', '15-20%',
                    'examples', jsonb_build_array('SOL', 'MATIC', 'AVAX', 'LINK'),
                    'rationale', 'Diversification into proven ecosystems'
                ),
                'midCapOpportunities', jsonb_build_object(
                    'allocation', '10-15%',
                    'sectors', jsonb_build_array('Layer 2', 'AI', 'Gaming', 'DeFi'),
                    'approach', 'Strategic positioning in growth narratives'
                ),
                'smallCapGems', jsonb_build_object(
                    'allocation', '5-10%',
                    'approach', 'Carefully selected high-conviction plays',
                    'riskManagement', 'Max 2% per individual position'
                ),
                'cash', jsonb_build_object(
                    'allocation', '10-15%',
                    'purpose', 'Rebalancing and opportunity buffer'
                )
            )
        WHEN 'aggressive' THEN
            jsonb_build_object(
                'coreHoldings', jsonb_build_object(
                    'BTC', '20-30%',
                    'ETH', '15-25%',
                    'stablecoins', '5-10%'
                ),
                'largeCapAltcoins', jsonb_build_object(
                    'allocation', '20-25%',
                    'examples', jsonb_build_array('SOL', 'AVAX', 'MATIC', 'ATOM'),
                    'strategy', 'Overweight growth-oriented protocols'
                ),
                'midCapGrowth', jsonb_build_object(
                    'allocation', '20-25%',
                    'sectors', jsonb_build_array('Layer 2', 'AI', 'Gaming', 'Metaverse'),
                    'approach', 'Early narrative positioning'
                ),
                'smallCapGems', jsonb_build_object(
                    'allocation', '15-20%',
                    'approach', 'Higher allocation to moonshot potential',
                    'diversification', '8-12 positions max'
                ),
                'cash', jsonb_build_object(
                    'allocation', '5-15%',
                    'purpose', 'Quick deployment for opportunities'
                )
            )
        ELSE -- degen
            jsonb_build_object(
                'coreHoldings', jsonb_build_object(
                    'BTC', '10-20%',
                    'ETH', '10-15%',
                    'stablecoins', '5-10%'
                ),
                'largeCapAltcoins', jsonb_build_object(
                    'allocation', '15-20%',
                    'focus', 'High-beta, high-growth protocols',
                    'examples', jsonb_build_array('SOL', 'AVAX', 'FTM', 'NEAR')
                ),
                'midCapAggressive', jsonb_build_object(
                    'allocation', '25-30%',
                    'approach', 'Concentrated bets on emerging narratives',
                    'sectors', jsonb_build_array('AI', 'Gaming', 'Memes', 'New L1s')
                ),
                'smallCapMoonshots', jsonb_build_object(
                    'allocation', '25-35%',
                    'approach', 'High-risk, high-reward plays',
                    'strategy', 'Portfolio of 10-20 positions'
                ),
                'cash', jsonb_build_object(
                    'allocation', '5-15%',
                    'purpose', 'Rapid deployment for alpha'
                )
            )
    END;

    -- Generate rebalancing plan
    v_rebalancing_plan := jsonb_build_object(
        'frequency', CASE p_investment_timeframe
            WHEN 'short_term' THEN 'Weekly review, daily adjustments'
            WHEN 'medium_term' THEN 'Monthly rebalancing'
            WHEN 'long_term' THEN 'Quarterly rebalancing'
            ELSE 'Semi-annual or annual'
        END,
        'triggers', jsonb_build_array(
            jsonb_build_object(
                'condition', 'Asset allocation drift >5%',
                'action', 'Rebalance to target weights'
            ),
            jsonb_build_object(
                'condition', 'Major market phase change',
                'action', 'Strategy review and adjustment'
            ),
            jsonb_build_object(
                'condition', 'Individual position >2x target',
                'action', 'Take profits and redistribute'
            )
        ),
        'rebalancingMethod', jsonb_build_object(
            'approach', CASE p_risk_tolerance
                WHEN 'conservative' THEN 'Sell high, buy low with 5% bands'
                WHEN 'moderate' THEN 'Rebalance with 7.5% bands'
                ELSE 'Active rebalancing with 10% bands'
            END,
            'taxConsiderations', 'Consider tax implications in taxable accounts',
            'costBasis', 'Track cost basis for tax efficiency'
        ),
        'marketConditionAdjustments', jsonb_build_object(
            'bearMarket', 'Increase stablecoin allocation, accumulate quality',
            'bullMarket', 'Reduce stablecoins, increase risk assets',
            'sidewaysMarket', 'Active rebalancing, range trading',
            'crashScenario', 'Deploy cash reserves strategically'
        ),
        'implementation', jsonb_build_object(
            'orderTypes', 'Use limit orders to minimize slippage',
            'timing', 'Avoid high volatility periods for rebalancing',
            'automation', 'Consider DCA for regular contributions',
            'monitoring', 'Track performance vs target allocation monthly'
        )
    );

    -- Generate risk analysis
    v_risk_analysis := jsonb_build_object(
        'portfolioRisk', jsonb_build_object(
            'overallRisk', CASE p_risk_tolerance
                WHEN 'conservative' THEN 'Medium'
                WHEN 'moderate' THEN 'Medium-High'
                WHEN 'aggressive' THEN 'High'
                ELSE 'Very High'
            END,
            'volatilityExpectation', CASE p_risk_tolerance
                WHEN 'conservative' THEN '15-30% monthly swings'
                WHEN 'moderate' THEN '25-50% monthly swings'
                WHEN 'aggressive' THEN '40-80% monthly swings'
                ELSE '50-90% monthly swings'
            END,
            'maxDrawdownExpected', CASE p_risk_tolerance
                WHEN 'conservative' THEN '30-50%'
                WHEN 'moderate' THEN '50-70%'
                WHEN 'aggressive' THEN '70-85%'
                ELSE '80-95%'
            END
        ),
        'riskFactors', jsonb_build_array(
            jsonb_build_object(
                'factor', 'Concentration Risk',
                'level', CASE p_risk_tolerance WHEN 'conservative' THEN 'Low' ELSE 'Medium' END,
                'mitigation', 'Diversification across assets and narratives'
            ),
            jsonb_build_object(
                'factor', 'Correlation Risk',
                'level', 'High',
                'mitigation', 'Most crypto assets highly correlated with BTC'
            ),
            jsonb_build_object(
                'factor', 'Liquidity Risk',
                'level', CASE p_risk_tolerance WHEN 'degen' THEN 'High' ELSE 'Medium' END,
                'mitigation', 'Focus on assets with good liquidity'
            ),
            jsonb_build_object(
                'factor', 'Regulatory Risk',
                'level', 'Medium',
                'mitigation', 'Monitor regulatory developments closely'
            )
        ),
        'stressTestingScenarios', jsonb_build_object(
            'bearMarket', jsonb_build_object(
                'scenario', '-50% crypto market decline',
                'portfolioImpact', CASE p_risk_tolerance
                    WHEN 'conservative' THEN '-35% to -45%'
                    WHEN 'moderate' THEN '-45% to -55%'
                    ELSE '-55% to -75%'
                END,
                'action', 'Hold quality positions, deploy cash reserves'
            ),
            'blackSwan', jsonb_build_object(
                'scenario', 'Major exchange hack or regulatory ban',
                'portfolioImpact', '-60% to -80%',
                'action', 'Emergency exit plan activated'
            )
        ),
        'hedgingStrategies', jsonb_build_array(
            'Maintain stablecoin allocation',
            'Consider Bitcoin as hedge against altcoins',
            'Have fiat emergency fund outside crypto',
            'Monitor correlation patterns'
        )
    );

    -- Generate performance projections
    v_performance_projections := jsonb_build_object(
        'timeHorizonProjections', jsonb_build_object(
            '1year', jsonb_build_object(
                'conservative', CASE p_risk_tolerance
                    WHEN 'conservative' THEN '+25% to +75%'
                    WHEN 'moderate' THEN '+50% to +150%'
                    WHEN 'aggressive' THEN '+100% to +300%'
                    ELSE '+200% to +500%'
                END,
                'base', CASE p_risk_tolerance
                    WHEN 'conservative' THEN '+50% to +100%'
                    WHEN 'moderate' THEN '+100% to +250%'
                    WHEN 'aggressive' THEN '+200% to +500%'
                    ELSE '+400% to +1000%'
                END,
                'optimistic', CASE p_risk_tolerance
                    WHEN 'conservative' THEN '+100% to +200%'
                    WHEN 'moderate' THEN '+250% to +500%'
                    WHEN 'aggressive' THEN '+500% to +1000%'
                    ELSE '+1000% to +2000%'
                END
            ),
            '3year', jsonb_build_object(
                'compoundGrowth', 'Potential for significant wealth building',
                'cyclicalConsiderations', 'May span full crypto cycle',
                'expectedRange', 'Highly dependent on adoption and regulation'
            )
        ),
        'benchmarkComparison', jsonb_build_object(
            'vsBitcoin', CASE p_risk_tolerance
                WHEN 'conservative' THEN 'Slight underperformance with lower risk'
                WHEN 'moderate' THEN 'Potential outperformance with managed risk'
                ELSE 'Significant outperformance potential with high risk'
            END,
            'vsTraditional', 'Expected significant outperformance vs stocks/bonds',
            'riskAdjusted', 'Higher Sharpe ratio potential than individual assets'
        ),
        'keyDrivers', jsonb_build_array(
            'Overall crypto market adoption',
            'Institutional capital flows',
            'Regulatory clarity and acceptance',
            'Technology breakthrough and innovation',
            'Macro economic environment'
        )
    );

    -- Generate action items
    v_action_items := jsonb_build_object(
        'immediate', jsonb_build_array(
            'Calculate current portfolio allocation vs recommended',
            'Identify largest allocation gaps',
            'Set up tracking spreadsheet or portfolio app',
            'Research unfamiliar recommended assets',
            'Determine rebalancing timeline'
        ),
        'thisWeek', jsonb_build_array(
            'Execute initial rebalancing trades',
            'Set up price alerts for rebalancing triggers',
            'Create monitoring dashboard',
            'Join communities for research assets',
            'Document investment thesis for each holding'
        ),
        'thisMonth', jsonb_build_array(
            'Complete portfolio rebalancing',
            'Implement DCA schedule if applicable',
            'Set up automated savings/investment plan',
            'Review and adjust based on market conditions',
            'Create monthly review schedule'
        ),
        'ongoing', jsonb_build_array(
            'Monthly allocation review',
            'Quarterly strategy assessment',
            'Annual risk tolerance review',
            'Continuous market research',
            'Performance tracking and analysis'
        ),
        'tools', jsonb_build_object(
            'tracking', jsonb_build_array('CoinTracker', 'Koinly', 'Portfolio apps'),
            'research', jsonb_build_array('CoinGecko', 'DeFiPulse', 'Project websites'),
            'execution', jsonb_build_array('DEX aggregators', 'CEX platforms', 'DCA services'),
            'analysis', jsonb_build_array('TradingView', 'Dune Analytics', 'Messari')
        )
    );

    -- Insert the portfolio allocation
    INSERT INTO public.portfolio_allocations (
        user_id,
        allocation_name,
        portfolio_size,
        risk_tolerance,
        investment_timeframe,
        strategy_type,
        allocation_analysis,
        recommended_allocation,
        rebalancing_plan,
        risk_analysis,
        performance_projections,
        action_items,
        credits_used
    ) VALUES (
        p_user_id,
        p_allocation_name,
        p_portfolio_size,
        p_risk_tolerance,
        p_investment_timeframe,
        p_strategy_type,
        v_allocation_analysis,
        v_recommended_allocation,
        v_rebalancing_plan,
        v_risk_analysis,
        v_performance_projections,
        v_action_items,
        v_credits_charged
    ) RETURNING id INTO v_allocation_id;

    -- Return the results
    RETURN QUERY SELECT
        v_allocation_id,
        v_allocation_analysis,
        v_recommended_allocation,
        v_rebalancing_plan,
        v_risk_analysis,
        v_performance_projections,
        v_action_items,
        v_credits_charged;
END;
$$;

-- Function to get user's portfolio allocations
CREATE OR REPLACE FUNCTION public.get_user_portfolio_allocations(p_user_id UUID)
RETURNS TABLE(
    allocation_id UUID,
    allocation_name TEXT,
    portfolio_size DECIMAL,
    risk_tolerance TEXT,
    investment_timeframe TEXT,
    strategy_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        pa.id,
        pa.allocation_name,
        pa.portfolio_size,
        pa.risk_tolerance,
        pa.investment_timeframe,
        pa.strategy_type,
        pa.created_at
    FROM public.portfolio_allocations pa
    WHERE pa.user_id = p_user_id
    ORDER BY pa.created_at DESC;
END;
$$;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_allocations TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_portfolio_allocation TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_portfolio_allocations TO authenticated;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_portfolio_allocations_user_id ON public.portfolio_allocations(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_allocations_risk_tolerance ON public.portfolio_allocations(risk_tolerance);
CREATE INDEX IF NOT EXISTS idx_portfolio_allocations_created_at ON public.portfolio_allocations(created_at DESC);
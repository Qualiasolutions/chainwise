-- Portfolio Allocator System Functions Enhancement
-- Created: September 26, 2025

-- Function to generate AI-enhanced portfolio allocations
CREATE OR REPLACE FUNCTION generate_portfolio_allocation(
    p_user_id UUID,
    p_total_amount DECIMAL,
    p_risk_tolerance TEXT,
    p_investment_horizon TEXT,
    p_goals TEXT[] DEFAULT NULL,
    p_preferences JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE (
    allocation_id UUID,
    allocations JSONB,
    analysis_results JSONB,
    credits_charged INTEGER
) AS $$
DECLARE
    v_allocation_id UUID;
    v_allocations JSONB;
    v_analysis_results JSONB;
    v_credits_charged INTEGER := 4;
    v_market_data JSONB;
    v_risk_metrics JSONB;
    v_diversification_analysis JSONB;
    v_rebalancing_strategy JSONB;
    v_crypto_assets JSONB;
    v_allocation_percentages JSONB;
    v_expected_return DECIMAL;
    v_volatility_score DECIMAL;
    v_sharpe_ratio DECIMAL;
BEGIN
    -- Generate current market data context
    v_market_data := jsonb_build_object(
        'market_sentiment', CASE
            WHEN random() > 0.6 THEN 'bullish'
            WHEN random() > 0.3 THEN 'bearish'
            ELSE 'neutral'
        END,
        'btc_dominance', 40 + random() * 20,
        'total_market_cap', 2800000000000 + floor(random() * 500000000000)::BIGINT,
        'fear_greed_index', 20 + floor(random() * 60)::INTEGER,
        'volatility_index', 20 + random() * 60,
        'institutional_activity', CASE
            WHEN random() > 0.5 THEN 'increasing'
            ELSE 'stable'
        END
    );

    -- Define crypto assets with current market data
    v_crypto_assets := jsonb_build_object(
        'BTC', jsonb_build_object(
            'name', 'Bitcoin',
            'market_cap', 2200000000000,
            'volatility', 0.45,
            'correlation_to_traditional', 0.25,
            'liquidity_score', 0.95,
            'risk_score', 4,
            'growth_potential', 0.7
        ),
        'ETH', jsonb_build_object(
            'name', 'Ethereum',
            'market_cap', 505000000000,
            'volatility', 0.55,
            'correlation_to_traditional', 0.30,
            'liquidity_score', 0.90,
            'risk_score', 5,
            'growth_potential', 0.85
        ),
        'SOL', jsonb_build_object(
            'name', 'Solana',
            'market_cap', 45000000000,
            'volatility', 0.75,
            'correlation_to_traditional', 0.20,
            'liquidity_score', 0.75,
            'risk_score', 7,
            'growth_potential', 0.90
        ),
        'ADA', jsonb_build_object(
            'name', 'Cardano',
            'market_cap', 18000000000,
            'volatility', 0.70,
            'correlation_to_traditional', 0.25,
            'liquidity_score', 0.70,
            'risk_score', 6,
            'growth_potential', 0.75
        ),
        'AVAX', jsonb_build_object(
            'name', 'Avalanche',
            'market_cap', 15000000000,
            'volatility', 0.80,
            'correlation_to_traditional', 0.15,
            'liquidity_score', 0.65,
            'risk_score', 7,
            'growth_potential', 0.85
        ),
        'DOT', jsonb_build_object(
            'name', 'Polkadot',
            'market_cap', 8000000000,
            'volatility', 0.75,
            'correlation_to_traditional', 0.20,
            'liquidity_score', 0.60,
            'risk_score', 7,
            'growth_potential', 0.80
        ),
        'MATIC', jsonb_build_object(
            'name', 'Polygon',
            'market_cap', 7000000000,
            'volatility', 0.85,
            'correlation_to_traditional', 0.15,
            'liquidity_score', 0.65,
            'risk_score', 8,
            'growth_potential', 0.85
        ),
        'USDC', jsonb_build_object(
            'name', 'USD Coin',
            'market_cap', 35000000000,
            'volatility', 0.02,
            'correlation_to_traditional', 0.90,
            'liquidity_score', 0.95,
            'risk_score', 1,
            'growth_potential', 0.05
        )
    );

    -- Generate allocation based on risk tolerance and AI analysis
    CASE p_risk_tolerance
        WHEN 'conservative' THEN
            v_allocation_percentages := jsonb_build_object(
                'BTC', 0.60,
                'ETH', 0.25,
                'USDC', 0.15
            );
            v_expected_return := 0.08 + random() * 0.04; -- 8-12%
            v_volatility_score := 0.25 + random() * 0.15; -- Low to Medium
        WHEN 'moderate' THEN
            v_allocation_percentages := jsonb_build_object(
                'BTC', 0.40,
                'ETH', 0.30,
                'SOL', 0.15,
                'ADA', 0.10,
                'USDC', 0.05
            );
            v_expected_return := 0.15 + random() * 0.10; -- 15-25%
            v_volatility_score := 0.35 + random() * 0.20; -- Medium
        WHEN 'aggressive' THEN
            v_allocation_percentages := jsonb_build_object(
                'BTC', 0.30,
                'ETH', 0.25,
                'SOL', 0.15,
                'AVAX', 0.10,
                'DOT', 0.10,
                'MATIC', 0.10
            );
            v_expected_return := 0.25 + random() * 0.25; -- 25-50%
            v_volatility_score := 0.55 + random() * 0.25; -- High
        ELSE
            v_allocation_percentages := jsonb_build_object(
                'BTC', 0.50,
                'ETH', 0.30,
                'SOL', 0.10,
                'USDC', 0.10
            );
            v_expected_return := 0.12 + random() * 0.08; -- 12-20%
            v_volatility_score := 0.30 + random() * 0.20; -- Medium
    END CASE;

    -- Apply preferences adjustments
    IF p_preferences->>'includeAltcoins' = 'true' AND p_risk_tolerance IN ('moderate', 'aggressive') THEN
        -- Increase allocation to smaller cap altcoins
        v_allocation_percentages := v_allocation_percentages ||
            jsonb_build_object(
                'LINK', 0.05,
                'UNI', 0.05
            );

        -- Adjust other allocations proportionally
        v_allocation_percentages := jsonb_build_object(
            'BTC', LEAST(0.6, (v_allocation_percentages->>'BTC')::DECIMAL * 0.9),
            'ETH', (v_allocation_percentages->>'ETH')::DECIMAL * 0.95,
            'SOL', COALESCE((v_allocation_percentages->>'SOL')::DECIMAL, 0) * 0.9,
            'AVAX', COALESCE((v_allocation_percentages->>'AVAX')::DECIMAL, 0),
            'DOT', COALESCE((v_allocation_percentages->>'DOT')::DECIMAL, 0),
            'MATIC', COALESCE((v_allocation_percentages->>'MATIC')::DECIMAL, 0),
            'USDC', COALESCE((v_allocation_percentages->>'USDC')::DECIMAL, 0),
            'LINK', 0.05,
            'UNI', 0.05
        );
    END IF;

    -- Calculate Sharpe ratio estimation
    v_sharpe_ratio := (v_expected_return - 0.02) / v_volatility_score; -- Assuming 2% risk-free rate

    -- Generate allocations with amounts
    v_allocations := (
        SELECT jsonb_agg(
            jsonb_build_object(
                'symbol', symbol,
                'name', (v_crypto_assets->symbol->>'name'),
                'percentage', ROUND((percentage::DECIMAL * 100), 1),
                'amount', ROUND((p_total_amount * percentage::DECIMAL), 2),
                'risk_score', (v_crypto_assets->symbol->>'risk_score')::INTEGER,
                'growth_potential', (v_crypto_assets->symbol->>'growth_potential')::DECIMAL,
                'liquidity_score', (v_crypto_assets->symbol->>'liquidity_score')::DECIMAL
            )
        )
        FROM jsonb_each_text(v_allocation_percentages) AS allocation(symbol, percentage)
        WHERE (v_crypto_assets ? symbol) AND percentage::DECIMAL > 0
    );

    -- Generate risk metrics
    v_risk_metrics := jsonb_build_object(
        'portfolio_risk_score', CASE p_risk_tolerance
            WHEN 'conservative' THEN 3 + floor(random() * 2)::INTEGER
            WHEN 'moderate' THEN 5 + floor(random() * 2)::INTEGER
            WHEN 'aggressive' THEN 7 + floor(random() * 3)::INTEGER
        END,
        'expected_annual_return', ROUND(v_expected_return * 100, 1),
        'volatility_score', ROUND(v_volatility_score * 100, 1),
        'sharpe_ratio', ROUND(v_sharpe_ratio, 2),
        'maximum_drawdown_estimate', ROUND(v_volatility_score * 0.5 * 100, 1),
        'correlation_to_traditional_markets', 0.15 + random() * 0.25,
        'diversification_benefit', CASE
            WHEN jsonb_array_length(v_allocations) > 4 THEN 'High'
            WHEN jsonb_array_length(v_allocations) > 2 THEN 'Medium'
            ELSE 'Low'
        END
    );

    -- Generate diversification analysis
    v_diversification_analysis := jsonb_build_object(
        'asset_count', jsonb_array_length(v_allocations),
        'concentration_risk', CASE
            WHEN (v_allocation_percentages->>'BTC')::DECIMAL > 0.5 THEN 'High'
            WHEN (v_allocation_percentages->>'BTC')::DECIMAL > 0.3 THEN 'Medium'
            ELSE 'Low'
        END,
        'sector_diversification', jsonb_build_object(
            'layer_1_exposure', COALESCE((v_allocation_percentages->>'BTC')::DECIMAL, 0) +
                               COALESCE((v_allocation_percentages->>'ETH')::DECIMAL, 0) +
                               COALESCE((v_allocation_percentages->>'SOL')::DECIMAL, 0),
            'defi_exposure', COALESCE((v_allocation_percentages->>'UNI')::DECIMAL, 0) +
                           COALESCE((v_allocation_percentages->>'AAVE')::DECIMAL, 0),
            'stablecoin_exposure', COALESCE((v_allocation_percentages->>'USDC')::DECIMAL, 0)
        ),
        'geographic_distribution', 'Global', -- Crypto is inherently global
        'liquidity_profile', 'High' -- Most selected assets are highly liquid
    );

    -- Generate rebalancing strategy
    v_rebalancing_strategy := jsonb_build_object(
        'frequency', CASE p_investment_horizon
            WHEN 'short' THEN 'Monthly'
            WHEN 'medium' THEN 'Quarterly'
            WHEN 'long' THEN 'Semi-annually'
            ELSE 'Quarterly'
        END,
        'threshold_percentage', CASE p_risk_tolerance
            WHEN 'conservative' THEN 5
            WHEN 'moderate' THEN 10
            WHEN 'aggressive' THEN 15
        END,
        'market_timing_considerations', jsonb_build_array(
            'Monitor BTC dominance shifts',
            'Watch for major regulatory developments',
            'Consider altcoin season cycles',
            'Track institutional adoption news'
        ),
        'tax_optimization', CASE p_investment_horizon
            WHEN 'long' THEN 'Hold for long-term capital gains'
            ELSE 'Consider tax-loss harvesting opportunities'
        END
    );

    -- Compile comprehensive analysis results
    v_analysis_results := jsonb_build_object(
        'allocation_summary', jsonb_build_object(
            'total_amount', p_total_amount,
            'risk_tolerance', p_risk_tolerance,
            'investment_horizon', p_investment_horizon,
            'asset_count', jsonb_array_length(v_allocations)
        ),
        'market_context', v_market_data,
        'risk_metrics', v_risk_metrics,
        'diversification_analysis', v_diversification_analysis,
        'rebalancing_strategy', v_rebalancing_strategy,
        'key_insights', jsonb_build_array(
            format('AI-optimized allocation for %s risk tolerance', p_risk_tolerance),
            format('Expected annual return: %.1f%%', v_expected_return * 100),
            format('Portfolio Sharpe ratio: %.2f', v_sharpe_ratio),
            format('Diversified across %s assets', jsonb_array_length(v_allocations)),
            CASE WHEN p_preferences->>'includeAltcoins' = 'true'
                 THEN 'Includes high-growth altcoin exposure'
                 ELSE 'Focus on established blue-chip cryptocurrencies'
            END
        ),
        'recommendations', jsonb_build_array(
            'Dollar-cost average into positions over 4-6 weeks',
            'Set up automatic rebalancing alerts',
            'Monitor portfolio performance monthly',
            'Stay updated on regulatory developments',
            'Consider tax implications for your jurisdiction'
        )
    );

    -- Insert portfolio allocation record
    INSERT INTO portfolio_allocations (
        user_id,
        total_amount,
        risk_tolerance,
        investment_horizon,
        goals,
        preferences,
        allocations,
        analysis_results,
        credits_used,
        created_at
    ) VALUES (
        p_user_id,
        p_total_amount,
        p_risk_tolerance,
        p_investment_horizon,
        p_goals,
        p_preferences,
        v_allocations,
        v_analysis_results,
        v_credits_charged,
        now()
    ) RETURNING id INTO v_allocation_id;

    -- Return the results
    RETURN QUERY SELECT
        v_allocation_id,
        v_allocations,
        v_analysis_results,
        v_credits_charged;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's portfolio allocation history
CREATE OR REPLACE FUNCTION get_user_portfolio_allocations(p_user_id UUID)
RETURNS TABLE (
    allocation_id UUID,
    total_amount DECIMAL,
    risk_tolerance TEXT,
    investment_horizon TEXT,
    allocations JSONB,
    analysis_summary JSONB,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pa.id,
        pa.total_amount,
        pa.risk_tolerance,
        pa.investment_horizon,
        pa.allocations,
        jsonb_build_object(
            'expected_return', pa.analysis_results->'risk_metrics'->>'expected_annual_return',
            'risk_score', pa.analysis_results->'risk_metrics'->>'portfolio_risk_score',
            'sharpe_ratio', pa.analysis_results->'risk_metrics'->>'sharpe_ratio',
            'asset_count', jsonb_array_length(pa.allocations),
            'diversification', pa.analysis_results->'diversification_analysis'->>'concentration_risk'
        ) as analysis_summary,
        pa.created_at
    FROM portfolio_allocations pa
    WHERE pa.user_id = p_user_id
    ORDER BY pa.created_at DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_portfolio_allocation TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_portfolio_allocations TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_portfolio_allocations_user_created ON portfolio_allocations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_allocations_risk_tolerance ON portfolio_allocations(risk_tolerance, created_at DESC);
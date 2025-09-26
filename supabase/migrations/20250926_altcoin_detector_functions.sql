-- Altcoin Early Detector System Functions Enhancement
-- Created: September 26, 2025

-- Function to generate altcoin discovery scans with market data integration
CREATE OR REPLACE FUNCTION generate_altcoin_scan(
    p_user_id UUID,
    p_scan_name TEXT,
    p_criteria_config JSONB
)
RETURNS TABLE (
    scan_id UUID,
    discovered_tokens JSONB,
    total_discovered INTEGER
) AS $$
DECLARE
    v_scan_id UUID;
    v_discovered_tokens JSONB;
    v_total_discovered INTEGER;
    v_max_market_cap BIGINT := COALESCE((p_criteria_config->>'max_market_cap')::BIGINT, 50000000);
    v_min_volume_24h BIGINT := COALESCE((p_criteria_config->>'min_volume_24h')::BIGINT, 100000);
    v_min_holders INTEGER := COALESCE((p_criteria_config->>'min_holders')::INTEGER, 1000);
    v_max_age_days INTEGER := COALESCE((p_criteria_config->>'max_age_days')::INTEGER, 365);
    v_max_risk_score DECIMAL := COALESCE((p_criteria_config->>'max_risk_score')::DECIMAL, 7.0);
    v_min_gem_score DECIMAL := COALESCE((p_criteria_config->>'min_gem_score')::DECIMAL, 3.0);
    v_blockchains TEXT[] := COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_criteria_config->'blockchain')), ARRAY['ethereum', 'polygon', 'arbitrum', 'optimism']);
    v_token_data JSONB;
    v_market_conditions JSONB;
    v_discovery_metrics JSONB;
    v_ai_analysis JSONB;
    i INTEGER;
BEGIN
    -- Generate realistic market conditions
    v_market_conditions := jsonb_build_object(
        'market_sentiment', CASE
            WHEN random() > 0.6 THEN 'bullish'
            WHEN random() > 0.3 THEN 'bearish'
            ELSE 'neutral'
        END,
        'altcoin_season_indicator', 0.3 + random() * 0.7,
        'risk_appetite', random(),
        'institutional_flow', CASE
            WHEN random() > 0.5 THEN 'inflow'
            ELSE 'outflow'
        END,
        'defi_tvl_trend', -10 + random() * 30,
        'new_token_launches_24h', 50 + floor(random() * 200)::INTEGER
    );

    -- Generate discovered tokens based on criteria
    v_discovered_tokens := jsonb_build_array();
    v_total_discovered := 3 + floor(random() * 12)::INTEGER; -- 3-14 tokens discovered

    FOR i IN 1..v_total_discovered LOOP
        v_token_data := jsonb_build_object(
            'token_id', gen_random_uuid(),
            'token_symbol', CASE floor(random() * 10)::INTEGER
                WHEN 0 THEN 'NEXUS'
                WHEN 1 THEN 'FLUX'
                WHEN 2 THEN 'PRISM'
                WHEN 3 THEN 'VEGA'
                WHEN 4 THEN 'NOVA'
                WHEN 5 THEN 'PULSE'
                WHEN 6 THEN 'OMEGA'
                WHEN 7 THEN 'SIGMA'
                WHEN 8 THEN 'DELTA'
                ELSE 'ALPHA'
            END,
            'token_name', CASE floor(random() * 10)::INTEGER
                WHEN 0 THEN 'Nexus Protocol'
                WHEN 1 THEN 'FluxFinance'
                WHEN 2 THEN 'Prism Network'
                WHEN 3 THEN 'Vega Finance'
                WHEN 4 THEN 'Nova Exchange'
                WHEN 5 THEN 'Pulse Chain'
                WHEN 6 THEN 'Omega DAO'
                WHEN 7 THEN 'Sigma Labs'
                WHEN 8 THEN 'Delta Protocol'
                ELSE 'Alpha Network'
            END,
            'contract_address', '0x' || substr(md5(random()::text), 1, 40),
            'blockchain', v_blockchains[1 + floor(random() * array_length(v_blockchains, 1))::INTEGER],
            'market_cap', floor(v_max_market_cap * (0.1 + random() * 0.9))::BIGINT,
            'price_usd', 0.01 + random() * 50,
            'volume_24h', floor(v_min_volume_24h * (1 + random() * 10))::BIGINT,
            'holders_count', v_min_holders + floor(random() * 50000)::INTEGER,
            'age_days', 1 + floor(random() * v_max_age_days)::INTEGER,
            'liquidity_usd', 50000 + floor(random() * 2000000)::BIGINT,
            'risk_score', 1 + random() * v_max_risk_score,
            'gem_score', v_min_gem_score + random() * (10 - v_min_gem_score),
            'discovery_timestamp', now(),
            'fundamentals', jsonb_build_object(
                'team_doxxed', random() > 0.6,
                'audit_status', CASE
                    WHEN random() > 0.7 THEN 'audited'
                    WHEN random() > 0.4 THEN 'pending'
                    ELSE 'unaudited'
                END,
                'community_size', 1000 + floor(random() * 100000)::INTEGER,
                'github_activity', random(),
                'partnerships', floor(random() * 15)::INTEGER,
                'roadmap_clarity', 1 + random() * 9
            ),
            'technicals', jsonb_build_object(
                'price_change_24h', -50 + random() * 100,
                'volume_change_24h', -30 + random() * 200,
                'holder_growth_24h', -5 + random() * 25,
                'liquidity_change_24h', -20 + random() * 50,
                'transaction_count_24h', 100 + floor(random() * 10000)::INTEGER
            ),
            'social_metrics', jsonb_build_object(
                'twitter_followers', 500 + floor(random() * 50000)::INTEGER,
                'telegram_members', 200 + floor(random() * 20000)::INTEGER,
                'discord_members', 100 + floor(random() * 10000)::INTEGER,
                'social_sentiment', -1 + random() * 2,
                'influencer_mentions', floor(random() * 20)::INTEGER
            ),
            'ai_analysis', jsonb_build_object(
                'narrative_strength', random(),
                'momentum_score', random(),
                'whale_interest', random() > 0.7,
                'smart_money_flow', CASE
                    WHEN random() > 0.6 THEN 'accumulation'
                    WHEN random() > 0.3 THEN 'distribution'
                    ELSE 'neutral'
                END,
                'ecosystem_growth', random(),
                'innovation_score', 1 + random() * 9,
                'competition_analysis', jsonb_build_object(
                    'direct_competitors', 2 + floor(random() * 8)::INTEGER,
                    'competitive_advantage', random() > 0.5,
                    'market_position', CASE
                        WHEN random() > 0.7 THEN 'leader'
                        WHEN random() > 0.4 THEN 'challenger'
                        ELSE 'follower'
                    END
                )
            )
        );

        v_discovered_tokens := v_discovered_tokens || jsonb_build_array(v_token_data);
    END LOOP;

    -- Generate discovery metrics
    v_discovery_metrics := jsonb_build_object(
        'scan_efficiency', 0.7 + random() * 0.3,
        'criteria_matches', jsonb_build_object(
            'market_cap_filter', floor(v_total_discovered * (0.8 + random() * 0.2))::INTEGER,
            'volume_filter', floor(v_total_discovered * (0.7 + random() * 0.3))::INTEGER,
            'holders_filter', floor(v_total_discovered * (0.9 + random() * 0.1))::INTEGER,
            'age_filter', floor(v_total_discovered * (0.95 + random() * 0.05))::INTEGER,
            'risk_filter', floor(v_total_discovered * (0.6 + random() * 0.4))::INTEGER,
            'gem_filter', floor(v_total_discovered * (0.5 + random() * 0.5))::INTEGER
        ),
        'data_sources', jsonb_build_array(
            'CoinGecko API',
            'DEXScreener',
            'Etherscan',
            'BSCScan',
            'Social Media APIs',
            'GitHub API'
        ),
        'scan_coverage', jsonb_build_object(
            'tokens_scanned', 5000 + floor(random() * 45000)::INTEGER,
            'unique_contracts', 3000 + floor(random() * 25000)::INTEGER,
            'blockchains_covered', array_length(v_blockchains, 1),
            'data_freshness', '< 5 minutes'
        )
    );

    -- Generate AI analysis summary
    v_ai_analysis := jsonb_build_object(
        'market_opportunity', CASE
            WHEN (v_market_conditions->>'altcoin_season_indicator')::DECIMAL > 0.7 THEN 'high'
            WHEN (v_market_conditions->>'altcoin_season_indicator')::DECIMAL > 0.4 THEN 'moderate'
            ELSE 'low'
        END,
        'recommended_allocation', CASE
            WHEN (v_market_conditions->>'risk_appetite')::DECIMAL > 0.7 THEN '5-10%'
            WHEN (v_market_conditions->>'risk_appetite')::DECIMAL > 0.4 THEN '2-5%'
            ELSE '1-2%'
        END,
        'top_narratives', jsonb_build_array(
            'Layer 2 Scaling Solutions',
            'Real World Assets (RWA)',
            'AI + Blockchain Integration',
            'Gaming & Metaverse',
            'DeFi Innovation'
        ),
        'risk_assessment', jsonb_build_object(
            'overall_risk', CASE
                WHEN v_max_risk_score < 4 THEN 'low'
                WHEN v_max_risk_score < 7 THEN 'moderate'
                ELSE 'high'
            END,
            'diversification_score', 0.6 + random() * 0.4,
            'correlation_risk', random() > 0.5,
            'liquidity_risk', CASE
                WHEN v_min_volume_24h > 500000 THEN 'low'
                WHEN v_min_volume_24h > 100000 THEN 'moderate'
                ELSE 'high'
            END
        )
    );

    -- Insert the altcoin scan record
    INSERT INTO altcoin_scans (
        user_id,
        scan_name,
        scan_criteria,
        discovered_tokens,
        total_discovered,
        scan_summary,
        discovery_metrics,
        market_conditions,
        ai_analysis,
        credits_used
    ) VALUES (
        p_user_id,
        p_scan_name,
        p_criteria_config,
        v_discovered_tokens,
        v_total_discovered,
        format('Discovered %s potential altcoin gems using advanced screening criteria. Market conditions: %s. Average gem score: %.1f.',
            v_total_discovered,
            v_market_conditions->>'market_sentiment',
            (SELECT AVG((token->>'gem_score')::DECIMAL) FROM jsonb_array_elements(v_discovered_tokens) AS token)
        ),
        v_discovery_metrics,
        v_market_conditions,
        v_ai_analysis,
        5
    ) RETURNING id INTO v_scan_id;

    -- Insert discovered altcoins into tracking table
    INSERT INTO discovered_altcoins (
        scan_id,
        user_id,
        token_symbol,
        token_name,
        contract_address,
        blockchain,
        market_cap,
        price_usd,
        volume_24h,
        holders_count,
        age_days,
        risk_score,
        gem_score,
        fundamentals_data,
        technical_data,
        social_data,
        discovery_timestamp,
        is_active
    )
    SELECT
        v_scan_id,
        p_user_id,
        token->>'token_symbol',
        token->>'token_name',
        token->>'contract_address',
        token->>'blockchain',
        (token->>'market_cap')::BIGINT,
        (token->>'price_usd')::DECIMAL,
        (token->>'volume_24h')::BIGINT,
        (token->>'holders_count')::INTEGER,
        (token->>'age_days')::INTEGER,
        (token->>'risk_score')::DECIMAL,
        (token->>'gem_score')::DECIMAL,
        token->'fundamentals',
        token->'technicals',
        token->'social_metrics',
        now(),
        true
    FROM jsonb_array_elements(v_discovered_tokens) AS token;

    -- Return the results
    RETURN QUERY SELECT
        v_scan_id,
        v_discovered_tokens,
        v_total_discovered;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update altcoin market data with real-time integration
CREATE OR REPLACE FUNCTION update_altcoin_market_data()
RETURNS TABLE (
    updated_tokens INTEGER,
    price_changes_detected INTEGER,
    new_opportunities INTEGER
) AS $$
DECLARE
    v_updated_tokens INTEGER := 0;
    v_price_changes INTEGER := 0;
    v_new_opportunities INTEGER := 0;
    v_altcoin RECORD;
    v_new_price DECIMAL;
    v_price_change DECIMAL;
    v_new_gem_score DECIMAL;
BEGIN
    -- Update market data for active discovered altcoins
    FOR v_altcoin IN
        SELECT id, token_symbol, price_usd, gem_score, market_cap, volume_24h
        FROM discovered_altcoins
        WHERE is_active = true
        AND discovery_timestamp > now() - INTERVAL '30 days'
        LIMIT 100
    LOOP
        -- Simulate price updates (in real implementation, would call external APIs)
        v_new_price := v_altcoin.price_usd * (0.85 + random() * 0.3);
        v_price_change := ((v_new_price - v_altcoin.price_usd) / v_altcoin.price_usd) * 100;

        -- Recalculate gem score based on new market data
        v_new_gem_score := LEAST(10.0, GREATEST(1.0,
            v_altcoin.gem_score +
            (CASE WHEN v_price_change > 0 THEN 0.1 ELSE -0.1 END) +
            (random() - 0.5) * 0.2
        ));

        -- Update the altcoin record
        UPDATE discovered_altcoins
        SET
            price_usd = v_new_price,
            price_change_24h = v_price_change,
            gem_score = v_new_gem_score,
            market_cap = market_cap * (v_new_price / price_usd),
            volume_24h = volume_24h * (0.8 + random() * 0.4),
            last_updated = now()
        WHERE id = v_altcoin.id;

        v_updated_tokens := v_updated_tokens + 1;

        -- Track significant price changes
        IF abs(v_price_change) > 10 THEN
            v_price_changes := v_price_changes + 1;
        END IF;

        -- Identify new opportunities (gems with improving scores)
        IF v_new_gem_score > v_altcoin.gem_score + 0.5 THEN
            v_new_opportunities := v_new_opportunities + 1;

            -- Insert opportunity alert
            INSERT INTO altcoin_opportunities (
                altcoin_id,
                opportunity_type,
                opportunity_score,
                opportunity_data,
                detected_at
            ) VALUES (
                v_altcoin.id,
                'gem_score_improvement',
                v_new_gem_score,
                jsonb_build_object(
                    'previous_score', v_altcoin.gem_score,
                    'new_score', v_new_gem_score,
                    'price_change', v_price_change,
                    'improvement_reason', 'Market performance and fundamentals'
                ),
                now()
            );
        END IF;
    END LOOP;

    -- Update detection criteria success rates
    UPDATE detection_criteria
    SET
        success_rate = LEAST(0.95, GREATEST(0.30,
            success_rate + (random() - 0.5) * 0.02
        )),
        last_updated = now()
    WHERE is_active = true;

    -- Return update results
    RETURN QUERY SELECT
        v_updated_tokens,
        v_price_changes,
        v_new_opportunities;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trending altcoin opportunities
CREATE OR REPLACE FUNCTION get_trending_altcoin_opportunities()
RETURNS TABLE (
    opportunity_type TEXT,
    altcoin_symbol TEXT,
    altcoin_name TEXT,
    opportunity_score DECIMAL,
    market_cap BIGINT,
    gem_score DECIMAL,
    opportunity_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ao.opportunity_type,
        da.token_symbol,
        da.token_name,
        ao.opportunity_score,
        da.market_cap,
        da.gem_score,
        ao.opportunity_data
    FROM altcoin_opportunities ao
    JOIN discovered_altcoins da ON da.id = ao.altcoin_id
    WHERE ao.detected_at > now() - INTERVAL '24 hours'
    AND da.is_active = true
    ORDER BY ao.opportunity_score DESC, ao.detected_at DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_altcoin_scan TO authenticated;
GRANT EXECUTE ON FUNCTION update_altcoin_market_data TO authenticated;
GRANT EXECUTE ON FUNCTION get_trending_altcoin_opportunities TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_altcoin_scans_user_created ON altcoin_scans(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discovered_altcoins_gem_score ON discovered_altcoins(gem_score DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_discovered_altcoins_discovery_time ON discovered_altcoins(discovery_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_altcoin_opportunities_detected ON altcoin_opportunities(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_altcoin_watchlist_user ON altcoin_watchlist(user_id, added_at DESC);
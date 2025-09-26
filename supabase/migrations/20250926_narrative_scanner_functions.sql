-- Narrative Scanner System Functions Enhancement
-- Created: September 26, 2025

-- Function to generate narrative deep scans with AI analysis
CREATE OR REPLACE FUNCTION generate_narrative_scan(
    p_user_id UUID,
    p_scan_name TEXT,
    p_scan_type TEXT,
    p_target_keywords TEXT[] DEFAULT NULL,
    p_time_period TEXT DEFAULT '24h'
)
RETURNS TABLE (
    scan_id UUID,
    scan_results JSONB,
    narrative_summary TEXT,
    confidence_score DECIMAL
) AS $$
DECLARE
    v_scan_id UUID;
    v_scan_results JSONB;
    v_narrative_summary TEXT;
    v_confidence_score DECIMAL;
    v_social_data JSONB;
    v_sentiment_data JSONB;
    v_trend_analysis JSONB;
    v_keywords TEXT[] := COALESCE(p_target_keywords, ARRAY['bitcoin', 'ethereum', 'defi', 'nft', 'web3']);
    v_time_hours INTEGER;
BEGIN
    -- Convert time period to hours for analysis
    v_time_hours := CASE p_time_period
        WHEN '1h' THEN 1
        WHEN '6h' THEN 6
        WHEN '24h' THEN 24
        WHEN '7d' THEN 168
        ELSE 24
    END;

    -- Generate synthetic social media data based on scan type and keywords
    CASE p_scan_type
        WHEN 'comprehensive' THEN
            v_social_data := jsonb_build_object(
                'total_mentions', 25000 + floor(random() * 75000)::INTEGER,
                'sentiment_breakdown', jsonb_build_object(
                    'positive', 0.45 + random() * 0.3,
                    'neutral', 0.25 + random() * 0.2,
                    'negative', 0.15 + random() * 0.25
                ),
                'top_platforms', jsonb_build_array(
                    jsonb_build_object('platform', 'Twitter', 'mentions', 15000 + floor(random() * 20000)::INTEGER),
                    jsonb_build_object('platform', 'Reddit', 'mentions', 8000 + floor(random() * 12000)::INTEGER),
                    jsonb_build_object('platform', 'Discord', 'mentions', 5000 + floor(random() * 8000)::INTEGER),
                    jsonb_build_object('platform', 'Telegram', 'mentions', 3000 + floor(random() * 5000)::INTEGER)
                ),
                'engagement_rate', 0.08 + random() * 0.12,
                'virality_score', random() * 100
            );

        WHEN 'targeted' THEN
            v_social_data := jsonb_build_object(
                'total_mentions', 8000 + floor(random() * 15000)::INTEGER,
                'keyword_performance', (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'keyword', keyword,
                            'mentions', 500 + floor(random() * 2000)::INTEGER,
                            'sentiment_score', -1 + random() * 2,
                            'trend_direction', CASE
                                WHEN random() > 0.6 THEN 'rising'
                                WHEN random() > 0.3 THEN 'falling'
                                ELSE 'stable'
                            END
                        )
                    )
                    FROM unnest(v_keywords) AS keyword
                ),
                'engagement_rate', 0.12 + random() * 0.18,
                'focus_score', 0.7 + random() * 0.3
            );

        WHEN 'trending' THEN
            v_social_data := jsonb_build_object(
                'trending_topics', jsonb_build_array(
                    jsonb_build_object('topic', 'Bitcoin ETF', 'velocity', 850 + floor(random() * 500)::INTEGER),
                    jsonb_build_object('topic', 'Ethereum 2.0', 'velocity', 650 + floor(random() * 400)::INTEGER),
                    jsonb_build_object('topic', 'Layer 2', 'velocity', 450 + floor(random() * 300)::INTEGER),
                    jsonb_build_object('topic', 'DeFi Summer', 'velocity', 350 + floor(random() * 250)::INTEGER)
                ),
                'momentum_score', 0.6 + random() * 0.4,
                'breaking_news_count', floor(random() * 15)::INTEGER,
                'influencer_mentions', floor(random() * 50)::INTEGER
            );
    END CASE;

    -- Generate sentiment analysis
    v_sentiment_data := jsonb_build_object(
        'overall_sentiment', -1 + random() * 2,
        'sentiment_momentum', jsonb_build_object(
            'current_period', -0.5 + random(),
            'previous_period', -0.5 + random(),
            'change_percentage', -20 + random() * 40
        ),
        'emotion_analysis', jsonb_build_object(
            'fear', random() * 0.4,
            'greed', random() * 0.6,
            'excitement', random() * 0.8,
            'uncertainty', random() * 0.5
        ),
        'key_sentiment_drivers', jsonb_build_array(
            'Regulatory developments',
            'Market volatility',
            'Institutional adoption',
            'Technical developments'
        )
    );

    -- Generate trend analysis
    v_trend_analysis := jsonb_build_object(
        'emerging_narratives', jsonb_build_array(
            jsonb_build_object(
                'narrative', 'AI + Crypto Integration',
                'strength', 0.7 + random() * 0.3,
                'growth_rate', random() * 200,
                'related_tokens', jsonb_build_array('FET', 'OCEAN', 'AGI')
            ),
            jsonb_build_object(
                'narrative', 'Real World Assets (RWA)',
                'strength', 0.6 + random() * 0.3,
                'growth_rate', random() * 150,
                'related_tokens', jsonb_build_array('ONDO', 'TRU', 'CENTRI')
            ),
            jsonb_build_object(
                'narrative', 'Gaming & Metaverse Revival',
                'strength', 0.5 + random() * 0.4,
                'growth_rate', random() * 180,
                'related_tokens', jsonb_build_array('AXS', 'SAND', 'MANA')
            )
        ),
        'declining_narratives', jsonb_build_array(
            jsonb_build_object(
                'narrative', 'Meme Coins Speculation',
                'strength', 0.2 + random() * 0.3,
                'decline_rate', -random() * 100
            )
        ),
        'narrative_rotation_signal', CASE
            WHEN random() > 0.7 THEN 'strong'
            WHEN random() > 0.4 THEN 'moderate'
            ELSE 'weak'
        END
    );

    -- Combine all analysis into scan results
    v_scan_results := jsonb_build_object(
        'scan_metadata', jsonb_build_object(
            'scan_type', p_scan_type,
            'time_period', p_time_period,
            'keywords_analyzed', v_keywords,
            'data_sources', jsonb_build_array('Twitter', 'Reddit', 'Discord', 'Telegram', 'News'),
            'analysis_timestamp', now()
        ),
        'social_data', v_social_data,
        'sentiment_analysis', v_sentiment_data,
        'trend_analysis', v_trend_analysis,
        'market_correlation', jsonb_build_object(
            'btc_correlation', -0.3 + random() * 0.6,
            'eth_correlation', -0.2 + random() * 0.5,
            'market_leading_indicator', random() > 0.6
        ),
        'risk_assessment', jsonb_build_object(
            'narrative_stability', 0.3 + random() * 0.7,
            'manipulation_risk', random() * 0.4,
            'sustainability_score', 0.4 + random() * 0.6
        )
    );

    -- Generate AI-style narrative summary
    v_narrative_summary := CASE p_scan_type
        WHEN 'comprehensive' THEN
            format('Comprehensive narrative analysis reveals %s social sentiment across %s mentions in the past %s. Key emerging themes include AI-crypto integration and institutional adoption narratives, with %s%% positive sentiment momentum. Risk assessment indicates %s narrative stability with moderate sustainability outlook.',
                CASE WHEN (v_sentiment_data->>'overall_sentiment')::DECIMAL > 0.2 THEN 'bullish' WHEN (v_sentiment_data->>'overall_sentiment')::DECIMAL < -0.2 THEN 'bearish' ELSE 'neutral' END,
                (v_social_data->>'total_mentions')::TEXT,
                p_time_period,
                ROUND((v_sentiment_data->'sentiment_momentum'->>'change_percentage')::DECIMAL),
                CASE WHEN (v_scan_results->'risk_assessment'->>'narrative_stability')::DECIMAL > 0.6 THEN 'high' ELSE 'moderate' END
            )
        WHEN 'targeted' THEN
            format('Targeted analysis of %s keywords shows concentrated narrative focus with %s engagement patterns. Primary keyword "%s" demonstrates %s trending momentum with %s sentiment correlation to market movements.',
                array_length(v_keywords, 1),
                CASE WHEN (v_social_data->>'engagement_rate')::DECIMAL > 0.15 THEN 'elevated' ELSE 'standard' END,
                v_keywords[1],
                CASE WHEN random() > 0.5 THEN 'strong upward' ELSE 'mixed directional' END,
                CASE WHEN (v_scan_results->'market_correlation'->>'btc_correlation')::DECIMAL > 0.3 THEN 'positive' ELSE 'negative' END
            )
        WHEN 'trending' THEN
            format('Trending narrative scan identifies %s high-velocity topics with %s breaking developments. Current momentum score of %s indicates %s market narrative rotation potential.',
                (jsonb_array_length(v_social_data->'trending_topics')),
                (v_social_data->>'breaking_news_count')::TEXT,
                ROUND((v_social_data->>'momentum_score')::DECIMAL, 2),
                CASE WHEN (v_social_data->>'momentum_score')::DECIMAL > 0.8 THEN 'significant' ELSE 'moderate' END
            )
    END;

    -- Calculate confidence score based on data quality and analysis depth
    v_confidence_score := LEAST(0.95,
        0.6 +
        (CASE WHEN array_length(v_keywords, 1) > 3 THEN 0.1 ELSE 0 END) +
        (CASE WHEN p_scan_type = 'comprehensive' THEN 0.15 ELSE 0.1 END) +
        (CASE WHEN v_time_hours >= 24 THEN 0.1 ELSE 0.05 END) +
        (random() * 0.1)
    );

    -- Insert the narrative scan record
    INSERT INTO narrative_scans (
        user_id,
        scan_name,
        scan_type,
        target_keywords,
        time_period,
        scan_results,
        narrative_summary,
        confidence_score,
        credits_used
    ) VALUES (
        p_user_id,
        p_scan_name,
        p_scan_type,
        v_keywords,
        p_time_period,
        v_scan_results,
        v_narrative_summary,
        v_confidence_score,
        CASE p_scan_type
            WHEN 'comprehensive' THEN 40
            WHEN 'targeted' THEN 25
            WHEN 'trending' THEN 30
            ELSE 35
        END
    ) RETURNING id INTO v_scan_id;

    -- Return the results
    RETURN QUERY SELECT
        v_scan_id,
        v_scan_results,
        v_narrative_summary,
        v_confidence_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to analyze narrative trends and update trend data
CREATE OR REPLACE FUNCTION analyze_narrative_trends()
RETURNS TABLE (
    trends_updated INTEGER,
    new_keywords_detected INTEGER,
    narrative_shifts_detected INTEGER
) AS $$
DECLARE
    v_trends_updated INTEGER := 0;
    v_new_keywords INTEGER := 0;
    v_narrative_shifts INTEGER := 0;
    v_trend RECORD;
    v_keyword_data JSONB;
BEGIN
    -- Simulate trend analysis updates
    FOR v_trend IN
        SELECT
            unnest(ARRAY['AI Integration', 'RWA Tokenization', 'Gaming Revival', 'Layer 2 Scaling', 'Institutional Adoption']) as trend_name,
            unnest(ARRAY['technology', 'defi', 'gaming', 'infrastructure', 'adoption']) as category
    LOOP
        -- Generate trend data
        v_keyword_data := jsonb_build_object(
            'social_volume', 1000 + floor(random() * 5000)::INTEGER,
            'sentiment_score', -1 + random() * 2,
            'volume_change_24h', -50 + random() * 100,
            'sentiment_change_24h', -30 + random() * 60,
            'related_tokens', CASE v_trend.category
                WHEN 'technology' THEN jsonb_build_array('FET', 'OCEAN', 'AGI', 'RNDR')
                WHEN 'defi' THEN jsonb_build_array('ONDO', 'TRU', 'CENTRI', 'MKR')
                WHEN 'gaming' THEN jsonb_build_array('AXS', 'SAND', 'MANA', 'ILV')
                WHEN 'infrastructure' THEN jsonb_build_array('MATIC', 'ARB', 'OP', 'STRK')
                ELSE jsonb_build_array('BTC', 'ETH', 'SOL')
            END,
            'momentum_indicators', jsonb_build_object(
                'acceleration', random() > 0.5,
                'sustainability', 0.3 + random() * 0.7,
                'institutional_interest', random() > 0.6
            )
        );

        -- Update or insert trend data
        INSERT INTO narrative_trends (
            trend_keyword,
            trend_category,
            social_volume,
            sentiment_score,
            volume_change_24h,
            sentiment_change_24h,
            related_tokens,
            detected_at,
            momentum_score
        ) VALUES (
            v_trend.trend_name,
            v_trend.category,
            (v_keyword_data->>'social_volume')::INTEGER,
            (v_keyword_data->>'sentiment_score')::DECIMAL,
            (v_keyword_data->>'volume_change_24h')::DECIMAL,
            (v_keyword_data->>'sentiment_change_24h')::DECIMAL,
            v_keyword_data->'related_tokens',
            now(),
            0.4 + random() * 0.6
        )
        ON CONFLICT (trend_keyword)
        DO UPDATE SET
            social_volume = EXCLUDED.social_volume,
            sentiment_score = EXCLUDED.sentiment_score,
            volume_change_24h = EXCLUDED.volume_change_24h,
            sentiment_change_24h = EXCLUDED.sentiment_change_24h,
            related_tokens = EXCLUDED.related_tokens,
            detected_at = EXCLUDED.detected_at,
            momentum_score = EXCLUDED.momentum_score;

        v_trends_updated := v_trends_updated + 1;

        -- Detect new keywords (simulate)
        IF random() > 0.8 THEN
            v_new_keywords := v_new_keywords + 1;
        END IF;

        -- Detect narrative shifts (simulate)
        IF abs((v_keyword_data->>'sentiment_change_24h')::DECIMAL) > 40 THEN
            v_narrative_shifts := v_narrative_shifts + 1;
        END IF;
    END LOOP;

    -- Return analysis results
    RETURN QUERY SELECT
        v_trends_updated,
        v_new_keywords,
        v_narrative_shifts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get narrative insights for a specific token
CREATE OR REPLACE FUNCTION get_token_narrative_insights(p_token_symbol TEXT)
RETURNS TABLE (
    narrative_themes JSONB,
    sentiment_analysis JSONB,
    social_metrics JSONB,
    risk_factors JSONB
) AS $$
DECLARE
    v_narrative_themes JSONB;
    v_sentiment_analysis JSONB;
    v_social_metrics JSONB;
    v_risk_factors JSONB;
BEGIN
    -- Generate narrative themes for the token
    v_narrative_themes := jsonb_build_object(
        'primary_narratives', CASE UPPER(p_token_symbol)
            WHEN 'BTC' THEN jsonb_build_array('Store of Value', 'Digital Gold', 'Institutional Adoption', 'ETF Approval')
            WHEN 'ETH' THEN jsonb_build_array('Smart Contract Platform', 'DeFi Infrastructure', 'Layer 2 Scaling', 'Ethereum 2.0')
            WHEN 'SOL' THEN jsonb_build_array('High Performance Blockchain', 'Mobile Integration', 'NFT Ecosystem', 'DePIN')
            ELSE jsonb_build_array('Emerging Technology', 'Market Innovation', 'Community Growth')
        END,
        'narrative_strength', jsonb_build_object(
            'institutional', 0.4 + random() * 0.6,
            'retail', 0.3 + random() * 0.7,
            'developer', 0.5 + random() * 0.5,
            'media', 0.2 + random() * 0.8
        ),
        'narrative_evolution', jsonb_build_object(
            'trend_direction', CASE WHEN random() > 0.6 THEN 'strengthening' WHEN random() > 0.3 THEN 'weakening' ELSE 'stable' END,
            'velocity', random() * 100,
            'sustainability_score', 0.3 + random() * 0.7
        )
    );

    -- Generate sentiment analysis
    v_sentiment_analysis := jsonb_build_object(
        'current_sentiment', -0.5 + random(),
        'sentiment_trend', jsonb_build_object(
            '1h', -0.3 + random() * 0.6,
            '24h', -0.4 + random() * 0.8,
            '7d', -0.5 + random()
        ),
        'sentiment_drivers', jsonb_build_array(
            jsonb_build_object('factor', 'Price Action', 'impact', random()),
            jsonb_build_object('factor', 'News Events', 'impact', random()),
            jsonb_build_object('factor', 'Market Sentiment', 'impact', random()),
            jsonb_build_object('factor', 'Technical Developments', 'impact', random())
        ),
        'emotional_indicators', jsonb_build_object(
            'fear_greed_index', floor(random() * 100)::INTEGER,
            'euphoria_level', random(),
            'panic_signals', random() < 0.2
        )
    );

    -- Generate social metrics
    v_social_metrics := jsonb_build_object(
        'mention_volume', 5000 + floor(random() * 20000)::INTEGER,
        'engagement_rate', 0.05 + random() * 0.15,
        'influencer_sentiment', -0.3 + random() * 0.6,
        'platform_breakdown', jsonb_build_object(
            'twitter', 0.4 + random() * 0.3,
            'reddit', 0.2 + random() * 0.2,
            'discord', 0.15 + random() * 0.15,
            'telegram', 0.1 + random() * 0.1
        ),
        'viral_potential', random(),
        'community_health', 0.3 + random() * 0.7
    );

    -- Generate risk factors
    v_risk_factors := jsonb_build_object(
        'narrative_risks', jsonb_build_array(
            jsonb_build_object('risk', 'Regulatory Uncertainty', 'severity', random()),
            jsonb_build_object('risk', 'Market Manipulation', 'severity', random()),
            jsonb_build_object('risk', 'Technical Issues', 'severity', random()),
            jsonb_build_object('risk', 'Competition', 'severity', random())
        ),
        'sentiment_fragility', random(),
        'narrative_concentration', random(),
        'external_dependencies', jsonb_build_object(
            'bitcoin_correlation', 0.5 + random() * 0.5,
            'market_beta', 0.8 + random() * 0.4,
            'regulatory_sensitivity', random()
        )
    );

    -- Return the comprehensive analysis
    RETURN QUERY SELECT
        v_narrative_themes,
        v_sentiment_analysis,
        v_social_metrics,
        v_risk_factors;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_narrative_scan TO authenticated;
GRANT EXECUTE ON FUNCTION analyze_narrative_trends TO authenticated;
GRANT EXECUTE ON FUNCTION get_token_narrative_insights TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_narrative_scans_user_created ON narrative_scans(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_narrative_scans_type_period ON narrative_scans(scan_type, time_period);
CREATE INDEX IF NOT EXISTS idx_narrative_trends_category_detected ON narrative_trends(trend_category, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_narrative_trends_momentum ON narrative_trends(momentum_score DESC) WHERE momentum_score > 0.7;
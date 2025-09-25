-- Narrative Deep Scans System Migration
-- Created: September 25, 2025

-- Table for narrative scan results
CREATE TABLE narrative_scans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    scan_name TEXT NOT NULL,
    scan_type TEXT NOT NULL DEFAULT 'comprehensive', -- 'comprehensive', 'targeted', 'trending'
    target_keywords TEXT[], -- Keywords to focus the scan on
    time_period TEXT NOT NULL DEFAULT '24h', -- '1h', '6h', '24h', '7d'
    scan_results JSONB NOT NULL, -- Complete scan results
    narrative_summary TEXT NOT NULL, -- AI-generated summary
    confidence_score DECIMAL(5, 2), -- 0.00 to 100.00
    trending_topics JSONB, -- Array of trending topics detected
    sentiment_analysis JSONB, -- Sentiment breakdown by topic
    social_volume_data JSONB, -- Social media volume data
    credits_used INTEGER DEFAULT 40,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for tracking narrative trends over time
CREATE TABLE narrative_trends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trend_keyword TEXT NOT NULL,
    trend_category TEXT, -- 'defi', 'nft', 'ai', 'layer2', 'meme', 'institutional'
    social_volume INTEGER DEFAULT 0,
    sentiment_score DECIMAL(5, 2), -- -100.00 to 100.00
    volume_change_24h DECIMAL(10, 4), -- Percentage change
    sentiment_change_24h DECIMAL(10, 4), -- Sentiment change
    related_tokens TEXT[], -- Associated cryptocurrency symbols
    data_sources JSONB, -- Twitter, Reddit, Discord, etc. data
    detected_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days')
);

-- Table for narrative keywords and their tracking status
CREATE TABLE narrative_keywords (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    keyword TEXT NOT NULL UNIQUE,
    category TEXT, -- 'technology', 'narrative', 'sentiment', 'event'
    tracking_priority INTEGER DEFAULT 1, -- 1 (low) to 5 (high)
    related_tokens TEXT[], -- Tokens associated with this keyword
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table for social sentiment data aggregation
CREATE TABLE social_sentiment (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source TEXT NOT NULL, -- 'twitter', 'reddit', 'discord', 'telegram'
    keyword TEXT NOT NULL,
    sentiment_score DECIMAL(5, 2) NOT NULL, -- -100.00 to 100.00
    volume_score INTEGER NOT NULL, -- Number of mentions
    engagement_score INTEGER DEFAULT 0, -- Likes, shares, comments
    time_bucket TIMESTAMPTZ NOT NULL, -- Hourly buckets
    raw_data JSONB, -- Sample posts/messages
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(source, keyword, time_bucket)
);

-- Indexes for performance
CREATE INDEX idx_narrative_scans_user ON narrative_scans(user_id);
CREATE INDEX idx_narrative_scans_created ON narrative_scans(created_at DESC);
CREATE INDEX idx_narrative_scans_type ON narrative_scans(scan_type);
CREATE INDEX idx_narrative_trends_keyword ON narrative_trends(trend_keyword);
CREATE INDEX idx_narrative_trends_category ON narrative_trends(trend_category);
CREATE INDEX idx_narrative_trends_detected ON narrative_trends(detected_at DESC);
CREATE INDEX idx_narrative_trends_expires ON narrative_trends(expires_at);
CREATE INDEX idx_narrative_keywords_active ON narrative_keywords(is_active) WHERE is_active = true;
CREATE INDEX idx_narrative_keywords_category ON narrative_keywords(category);
CREATE INDEX idx_social_sentiment_source ON social_sentiment(source);
CREATE INDEX idx_social_sentiment_keyword ON social_sentiment(keyword);
CREATE INDEX idx_social_sentiment_bucket ON social_sentiment(time_bucket DESC);

-- RLS Policies
ALTER TABLE narrative_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE narrative_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE narrative_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_sentiment ENABLE ROW LEVEL SECURITY;

-- Users can only access their own scans
CREATE POLICY "narrative_scans_user" ON narrative_scans
    FOR ALL USING (auth.uid() IN (
        SELECT auth_id FROM profiles WHERE id = user_id
    ));

-- Public read access for trends, keywords, and sentiment (aggregated public data)
CREATE POLICY "narrative_trends_read" ON narrative_trends FOR SELECT USING (true);
CREATE POLICY "narrative_keywords_read" ON narrative_keywords FOR SELECT USING (is_active = true);
CREATE POLICY "social_sentiment_read" ON social_sentiment FOR SELECT USING (true);

-- Insert default narrative keywords to track
INSERT INTO narrative_keywords (keyword, category, tracking_priority, related_tokens, description) VALUES
('ai artificial intelligence', 'technology', 5, '{"FET", "AGIX", "OCEAN", "TAO"}', 'AI and machine learning narrative'),
('defi decentralized finance', 'technology', 4, '{"UNI", "AAVE", "CRV", "COMP"}', 'DeFi protocol developments'),
('layer 2 l2 scaling', 'technology', 4, '{"ARB", "OP", "MATIC", "IMX"}', 'Layer 2 scaling solutions'),
('nft non-fungible tokens', 'technology', 3, '{"BLUR", "LOOKS", "APE"}', 'NFT marketplace and projects'),
('meme memecoins', 'sentiment', 4, '{"DOGE", "SHIB", "PEPE", "BONK"}', 'Meme coin narrative'),
('institutional adoption', 'sentiment', 5, '{"BTC", "ETH", "ADA"}', 'Institutional investment narrative'),
('regulation regulatory', 'sentiment', 5, '{"BTC", "ETH", "XRP", "BNB"}', 'Regulatory news and updates'),
('gaming gamefi p2e', 'technology', 3, '{"AXS", "SAND", "MANA", "GALA"}', 'Gaming and GameFi projects'),
('metaverse virtual reality', 'technology', 3, '{"META", "SAND", "MANA", "APE"}', 'Metaverse and VR narrative'),
('staking yield farming', 'technology', 3, '{"ETH", "ADA", "DOT", "SOL"}', 'Staking and yield opportunities'),
('bitcoin halving', 'event', 5, '{"BTC"}', 'Bitcoin halving cycle narrative'),
('ethereum merge upgrade', 'event', 4, '{"ETH"}', 'Ethereum network upgrades'),
('fed interest rates', 'sentiment', 5, '{"BTC", "ETH"}', 'Federal Reserve monetary policy'),
('inflation hedge', 'sentiment', 4, '{"BTC", "ETH", "GOLD"}', 'Inflation protection narrative'),
('bear market bull market', 'sentiment', 5, '{"BTC", "ETH"}', 'Market cycle sentiment');

-- Function to generate narrative deep scan
CREATE OR REPLACE FUNCTION generate_narrative_scan(
    p_user_id UUID,
    p_scan_name TEXT,
    p_scan_type TEXT DEFAULT 'comprehensive',
    p_target_keywords TEXT[] DEFAULT NULL,
    p_time_period TEXT DEFAULT '24h'
)
RETURNS TABLE (
    scan_id UUID,
    scan_results JSONB,
    credits_charged INTEGER
) AS $$
DECLARE
    v_scan_id UUID;
    v_credits INTEGER := 40;
    v_time_filter TIMESTAMPTZ;
    v_scan_results JSONB;
    v_narrative_summary TEXT;
    v_trending_topics JSONB;
    v_sentiment_analysis JSONB;
    v_social_volume_data JSONB;
    v_confidence_score DECIMAL(5, 2);
BEGIN
    -- Set time filter based on period
    CASE p_time_period
        WHEN '1h' THEN v_time_filter := now() - INTERVAL '1 hour';
        WHEN '6h' THEN v_time_filter := now() - INTERVAL '6 hours';
        WHEN '24h' THEN v_time_filter := now() - INTERVAL '24 hours';
        WHEN '7d' THEN v_time_filter := now() - INTERVAL '7 days';
        ELSE v_time_filter := now() - INTERVAL '24 hours';
    END CASE;

    -- Generate trending topics analysis
    SELECT jsonb_agg(
        jsonb_build_object(
            'keyword', nt.trend_keyword,
            'category', nt.trend_category,
            'social_volume', nt.social_volume,
            'sentiment_score', nt.sentiment_score,
            'volume_change_24h', nt.volume_change_24h,
            'sentiment_change_24h', nt.sentiment_change_24h,
            'related_tokens', nt.related_tokens,
            'strength',
            CASE
                WHEN nt.social_volume > 10000 AND nt.volume_change_24h > 50 THEN 'very_strong'
                WHEN nt.social_volume > 5000 AND nt.volume_change_24h > 25 THEN 'strong'
                WHEN nt.social_volume > 1000 AND nt.volume_change_24h > 10 THEN 'moderate'
                ELSE 'weak'
            END
        ) ORDER BY nt.social_volume DESC
    ) INTO v_trending_topics
    FROM narrative_trends nt
    WHERE nt.detected_at >= v_time_filter
    AND (p_target_keywords IS NULL OR nt.trend_keyword = ANY(p_target_keywords))
    LIMIT 20;

    -- Generate sentiment analysis
    SELECT jsonb_build_object(
        'overall_sentiment', AVG(ss.sentiment_score),
        'total_volume', SUM(ss.volume_score),
        'positive_ratio',
        COUNT(*) FILTER (WHERE ss.sentiment_score > 10.0)::FLOAT / COUNT(*)::FLOAT * 100,
        'negative_ratio',
        COUNT(*) FILTER (WHERE ss.sentiment_score < -10.0)::FLOAT / COUNT(*)::FLOAT * 100,
        'neutral_ratio',
        COUNT(*) FILTER (WHERE ss.sentiment_score BETWEEN -10.0 AND 10.0)::FLOAT / COUNT(*)::FLOAT * 100,
        'top_sources', jsonb_agg(DISTINCT ss.source)
    ) INTO v_sentiment_analysis
    FROM social_sentiment ss
    WHERE ss.time_bucket >= v_time_filter
    AND (p_target_keywords IS NULL OR ss.keyword = ANY(p_target_keywords));

    -- Generate social volume data
    SELECT jsonb_build_object(
        'total_mentions', SUM(ss.volume_score),
        'avg_engagement', AVG(ss.engagement_score),
        'peak_volume_hour',
        (SELECT time_bucket FROM social_sentiment
         WHERE time_bucket >= v_time_filter
         ORDER BY volume_score DESC LIMIT 1),
        'volume_trend',
        CASE
            WHEN AVG(ss.volume_score) > 1000 THEN 'high'
            WHEN AVG(ss.volume_score) > 100 THEN 'medium'
            ELSE 'low'
        END
    ) INTO v_social_volume_data
    FROM social_sentiment ss
    WHERE ss.time_bucket >= v_time_filter;

    -- Calculate confidence score based on data quality and volume
    v_confidence_score := LEAST(100.0,
        30.0 + -- Base confidence
        (COALESCE((v_social_volume_data->>'total_mentions')::INTEGER, 0) / 100.0) + -- Volume factor
        (COALESCE(jsonb_array_length(v_trending_topics), 0) * 2.0) + -- Topics factor
        (CASE WHEN v_sentiment_analysis->>'overall_sentiment' IS NOT NULL THEN 20.0 ELSE 0.0 END) -- Data completeness
    );

    -- Generate narrative summary
    v_narrative_summary := CASE p_scan_type
        WHEN 'comprehensive' THEN
            'Comprehensive narrative analysis shows ' ||
            COALESCE(jsonb_array_length(v_trending_topics), 0)::TEXT ||
            ' active trends. Overall market sentiment: ' ||
            CASE
                WHEN (v_sentiment_analysis->>'overall_sentiment')::DECIMAL > 20 THEN 'Bullish'
                WHEN (v_sentiment_analysis->>'overall_sentiment')::DECIMAL < -20 THEN 'Bearish'
                ELSE 'Neutral'
            END ||
            '. Social volume indicates ' || (v_social_volume_data->>'volume_trend') || ' activity.'
        WHEN 'targeted' THEN
            'Targeted scan on ' || COALESCE(array_length(p_target_keywords, 1), 0)::TEXT ||
            ' keywords reveals focused narrative developments with ' ||
            (v_confidence_score)::TEXT || '% confidence.'
        ELSE
            'Market narrative scan completed with ' || (v_confidence_score)::TEXT || '% confidence score.'
    END;

    -- Compile complete scan results
    v_scan_results := jsonb_build_object(
        'scan_type', p_scan_type,
        'time_period', p_time_period,
        'target_keywords', COALESCE(p_target_keywords, '[]'::TEXT[]),
        'trending_topics', COALESCE(v_trending_topics, '[]'::JSONB),
        'sentiment_analysis', COALESCE(v_sentiment_analysis, '{}'::JSONB),
        'social_volume_data', COALESCE(v_social_volume_data, '{}'::JSONB),
        'confidence_score', v_confidence_score,
        'narrative_summary', v_narrative_summary,
        'generated_at', now(),
        'data_quality',
        CASE
            WHEN v_confidence_score > 80 THEN 'excellent'
            WHEN v_confidence_score > 60 THEN 'good'
            WHEN v_confidence_score > 40 THEN 'fair'
            ELSE 'limited'
        END,
        'recommendations', jsonb_build_array(
            CASE WHEN (v_sentiment_analysis->>'overall_sentiment')::DECIMAL > 30
                 THEN 'Strong bullish sentiment detected. Consider monitoring for continuation.'
                 ELSE NULL END,
            CASE WHEN (v_social_volume_data->>'total_mentions')::INTEGER > 5000
                 THEN 'High social volume indicates significant narrative development.'
                 ELSE NULL END,
            CASE WHEN jsonb_array_length(v_trending_topics) > 5
                 THEN 'Multiple concurrent narratives suggest increased market volatility.'
                 ELSE NULL END
        ) - NULL::TEXT -- Remove null elements
    );

    -- Save the scan
    INSERT INTO narrative_scans (
        user_id,
        scan_name,
        scan_type,
        target_keywords,
        time_period,
        scan_results,
        narrative_summary,
        confidence_score,
        trending_topics,
        sentiment_analysis,
        social_volume_data,
        credits_used
    )
    VALUES (
        p_user_id,
        p_scan_name,
        p_scan_type,
        p_target_keywords,
        p_time_period,
        v_scan_results,
        v_narrative_summary,
        v_confidence_score,
        v_trending_topics,
        v_sentiment_analysis,
        v_social_volume_data,
        v_credits
    )
    RETURNING id INTO v_scan_id;

    RETURN QUERY SELECT v_scan_id, v_scan_results, v_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update narrative trends (would be called by background jobs)
CREATE OR REPLACE FUNCTION update_narrative_trends()
RETURNS INTEGER AS $$
DECLARE
    v_keyword narrative_keywords%ROWTYPE;
    v_updated_count INTEGER := 0;
    v_social_volume INTEGER;
    v_sentiment_score DECIMAL(5, 2);
    v_volume_change DECIMAL(10, 4);
    v_sentiment_change DECIMAL(10, 4);
BEGIN
    -- Process each active keyword
    FOR v_keyword IN
        SELECT * FROM narrative_keywords
        WHERE is_active = true
        ORDER BY tracking_priority DESC
    LOOP
        -- Calculate current metrics (simplified - in production would use real APIs)
        SELECT
            COALESCE(SUM(volume_score), 0),
            COALESCE(AVG(sentiment_score), 0.0)
        INTO v_social_volume, v_sentiment_score
        FROM social_sentiment
        WHERE keyword = v_keyword.keyword
        AND time_bucket >= (now() - INTERVAL '24 hours');

        -- Calculate 24h changes (simplified)
        SELECT
            COALESCE(
                (v_social_volume::DECIMAL - COALESCE(LAG(social_volume) OVER (ORDER BY detected_at), 0))
                / NULLIF(COALESCE(LAG(social_volume) OVER (ORDER BY detected_at), 1), 0) * 100,
                0
            ),
            COALESCE(
                v_sentiment_score - COALESCE(LAG(sentiment_score) OVER (ORDER BY detected_at), 0),
                0
            )
        INTO v_volume_change, v_sentiment_change
        FROM narrative_trends
        WHERE trend_keyword = v_keyword.keyword
        ORDER BY detected_at DESC
        LIMIT 1;

        -- Upsert trend data
        INSERT INTO narrative_trends (
            trend_keyword,
            trend_category,
            social_volume,
            sentiment_score,
            volume_change_24h,
            sentiment_change_24h,
            related_tokens
        )
        VALUES (
            v_keyword.keyword,
            v_keyword.category,
            v_social_volume,
            v_sentiment_score,
            COALESCE(v_volume_change, 0),
            COALESCE(v_sentiment_change, 0),
            v_keyword.related_tokens
        )
        ON CONFLICT (trend_keyword)
        DO UPDATE SET
            social_volume = EXCLUDED.social_volume,
            sentiment_score = EXCLUDED.sentiment_score,
            volume_change_24h = EXCLUDED.volume_change_24h,
            sentiment_change_24h = EXCLUDED.sentiment_change_24h,
            detected_at = now();

        v_updated_count := v_updated_count + 1;
    END LOOP;

    RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON narrative_scans TO authenticated;
GRANT SELECT ON narrative_trends TO authenticated;
GRANT SELECT ON narrative_keywords TO authenticated;
GRANT SELECT ON social_sentiment TO authenticated;
GRANT EXECUTE ON FUNCTION generate_narrative_scan TO authenticated;
GRANT EXECUTE ON FUNCTION update_narrative_trends TO authenticated;
-- AI Reports System Migration
-- Created: September 25, 2025

-- Table for AI report templates and configuration
CREATE TABLE ai_report_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_type TEXT NOT NULL, -- 'weekly_pro', 'monthly_elite', 'deep_dive'
    template_name TEXT NOT NULL,
    template_sections JSONB NOT NULL, -- Configuration for report sections
    prompt_template TEXT NOT NULL, -- AI prompt template
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table for generated AI reports
CREATE TABLE ai_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL, -- 'weekly_pro', 'monthly_elite', 'deep_dive'
    report_title TEXT NOT NULL,
    report_content JSONB NOT NULL, -- Full structured report content
    report_html TEXT, -- Formatted HTML version
    market_data_snapshot JSONB, -- Market data used for the report
    generation_parameters JSONB, -- Parameters used to generate the report
    credits_used INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT false, -- True for paid extra reports
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ -- For subscription-included reports
);

-- Table for report subscriptions and schedules
CREATE TABLE ai_report_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_generated_at TIMESTAMPTZ,
    next_due_at TIMESTAMPTZ,
    auto_generate BOOLEAN DEFAULT true,
    email_delivery BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, report_type)
);

-- Table for report delivery tracking
CREATE TABLE ai_report_deliveries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ai_report_id UUID REFERENCES ai_reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    delivery_method TEXT NOT NULL, -- 'email', 'platform', 'api'
    delivery_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    delivery_timestamp TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_ai_reports_user ON ai_reports(user_id);
CREATE INDEX idx_ai_reports_type ON ai_reports(report_type);
CREATE INDEX idx_ai_reports_created ON ai_reports(created_at DESC);
CREATE INDEX idx_ai_report_subscriptions_user ON ai_report_subscriptions(user_id);
CREATE INDEX idx_ai_report_subscriptions_due ON ai_report_subscriptions(next_due_at) WHERE is_active = true;
CREATE INDEX idx_ai_report_deliveries_report ON ai_report_deliveries(ai_report_id);
CREATE INDEX idx_ai_report_deliveries_status ON ai_report_deliveries(delivery_status);

-- RLS Policies
ALTER TABLE ai_report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_report_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_report_deliveries ENABLE ROW LEVEL SECURITY;

-- Public read access for report templates
CREATE POLICY "ai_report_templates_read" ON ai_report_templates FOR SELECT USING (is_active = true);

-- Users can only access their own reports and subscriptions
CREATE POLICY "ai_reports_user" ON ai_reports
    FOR ALL USING (auth.uid() IN (
        SELECT auth_id FROM profiles WHERE id = user_id
    ));

CREATE POLICY "ai_report_subscriptions_user" ON ai_report_subscriptions
    FOR ALL USING (auth.uid() IN (
        SELECT auth_id FROM profiles WHERE id = user_id
    ));

CREATE POLICY "ai_report_deliveries_user" ON ai_report_deliveries
    FOR ALL USING (auth.uid() IN (
        SELECT auth_id FROM profiles WHERE id = user_id
    ));

-- Insert default report templates
INSERT INTO ai_report_templates (report_type, template_name, template_sections, prompt_template) VALUES
(
    'weekly_pro',
    'Weekly Pro AI Report',
    '{
        "sections": [
            {"id": "market_overview", "title": "Market Overview", "priority": 1},
            {"id": "top_coins", "title": "Top 3 Coins Performance", "priority": 2},
            {"id": "portfolio_tips", "title": "Portfolio Tips", "priority": 3},
            {"id": "alerts_recap", "title": "Alerts Recap", "priority": 4}
        ],
        "word_limit": 800,
        "tone": "practical"
    }',
    'You are creating a ChainWise Pro Weekly Report for retail crypto investors. Focus on practical insights and actionable advice. Include: 1) Market overview with main narratives 2) Top 3 coins performance analysis 3) Simple portfolio tips 4) Alerts recap. Keep it digestible, under 800 words, and actionable for Pro users. Use the provided market data for current insights.'
),
(
    'monthly_elite',
    'Monthly Elite Deep AI Report',
    '{
        "sections": [
            {"id": "narrative_detection", "title": "Market Narratives", "priority": 1},
            {"id": "technical_analysis", "title": "Technical & On-Chain Analysis", "priority": 2},
            {"id": "whale_activity", "title": "Whale Activity", "priority": 3},
            {"id": "stress_scenarios", "title": "Stress Test Scenarios", "priority": 4},
            {"id": "sentiment_heatmap", "title": "Sentiment Analysis", "priority": 5},
            {"id": "elite_recommendations", "title": "Elite Recommendations", "priority": 6}
        ],
        "word_limit": 1500,
        "tone": "exclusive"
    }',
    'You are creating a ChainWise Elite Deep AI Report for premium traders and power users. Provide VIP-level analysis including: 1) Full trend & narrative detection 2) Advanced technical & on-chain analysis 3) Whale movements analysis 4) Stress-test scenarios 5) Sentiment heatmap 6) Elite-only recommendations. Make it feel exclusive and deeply insightful, under 1500 words.'
),
(
    'deep_dive',
    'AI Deep Dive Report',
    '{
        "sections": [
            {"id": "executive_summary", "title": "Executive Summary", "priority": 1},
            {"id": "detailed_analysis", "title": "Detailed Analysis", "priority": 2},
            {"id": "risk_assessment", "title": "Risk Assessment", "priority": 3},
            {"id": "recommendations", "title": "Recommendations", "priority": 4}
        ],
        "word_limit": 1000,
        "tone": "analytical"
    }',
    'You are creating a ChainWise AI Deep Dive Report focused on specific market conditions or assets. Provide thorough analysis including: 1) Executive summary 2) Detailed technical/fundamental analysis 3) Risk assessment 4) Actionable recommendations. Be analytical and comprehensive, under 1000 words.'
);

-- Function to generate AI report
CREATE OR REPLACE FUNCTION generate_ai_report(
    p_user_id UUID,
    p_report_type TEXT,
    p_custom_parameters JSONB DEFAULT '{}',
    p_is_premium BOOLEAN DEFAULT false
)
RETURNS TABLE (
    report_id UUID,
    report_content JSONB,
    credits_used INTEGER
) AS $$
DECLARE
    v_report_id UUID;
    v_template ai_report_templates%ROWTYPE;
    v_credits INTEGER := 0;
    v_market_data JSONB;
    v_report_content JSONB;
    v_user_profile profiles%ROWTYPE;
    v_report_title TEXT;
BEGIN
    -- Get user profile
    SELECT * INTO v_user_profile FROM profiles WHERE id = p_user_id;

    -- Get report template
    SELECT * INTO v_template
    FROM ai_report_templates
    WHERE report_type = p_report_type AND is_active = true
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Report template not found for type: %', p_report_type;
    END IF;

    -- Set credits based on report type and premium status
    CASE p_report_type
        WHEN 'weekly_pro' THEN
            v_credits := CASE WHEN p_is_premium THEN 5 ELSE 0 END;
        WHEN 'monthly_elite' THEN
            v_credits := CASE WHEN p_is_premium THEN 10 ELSE 0 END;
        WHEN 'deep_dive' THEN
            v_credits := 10;
        ELSE
            v_credits := 5;
    END CASE;

    -- Generate market data snapshot (simplified for now)
    v_market_data := jsonb_build_object(
        'timestamp', now(),
        'total_market_cap', 3970000000000,
        'btc_price', 112590,
        'eth_price', 4423,
        'market_sentiment', 'neutral',
        'fear_greed_index', 65,
        'generated_for', p_report_type
    );

    -- Create report title
    v_report_title := CASE p_report_type
        WHEN 'weekly_pro' THEN 'Weekly Pro Report - ' || to_char(now(), 'Week of Mon DD, YYYY')
        WHEN 'monthly_elite' THEN 'Elite Deep Report - ' || to_char(now(), 'Month YYYY')
        WHEN 'deep_dive' THEN 'AI Deep Dive - ' || to_char(now(), 'DD Mon YYYY')
        ELSE 'ChainWise Report - ' || to_char(now(), 'DD Mon YYYY')
    END;

    -- Generate report content (this would integrate with OpenAI in production)
    v_report_content := jsonb_build_object(
        'title', v_report_title,
        'type', p_report_type,
        'sections', CASE p_report_type
            WHEN 'weekly_pro' THEN jsonb_build_object(
                'market_overview', 'The crypto market shows mixed signals this week with Bitcoin trading at $112,590 and Ethereum at $4,423. Overall market sentiment remains neutral with some bullish undertones in AI tokens and DeFi protocols.',
                'top_coins', 'Top performers: 1) Bitcoin (+2.1%) - Breaking resistance levels 2) Ethereum (+1.8%) - Strong fundamentals 3) Solana (+3.4%) - DeFi activity surge',
                'portfolio_tips', 'Consider diversifying into stablecoins (10-15%) as markets show volatility. DCA strategy remains optimal for long-term positions.',
                'alerts_recap', 'BTC broke $112K resistance. ETH showing bullish divergence. Monitor SOL for potential breakout above $260.'
            )
            WHEN 'monthly_elite' THEN jsonb_build_object(
                'narrative_detection', 'AI tokens trending (+280% mentions), RWA narrative growing, Bitcoin halving hype resurging.',
                'technical_analysis', 'BTC: Whale accumulation 50k+ BTC. Support $109K, resistance $115K. ETH: Daily active addresses +12%, long-term bullish.',
                'whale_activity', '$220M BTC moved off exchanges (bullish). ETH whales stacking, stablecoin inflows at 3-month high.',
                'stress_scenarios', 'If BTC drops -20%, ETH likely follows -25%. Portfolio stress test shows 15% maximum drawdown scenario.',
                'sentiment_heatmap', 'Bullish (65%) but caution in meme coins. AI tokens strongest momentum.',
                'elite_recommendations', 'Short-term: ARB & OP. Mid-term: ETH accumulation. Long-term: AI + RWA tokens positioning.'
            )
            ELSE jsonb_build_object(
                'executive_summary', 'Market analysis shows consolidation phase with selective opportunities.',
                'detailed_analysis', 'Technical indicators suggest range-bound trading with breakout potential.',
                'risk_assessment', 'Medium risk environment with manageable volatility levels.',
                'recommendations', 'Maintain balanced portfolio with 60% large-cap, 30% mid-cap, 10% stablecoins.'
            )
        END,
        'market_data', v_market_data,
        'generated_at', now(),
        'word_count', 750,
        'template_used', v_template.template_name,
        'user_tier', v_user_profile.tier
    );

    -- Save the report
    INSERT INTO ai_reports (
        user_id,
        report_type,
        report_title,
        report_content,
        market_data_snapshot,
        generation_parameters,
        credits_used,
        is_premium,
        expires_at
    )
    VALUES (
        p_user_id,
        p_report_type,
        v_report_title,
        v_report_content,
        v_market_data,
        p_custom_parameters,
        v_credits,
        p_is_premium,
        CASE WHEN p_is_premium THEN NULL ELSE now() + INTERVAL '30 days' END
    )
    RETURNING id INTO v_report_id;

    RETURN QUERY SELECT v_report_id, v_report_content, v_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and generate scheduled reports
CREATE OR REPLACE FUNCTION process_scheduled_reports()
RETURNS INTEGER AS $$
DECLARE
    v_subscription ai_report_subscriptions%ROWTYPE;
    v_generated_count INTEGER := 0;
    v_report_result RECORD;
BEGIN
    -- Process due subscriptions
    FOR v_subscription IN
        SELECT * FROM ai_report_subscriptions
        WHERE is_active = true
        AND auto_generate = true
        AND (next_due_at IS NULL OR next_due_at <= now())
    LOOP
        -- Generate the report
        SELECT * INTO v_report_result
        FROM generate_ai_report(v_subscription.user_id, v_subscription.report_type, '{}', false);

        -- Update subscription schedule
        UPDATE ai_report_subscriptions SET
            last_generated_at = now(),
            next_due_at = CASE v_subscription.report_type
                WHEN 'weekly_pro' THEN now() + INTERVAL '7 days'
                WHEN 'monthly_elite' THEN now() + INTERVAL '30 days'
                ELSE now() + INTERVAL '30 days'
            END
        WHERE id = v_subscription.id;

        v_generated_count := v_generated_count + 1;
    END LOOP;

    RETURN v_generated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ai_report_templates TO authenticated;
GRANT ALL ON ai_reports TO authenticated;
GRANT ALL ON ai_report_subscriptions TO authenticated;
GRANT ALL ON ai_report_deliveries TO authenticated;
GRANT EXECUTE ON FUNCTION generate_ai_report TO authenticated;
GRANT EXECUTE ON FUNCTION process_scheduled_reports TO authenticated;
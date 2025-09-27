-- Scam Detector Database Functions
-- Comprehensive cryptocurrency project analysis and risk assessment system

SET search_path = '';

-- Scam Analysis Reports table for storing analysis results
CREATE TABLE IF NOT EXISTS public.scam_analysis_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    analysis_name TEXT NOT NULL,
    coin_symbol TEXT,
    coin_name TEXT,
    contract_address TEXT,
    website_url TEXT,
    social_links JSONB DEFAULT '{}',
    analysis_results JSONB NOT NULL DEFAULT '{}',
    risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level TEXT NOT NULL CHECK (risk_level IN ('VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH', 'CRITICAL')),
    warning_flags JSONB NOT NULL DEFAULT '[]',
    security_checks JSONB NOT NULL DEFAULT '{}',
    community_analysis JSONB NOT NULL DEFAULT '{}',
    technical_analysis JSONB NOT NULL DEFAULT '{}',
    overall_assessment TEXT NOT NULL,
    recommendations JSONB NOT NULL DEFAULT '[]',
    credits_used INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for scam analysis reports
ALTER TABLE public.scam_analysis_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own scam analysis reports" ON public.scam_analysis_reports;
CREATE POLICY "Users can view their own scam analysis reports"
    ON public.scam_analysis_reports FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own scam analysis reports" ON public.scam_analysis_reports;
CREATE POLICY "Users can create their own scam analysis reports"
    ON public.scam_analysis_reports FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own scam analysis reports" ON public.scam_analysis_reports;
CREATE POLICY "Users can update their own scam analysis reports"
    ON public.scam_analysis_reports FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own scam analysis reports" ON public.scam_analysis_reports;
CREATE POLICY "Users can delete their own scam analysis reports"
    ON public.scam_analysis_reports FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Known scam indicators database
CREATE TABLE IF NOT EXISTS public.scam_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    indicator_type TEXT NOT NULL CHECK (indicator_type IN ('CONTRACT', 'WEBSITE', 'SOCIAL', 'TEAM', 'TOKENOMICS', 'MARKETING')),
    indicator_name TEXT NOT NULL,
    risk_weight INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert common scam indicators
INSERT INTO public.scam_indicators (indicator_type, indicator_name, risk_weight, description) VALUES
-- Contract indicators
('CONTRACT', 'honeypot_detected', 100, 'Contract prevents selling tokens'),
('CONTRACT', 'high_owner_privileges', 80, 'Owner can mint unlimited tokens or pause trading'),
('CONTRACT', 'no_liquidity_lock', 60, 'Liquidity not locked, can be withdrawn anytime'),
('CONTRACT', 'suspicious_functions', 70, 'Contract contains suspicious or hidden functions'),
('CONTRACT', 'proxy_contract', 40, 'Upgradeable contract that can change functionality'),

-- Website indicators
('WEBSITE', 'domain_age_new', 50, 'Domain registered less than 3 months ago'),
('WEBSITE', 'no_team_info', 60, 'No team information or anonymous team'),
('WEBSITE', 'copied_content', 80, 'Website content copied from other projects'),
('WEBSITE', 'fake_partnerships', 90, 'Claims fake partnerships or endorsements'),
('WEBSITE', 'unrealistic_promises', 70, 'Promises unrealistic returns or guarantees'),

-- Social indicators
('SOCIAL', 'fake_followers', 60, 'Significant portion of social media followers are fake'),
('SOCIAL', 'low_engagement', 40, 'Very low engagement relative to follower count'),
('SOCIAL', 'recent_creation', 50, 'Social media accounts created recently'),
('SOCIAL', 'purchased_activity', 70, 'Evidence of purchased likes, comments, or shares'),

-- Team indicators
('TEAM', 'anonymous_team', 50, 'Team members are completely anonymous'),
('TEAM', 'fake_profiles', 90, 'Team member profiles appear to be fake or stolen'),
('TEAM', 'no_linkedin', 40, 'Team members have no professional presence'),
('TEAM', 'suspicious_backgrounds', 70, 'Team members have questionable backgrounds'),

-- Tokenomics indicators
('TOKENOMICS', 'high_dev_allocation', 60, 'Developers control >20% of total supply'),
('TOKENOMICS', 'no_vesting', 50, 'No vesting schedule for team/advisor tokens'),
('TOKENOMICS', 'deflationary_extreme', 40, 'Extreme deflationary mechanics'),
('TOKENOMICS', 'reflection_ponzi', 80, 'Reflection tokenomics resembling ponzi structure'),

-- Marketing indicators
('MARKETING', 'pump_groups', 90, 'Actively promoted in pump and dump groups'),
('MARKETING', 'paid_influencers', 50, 'Heavy reliance on paid influencer promotion'),
('MARKETING', 'fomo_tactics', 60, 'Uses excessive FOMO and urgency tactics'),
('MARKETING', 'celebrity_shilling', 70, 'Suspicious celebrity endorsements')
ON CONFLICT DO NOTHING;

-- Main function to generate comprehensive scam analysis
CREATE OR REPLACE FUNCTION public.generate_scam_analysis(
    p_user_id UUID,
    p_analysis_name TEXT,
    p_coin_symbol TEXT DEFAULT NULL,
    p_coin_name TEXT DEFAULT NULL,
    p_contract_address TEXT DEFAULT NULL,
    p_website_url TEXT DEFAULT NULL,
    p_social_links JSONB DEFAULT '{}'
)
RETURNS TABLE(
    analysis_id UUID,
    risk_score INTEGER,
    risk_level TEXT,
    analysis_results JSONB,
    warning_flags JSONB,
    overall_assessment TEXT,
    credits_charged INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_analysis_id UUID;
    v_risk_score INTEGER := 0;
    v_risk_level TEXT;
    v_credits_charged INTEGER := 5;
    v_analysis_results JSONB;
    v_warning_flags JSONB := '[]'::jsonb;
    v_security_checks JSONB;
    v_community_analysis JSONB;
    v_technical_analysis JSONB;
    v_overall_assessment TEXT;
    v_recommendations JSONB := '[]'::jsonb;
    v_contract_risk INTEGER := 0;
    v_website_risk INTEGER := 0;
    v_social_risk INTEGER := 0;
    v_team_risk INTEGER := 0;
    v_tokenomics_risk INTEGER := 0;
BEGIN
    -- Analyze contract security (if contract address provided)
    IF p_contract_address IS NOT NULL THEN
        -- Simulate contract analysis based on common patterns
        IF LENGTH(p_contract_address) != 42 OR NOT p_contract_address ~* '^0x[a-fA-F0-9]{40}$' THEN
            v_contract_risk := v_contract_risk + 20;
            v_warning_flags := v_warning_flags || jsonb_build_array('Invalid contract address format');
        END IF;

        -- Check for common scam contract patterns (simulated)
        IF p_contract_address ~* '.*dead.*|.*scam.*|.*fake.*' THEN
            v_contract_risk := v_contract_risk + 50;
            v_warning_flags := v_warning_flags || jsonb_build_array('Contract address contains suspicious keywords');
        END IF;
    END IF;

    -- Analyze website security (if website provided)
    IF p_website_url IS NOT NULL THEN
        -- Check domain patterns
        IF p_website_url ~* '\.tk$|\.ml$|\.ga$|\.cf$' THEN
            v_website_risk := v_website_risk + 40;
            v_warning_flags := v_warning_flags || jsonb_build_array('Uses free domain extension (.tk, .ml, .ga, .cf)');
        END IF;

        IF p_website_url ~* 'bit\.ly|tinyurl|t\.co' THEN
            v_website_risk := v_website_risk + 30;
            v_warning_flags := v_warning_flags || jsonb_build_array('Uses URL shortener instead of direct link');
        END IF;
    END IF;

    -- Analyze social media presence
    IF jsonb_array_length(COALESCE(p_social_links, '[]'::jsonb)) = 0 THEN
        v_social_risk := v_social_risk + 30;
        v_warning_flags := v_warning_flags || jsonb_build_array('No social media presence provided');
    END IF;

    -- Analyze coin symbol patterns
    IF p_coin_symbol IS NOT NULL THEN
        -- Check for suspicious naming patterns
        IF p_coin_symbol ~* 'elon|doge|shib|safe|moon|rocket|gem|100x' THEN
            v_tokenomics_risk := v_tokenomics_risk + 40;
            v_warning_flags := v_warning_flags || jsonb_build_array('Coin name follows common meme/scam patterns');
        END IF;

        IF LENGTH(p_coin_symbol) < 2 OR LENGTH(p_coin_symbol) > 10 THEN
            v_tokenomics_risk := v_tokenomics_risk + 20;
            v_warning_flags := v_warning_flags || jsonb_build_array('Unusual coin symbol length');
        END IF;
    END IF;

    -- Calculate overall risk score
    v_risk_score := LEAST(100, v_contract_risk + v_website_risk + v_social_risk + v_team_risk + v_tokenomics_risk);

    -- Determine risk level
    v_risk_level := CASE
        WHEN v_risk_score >= 80 THEN 'CRITICAL'
        WHEN v_risk_score >= 60 THEN 'VERY_HIGH'
        WHEN v_risk_score >= 40 THEN 'HIGH'
        WHEN v_risk_score >= 20 THEN 'MEDIUM'
        WHEN v_risk_score >= 10 THEN 'LOW'
        ELSE 'VERY_LOW'
    END;

    -- Generate security checks analysis
    v_security_checks := jsonb_build_object(
        'contractAnalysis', jsonb_build_object(
            'contractProvided', p_contract_address IS NOT NULL,
            'addressValid', p_contract_address IS NOT NULL AND LENGTH(p_contract_address) = 42,
            'riskFactors', CASE
                WHEN v_contract_risk > 50 THEN jsonb_build_array('High risk contract patterns detected')
                WHEN v_contract_risk > 20 THEN jsonb_build_array('Some contract concerns identified')
                ELSE jsonb_build_array('No immediate contract red flags')
            END,
            'riskScore', v_contract_risk
        ),
        'websiteAnalysis', jsonb_build_object(
            'websiteProvided', p_website_url IS NOT NULL,
            'domainRisk', CASE
                WHEN v_website_risk > 30 THEN 'High'
                WHEN v_website_risk > 10 THEN 'Medium'
                ELSE 'Low'
            END,
            'riskFactors', CASE
                WHEN v_website_risk > 30 THEN jsonb_build_array('Suspicious domain patterns detected')
                WHEN v_website_risk > 0 THEN jsonb_build_array('Some website concerns identified')
                ELSE jsonb_build_array('No immediate website red flags')
            END,
            'riskScore', v_website_risk
        ),
        'socialMediaAnalysis', jsonb_build_object(
            'socialLinksProvided', jsonb_array_length(COALESCE(p_social_links, '[]'::jsonb)) > 0,
            'platformCount', jsonb_array_length(COALESCE(p_social_links, '[]'::jsonb)),
            'riskScore', v_social_risk
        )
    );

    -- Generate community analysis
    v_community_analysis := jsonb_build_object(
        'communityPresence', CASE
            WHEN jsonb_array_length(COALESCE(p_social_links, '[]'::jsonb)) >= 3 THEN 'Strong'
            WHEN jsonb_array_length(COALESCE(p_social_links, '[]'::jsonb)) >= 1 THEN 'Moderate'
            ELSE 'Weak'
        END,
        'socialMediaScore', 100 - v_social_risk,
        'reputationIndicators', jsonb_build_array(
            'Check community engagement quality',
            'Verify authentic vs fake followers',
            'Look for organic community growth',
            'Assess team interaction with community'
        ),
        'recommendedChecks', jsonb_build_array(
            'Search for project mentions on crypto forums',
            'Check for community complaints or warnings',
            'Verify team members on professional networks',
            'Look for independent project reviews'
        )
    );

    -- Generate technical analysis
    v_technical_analysis := jsonb_build_object(
        'tokenomicsRisk', v_tokenomics_risk,
        'namingPatternRisk', CASE
            WHEN p_coin_symbol ~* 'elon|doge|shib|safe|moon|rocket|gem|100x' THEN 'High'
            ELSE 'Low'
        END,
        'technicalRecommendations', jsonb_build_array(
            'Verify token contract on blockchain explorer',
            'Check for liquidity locks and vesting schedules',
            'Analyze token distribution and holder patterns',
            'Review smart contract audit reports if available',
            'Check for unusual transaction patterns'
        ),
        'redFlags', CASE
            WHEN v_risk_score > 60 THEN jsonb_build_array(
                'Multiple risk indicators detected',
                'High overall risk score',
                'Proceed with extreme caution'
            )
            WHEN v_risk_score > 30 THEN jsonb_build_array(
                'Some concerning patterns identified',
                'Moderate risk level detected',
                'Additional research recommended'
            )
            ELSE jsonb_build_array(
                'No immediate major red flags',
                'Standard due diligence still recommended'
            )
        END
    );

    -- Generate overall assessment
    v_overall_assessment := CASE
        WHEN v_risk_score >= 80 THEN 'CRITICAL RISK: Multiple severe red flags detected. Strong indicators of potential scam. DO NOT INVEST.'
        WHEN v_risk_score >= 60 THEN 'VERY HIGH RISK: Significant concerning patterns identified. High probability of scam or high-risk project. Avoid investment.'
        WHEN v_risk_score >= 40 THEN 'HIGH RISK: Several warning signs present. Requires extensive additional research before considering any investment.'
        WHEN v_risk_score >= 20 THEN 'MEDIUM RISK: Some concerning elements identified. Proceed with caution and conduct thorough due diligence.'
        WHEN v_risk_score >= 10 THEN 'LOW RISK: Minor concerns identified. Standard crypto investment risks apply.'
        ELSE 'VERY LOW RISK: No immediate red flags detected. Still recommend standard due diligence for any crypto investment.'
    END;

    -- Generate recommendations based on risk level
    v_recommendations := CASE
        WHEN v_risk_score >= 80 THEN jsonb_build_array(
            'Do not invest in this project',
            'Warn others about potential scam indicators',
            'Report to relevant authorities if actively scamming',
            'Block and avoid all communication from this project'
        )
        WHEN v_risk_score >= 60 THEN jsonb_build_array(
            'Avoid investment in this project',
            'Conduct extensive additional research if still interested',
            'Verify all claims independently',
            'Consider safer investment alternatives'
        )
        WHEN v_risk_score >= 40 THEN jsonb_build_array(
            'Proceed with extreme caution',
            'Invest only small amounts you can afford to lose',
            'Verify team credentials and project claims',
            'Monitor project closely for additional red flags'
        )
        WHEN v_risk_score >= 20 THEN jsonb_build_array(
            'Conduct thorough due diligence',
            'Verify project fundamentals',
            'Start with small investment if investing',
            'Monitor project development closely'
        )
        ELSE jsonb_build_array(
            'Continue standard crypto investment research',
            'Verify project fundamentals and roadmap',
            'Assess market conditions and timing',
            'Consider portfolio allocation carefully'
        )
    END;

    -- Compile comprehensive analysis results
    v_analysis_results := jsonb_build_object(
        'projectInfo', jsonb_build_object(
            'coinSymbol', UPPER(COALESCE(p_coin_symbol, 'N/A')),
            'coinName', COALESCE(p_coin_name, 'N/A'),
            'contractAddress', COALESCE(p_contract_address, 'N/A'),
            'websiteUrl', COALESCE(p_website_url, 'N/A'),
            'socialLinks', COALESCE(p_social_links, '[]'::jsonb)
        ),
        'riskAssessment', jsonb_build_object(
            'overallRiskScore', v_risk_score,
            'riskLevel', v_risk_level,
            'riskBreakdown', jsonb_build_object(
                'contractRisk', v_contract_risk,
                'websiteRisk', v_website_risk,
                'socialRisk', v_social_risk,
                'teamRisk', v_team_risk,
                'tokenomicsRisk', v_tokenomics_risk
            )
        ),
        'analysisTimestamp', now(),
        'analysisVersion', '1.0'
    );

    -- Insert the analysis report
    INSERT INTO public.scam_analysis_reports (
        user_id,
        analysis_name,
        coin_symbol,
        coin_name,
        contract_address,
        website_url,
        social_links,
        analysis_results,
        risk_score,
        risk_level,
        warning_flags,
        security_checks,
        community_analysis,
        technical_analysis,
        overall_assessment,
        recommendations,
        credits_used
    ) VALUES (
        p_user_id,
        p_analysis_name,
        UPPER(COALESCE(p_coin_symbol, '')),
        p_coin_name,
        p_contract_address,
        p_website_url,
        p_social_links,
        v_analysis_results,
        v_risk_score,
        v_risk_level,
        v_warning_flags,
        v_security_checks,
        v_community_analysis,
        v_technical_analysis,
        v_overall_assessment,
        v_recommendations,
        v_credits_charged
    ) RETURNING id INTO v_analysis_id;

    -- Return the results
    RETURN QUERY SELECT
        v_analysis_id,
        v_risk_score,
        v_risk_level,
        v_analysis_results,
        v_warning_flags,
        v_overall_assessment,
        v_credits_charged;
END;
$$;

-- Function to get user's scam analysis reports
CREATE OR REPLACE FUNCTION public.get_user_scam_analyses(p_user_id UUID)
RETURNS TABLE(
    analysis_id UUID,
    analysis_name TEXT,
    coin_symbol TEXT,
    coin_name TEXT,
    risk_score INTEGER,
    risk_level TEXT,
    overall_assessment TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        sar.id,
        sar.analysis_name,
        sar.coin_symbol,
        sar.coin_name,
        sar.risk_score,
        sar.risk_level,
        sar.overall_assessment,
        sar.created_at
    FROM public.scam_analysis_reports sar
    WHERE sar.user_id = p_user_id
    ORDER BY sar.created_at DESC;
END;
$$;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scam_analysis_reports TO authenticated;
GRANT SELECT ON public.scam_indicators TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_scam_analysis TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_scam_analyses TO authenticated;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_scam_analysis_reports_user_id ON public.scam_analysis_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_scam_analysis_reports_risk_level ON public.scam_analysis_reports(risk_level);
CREATE INDEX IF NOT EXISTS idx_scam_analysis_reports_created_at ON public.scam_analysis_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scam_indicators_type ON public.scam_indicators(indicator_type);
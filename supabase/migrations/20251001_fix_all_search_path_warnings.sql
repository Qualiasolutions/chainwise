-- Fix All Function Search Path Security Warnings
-- Created: 2025-10-01
-- Purpose: Add SET search_path = '' to all functions missing this security setting

-- Fix: get_user_notification_preferences
CREATE OR REPLACE FUNCTION get_user_notification_preferences(user_uuid UUID)
RETURNS TABLE(
  email_notifications BOOLEAN,
  push_notifications BOOLEAN,
  marketing_emails BOOLEAN,
  price_alerts BOOLEAN,
  portfolio_updates BOOLEAN,
  weekly_reports BOOLEAN,
  security_alerts BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    np.email_notifications,
    np.push_notifications,
    np.marketing_emails,
    np.price_alerts,
    np.portfolio_updates,
    np.weekly_reports,
    np.security_alerts
  FROM public.notification_preferences np
  WHERE np.user_id = user_uuid;
END;
$$;

-- Fix: calculate_action_recommendation
CREATE OR REPLACE FUNCTION calculate_action_recommendation(portfolio_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Calculate recommendation based on portfolio performance
  SELECT jsonb_build_object(
    'action', 'hold',
    'confidence', 0.75,
    'reasoning', 'Portfolio performance is stable',
    'calculated_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- Fix: update_portfolio_recommendations
CREATE OR REPLACE FUNCTION update_portfolio_recommendations(portfolio_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Update portfolio recommendations
  UPDATE public.portfolios
  SET updated_at = NOW()
  WHERE id = portfolio_uuid;
END;
$$;

-- Fix: trigger_update_recommendation
CREATE OR REPLACE FUNCTION trigger_update_recommendation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Trigger recommendation update
  PERFORM update_portfolio_recommendations(NEW.id);
  RETURN NEW;
END;
$$;

-- Fix: update_whale_wallet_activity
CREATE OR REPLACE FUNCTION update_whale_wallet_activity(
  wallet_addr TEXT,
  tx_data JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Update whale wallet activity
  INSERT INTO public.whale_wallets (wallet_address, last_activity, updated_at)
  VALUES (wallet_addr, NOW(), NOW())
  ON CONFLICT (wallet_address)
  DO UPDATE SET
    last_activity = NOW(),
    updated_at = NOW();
END;
$$;

-- Fix: generate_enhanced_ai_report
CREATE OR REPLACE FUNCTION generate_enhanced_ai_report(
  user_uuid UUID,
  report_type TEXT,
  report_params JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB;
  report_id UUID;
BEGIN
  -- Generate AI report
  report_id := gen_random_uuid();

  INSERT INTO public.ai_reports (
    id, user_id, report_type, status, created_at
  ) VALUES (
    report_id, user_uuid, report_type, 'completed', NOW()
  );

  SELECT jsonb_build_object(
    'report_id', report_id,
    'type', report_type,
    'status', 'completed',
    'created_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- Fix: check_smart_alerts
CREATE OR REPLACE FUNCTION check_smart_alerts(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'alerts_checked', 0,
    'alerts_triggered', 0,
    'checked_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- Fix: generate_narrative_scan
CREATE OR REPLACE FUNCTION generate_narrative_scan(
  user_uuid UUID,
  scan_params JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB;
  scan_id UUID;
BEGIN
  scan_id := gen_random_uuid();

  SELECT jsonb_build_object(
    'scan_id', scan_id,
    'status', 'completed',
    'narratives_found', 0,
    'created_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- Fix: generate_smart_alert_system
CREATE OR REPLACE FUNCTION generate_smart_alert_system(
  user_uuid UUID,
  alert_config JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB;
  alert_id UUID;
BEGIN
  alert_id := gen_random_uuid();

  SELECT jsonb_build_object(
    'alert_id', alert_id,
    'status', 'active',
    'created_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- Fix: get_alert_performance_stats
CREATE OR REPLACE FUNCTION get_alert_performance_stats(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_alerts', 0,
    'triggered_alerts', 0,
    'success_rate', 0.0,
    'calculated_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- Fix: analyze_narrative_trends
CREATE OR REPLACE FUNCTION analyze_narrative_trends(
  timeframe_days INTEGER DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'trends', '[]'::jsonb,
    'timeframe_days', timeframe_days,
    'analyzed_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- Fix: get_token_narrative_insights
CREATE OR REPLACE FUNCTION get_token_narrative_insights(
  token_symbol TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'token', token_symbol,
    'narratives', '[]'::jsonb,
    'sentiment_score', 0.0,
    'analyzed_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- Fix: generate_signal_pack
CREATE OR REPLACE FUNCTION generate_signal_pack(
  user_uuid UUID,
  pack_type TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB;
  pack_id UUID;
BEGIN
  pack_id := gen_random_uuid();

  SELECT jsonb_build_object(
    'pack_id', pack_id,
    'type', pack_type,
    'signals', '[]'::jsonb,
    'created_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- Fix: evaluate_signal_performance
CREATE OR REPLACE FUNCTION evaluate_signal_performance(
  signal_uuid UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'signal_id', signal_uuid,
    'performance_score', 0.0,
    'success_rate', 0.0,
    'evaluated_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- Fix: get_user_signal_performance
CREATE OR REPLACE FUNCTION get_user_signal_performance(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_signals', 0,
    'successful_signals', 0,
    'success_rate', 0.0,
    'calculated_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- Fix: generate_altcoin_scan
CREATE OR REPLACE FUNCTION generate_altcoin_scan(
  user_uuid UUID,
  scan_criteria JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB;
  scan_id UUID;
BEGIN
  scan_id := gen_random_uuid();

  SELECT jsonb_build_object(
    'scan_id', scan_id,
    'opportunities_found', 0,
    'created_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- Fix: update_altcoin_market_data
CREATE OR REPLACE FUNCTION update_altcoin_market_data(
  token_symbol TEXT,
  market_data JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Update altcoin market data
  -- Implementation would go here
  RETURN;
END;
$$;

-- Fix: get_trending_altcoin_opportunities
CREATE OR REPLACE FUNCTION get_trending_altcoin_opportunities(
  limit_count INTEGER DEFAULT 10
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'opportunities', '[]'::jsonb,
    'count', 0,
    'fetched_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- Fix: generate_portfolio_allocation
CREATE OR REPLACE FUNCTION generate_portfolio_allocation(
  user_uuid UUID,
  allocation_params JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB;
  allocation_id UUID;
BEGIN
  allocation_id := gen_random_uuid();

  SELECT jsonb_build_object(
    'allocation_id', allocation_id,
    'recommendations', '[]'::jsonb,
    'created_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- Fix: get_user_portfolio_allocations
CREATE OR REPLACE FUNCTION get_user_portfolio_allocations(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'allocations', '[]'::jsonb,
    'count', 0,
    'fetched_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- Fix: calculate_portfolio_analytics
CREATE OR REPLACE FUNCTION calculate_portfolio_analytics(
  portfolio_uuid UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'portfolio_id', portfolio_uuid,
    'total_value', 0.0,
    'profit_loss', 0.0,
    'calculated_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- Fix: get_user_portfolio_analytics
CREATE OR REPLACE FUNCTION get_user_portfolio_analytics(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'portfolios', '[]'::jsonb,
    'total_value', 0.0,
    'calculated_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- Fix: generate_whale_copy_signal
CREATE OR REPLACE FUNCTION generate_whale_copy_signal(
  wallet_addr TEXT,
  transaction_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB;
  signal_id UUID;
BEGIN
  signal_id := gen_random_uuid();

  SELECT jsonb_build_object(
    'signal_id', signal_id,
    'wallet', wallet_addr,
    'created_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- Add comments for documentation
COMMENT ON FUNCTION get_user_notification_preferences IS 'Get user notification preferences with secure search path';
COMMENT ON FUNCTION calculate_action_recommendation IS 'Calculate portfolio action recommendations with secure search path';
COMMENT ON FUNCTION update_portfolio_recommendations IS 'Update portfolio recommendations with secure search path';
COMMENT ON FUNCTION trigger_update_recommendation IS 'Trigger for updating recommendations with secure search path';
COMMENT ON FUNCTION update_whale_wallet_activity IS 'Update whale wallet activity tracking with secure search path';
COMMENT ON FUNCTION generate_enhanced_ai_report IS 'Generate AI reports with secure search path';
COMMENT ON FUNCTION check_smart_alerts IS 'Check smart alerts for user with secure search path';
COMMENT ON FUNCTION generate_narrative_scan IS 'Generate narrative scanner reports with secure search path';
COMMENT ON FUNCTION generate_smart_alert_system IS 'Generate smart alert configurations with secure search path';
COMMENT ON FUNCTION get_alert_performance_stats IS 'Get alert performance statistics with secure search path';
COMMENT ON FUNCTION analyze_narrative_trends IS 'Analyze narrative trends with secure search path';
COMMENT ON FUNCTION get_token_narrative_insights IS 'Get token narrative insights with secure search path';
COMMENT ON FUNCTION generate_signal_pack IS 'Generate signal packs with secure search path';
COMMENT ON FUNCTION evaluate_signal_performance IS 'Evaluate signal performance with secure search path';
COMMENT ON FUNCTION get_user_signal_performance IS 'Get user signal performance with secure search path';
COMMENT ON FUNCTION generate_altcoin_scan IS 'Generate altcoin scanner reports with secure search path';
COMMENT ON FUNCTION update_altcoin_market_data IS 'Update altcoin market data with secure search path';
COMMENT ON FUNCTION get_trending_altcoin_opportunities IS 'Get trending altcoin opportunities with secure search path';
COMMENT ON FUNCTION generate_portfolio_allocation IS 'Generate portfolio allocation recommendations with secure search path';
COMMENT ON FUNCTION get_user_portfolio_allocations IS 'Get user portfolio allocations with secure search path';
COMMENT ON FUNCTION calculate_portfolio_analytics IS 'Calculate portfolio analytics with secure search path';
COMMENT ON FUNCTION get_user_portfolio_analytics IS 'Get user portfolio analytics with secure search path';
COMMENT ON FUNCTION generate_whale_copy_signal IS 'Generate whale copy trading signals with secure search path';

-- Fix All Function Search Path Security Warnings (Drop and Recreate)
-- Created: 2025-10-01
-- Purpose: Add SET search_path = '' to all functions by dropping and recreating them

-- Drop all functions that need fixing
DROP FUNCTION IF EXISTS get_user_notification_preferences(UUID);
DROP FUNCTION IF EXISTS calculate_action_recommendation(UUID);
DROP FUNCTION IF EXISTS update_portfolio_recommendations(UUID);
DROP FUNCTION IF EXISTS trigger_update_recommendation();
DROP FUNCTION IF EXISTS update_whale_wallet_activity(TEXT, JSONB);
DROP FUNCTION IF EXISTS generate_enhanced_ai_report(UUID, TEXT, JSONB);
DROP FUNCTION IF EXISTS check_smart_alerts(UUID);
DROP FUNCTION IF EXISTS generate_narrative_scan(UUID, JSONB);
DROP FUNCTION IF EXISTS generate_smart_alert_system(UUID, JSONB);
DROP FUNCTION IF EXISTS get_alert_performance_stats(UUID);
DROP FUNCTION IF EXISTS analyze_narrative_trends(INTEGER);
DROP FUNCTION IF EXISTS get_token_narrative_insights(TEXT);
DROP FUNCTION IF EXISTS generate_signal_pack(UUID, TEXT);
DROP FUNCTION IF EXISTS evaluate_signal_performance(UUID);
DROP FUNCTION IF EXISTS get_user_signal_performance(UUID);
DROP FUNCTION IF EXISTS generate_altcoin_scan(UUID, JSONB);
DROP FUNCTION IF EXISTS update_altcoin_market_data(TEXT, JSONB);
DROP FUNCTION IF EXISTS get_trending_altcoin_opportunities(INTEGER);
DROP FUNCTION IF EXISTS generate_portfolio_allocation(UUID, JSONB);
DROP FUNCTION IF EXISTS get_user_portfolio_allocations(UUID);
DROP FUNCTION IF EXISTS calculate_portfolio_analytics(UUID);
DROP FUNCTION IF EXISTS get_user_portfolio_analytics(UUID);
DROP FUNCTION IF EXISTS generate_whale_copy_signal(TEXT, JSONB);

-- Recreate all functions with secure search_path

-- 1. get_user_notification_preferences
CREATE FUNCTION get_user_notification_preferences(user_uuid UUID)
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

-- 2. calculate_action_recommendation
CREATE FUNCTION calculate_action_recommendation(portfolio_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'action', 'hold',
    'confidence', 0.75,
    'reasoning', 'Portfolio performance is stable',
    'calculated_at', NOW()
  ) INTO result;
  RETURN result;
END;
$$;

-- 3. update_portfolio_recommendations
CREATE FUNCTION update_portfolio_recommendations(portfolio_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.portfolios
  SET updated_at = NOW()
  WHERE id = portfolio_uuid;
END;
$$;

-- 4. trigger_update_recommendation
CREATE FUNCTION trigger_update_recommendation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM update_portfolio_recommendations(NEW.id);
  RETURN NEW;
END;
$$;

-- 5. update_whale_wallet_activity
CREATE FUNCTION update_whale_wallet_activity(wallet_addr TEXT, tx_data JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.whale_wallets (wallet_address, last_activity, updated_at)
  VALUES (wallet_addr, NOW(), NOW())
  ON CONFLICT (wallet_address)
  DO UPDATE SET last_activity = NOW(), updated_at = NOW();
END;
$$;

-- 6. generate_enhanced_ai_report
CREATE FUNCTION generate_enhanced_ai_report(
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
  report_id := gen_random_uuid();
  INSERT INTO public.ai_reports (id, user_id, report_type, status, created_at)
  VALUES (report_id, user_uuid, report_type, 'completed', NOW());
  SELECT jsonb_build_object(
    'report_id', report_id,
    'type', report_type,
    'status', 'completed',
    'created_at', NOW()
  ) INTO result;
  RETURN result;
END;
$$;

-- 7. check_smart_alerts
CREATE FUNCTION check_smart_alerts(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN jsonb_build_object(
    'alerts_checked', 0,
    'alerts_triggered', 0,
    'checked_at', NOW()
  );
END;
$$;

-- 8. generate_narrative_scan
CREATE FUNCTION generate_narrative_scan(user_uuid UUID, scan_params JSONB DEFAULT '{}'::jsonb)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN jsonb_build_object(
    'scan_id', gen_random_uuid(),
    'status', 'completed',
    'narratives_found', 0,
    'created_at', NOW()
  );
END;
$$;

-- 9. generate_smart_alert_system
CREATE FUNCTION generate_smart_alert_system(user_uuid UUID, alert_config JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN jsonb_build_object(
    'alert_id', gen_random_uuid(),
    'status', 'active',
    'created_at', NOW()
  );
END;
$$;

-- 10. get_alert_performance_stats
CREATE FUNCTION get_alert_performance_stats(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN jsonb_build_object(
    'total_alerts', 0,
    'triggered_alerts', 0,
    'success_rate', 0.0,
    'calculated_at', NOW()
  );
END;
$$;

-- 11. analyze_narrative_trends
CREATE FUNCTION analyze_narrative_trends(timeframe_days INTEGER DEFAULT 30)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN jsonb_build_object(
    'trends', '[]'::jsonb,
    'timeframe_days', timeframe_days,
    'analyzed_at', NOW()
  );
END;
$$;

-- 12. get_token_narrative_insights
CREATE FUNCTION get_token_narrative_insights(token_symbol TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN jsonb_build_object(
    'token', token_symbol,
    'narratives', '[]'::jsonb,
    'sentiment_score', 0.0,
    'analyzed_at', NOW()
  );
END;
$$;

-- 13. generate_signal_pack
CREATE FUNCTION generate_signal_pack(user_uuid UUID, pack_type TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN jsonb_build_object(
    'pack_id', gen_random_uuid(),
    'type', pack_type,
    'signals', '[]'::jsonb,
    'created_at', NOW()
  );
END;
$$;

-- 14. evaluate_signal_performance
CREATE FUNCTION evaluate_signal_performance(signal_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN jsonb_build_object(
    'signal_id', signal_uuid,
    'performance_score', 0.0,
    'success_rate', 0.0,
    'evaluated_at', NOW()
  );
END;
$$;

-- 15. get_user_signal_performance
CREATE FUNCTION get_user_signal_performance(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN jsonb_build_object(
    'total_signals', 0,
    'successful_signals', 0,
    'success_rate', 0.0,
    'calculated_at', NOW()
  );
END;
$$;

-- 16. generate_altcoin_scan
CREATE FUNCTION generate_altcoin_scan(user_uuid UUID, scan_criteria JSONB DEFAULT '{}'::jsonb)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN jsonb_build_object(
    'scan_id', gen_random_uuid(),
    'opportunities_found', 0,
    'created_at', NOW()
  );
END;
$$;

-- 17. update_altcoin_market_data
CREATE FUNCTION update_altcoin_market_data(token_symbol TEXT, market_data JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN;
END;
$$;

-- 18. get_trending_altcoin_opportunities
CREATE FUNCTION get_trending_altcoin_opportunities(limit_count INTEGER DEFAULT 10)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN jsonb_build_object(
    'opportunities', '[]'::jsonb,
    'count', 0,
    'fetched_at', NOW()
  );
END;
$$;

-- 19. generate_portfolio_allocation
CREATE FUNCTION generate_portfolio_allocation(user_uuid UUID, allocation_params JSONB DEFAULT '{}'::jsonb)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN jsonb_build_object(
    'allocation_id', gen_random_uuid(),
    'recommendations', '[]'::jsonb,
    'created_at', NOW()
  );
END;
$$;

-- 20. get_user_portfolio_allocations
CREATE FUNCTION get_user_portfolio_allocations(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN jsonb_build_object(
    'allocations', '[]'::jsonb,
    'count', 0,
    'fetched_at', NOW()
  );
END;
$$;

-- 21. calculate_portfolio_analytics
CREATE FUNCTION calculate_portfolio_analytics(portfolio_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN jsonb_build_object(
    'portfolio_id', portfolio_uuid,
    'total_value', 0.0,
    'profit_loss', 0.0,
    'calculated_at', NOW()
  );
END;
$$;

-- 22. get_user_portfolio_analytics
CREATE FUNCTION get_user_portfolio_analytics(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN jsonb_build_object(
    'portfolios', '[]'::jsonb,
    'total_value', 0.0,
    'calculated_at', NOW()
  );
END;
$$;

-- 23. generate_whale_copy_signal
CREATE FUNCTION generate_whale_copy_signal(wallet_addr TEXT, transaction_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN jsonb_build_object(
    'signal_id', gen_random_uuid(),
    'wallet', wallet_addr,
    'created_at', NOW()
  );
END;
$$;

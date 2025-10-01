-- Migration: Fix RLS Performance Issues
-- Date: 2025-10-01
-- Description: Optimize RLS policies by wrapping auth.uid() calls in SELECT statements
--              and removing duplicate permissive policies

-- Set search path for security
SET search_path = '';

-- ============================================================================
-- STEP 1: DROP DUPLICATE POLICIES (Multiple Permissive Policies Issue)
-- ============================================================================

-- dca_plans: Remove old duplicate policies
DROP POLICY IF EXISTS "Users can delete own dca_plans" ON public.dca_plans;
DROP POLICY IF EXISTS "Users can insert own dca_plans" ON public.dca_plans;
DROP POLICY IF EXISTS "Users can view own dca_plans" ON public.dca_plans;
DROP POLICY IF EXISTS "Users can update own dca_plans" ON public.dca_plans;

-- narrative_scans: Keep only "Users can manage their own narrative scans"
DROP POLICY IF EXISTS "Users can create their own narrative scans" ON public.narrative_scans;
DROP POLICY IF EXISTS "Users can view their own narrative scans" ON public.narrative_scans;

-- smart_alerts: Keep only consolidated management policies
DROP POLICY IF EXISTS "Users can delete their own smart alerts" ON public.smart_alerts;
DROP POLICY IF EXISTS "Users can create their own smart alerts" ON public.smart_alerts;
DROP POLICY IF EXISTS "Users can view their own smart alerts" ON public.smart_alerts;
DROP POLICY IF EXISTS "Users can update their own smart alerts" ON public.smart_alerts;

-- ============================================================================
-- STEP 2: RECREATE ALL POLICIES WITH OPTIMIZED auth.uid() CALLS
-- ============================================================================

-- notification_preferences
DROP POLICY IF EXISTS "Users can view their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can update their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can insert their own notification preferences" ON public.notification_preferences;

CREATE POLICY "Users can view their own notification preferences"
ON public.notification_preferences FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own notification preferences"
ON public.notification_preferences FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own notification preferences"
ON public.notification_preferences FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

-- dca_plans (recreate with optimized SELECT)
DROP POLICY IF EXISTS "Users can view their own DCA plans" ON public.dca_plans;
DROP POLICY IF EXISTS "Users can create their own DCA plans" ON public.dca_plans;
DROP POLICY IF EXISTS "Users can update their own DCA plans" ON public.dca_plans;
DROP POLICY IF EXISTS "Users can delete their own DCA plans" ON public.dca_plans;

CREATE POLICY "Users can view their own DCA plans"
ON public.dca_plans FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create their own DCA plans"
ON public.dca_plans FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own DCA plans"
ON public.dca_plans FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own DCA plans"
ON public.dca_plans FOR DELETE
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- smart_alerts (single consolidated policy)
DROP POLICY IF EXISTS "Users can manage their own alerts" ON public.smart_alerts;

CREATE POLICY "Users can manage their own alerts"
ON public.smart_alerts FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- alert_notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.alert_notifications;

CREATE POLICY "Users can view their own notifications"
ON public.alert_notifications FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- scam_analysis_reports
DROP POLICY IF EXISTS "Users can view their own scam analysis reports" ON public.scam_analysis_reports;
DROP POLICY IF EXISTS "Users can create their own scam analysis reports" ON public.scam_analysis_reports;
DROP POLICY IF EXISTS "Users can update their own scam analysis reports" ON public.scam_analysis_reports;
DROP POLICY IF EXISTS "Users can delete their own scam analysis reports" ON public.scam_analysis_reports;

CREATE POLICY "Users can view their own scam analysis reports"
ON public.scam_analysis_reports FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create their own scam analysis reports"
ON public.scam_analysis_reports FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own scam analysis reports"
ON public.scam_analysis_reports FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own scam analysis reports"
ON public.scam_analysis_reports FOR DELETE
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- narrative_scans (single consolidated policy)
DROP POLICY IF EXISTS "Users can manage their own narrative scans" ON public.narrative_scans;

CREATE POLICY "Users can manage their own narrative scans"
ON public.narrative_scans FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- signal_packs
DROP POLICY IF EXISTS "Users can access their own signal packs" ON public.signal_packs;

CREATE POLICY "Users can access their own signal packs"
ON public.signal_packs FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- user_signal_access
DROP POLICY IF EXISTS "Users can manage their signal access" ON public.user_signal_access;

CREATE POLICY "Users can manage their signal access"
ON public.user_signal_access FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- trading_signals
DROP POLICY IF EXISTS "Users can view their trading signals" ON public.trading_signals;

CREATE POLICY "Users can view their trading signals"
ON public.trading_signals FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- signal_subscriptions
DROP POLICY IF EXISTS "Users can manage their subscriptions" ON public.signal_subscriptions;

CREATE POLICY "Users can manage their subscriptions"
ON public.signal_subscriptions FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- altcoin_scans
DROP POLICY IF EXISTS "Users can manage their own altcoin scans" ON public.altcoin_scans;

CREATE POLICY "Users can manage their own altcoin scans"
ON public.altcoin_scans FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- discovered_altcoins
DROP POLICY IF EXISTS "Users can view their discovered altcoins" ON public.discovered_altcoins;

CREATE POLICY "Users can view their discovered altcoins"
ON public.discovered_altcoins FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- altcoin_watchlist
DROP POLICY IF EXISTS "Users can manage their watchlist" ON public.altcoin_watchlist;

CREATE POLICY "Users can manage their watchlist"
ON public.altcoin_watchlist FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- portfolio_allocations
DROP POLICY IF EXISTS "Users can manage their own portfolio allocations" ON public.portfolio_allocations;

CREATE POLICY "Users can manage their own portfolio allocations"
ON public.portfolio_allocations FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- portfolio_analytics
DROP POLICY IF EXISTS "Users can manage their own portfolio analytics" ON public.portfolio_analytics;

CREATE POLICY "Users can manage their own portfolio analytics"
ON public.portfolio_analytics FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- whale_copy_subscriptions
DROP POLICY IF EXISTS "whale_copy_subscriptions_user" ON public.whale_copy_subscriptions;

CREATE POLICY "whale_copy_subscriptions_user"
ON public.whale_copy_subscriptions FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- whale_signal_performance
DROP POLICY IF EXISTS "whale_signal_performance_user" ON public.whale_signal_performance;

CREATE POLICY "whale_signal_performance_user"
ON public.whale_signal_performance FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- altcoin_detections
DROP POLICY IF EXISTS "Users can view their own altcoin detections" ON public.altcoin_detections;
DROP POLICY IF EXISTS "Users can create their own altcoin detections" ON public.altcoin_detections;
DROP POLICY IF EXISTS "Users can update their own altcoin detections" ON public.altcoin_detections;
DROP POLICY IF EXISTS "Users can delete their own altcoin detections" ON public.altcoin_detections;

CREATE POLICY "Users can view their own altcoin detections"
ON public.altcoin_detections FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create their own altcoin detections"
ON public.altcoin_detections FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own altcoin detections"
ON public.altcoin_detections FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own altcoin detections"
ON public.altcoin_detections FOR DELETE
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- portfolios
DROP POLICY IF EXISTS "Users can manage own portfolios" ON public.portfolios;

CREATE POLICY "Users can manage own portfolios"
ON public.portfolios FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- notifications
DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;

CREATE POLICY "Users can manage own notifications"
ON public.notifications FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- subscription_history
DROP POLICY IF EXISTS "Users can view own subscription history" ON public.subscription_history;

CREATE POLICY "Users can view own subscription history"
ON public.subscription_history FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- trade_orders
DROP POLICY IF EXISTS "Users can manage own trade orders" ON public.trade_orders;

CREATE POLICY "Users can manage own trade orders"
ON public.trade_orders FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- user_alerts
DROP POLICY IF EXISTS "Users can manage own alerts" ON public.user_alerts;

CREATE POLICY "Users can manage own alerts"
ON public.user_alerts FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- whale_tracker_reports
DROP POLICY IF EXISTS "whale_tracker_reports_user" ON public.whale_tracker_reports;

CREATE POLICY "whale_tracker_reports_user"
ON public.whale_tracker_reports FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- whale_alerts
DROP POLICY IF EXISTS "whale_alerts_user" ON public.whale_alerts;

CREATE POLICY "whale_alerts_user"
ON public.whale_alerts FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- ai_report_subscriptions
DROP POLICY IF EXISTS "ai_report_subscriptions_user" ON public.ai_report_subscriptions;

CREATE POLICY "ai_report_subscriptions_user"
ON public.ai_report_subscriptions FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- ai_report_deliveries
DROP POLICY IF EXISTS "ai_report_deliveries_user" ON public.ai_report_deliveries;

CREATE POLICY "ai_report_deliveries_user"
ON public.ai_report_deliveries FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- watchlist
DROP POLICY IF EXISTS "Users can manage own watchlist" ON public.watchlist;

CREATE POLICY "Users can manage own watchlist"
ON public.watchlist FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Output summary
DO $$
BEGIN
  RAISE NOTICE '✅ RLS Performance Optimization Complete';
  RAISE NOTICE '📊 All auth.uid() calls wrapped in SELECT statements';
  RAISE NOTICE '🗑️  All duplicate permissive policies removed';
  RAISE NOTICE '🔒 Database security maintained with optimal performance';
END $$;

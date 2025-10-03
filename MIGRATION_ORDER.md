# 📋 ChainWise Database Migration Order

**Total Migrations:** 37 files
**Apply in this exact order for production database setup**

---

## Applying Migrations to Production

### Option 1: Using Supabase CLI (Recommended - Fastest)
```bash
# 1. Link to your production project
npx supabase link --project-ref YOUR_PROJECT_REF

# 2. Push all migrations at once
npx supabase db push

# Done! All 37 migrations applied in correct order
```

### Option 2: Manual SQL Execution
If CLI doesn't work, apply each file manually in this order:

---

## Migration Files in Order

### 1️⃣ Foundation (5 files)
```
1. 001_initial_schema.sql - Core tables (users, portfolios, holdings, sessions)
2. 20250919_premium_features.sql - Subscription system & credit management
3. 20250920_backend_integration.sql - MCP helpers & API functions
4. 20250920_complete_rls_fix.sql - Row Level Security policies
5. 20250920_fix_security_warnings.sql - Security hardening
```

### 2️⃣ Features Phase 1 (3 files)
```
6. 20250922_add_portfolio_actions_recommendations.sql - Portfolio insights
7. 20250922_fix_ai_chat_schema.sql - Enhanced chat system
8. 20250922_settings_backend_integration.sql - Settings management
```

### 3️⃣ Premium Tools (7 files)
```
9.  20250925_ai_reports_system.sql - AI report generation
10. 20250925_altcoin_detector.sql - Altcoin gem finder
11. 20250925_narrative_deep_scans.sql - Market narrative analysis
12. 20250925_signals_pack_system.sql - Trading signals
13. 20250925_smart_alerts_system.sql - Smart price alerts
14. 20250925_whale_copy_signals.sql - Whale copy trading
15. 20250925_whale_tracker_system.sql - Whale transaction tracking
```

### 4️⃣ Tool Functions Phase 1 (6 files)
```
16. 20250926_altcoin_detector_functions.sql - Altcoin functions
17. 20250926_narrative_scanner_functions.sql - Narrative functions
18. 20250926_portfolio_allocator_functions.sql - Allocation functions
19. 20250926_portfolio_analytics_functions.sql - Analytics functions
20. 20250926_signals_pack_functions.sql - Signals functions
21. 20250926_smart_alerts_functions.sql - Alerts functions
```

### 5️⃣ Tool Functions Phase 2 (8 files)
```
22. 20250927_altcoin_detector_functions.sql - Enhanced altcoin
23. 20250927_dca_planner_functions.sql - DCA planning
24. 20250927_fix_notification_preferences_rls.sql - Notification security
25. 20250927_narrative_scanner_functions.sql - Enhanced narrative
26. 20250927_portfolio_allocator_functions.sql - Enhanced allocation
27. 20250927_scam_detector_functions.sql - Scam detection
28. 20250927_signals_pack_functions.sql - Enhanced signals
29. 20250927_smart_alerts_functions.sql - Enhanced alerts
```

### 6️⃣ Final Enhancements (8 files)
```
30. 20251001_avatar_storage_system.sql - Avatar upload system
31. 20251001_enhance_chat_sessions.sql - Chat improvements
32. 20251001_fix_all_search_path_warnings.sql - Security fixes
33. 20251001_fix_rls_performance.sql - Performance optimization
34. 20251001_fix_search_path_drop_recreate.sql - Function security
35. 20251001_fix_whale_alert_rls.sql - Whale alert security
36. 20251001_page_views_analytics.sql - Analytics tracking
37. 20251001_whale_alerts_system.sql - Whale alert system
```

---

## Verification After Migrations

### Check Tables Created (31+ tables expected)
```sql
-- Run in Supabase SQL Editor
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables:
- users, profiles
- portfolios, portfolio_holdings
- ai_chat_sessions, ai_chat_messages
- credit_transactions, subscriptions
- whale_tracker_reports, ai_reports
- smart_alerts, narrative_scans
- altcoin_detections, signal_packs
- whale_copy_signals, alerts
- notifications, notification_preferences
- whale_alerts, whale_alert_subscriptions
- page_views
- And more...

### Check Functions Created (16+ functions expected)
```sql
-- Run in Supabase SQL Editor
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

Expected functions:
- generate_whale_tracker_report()
- generate_ai_report()
- generate_smart_alert()
- generate_narrative_scan()
- generate_altcoin_detection()
- generate_signal_pack()
- generate_whale_copy_signal()
- generate_dca_plan()
- generate_portfolio_allocation()
- detect_scam()
- And more...

### Check RLS Policies
```sql
-- Run in Supabase SQL Editor
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Should see policies for:
- Enable read/write access for users on all tables
- Policies named like "Users can view their own...", "Users can update their own..."

### Test Database Connection
```sql
-- Simple test query
SELECT 'Database is ready!' as status,
       COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public';
```

---

## Common Issues & Solutions

### Issue: "relation already exists"
**Cause:** Migration was partially applied before
**Solution:**
```sql
-- Check what exists
\dt

-- Drop problematic table/function and re-run
DROP TABLE IF EXISTS table_name CASCADE;
```

### Issue: "permission denied"
**Cause:** Not using service role key
**Solution:** Make sure you're connected with admin/service role privileges

### Issue: "function doesn't exist"
**Cause:** Dependencies not applied in order
**Solution:** Make sure to apply ALL migrations in exact order listed above

### Issue: RLS preventing access
**Cause:** Policies not applied correctly
**Solution:**
```sql
-- Temporarily disable RLS for testing
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Re-enable after fixing
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

---

## Post-Migration Checklist

- [ ] All 37 migrations applied successfully
- [ ] 31+ tables exist in database
- [ ] 16+ functions created
- [ ] RLS policies active on all tables
- [ ] Test query returns results
- [ ] No errors in Supabase logs
- [ ] Database backup created
- [ ] Connection details saved for Vercel

---

## Next Steps

After migrations are complete:
1. ✅ Create initial database backup
2. ✅ Save connection details for Vercel environment variables
3. ✅ Proceed to Vercel setup (see DEPLOYMENT_GUIDE.md)

---

**Migration files location:** `supabase/migrations/`
**For detailed deployment steps:** See `DEPLOYMENT_GUIDE.md`
**For technical details:** See `DEPLOYMENT_CHECKLIST.md`

# 🚀 ChainWise Production Deployment Guide

**Status:** Code pushed to GitHub ✅
**Build:** Successful (21.1s, 94 pages) ✅
**Readiness:** 98/100 - Ready to deploy! ✅

---

## ⏱️ Estimated Time: 2-3 hours

---

## 📋 Phase 1: Production Supabase Setup (15 minutes)

### Step 1.1: Create Production Project
1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in details:
   - **Name:** `chainwise-production`
   - **Database Password:** Generate strong password (save it!)
   - **Region:** Choose closest to your users (recommended: `us-east-1`)
4. Click "Create new project"
5. Wait 2-3 minutes for provisioning

### Step 1.2: Get Connection Details
Once project is ready:
1. Go to Project Settings → API
2. Save these values (you'll need them for Vercel):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx... (⚠️ Keep secret!)
   ```

### Step 1.3: Apply Database Migrations
You have 37 migration files to apply. Use one of these methods:

**Option A: Using Supabase CLI (Recommended)**
```bash
# Link to production project
npx supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
npx supabase db push
```

**Option B: Manual SQL Execution**
1. Go to Supabase Dashboard → SQL Editor
2. Open each migration file in order from `supabase/migrations/`
3. Copy and paste SQL, then run
4. Verify no errors

**Migration Files Order:**
1. `001_initial_schema.sql`
2. `20250919_premium_features.sql`
3. `20250920_backend_integration.sql`
4. `20250920_complete_rls_fix.sql`
5. `20250920_fix_security_warnings.sql`
6. ... (continue with all 37 files in chronological order)

### Step 1.4: Enable Row Level Security
1. Go to Authentication → Policies
2. Verify RLS is enabled on all tables
3. Check that policies are active (should be from migrations)

### Step 1.5: Create Initial Backup
1. Go to Database → Backups
2. Enable automatic daily backups
3. Create manual backup now (just in case)

✅ **Checkpoint:** You should now have a production Supabase project with all tables and functions ready.

---

## 📋 Phase 2: Vercel Setup (15 minutes)

### Step 2.1: Create Vercel Project
1. Go to https://vercel.com/new
2. Sign in with GitHub
3. Import your repository: `Qualiasolutions/chainwise`
4. Configure project:
   - **Project Name:** `chainwise`
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install`

### Step 2.2: Configure Build Settings
Before deploying, click "Environment Variables" and skip to Phase 4 first to add all env vars.

✅ **Checkpoint:** Vercel project created and connected to GitHub.

---

## 📋 Phase 3: Stripe Live Mode Setup (30 minutes)

### Step 3.1: Activate Live Mode
1. Go to https://dashboard.stripe.com
2. Complete business verification if not done:
   - Business details
   - Bank account for payouts
   - Tax information
3. Toggle to "Live mode" (top right)

### Step 3.2: Create Products
You need to create 4 products. For each:

**Product 1: Pro Monthly**
1. Products → Add Product
2. Name: `ChainWise Pro - Monthly`
3. Price: `$12.99`
4. Billing period: `Monthly`
5. Copy the Price ID: `price_xxx` → Save as `STRIPE_PRICE_PRO_MONTHLY`

**Product 2: Pro Yearly**
1. Name: `ChainWise Pro - Yearly`
2. Price: `$129.99`
3. Billing period: `Yearly`
4. Copy Price ID → Save as `STRIPE_PRICE_PRO_YEARLY`

**Product 3: Elite Monthly**
1. Name: `ChainWise Elite - Monthly`
2. Price: `$24.99`
3. Billing period: `Monthly`
4. Copy Price ID → Save as `STRIPE_PRICE_ELITE_MONTHLY`

**Product 4: Elite Yearly**
1. Name: `ChainWise Elite - Yearly`
2. Price: `$249.99`
3. Billing period: `Yearly`
4. Copy Price ID → Save as `STRIPE_PRICE_ELITE_YEARLY`

### Step 3.3: Get API Keys
1. Developers → API keys
2. Copy **Publishable key** → Save as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Reveal and copy **Secret key** → Save as `STRIPE_SECRET_KEY`

⚠️ **Important:** Make sure you're in LIVE mode when copying these!

✅ **Checkpoint:** You should have 6 Stripe values saved (4 price IDs + 2 API keys).

---

## 📋 Phase 4: Environment Variables (20 minutes)

### Step 4.1: Prepare All Variables
Create a text file with all these variables filled in:

```bash
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Stripe (Live Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx...
STRIPE_SECRET_KEY=sk_live_xxx...
STRIPE_PRICE_PRO_MONTHLY=price_xxx...
STRIPE_PRICE_PRO_YEARLY=price_xxx...
STRIPE_PRICE_ELITE_MONTHLY=price_xxx...
STRIPE_PRICE_ELITE_YEARLY=price_xxx...
STRIPE_WEBHOOK_SECRET=(we'll get this in Phase 5)

# OpenAI
OPENAI_API_KEY=sk-xxx...

# CoinGecko (Optional but recommended)
COINGECKO_API_KEY=CG-xxx...
```

### Step 4.2: Add to Vercel
1. Go to your Vercel project
2. Settings → Environment Variables
3. Add each variable:
   - Click "Add New"
   - Key: Variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Value: Your actual value
   - Environment: Select "Production" (and optionally "Preview" for testing)
   - Click "Save"
4. Repeat for all variables

⚠️ **Critical:** Double-check every variable - one mistake will break the deployment!

✅ **Checkpoint:** All environment variables are configured in Vercel.

---

## 📋 Phase 5: Stripe Webhook (10 minutes)

### Step 5.1: Get Your Vercel URL
If you haven't deployed yet:
1. Go to Vercel dashboard
2. Your preview URL will be: `https://chainwise-xxx.vercel.app`
3. Or your custom domain: `https://chainwise.tech` (if configured)

### Step 5.2: Create Webhook
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://YOUR_DOMAIN/api/webhooks/stripe`
   - Example: `https://chainwise.tech/api/webhooks/stripe`
4. Description: `ChainWise production webhook`
5. Click "Select events" and choose:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
6. Click "Add endpoint"

### Step 5.3: Get Webhook Secret
1. Click on your newly created webhook
2. Click "Reveal" on "Signing secret"
3. Copy the secret: `whsec_xxx...`
4. Go back to Vercel → Settings → Environment Variables
5. Add new variable:
   - Key: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_xxx...`
   - Environment: Production
6. Save

✅ **Checkpoint:** Stripe webhook configured and secret added to Vercel.

---

## 📋 Phase 6: Deploy to Preview (30 minutes)

### Step 6.1: Trigger Deployment
If you haven't deployed yet:
1. Go to Vercel dashboard → Your project
2. Click "Deploy" (or it should auto-deploy from git push)
3. Wait 2-3 minutes for build

Monitor the build logs. If errors occur, check:
- All environment variables are set correctly
- No typos in variable names
- Supabase migrations are applied

### Step 6.2: Get Preview URL
Once deployed:
1. Click on the deployment
2. Copy the preview URL (e.g., `https://chainwise-xxx.vercel.app`)

### Step 6.3: Test Preview Thoroughly

**Test 1: Homepage**
- Visit homepage
- Verify 3D globe loads
- Check pricing section
- Test navigation

**Test 2: Authentication**
```
1. Go to /auth/signup
2. Create test account with your email
3. Verify signup works
4. Check if redirected to dashboard
5. Try logging out and back in
```

**Test 3: AI Chat**
```
1. Go to /dashboard/ai
2. Select Buddy persona (free)
3. Send a message
4. Verify response arrives
5. Check credits deducted
```

**Test 4: Stripe Checkout (TEST MODE FIRST)**
```
1. Go to /checkout
2. Select Pro Monthly plan
3. Click checkout
4. Use Stripe test card: 4242 4242 4242 4242
5. Expiry: Any future date (e.g., 12/25)
6. CVC: Any 3 digits (e.g., 123)
7. Complete payment
8. Verify success redirect
9. Check Stripe dashboard for test payment
```

**Test 5: Premium Tool**
```
1. Go to /tools/whale-tracker
2. Enter a whale address or use suggested one
3. Generate report
4. Verify credits charged correctly
5. Check report displays
```

**Test 6: Database Updates**
```
1. Check Supabase dashboard
2. Go to Table Editor → profiles
3. Find your test user
4. Verify tier and credits are correct
5. Check credit_transactions table for records
```

### Step 6.4: Check Logs
1. Vercel → Your project → Functions
2. Check for any errors
3. Supabase → Logs → Check for any issues

✅ **Checkpoint:** Preview deployment working perfectly with all features tested.

---

## 📋 Phase 7: Go Live (45 minutes)

### Step 7.1: Configure Custom Domain
1. Vercel → Settings → Domains
2. Add your domain: `chainwise.tech`
3. Follow DNS instructions:
   - Add A record: `76.76.21.21` (or as instructed)
   - Add CNAME: `cname.vercel-dns.com`
4. Wait for DNS propagation (5-30 minutes)
5. Verify SSL certificate is active (automatic)

### Step 7.2: Update Stripe Webhook
Now that you have your custom domain:
1. Go back to Stripe → Webhooks
2. Edit your webhook endpoint URL to use custom domain
3. Change from Vercel URL to: `https://chainwise.tech/api/webhooks/stripe`
4. Save

### Step 7.3: Production Smoke Tests

**Run these tests on your live domain:**

**Test 1: New User Journey**
```
1. Sign up with real email
2. Verify email works
3. Complete onboarding
4. Check dashboard loads
```

**Test 2: Real Payment (Your Credit Card)**
```
⚠️ You'll be charged real money!

1. Go to /checkout
2. Select Pro Monthly ($12.99)
3. Use your real credit card
4. Complete checkout
5. Verify:
   - Success redirect works
   - Email confirmation received
   - Tier upgraded in dashboard
   - Credits allocated (50 credits)
   - Stripe dashboard shows payment
   - Webhook event received
```

**Test 3: Subscription Management**
```
1. Go to /settings/billing
2. Verify current plan shows Pro Monthly
3. Click "Manage Subscription"
4. Verify Stripe Customer Portal opens
5. DON'T cancel (unless testing)
```

**Test 4: AI & Tools**
```
1. Test AI chat with Pro features
2. Test a premium tool (costs credits)
3. Verify credit deduction
4. Check transaction history
```

### Step 7.4: Monitor First Hour
Watch closely for:
- Error rates in Vercel logs
- Failed payments in Stripe
- Database errors in Supabase
- User complaints (if any)

Set up alerts:
1. Vercel → Settings → Notifications
2. Stripe → Settings → Notifications
3. Enable error alerts

✅ **Checkpoint:** Platform is live and accepting real payments!

---

## 📋 Phase 8: Post-Launch (Ongoing)

### Immediate Tasks (Day 1)
- [ ] Monitor error logs every hour
- [ ] Check first customer signups
- [ ] Verify all payments processing correctly
- [ ] Respond to any support requests
- [ ] Monitor server performance

### First Week Tasks
- [ ] Review error patterns
- [ ] Analyze user behavior
- [ ] Check conversion rates
- [ ] Monitor payment success rate
- [ ] Collect user feedback
- [ ] Plan first iteration

### Setup Monitoring (Recommended)
**Sentry (Error Tracking)**
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

**Vercel Analytics**
1. Enable in Vercel dashboard
2. No code changes needed

**Uptime Monitoring**
- Use UptimeRobot.com (free)
- Monitor: https://chainwise.tech
- Alert: Email/SMS if down

---

## 🆘 Emergency Procedures

### If Payments Fail
1. Check Stripe webhook status
2. Verify webhook secret in Vercel env vars
3. Check Stripe logs for errors
4. Test with new test card

### If Site Goes Down
1. Check Vercel deployment status
2. Review error logs
3. Rollback to previous deployment if needed:
   - Vercel → Deployments → Previous → Promote to Production

### If Database Issues
1. Check Supabase status page
2. Review database logs
3. Verify connection limits not exceeded
4. Restore from backup if data corruption

### Rollback Procedure
```bash
# In Vercel dashboard:
1. Go to Deployments
2. Find last working deployment
3. Click "..." → Promote to Production
4. Instant rollback (< 30 seconds)
```

---

## 📊 Success Metrics (Week 1)

### Technical Metrics
- [ ] 99.9%+ uptime
- [ ] < 2s average page load time
- [ ] < 1% error rate
- [ ] < 500ms API response time
- [ ] Zero security incidents

### Business Metrics
- [ ] 100+ signups
- [ ] 10+ paid subscriptions
- [ ] < 5% churn rate
- [ ] Payment success rate > 95%
- [ ] Positive user feedback

---

## ✅ Deployment Checklist

### Pre-Deployment
- [x] Production build successful
- [x] All changes committed to git
- [x] Code pushed to GitHub
- [ ] Production Supabase project created
- [ ] All migrations applied to production DB
- [ ] RLS policies enabled
- [ ] Initial backup created

### Configuration
- [ ] Vercel project created and connected
- [ ] All environment variables set
- [ ] Stripe live mode activated
- [ ] All 4 products created in Stripe
- [ ] Webhook configured
- [ ] Webhook secret added to env vars

### Testing
- [ ] Preview deployment successful
- [ ] Authentication flow tested
- [ ] AI chat tested
- [ ] Checkout flow tested (test mode)
- [ ] Premium tools tested
- [ ] Database updates verified
- [ ] No errors in logs

### Production
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Webhook URL updated to custom domain
- [ ] Real payment tested successfully
- [ ] All smoke tests passed
- [ ] Monitoring enabled
- [ ] Error alerts configured

### Post-Launch
- [ ] Monitoring first users
- [ ] Error logs clean
- [ ] Payments processing correctly
- [ ] Support ready
- [ ] Launch announced

---

## 🎉 You're Ready to Launch!

Once all checkboxes above are ✅, you're ready to announce your launch!

**Social Media Template:**
```
🚀 Excited to announce ChainWise is now LIVE!

AI-powered cryptocurrency advisory platform with:
✨ Real-time portfolio tracking
🤖 3 AI personas for guidance
🐋 Whale tracking & copy trading
📊 Advanced analytics & insights

Try it now: https://chainwise.tech

#crypto #AI #blockchain #launch
```

---

**Good luck with your launch! 🚀**

*This guide was generated as part of the ChainWise production deployment process.*
*For questions or issues, refer to DEPLOYMENT_CHECKLIST.md or PRODUCTION_PLAN.md.*

# Quick GitHub Secrets Setup

## Your GitHub Actions workflow needs these secrets configured.

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Your Vercel Token

1. Go to: **https://vercel.com/account/tokens**
2. Click **"Create Token"**
3. Name: `github-actions-chainwise`
4. Scope: **Full Account**
5. **Copy the token** (shown only once!)

### Step 2: Add Secrets to GitHub

Go to: **https://github.com/Qualiasolutions/chainwise/settings/secrets/actions**

Click **"New repository secret"** for each of these:

---

### Required Secrets (Copy/Paste Ready)

#### 1. VERCEL_TOKEN
```
Name: VERCEL_TOKEN
Value: [Paste the token from Step 1]
```

#### 2. VERCEL_ORG_ID
```
Name: VERCEL_ORG_ID
Value: team_reZEzL1HScP9bxhRI5KIzPFW
```

#### 3. VERCEL_PROJECT_ID
```
Name: VERCEL_PROJECT_ID
Value: prj_UKPn1iYqOL8U4XtRf9AuZxKt2HYp
```

#### 4. NEXT_PUBLIC_SUPABASE_URL
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://vmnuzwoocympormyizsc.supabase.co
```

#### 5. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbnV6d29vY3ltcG9ybXlpenNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNjY2OTAsImV4cCI6MjA3Mzg0MjY5MH0.UhNWzwAWq-RpDz6I33buqfLzSE0wbx58G7BQdVDuDBY
```

---

## ✅ Verification

After adding all 5 secrets, your GitHub secrets page should show:
- ✅ VERCEL_TOKEN
- ✅ VERCEL_ORG_ID
- ✅ VERCEL_PROJECT_ID
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY

---

## 🧪 Test It

Push a commit to trigger the workflow:

```bash
git add .
git commit -m "Test CI/CD pipeline"
git push origin main
```

Then check: **https://github.com/Qualiasolutions/chainwise/actions**

---

## 📝 Also Configure Vercel Environment Variables

Go to: **https://vercel.com/qualiasolutions-glluztech/chainwise/settings/environment-variables**

Add these from your `.env.local` file:
- SUPABASE_SERVICE_ROLE_KEY
- OPENAI_API_KEY
- STRIPE_SECRET_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- COINGECKO_API_KEY
- NEXT_PUBLIC_APP_URL

Set for: **Production, Preview, and Development**

---

## 🆘 Troubleshooting

**Workflow still failing?**
- Make sure all 5 secrets are added correctly
- Check secret names are EXACT (case-sensitive)
- Regenerate Vercel token if needed

**Deployment works but app breaks?**
- Add remaining env vars to Vercel dashboard
- Check Vercel deployment logs

---

**Direct Links:**
- Add GitHub Secrets: https://github.com/Qualiasolutions/chainwise/settings/secrets/actions
- Create Vercel Token: https://vercel.com/account/tokens
- Vercel Env Vars: https://vercel.com/qualiasolutions-glluztech/chainwise/settings/environment-variables
- GitHub Actions: https://github.com/Qualiasolutions/chainwise/actions

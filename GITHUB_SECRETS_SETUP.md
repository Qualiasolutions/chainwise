# GitHub Secrets Setup Guide

## Required Secrets for CI/CD Pipeline

Your GitHub Actions workflow requires the following secrets to be configured. Follow these steps to set them up.

---

## 1. Vercel Integration Secrets

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Link Your Project
```bash
cd /home/qualiasolutions/Desktop/Projects/websites/chainwise
vercel link
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Select your team/personal account
- Link to existing project? **Yes** (if you already have one) or **No** to create new
- Project name: **chainwise**

### Step 4: Get Vercel Tokens

#### A. Get Vercel Token
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it: `github-actions-chainwise`
4. Set scope: Full Account
5. Copy the token (you'll only see it once)

#### B. Get Project Information
```bash
# Get your Project ID
cat .vercel/project.json
```

This will show:
```json
{
  "projectId": "prj_xxxxxxxxxxxxx",
  "orgId": "team_xxxxxxxxxxxxx"
}
```

---

## 2. Add Secrets to GitHub

### Navigate to GitHub Repository Settings
1. Go to: https://github.com/Qualiasolutions/chainwise
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### Add Each Secret

#### Secret 1: VERCEL_TOKEN
- **Name**: `VERCEL_TOKEN`
- **Value**: Paste the token from Vercel (step 4A above)
- Click **Add secret**

#### Secret 2: VERCEL_ORG_ID
- **Name**: `VERCEL_ORG_ID`
- **Value**: Paste the `orgId` from `.vercel/project.json`
- Click **Add secret**

#### Secret 3: VERCEL_PROJECT_ID
- **Name**: `VERCEL_PROJECT_ID`
- **Value**: Paste the `projectId` from `.vercel/project.json`
- Click **Add secret**

#### Secret 4: NEXT_PUBLIC_SUPABASE_URL
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://vmnuzwoocympormyizsc.supabase.co`
- Click **Add secret**

#### Secret 5: NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: Your Supabase anon key from `.env.local`
- Click **Add secret**

---

## 3. Optional Secrets (Recommended)

### For Security Scanning

#### SNYK_TOKEN (Optional)
1. Go to https://app.snyk.io/account
2. Copy your API token
3. Add as GitHub secret:
   - **Name**: `SNYK_TOKEN`
   - **Value**: Your Snyk API token

---

## 4. Verify Setup

After adding all secrets, your GitHub Actions secrets should include:

**Required (for deployment)**:
- ✅ `VERCEL_TOKEN`
- ✅ `VERCEL_ORG_ID`
- ✅ `VERCEL_PROJECT_ID`
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Optional (for enhanced features)**:
- ⚪ `SNYK_TOKEN` (security scanning)

---

## 5. Test the Workflow

### Trigger a Deployment

#### Option A: Push to Main Branch
```bash
git add .
git commit -m "Test CI/CD pipeline"
git push origin main
```

#### Option B: Create a Pull Request
```bash
git checkout -b test-ci
git add .
git commit -m "Test PR deployment"
git push origin test-ci
```

Then create a PR on GitHub.

### Check Workflow Status
1. Go to: https://github.com/Qualiasolutions/chainwise/actions
2. Click on the latest workflow run
3. Monitor the progress of each job

---

## 6. Alternative: Manual Deployment (No GitHub Secrets)

If you don't want to use GitHub Actions for deployment, you can deploy manually:

### Manual Vercel Deployment
```bash
# Production deployment
vercel --prod

# Preview deployment
vercel
```

### Disable Auto-Deploy in GitHub Actions

If you want to keep testing/building but skip deployment, modify `.github/workflows/ci.yml`:

```yaml
# Comment out or remove these jobs:
# - deploy-preview
# - deploy-production
# - health-check
```

---

## 7. Troubleshooting

### Error: "Input required and not supplied: vercel-token"
- **Cause**: `VERCEL_TOKEN` secret is missing
- **Fix**: Add the secret following step 2 above

### Error: "Project not found"
- **Cause**: `VERCEL_PROJECT_ID` is incorrect
- **Fix**: Run `vercel link` again and update the secret

### Error: "Unauthorized"
- **Cause**: `VERCEL_TOKEN` is invalid or expired
- **Fix**: Generate a new token and update the secret

### Deployment succeeds but app doesn't work
- **Cause**: Missing environment variables in Vercel
- **Fix**: Add all environment variables from `.env.local` to Vercel:
  1. Go to: https://vercel.com/qualiasolutions-glluztech/chainwise/settings/environment-variables
  2. Add each variable from `.env.local`
  3. Redeploy

---

## 8. Quick Setup Commands

Run these commands in your project directory:

```bash
# 1. Link to Vercel
vercel link

# 2. Get project info
echo "VERCEL_ORG_ID:" && cat .vercel/project.json | grep orgId
echo "VERCEL_PROJECT_ID:" && cat .vercel/project.json | grep projectId

# 3. Open GitHub secrets page
echo "Add secrets at: https://github.com/Qualiasolutions/chainwise/settings/secrets/actions"
```

---

## 9. Environment Variables in Vercel

After setting up secrets, also configure environment variables in Vercel dashboard:

1. Go to: https://vercel.com/qualiasolutions-glluztech/chainwise/settings/environment-variables
2. Add all variables from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `COINGECKO_API_KEY`
   - `NEXT_PUBLIC_APP_URL`
3. Set scope: **Production**, **Preview**, and **Development**
4. Save

---

## 10. Security Best Practices

### ✅ DO:
- Use separate tokens for development and production
- Rotate tokens every 90 days
- Use least privilege (only necessary scopes)
- Keep secrets in GitHub Secrets (never in code)
- Use different API keys for staging/production

### ❌ DON'T:
- Commit secrets to git
- Share secrets in plain text
- Use production keys in development
- Hardcode credentials in code
- Give full access when read-only is enough

---

## Need Help?

- **GitHub Actions Docs**: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- **Vercel CLI Docs**: https://vercel.com/docs/cli
- **Vercel GitHub Integration**: https://vercel.com/docs/git/vercel-for-github

---

**Created**: October 1, 2025
**Status**: Ready to configure

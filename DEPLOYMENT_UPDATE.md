# Deployment Update - Supabase Keys Fixed

## 🎯 **Current Status**
- ✅ Local environment updated with working Supabase keys
- ✅ Authentication 401 error resolved locally
- 🔄 **NEED TO UPDATE**: Vercel environment variables

## 🚀 **Critical: Update Vercel Environment Variables**

Your Vercel deployment still has the old, invalid Supabase keys. Update these **IMMEDIATELY** after pushing:

### **Go to Vercel Dashboard**
1. Visit: https://vercel.com/qualiasolutions-glluztech/chainwise-crypto-saas
2. Go to **Settings** → **Environment Variables**
3. **UPDATE** these variables with the new values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://nrjtajifvlmfgodgdciu.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yanRhamlmdmxtZmdvZGdkY2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4ODE3MDcsImV4cCI6MjA3MjQ1NzcwN30.Ze8k9LMr6tEt-ZeC3r-_Sj86QlhfzvHK3Txfsd4HR4U

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yanRhamlmdmxtZmdvZGdkY2l1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njg4MTcwNywiZXhwIjoyMDcyNDU3NzA3fQ.tQL6NB5MWZtPTpYhjnyGOa--FIkrCBF4vGmDJrrQo7k
```

### **Also Update Site URLs**
```env
NEXT_PUBLIC_SITE_URL=https://chainwise-sand.vercel.app
SITE_URL=https://chainwise-sand.vercel.app
```

## 📋 **Deployment Checklist**

### ✅ **Before Push**
- [x] Local environment updated
- [x] Authentication working locally
- [x] No sensitive files in git

### 🔄 **After Push (DO IMMEDIATELY)**
- [ ] Update Vercel environment variables (CRITICAL)
- [ ] Trigger new deployment
- [ ] Test authentication on live site
- [ ] Verify API endpoints work

### 🔧 **Supabase Project Configuration**
Make sure these are configured in your Supabase dashboard:

1. **Authentication Settings**:
   - Site URL: `https://chainwise-sand.vercel.app`
   - Redirect URLs: `https://chainwise-sand.vercel.app/auth/callback`

2. **Email Settings** (if using email auth):
   - Enable/disable email confirmation as needed
   - Configure custom SMTP if required

## 🚨 **IMPORTANT NOTES**

1. **Environment Variables**: The deployment will FAIL with 401 errors until you update Vercel env vars
2. **No Secrets in Git**: Your .env.local is properly ignored
3. **Database Schema**: Make sure your Supabase project has the required tables
4. **Domain Matching**: Ensure all URLs match between Vercel and Supabase settings

## 🧪 **Testing After Deployment**

1. Visit your live site
2. Try to sign up with a new account
3. Check browser console for errors
4. Test API endpoints: `/api/health`

If you see 401 errors on the live site, it means Vercel env vars weren't updated properly.

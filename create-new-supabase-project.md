# Create New Supabase Project - RECOMMENDED FIX

## Step 1: Create New Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose your organization
4. Set project name: "ChainWise"
5. Set database password (save this!)
6. Choose region (closest to you)
7. Click "Create new project"

## Step 2: Get Your New API Keys
After project creation (2-3 minutes):
1. Go to Settings → API
2. Copy these values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 3: Set Up Database Schema
1. Go to SQL Editor in your new project
2. Run this schema creation script:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    image TEXT,
    subscription_tier TEXT DEFAULT 'free',
    credits_balance INTEGER DEFAULT 3,
    onboarding_completed BOOLEAN DEFAULT false,
    preferences JSONB DEFAULT '{}',
    total_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create other essential tables
CREATE TABLE public.portfolios (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT DEFAULT 'Main Portfolio',
    description TEXT,
    is_default BOOLEAN DEFAULT true,
    total_value_usd NUMERIC(20,8) DEFAULT 0,
    total_cost_usd NUMERIC(20,8) DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create credit transactions table
CREATE TABLE public.credit_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    feature_used TEXT,
    description TEXT,
    stripe_payment_intent_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own data" ON public.users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage their own portfolios" ON public.portfolios
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own credit transactions" ON public.credit_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, image)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Step 4: Configure Authentication
1. Go to Authentication → Settings
2. **Site URL**: Set to your domain (http://localhost:3000 for local)
3. **Email Confirmation**: Disable for testing (can enable later)
4. **Enable Google OAuth** (optional):
   - Add your Google OAuth credentials
   - Set redirect URL: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

## Step 5: Update Environment Variables
Replace your .env.local with the new project details:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_NEW_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_NEW_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_NEW_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SITE_URL=http://localhost:3000
```

## Step 6: Test the Fix
1. Restart your dev server: `npm run dev`
2. Try signing up with a new account
3. Check if the 401 error is resolved

This will give you a fresh, properly configured Supabase project that matches your application's needs.

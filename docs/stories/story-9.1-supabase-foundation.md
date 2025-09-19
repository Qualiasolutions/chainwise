# Story 9.1: Supabase Foundation Setup

**Epic**: Backend Integration & Infrastructure
**Priority**: Critical Path
**Status**: ✅ **COMPLETED**
**Estimated Effort**: 4-6 hours

## User Story

As a ChainWise user,
I want secure authentication and data persistence,
So that I can safely manage my crypto portfolios and access personalized AI guidance with real data.

## Acceptance Criteria

### AC1: Supabase Project Setup
- [ ] Supabase project created with PostgreSQL database
- [ ] Database schema implemented for users, portfolios, holdings, chat sessions
- [ ] Row Level Security (RLS) policies configured for data protection
- [ ] Real-time subscriptions enabled for live data updates

### AC2: Authentication Integration
- [ ] Supabase Auth integrated with existing dashboard layout
- [ ] Email/password authentication working
- [ ] Google OAuth provider configured
- [ ] Auth state management integrated with existing components
- [ ] Protected routes implemented without breaking existing UI

### AC3: Environment Configuration
- [ ] Environment variables properly configured for development
- [ ] Supabase client initialization in Next.js app
- [ ] TypeScript types generated for database schema
- [ ] Connection verification and error handling

### AC4: Brownfield Integration
- [ ] Existing mock user data replaced with real Supabase queries
- [ ] Current UI components work seamlessly with auth state
- [ ] No breaking changes to existing dashboard functionality
- [ ] Beautiful design system preserved throughout

## Technical Implementation Notes

### Database Schema (PostgreSQL)
```sql
-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'elite')),
  credits INTEGER DEFAULT 3,
  monthly_credits INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolios table
CREATE TABLE portfolios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  total_value DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio holdings table
CREATE TABLE portfolio_holdings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(20,8) NOT NULL,
  purchase_price DECIMAL(15,2) NOT NULL,
  purchase_date TIMESTAMPTZ NOT NULL,
  current_price DECIMAL(15,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI chat sessions table
CREATE TABLE ai_chat_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  persona TEXT NOT NULL CHECK (persona IN ('buddy', 'professor', 'trader')),
  messages JSONB NOT NULL DEFAULT '[]',
  credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Authentication Integration Pattern
```typescript
// src/lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient()

// src/hooks/useSupabaseAuth.ts
export const useSupabaseAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
  }, [])

  return { user, loading }
}

// Enhanced dashboard layout integration
export default function DashboardLayout({ children }) {
  const { user, loading } = useSupabaseAuth()

  if (loading) return <DashboardSkeleton />
  if (!user) return <AuthRequired />

  return (
    <SidebarProvider> {/* Preserve existing layout */}
      <AppSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
```

## File Changes Required

### New Files to Create
- [ ] `src/lib/supabase/client.ts` - Supabase client configuration
- [ ] `src/lib/supabase/types.ts` - Generated TypeScript types
- [ ] `src/hooks/useSupabaseAuth.ts` - Authentication hook
- [ ] `src/components/auth/AuthRequired.tsx` - Auth guard component
- [ ] `src/components/auth/LoginForm.tsx` - Login interface
- [ ] `src/components/ui/dashboard-skeleton.tsx` - Loading state component
- [ ] `supabase/migrations/001_initial_schema.sql` - Database schema
- [ ] `supabase/config.toml` - Supabase configuration

### Files to Modify
- [ ] `src/app/dashboard/layout.tsx` - Add auth integration
- [ ] `src/app/dashboard/ai/page.tsx` - Replace mock user data
- [ ] `src/app/dashboard/page.tsx` - Integrate real user data
- [ ] `package.json` - Add Supabase dependencies
- [ ] `.env.local` - Add environment variables
- [ ] `next.config.ts` - Add Supabase configuration

### Environment Variables Required
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Testing Checklist

### Manual Testing
- [ ] Supabase project accessible and database responsive
- [ ] User can register new account with email/password
- [ ] User can login with existing credentials
- [ ] Google OAuth login working (if configured)
- [ ] Dashboard loads correctly for authenticated users
- [ ] Existing AI chat interface still functional
- [ ] User data persists between sessions
- [ ] Logout functionality works correctly

### Integration Testing
- [ ] Mock user data successfully replaced with real Supabase data
- [ ] No console errors in browser dev tools
- [ ] TypeScript compilation successful
- [ ] Development server starts without errors
- [ ] Authentication state properly managed across route changes

### Database Testing
- [ ] All tables created with correct schema
- [ ] RLS policies prevent unauthorized access
- [ ] Foreign key relationships working correctly
- [ ] Real-time subscriptions functioning for live updates

## Definition of Done

- ✅ Supabase project created and configured
- ✅ Database schema implemented with all required tables
- ✅ Authentication working with existing UI components
- ✅ Mock user data replaced with real Supabase integration
- ✅ All existing functionality preserved (AI chat, dashboard, navigation)
- ✅ No breaking changes to current user experience
- ✅ Beautiful design system maintained throughout
- ✅ TypeScript types generated and working
- ✅ Environment variables configured for development
- ✅ All tests passing and manual verification complete

## Success Metrics

- Authentication flow completed in < 3 clicks
- Dashboard loads with real user data in < 2 seconds
- Zero regression in existing functionality
- Seamless transition from mock to real data

---

**Story Status**: Ready for Development
**Next Story**: 9.2 - OpenAI Integration
**Dependencies**: None (Critical path story)
**Risk Level**: Medium (Brownfield integration requires careful preservation of existing features)
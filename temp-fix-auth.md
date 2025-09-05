# Temporary Fix - Disable Auth for Testing

## Option 1: Mock Authentication (Quick Test)

Create a mock auth provider to bypass Supabase temporarily:

1. Create `src/components/providers/MockAuthProvider.tsx`:

```tsx
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface MockUser {
  id: string
  email: string
  name: string
  subscription_tier: string
  credits_balance: number
}

interface MockAuthContextType {
  user: MockUser | null
  session: any
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined)

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>({
    id: 'mock-user-id',
    email: 'test@example.com',
    name: 'Test User',
    subscription_tier: 'free',
    credits_balance: 3
  })
  const [loading, setLoading] = useState(false)

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setUser({
      id: 'mock-user-id',
      email,
      name: 'Test User',
      subscription_tier: 'free',
      credits_balance: 3
    })
    setLoading(false)
  }

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setUser({
      id: 'mock-user-id',
      email,
      name,
      subscription_tier: 'free',
      credits_balance: 3
    })
    setLoading(false)
  }

  const signOut = async () => {
    setUser(null)
  }

  return (
    <MockAuthContext.Provider value={{
      user,
      session: user ? { user } : null,
      loading,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </MockAuthContext.Provider>
  )
}

export const useMockAuth = () => {
  const context = useContext(MockAuthContext)
  if (!context) {
    throw new Error('useMockAuth must be used within MockAuthProvider')
  }
  return context
}
```

2. Temporarily replace the AuthProvider in `src/app/layout.tsx`:

```tsx
// Replace this line:
// import { AuthProvider } from '@/components/providers/AuthProvider'

// With this:
import { MockAuthProvider } from '@/components/providers/MockAuthProvider'

// And replace <AuthProvider> with <MockAuthProvider>
```

This will let you test the UI without authentication issues.

## Option 2: Use Local SQLite (Advanced)

If you want to test with a real database locally:

1. Install SQLite: `npm install better-sqlite3 @types/better-sqlite3`
2. Create a local database setup
3. Modify the Supabase client to use local SQLite for development

## Recommendation

**Create a new Supabase project** (see create-new-supabase-project.md) - it's the cleanest solution and will take about 10-15 minutes total.

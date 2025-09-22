import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from './types'

export const supabase = createClientComponentClient<Database>({
  options: {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'chainwise-auth-token'
    }
  }
})

// Server-side client for API routes
export { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
export { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

// Supabase project configuration for MCP integration
export const SUPABASE_PROJECT_ID = 'vmnuzwoocympormyizsc'
export const SUPABASE_URL = 'https://vmnuzwoocympormyizsc.supabase.co'
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbnV6d29vY3ltcG9ybXlpenNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNjY2OTAsImV4cCI6MjA3Mzg0MjY5MH0.UhNWzwAWq-RpDz6I33buqfLzSE0wbx58G7BQdVDuDBY'
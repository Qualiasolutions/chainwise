import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from './types'

// Enhanced storage with fallback for better session persistence
const createStorage = () => {
  if (typeof window === 'undefined') return undefined

  return {
    getItem: (key: string) => {
      try {
        return window.localStorage.getItem(key) || window.sessionStorage.getItem(key)
      } catch (error) {
        console.warn('Storage read error:', error)
        return null
      }
    },
    setItem: (key: string, value: string) => {
      try {
        window.localStorage.setItem(key, value)
        // Also set in sessionStorage as backup
        window.sessionStorage.setItem(key, value)
      } catch (error) {
        console.warn('Storage write error:', error)
        try {
          // Fallback to sessionStorage only
          window.sessionStorage.setItem(key, value)
        } catch (fallbackError) {
          console.error('Storage fallback failed:', fallbackError)
        }
      }
    },
    removeItem: (key: string) => {
      try {
        window.localStorage.removeItem(key)
        window.sessionStorage.removeItem(key)
      } catch (error) {
        console.warn('Storage remove error:', error)
      }
    }
  }
}

// Only create client in browser environment
export const supabase = typeof window !== 'undefined'
  ? createClientComponentClient<Database>({
      options: {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
          storage: createStorage(),
          storageKey: 'chainwise-auth-token',
          // Enhanced token refresh settings
          refreshTokenThreshold: 60, // Refresh token 60 seconds before expiry
          refreshTokenRetryAttempts: 3
        },
        global: {
          // Add retry logic for network failures
          fetch: (input: RequestInfo | URL, init?: RequestInit) => {
            return fetch(input, {
              ...init,
              // Add timeout to prevent hanging requests
              signal: AbortSignal.timeout(30000), // 30 second timeout
            })
          }
        }
      }
    })
  : null as any // Server-side will use createRouteHandlerClient instead

// Server-side client for API routes
export { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
export { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

// Supabase project configuration for MCP integration
export const SUPABASE_PROJECT_ID = 'vmnuzwoocympormyizsc'
export const SUPABASE_URL = 'https://vmnuzwoocympormyizsc.supabase.co'
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbnV6d29vY3ltcG9ybXlpenNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNjY2OTAsImV4cCI6MjA3Mzg0MjY5MH0.UhNWzwAWq-RpDz6I33buqfLzSE0wbx58G7BQdVDuDBY'
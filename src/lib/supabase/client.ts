import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  })
  
  if (typeof window !== 'undefined') {
    // Only show alert in browser
    console.warn('Supabase is not configured. Please check your environment variables.')
  }
}

export const createClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not configured. Please check your .env.local file.')
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
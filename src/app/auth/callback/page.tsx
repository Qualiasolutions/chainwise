import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import { redirect } from 'next/navigation'

export default async function AuthCallback({
  searchParams,
}: {
  searchParams: { code?: string; redirectTo?: string }
}) {
  const { code, redirectTo } = searchParams

  if (code) {
    const supabase = createClient()
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      redirect(`/auth/signin?error=${encodeURIComponent(error.message)}`)
    }
  }

  // Redirect to the intended destination or dashboard
  const destination = redirectTo ? decodeURIComponent(redirectTo) : '/dashboard'
  redirect(destination)
}
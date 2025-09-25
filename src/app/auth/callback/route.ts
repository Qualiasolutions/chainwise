import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient<Database>({
        cookies: () => cookieStore
      })

      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(
          new URL(`/auth/signin?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
        )
      }

      if (data?.user) {
        // Successful authentication - redirect to intended page
        return NextResponse.redirect(new URL(next, requestUrl.origin))
      }
    } catch (error) {
      console.error('Auth callback exception:', error)
      return NextResponse.redirect(
        new URL(`/auth/signin?error=${encodeURIComponent('Authentication failed')}`, requestUrl.origin)
      )
    }
  }

  // No code parameter - redirect to sign in
  return NextResponse.redirect(
    new URL('/auth/signin?error=Invalid authentication request', requestUrl.origin)
  )
}
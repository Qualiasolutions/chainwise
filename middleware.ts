import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  // Skip middleware if Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next()
  }
  
  const { supabase, response } = createMiddlewareClient(request)
  
  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()
  
  const { nextUrl } = request
  
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession()
  const isLoggedIn = !!session
  
  const isAuthRoute = nextUrl.pathname.startsWith("/auth/")
  const isPublicRoute = ["/", "/auth/signin", "/auth/signup", "/auth/error", "/api/auth/callback"].includes(nextUrl.pathname)
  const isProtectedRoute = ["/dashboard", "/portfolio", "/chat", "/settings"].some(route => 
    nextUrl.pathname.startsWith(route)
  )

  // Redirect authenticated users away from auth pages
  if (isLoggedIn && isAuthRoute && !nextUrl.pathname.includes('/callback')) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  // Redirect unauthenticated users from protected routes
  if (!isLoggedIn && isProtectedRoute) {
    const callbackUrl = nextUrl.pathname + nextUrl.search
    const encodedCallbackUrl = encodeURIComponent(callbackUrl)
    return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${encodedCallbackUrl}`, nextUrl))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
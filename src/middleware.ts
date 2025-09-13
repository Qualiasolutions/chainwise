import { createMiddlewareClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // Create a response object
    const res = NextResponse.next()
    
    // Create a Supabase client configured to use cookies
    const { supabase, response } = createMiddlewareClient(request)
    
    // Refresh session if expired - required for Server Components
    await supabase.auth.getSession()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Auth condition checks
    const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
    const isProtectedRoute = [
      '/dashboard',
      '/portfolio',
      '/chat',
      '/settings',
      '/alerts',
      '/notifications'
    ].some(route => request.nextUrl.pathname.startsWith(route))

    // Redirect authenticated users away from auth pages
    if (isAuthPage && user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Redirect unauthenticated users to sign in for protected routes
    if (isProtectedRoute && !user) {
      const redirectUrl = encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)
      return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${redirectUrl}`, request.url))
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
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
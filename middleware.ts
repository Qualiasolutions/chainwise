import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Create response
  const response = NextResponse.next()

  // Add security headers similar to helmet
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'no-referrer')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://apis.google.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https://api.coingecko.com https://*.supabase.co https://api.openai.com wss://*.supabase.co; " +
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com;"
  )

  // Strict Transport Security (HSTS)
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  // Add caching headers for static pages (aggressive caching for marketing/public pages)
  const pathname = request.nextUrl.pathname
  const isStaticPage = pathname === '/' ||
                       pathname.startsWith('/terms') ||
                       pathname.startsWith('/privacy') ||
                       pathname.startsWith('/contact')

  const isAuthPage = pathname.startsWith('/auth')
  const isDashboard = pathname.startsWith('/dashboard') ||
                      pathname.startsWith('/portfolio') ||
                      pathname.startsWith('/settings')

  if (isStaticPage) {
    // Cache static marketing pages for 1 hour
    response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
  } else if (isAuthPage) {
    // Never cache auth pages
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  } else if (isDashboard) {
    // Cache dashboard pages briefly (5 minutes) with stale-while-revalidate
    response.headers.set('Cache-Control', 'private, max-age=300, stale-while-revalidate=600')
  } else {
    // Default: cache for 5 minutes with revalidation
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
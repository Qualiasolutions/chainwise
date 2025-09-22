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
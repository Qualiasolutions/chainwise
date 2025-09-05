import { NextResponse } from 'next/server'

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    deployment: {
      platform: process.env.VERCEL ? 'vercel' : 'unknown',
      region: process.env.VERCEL_REGION || 'unknown',
      url: process.env.VERCEL_URL || 'https://chainwise-sand.vercel.app'
    },
    services: {
      database: 'checking...',
      auth: 'checking...',
      stripe: 'checking...'
    }
  }

  // Check database connection
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    const { data, error } = await supabase.from('users').select('id').limit(1)
    health.services.database = error ? 'unhealthy' : 'healthy'
    if (error) health.status = 'degraded'
  } catch (error) {
    health.services.database = 'unhealthy'
    health.status = 'degraded'
  }

  // Check Supabase Auth configuration
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    health.services.auth = 'configured'
  } catch (error) {
    health.services.auth = 'error'
    health.status = 'degraded'
  }

  // Check Stripe configuration
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY
    health.services.stripe = stripeSecret ? 'configured' : 'missing_key'
  } catch (error) {
    health.services.stripe = 'error'
    health.status = 'degraded'
  }

  const statusCode = health.status === 'ok' ? 200 :
                     health.status === 'degraded' ? 207 : 503

  return NextResponse.json(health, { status: statusCode })
}

// Also support POST for webhook health checks
export async function POST() {
  return GET()
}

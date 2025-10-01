// Health Check Endpoint
// GET /api/health - Returns application health status

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const startTime = Date.now()
  const checks: Record<string, any> = {}

  // Check environment variables
  checks.environment = {
    status: 'ok',
    nodeEnv: process.env.NODE_ENV,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasStripe: !!process.env.STRIPE_SECRET_KEY,
  }

  // Check database connection
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )

      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
        .single()

      checks.database = {
        status: error ? 'error' : 'ok',
        error: error?.message,
      }
    } else {
      checks.database = {
        status: 'not_configured',
      }
    }
  } catch (error) {
    checks.database = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }

  // Calculate response time
  const responseTime = Date.now() - startTime

  // Determine overall status
  const hasErrors = Object.values(checks).some((check: any) => check.status === 'error')
  const overallStatus = hasErrors ? 'degraded' : 'healthy'

  return NextResponse.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    responseTime: `${responseTime}ms`,
    version: '1.0.0',
    checks,
  }, {
    status: hasErrors ? 503 : 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}

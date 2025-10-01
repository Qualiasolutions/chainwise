// Stripe Customer Portal Session Creation
// POST /api/stripe/create-portal - Create Stripe customer portal session

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { createPortalSession } from '@/lib/stripe-helpers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile with Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile || !profile.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Create portal session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const returnUrl = `${baseUrl}/settings/billing`

    const portalSession = await createPortalSession(
      profile.stripe_customer_id,
      returnUrl
    )

    return NextResponse.json({
      success: true,
      url: portalSession.url
    })

  } catch (error: any) {
    console.error('Portal session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session', details: error.message },
      { status: 500 }
    )
  }
}

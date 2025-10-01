// Stripe Checkout Session Creation
// POST /api/stripe/create-checkout - Create Stripe checkout session

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { createCheckoutSession } from '@/lib/stripe-helpers'

// Price ID mapping (update these with your actual Stripe price IDs)
const PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
  elite_monthly: process.env.STRIPE_PRICE_ELITE_MONTHLY || 'price_elite_monthly',
  elite_yearly: process.env.STRIPE_PRICE_ELITE_YEARLY || 'price_elite_yearly',
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name, tier')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { priceId, planType } = body

    if (!priceId || !planType) {
      return NextResponse.json({
        error: 'Price ID and plan type are required'
      }, { status: 400 })
    }

    // Validate price ID
    const validPriceIds = Object.values(PRICE_IDS)
    if (!validPriceIds.includes(priceId)) {
      return NextResponse.json({
        error: 'Invalid price ID'
      }, { status: 400 })
    }

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${baseUrl}/checkout?canceled=true`

    const checkoutSession = await createCheckoutSession(
      profile.id,
      profile.email,
      priceId,
      successUrl,
      cancelUrl
    )

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    })

  } catch (error: any) {
    console.error('Checkout session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error.message },
      { status: 500 }
    )
  }
}

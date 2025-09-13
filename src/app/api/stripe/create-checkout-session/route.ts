import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, STRIPE_CONFIG, StripePlan } from '@/lib/stripe'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createCheckoutSchema = z.object({
  plan: z.enum(['pro', 'elite']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { plan, successUrl, cancelUrl } = createCheckoutSchema.parse(body)
    
    const planConfig = STRIPE_CONFIG.plans[plan as StripePlan]
    
    // Get user with subscription data
    const { data: customer, error: customerError } = await supabase
      .from('users')
      .select(`
        *,
        subscriptions (
          stripe_customer_id,
          status
        )
      `)
      .eq('id', user.id)
      .single()
    
    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user already has an active subscription
    if (customer.subscriptions?.[0]?.status === 'active') {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 400 }
      )
    }

    let stripeCustomerId = customer.subscriptions?.[0]?.stripe_customer_id

    if (!stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        email: customer.email,
        name: customer.full_name || undefined,
        metadata: {
          userId: customer.id,
        },
      })
      stripeCustomerId = stripeCustomer.id
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || STRIPE_CONFIG.successUrl,
      cancel_url: cancelUrl || STRIPE_CONFIG.cancelUrl,
      subscription_data: {
        metadata: {
          userId: user.id,
          plan: plan,
          credits: planConfig.credits.toString(),
        },
      },
      metadata: {
        userId: user.id,
        plan: plan,
      },
    })

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
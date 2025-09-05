import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const purchasePackSchema = z.object({
  packId: z.string(),
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
    const { packId, successUrl, cancelUrl } = purchasePackSchema.parse(body)
    
    // Get credit pack details
    const { data: creditPack, error: packError } = await supabase
      .from('credit_purchase_packs')
      .select('*')
      .eq('id', packId)
      .eq('is_active', true)
      .single()
    
    if (packError || !creditPack) {
      return NextResponse.json(
        { error: 'Credit pack not found' },
        { status: 404 }
      )
    }

    // Get user details
    const { data: customer, error: customerError } = await supabase
      .from('users')
      .select(`
        *,
        subscriptions (
          stripe_customer_id
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

    let stripeCustomerId = customer.subscriptions?.[0]?.stripe_customer_id

    if (!stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        email: customer.email,
        name: customer.name || undefined,
        metadata: {
          userId: customer.id,
        },
      })
      stripeCustomerId = stripeCustomer.id
    }

    // Create checkout session for credit pack
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${creditPack.pack_name} - ${creditPack.credits} Credits`,
              description: `Purchase ${creditPack.credits} ChainWise AI credits`,
            },
            unit_amount: Math.round(creditPack.price_usd * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?purchase=success`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?cancelled=true`,
      metadata: {
        userId: user.id,
        packId: creditPack.id,
        credits: creditPack.credits.toString(),
        type: 'credit_pack_purchase',
      },
    })

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error) {
    console.error('Error creating credit pack checkout:', error)
    
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
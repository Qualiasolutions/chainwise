import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { creditService } from '@/lib/credit-service'
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
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { packId, successUrl, cancelUrl } = purchasePackSchema.parse(body)
    
    // Get credit pack details from service (source of truth)
    const creditPack = creditService.getCreditPack(packId)
    if (!creditPack) {
      return NextResponse.json(
        { success: false, error: 'Credit pack not found' },
        { status: 404 }
      )
    }

    // For demo purposes: directly add credits without payment
    // In production, this would create a Stripe checkout session
    if (!stripe) {
      // Simulate successful purchase for demo
      await creditService.addCredits(
        user.id,
        creditPack.credits,
        'purchased',
        `Purchased ${creditPack.name}`,
        {
          pack_id: packId,
          payment_method: 'demo',
          amount_usd: creditPack.price_usd
        }
      )

      return NextResponse.json({
        success: true,
        message: `Successfully purchased ${creditPack.name}`,
        data: {
          pack: creditPack,
          creditsAdded: creditPack.credits
        }
      })
    }

    // Production Stripe integration
    const { data: customer, error: customerError } = await supabase
      .from('users')
      .select('email')
      .eq('id', user.id)
      .single()
    
    if (customerError || !customer) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Create checkout session for credit pack
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${creditPack.name} - ${creditPack.credits} Credits`,
              description: creditPack.description,
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
      customer_email: customer.email
    })

    return NextResponse.json({
      success: true,
      data: {
        url: checkoutSession.url,
        sessionId: checkoutSession.id
      }
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
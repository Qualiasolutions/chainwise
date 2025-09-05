import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const purchaseSchema = z.object({
  featureId: z.string().uuid(),
  purchaseType: z.enum(['credits', 'usd']) // Use credits or pay with USD
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

    const body = await request.json()
    const { featureId, purchaseType } = purchaseSchema.parse(body)

    // Get feature details
    const { data: feature, error: featureError } = await supabase
      .from('premium_features')
      .select('*')
      .eq('id', featureId)
      .eq('is_active', true)
      .single()

    if (featureError || !feature) {
      return NextResponse.json(
        { error: 'Feature not found' },
        { status: 404 }
      )
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('subscription_tier, credits_balance')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user meets tier requirement
    const tierOrder = { 'free': 0, 'pro': 1, 'elite': 2 }
    const userTierLevel = tierOrder[userData.subscription_tier as keyof typeof tierOrder] || 0
    const requiredTierLevel = tierOrder[feature.required_tier as keyof typeof tierOrder] || 0

    if (userTierLevel < requiredTierLevel) {
      return NextResponse.json(
        { 
          error: `This feature requires ${feature.required_tier} subscription or higher`,
          requiredTier: feature.required_tier,
          currentTier: userData.subscription_tier
        },
        { status: 403 }
      )
    }

    if (purchaseType === 'credits') {
      // Handle credit-based purchase
      if (!feature.credit_cost || feature.credit_cost <= 0) {
        return NextResponse.json(
          { error: 'This feature cannot be purchased with credits' },
          { status: 400 }
        )
      }

      // Check if user has enough credits
      if (userData.credits_balance < feature.credit_cost) {
        return NextResponse.json(
          { 
            error: 'Insufficient credits',
            required: feature.credit_cost,
            current: userData.credits_balance
          },
          { status: 402 }
        )
      }

      // Deduct credits using RPC function
      const { error: creditsError } = await supabase.rpc('spend_credits', {
        user_id: user.id,
        credit_amount: feature.credit_cost,
        feature_name: `premium_feature_${feature.feature_key}`,
        transaction_description: `${feature.name} - ${feature.description}`
      })

      if (creditsError) {
        return NextResponse.json(
          { error: 'Failed to deduct credits' },
          { status: 500 }
        )
      }

      // Record feature usage
      const { error: usageError } = await supabase
        .from('user_activity_logs')
        .insert({
          user_id: user.id,
          action: 'premium_feature_purchase',
          entity_type: 'premium_feature',
          entity_id: feature.id,
          metadata: {
            feature_key: feature.feature_key,
            feature_name: feature.name,
            credit_cost: feature.credit_cost,
            purchase_type: 'credits',
            timestamp: new Date().toISOString()
          }
        })

      if (usageError) {
        console.error('Error recording feature usage:', usageError)
      }

      return NextResponse.json({
        success: true,
        message: `Successfully purchased ${feature.name}`,
        feature: {
          id: feature.id,
          name: feature.name,
          description: feature.description,
          creditsCost: feature.credit_cost
        },
        remainingCredits: userData.credits_balance - feature.credit_cost
      })

    } else {
      // Handle USD purchase via Stripe
      if (!feature.pricing_usd) {
        return NextResponse.json(
          { error: 'This feature cannot be purchased with USD' },
          { status: 400 }
        )
      }

      // Import stripe here to avoid loading it unnecessarily
      const { stripe } = await import('@/lib/stripe')
      
      try {
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: feature.name,
                  description: feature.description,
                },
                unit_amount: Math.round(parseFloat(feature.pricing_usd) * 100),
              },
              quantity: 1,
            },
          ],
          success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?feature_purchased=${feature.feature_key}`,
          cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/marketplace`,
          metadata: {
            userId: user.id,
            type: 'premium_feature_purchase',
            featureId: feature.id,
            featureKey: feature.feature_key,
            featureName: feature.name
          },
        })

        return NextResponse.json({
          success: true,
          checkoutUrl: session.url
        })
      } catch (stripeError) {
        console.error('Stripe error:', stripeError)
        return NextResponse.json(
          { error: 'Failed to create payment session' },
          { status: 500 }
        )
      }
    }

  } catch (error) {
    console.error('Error purchasing premium feature:', error)
    
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
// Stripe Webhook Handler
// POST /api/webhooks/stripe - Handle Stripe webhook events

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Tier mapping based on price IDs
const PRICE_TO_TIER_MAP: Record<string, 'free' | 'pro' | 'elite'> = {
  // Pro tier price IDs
  'price_pro_monthly': 'pro',
  'price_pro_yearly': 'pro',
  // Elite tier price IDs
  'price_elite_monthly': 'elite',
  'price_elite_yearly': 'elite',
}

// Credit allocation based on tier
const TIER_CREDITS: Record<string, number> = {
  free: 100,
  pro: 500,
  elite: 2000,
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    console.error('Missing Stripe signature')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log(`Processing webhook event: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription' && session.customer) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          const priceId = subscription.items.data[0]?.price.id
          const tier = PRICE_TO_TIER_MAP[priceId] || 'free'
          const credits = TIER_CREDITS[tier]

          // Get user by Stripe customer ID
          const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id, email, credits, tier')
            .eq('stripe_customer_id', session.customer)
            .single()

          if (profileError || !profile) {
            console.error('Profile not found for customer:', session.customer)
            break
          }

          // Update user tier and allocate credits
          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
              tier,
              credits: profile.credits + credits,
              stripe_subscription_id: subscription.id,
              subscription_status: subscription.status,
              updated_at: new Date().toISOString()
            })
            .eq('id', profile.id)

          if (updateError) {
            console.error('Failed to update profile:', updateError)
            break
          }

          // Log credit transaction
          await supabaseAdmin
            .from('credit_transactions')
            .insert({
              user_id: profile.id,
              amount: credits,
              transaction_type: 'subscription_renewal',
              description: `${tier.toUpperCase()} tier subscription - ${credits} credits allocated`,
              balance_after: profile.credits + credits
            })

          console.log(`Successfully upgraded user ${profile.email} to ${tier} tier`)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const priceId = subscription.items.data[0]?.price.id
        const tier = PRICE_TO_TIER_MAP[priceId] || 'free'
        const credits = TIER_CREDITS[tier]

        // Get user by subscription ID
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('id, email, credits, tier')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (profileError || !profile) {
          console.error('Profile not found for subscription:', subscription.id)
          break
        }

        // Only update if tier changed
        if (profile.tier !== tier) {
          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
              tier,
              credits: profile.credits + credits,
              subscription_status: subscription.status,
              updated_at: new Date().toISOString()
            })
            .eq('id', profile.id)

          if (updateError) {
            console.error('Failed to update profile:', updateError)
            break
          }

          // Log credit transaction
          await supabaseAdmin
            .from('credit_transactions')
            .insert({
              user_id: profile.id,
              amount: credits,
              transaction_type: 'tier_change',
              description: `Tier changed from ${profile.tier.toUpperCase()} to ${tier.toUpperCase()} - ${credits} credits allocated`,
              balance_after: profile.credits + credits
            })

          console.log(`Successfully changed tier for ${profile.email} from ${profile.tier} to ${tier}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // Get user by subscription ID
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('id, email, tier')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (profileError || !profile) {
          console.error('Profile not found for subscription:', subscription.id)
          break
        }

        // Downgrade to free tier
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            tier: 'free',
            stripe_subscription_id: null,
            subscription_status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id)

        if (updateError) {
          console.error('Failed to downgrade profile:', updateError)
          break
        }

        console.log(`Successfully downgraded ${profile.email} to free tier`)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice

        if (invoice.subscription && invoice.billing_reason === 'subscription_cycle') {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          )

          const priceId = subscription.items.data[0]?.price.id
          const tier = PRICE_TO_TIER_MAP[priceId] || 'free'
          const credits = TIER_CREDITS[tier]

          // Get user by subscription ID
          const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id, email, credits')
            .eq('stripe_subscription_id', subscription.id)
            .single()

          if (profileError || !profile) {
            console.error('Profile not found for subscription:', subscription.id)
            break
          }

          // Allocate monthly credits
          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
              credits: profile.credits + credits,
              updated_at: new Date().toISOString()
            })
            .eq('id', profile.id)

          if (updateError) {
            console.error('Failed to allocate credits:', updateError)
            break
          }

          // Log credit transaction
          await supabaseAdmin
            .from('credit_transactions')
            .insert({
              user_id: profile.id,
              amount: credits,
              transaction_type: 'subscription_renewal',
              description: `Monthly renewal - ${credits} credits allocated`,
              balance_after: profile.credits + credits
            })

          console.log(`Successfully allocated ${credits} credits to ${profile.email}`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice

        if (invoice.subscription) {
          // Get user by subscription ID
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id, email')
            .eq('stripe_subscription_id', invoice.subscription)
            .single()

          if (profile) {
            // Update subscription status
            await supabaseAdmin
              .from('profiles')
              .update({
                subscription_status: 'past_due',
                updated_at: new Date().toISOString()
              })
              .eq('id', profile.id)

            console.log(`Payment failed for ${profile.email}`)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    )
  }
}

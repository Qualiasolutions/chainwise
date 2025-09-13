import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, STRIPE_CONFIG } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')
    
    if (!signature || !STRIPE_CONFIG.webhookSecret) {
      return NextResponse.json(
        { error: 'Missing signature or webhook secret' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_CONFIG.webhookSecret
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCanceled(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const type = session.metadata?.type
  
  if (!userId) {
    console.error('Missing userId in checkout session metadata')
    return
  }

  // Handle credit pack purchases
  if (type === 'credit_pack_purchase') {
    await handleCreditPackPurchase(session)
    return
  }

  // Handle premium feature purchases
  if (type === 'premium_feature_purchase') {
    await handlePremiumFeaturePurchase(session)
    return
  }

  const plan = session.metadata?.plan as 'pro' | 'elite'
  
  if (!plan) {
    console.error('Missing plan in checkout session metadata')
    return
  }

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  )

  const planConfig = STRIPE_CONFIG.plans[plan]
  const supabase = createClient()

  // Create or update subscription
  const { error: subError } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      status: subscription.status,
      tier: plan,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      cancel_at_period_end: (subscription as any).cancel_at_period_end,
    })

  if (subError) {
    console.error('Error upserting subscription:', subError)
    return
  }

  // Update user subscription tier
  const { error: userError } = await supabase
    .from('users')
    .update({
      subscription_tier: plan
    })
    .eq('id', userId)

  if (userError) {
    console.error('Error updating user:', userError)
    return
  }

  // Add credits using RPC function
  const { error: creditsError } = await supabase.rpc('spend_credits', {
    user_id: userId,
    credit_amount: -planConfig.credits, // Negative to add credits
    feature_name: 'subscription_purchase',
    transaction_description: `${planConfig.name} subscription - ${planConfig.credits} credits`
  })

  if (creditsError) {
    console.error('Error adding credits:', creditsError)
  }

  // Record credit transaction
  const { error: transactionError } = await supabase
    .from('credit_transactions')
    .insert({
      user_id: userId,
      transaction_type: 'purchased',
      amount: planConfig.credits,
      stripe_payment_intent_id: session.payment_intent as string,
      description: `${planConfig.name} subscription - ${planConfig.credits} credits`,
      metadata: {
        plan,
        subscriptionId: subscription.id,
      },
    })

  if (transactionError) {
    console.error('Error creating credit transaction:', transactionError)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  
  if (!userId) return

  const supabase = createClient()

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      cancel_at_period_end: (subscription as any).cancel_at_period_end,
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error updating subscription:', error)
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const supabase = createClient()

  // Update subscription status
  const { error: subError } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      cancel_at_period_end: true,
    })
    .eq('stripe_subscription_id', subscription.id)

  if (subError) {
    console.error('Error updating canceled subscription:', subError)
    return
  }

  // Get subscription to find user_id
  const { data: sub, error: getError } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (getError || !sub) {
    console.error('Error getting subscription for cancellation:', getError)
    return
  }

  // Downgrade user to free tier
  const { error: userError } = await supabase
    .from('users')
    .update({
      subscription_tier: 'free',
    })
    .eq('id', sub.user_id)

  if (userError) {
    console.error('Error downgrading user:', userError)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Handle successful recurring payments
  const subscription = await stripe.subscriptions.retrieve(
    (invoice as any).subscription as string
  )
  
  const userId = subscription.metadata?.userId
  const plan = subscription.metadata?.plan as 'pro' | 'elite'
  
  if (!userId || !plan) return

  const planConfig = STRIPE_CONFIG.plans[plan]
  const supabase = createClient()

  // Add monthly credits using RPC function
  const { error: creditsError } = await supabase.rpc('spend_credits', {
    user_id: userId,
    credit_amount: -planConfig.credits, // Negative to add credits
    feature_name: 'monthly_subscription',
    transaction_description: `Monthly ${planConfig.name} credits - ${planConfig.credits} credits`
  })

  if (creditsError) {
    console.error('Error adding monthly credits:', creditsError)
  }

  // Record additional metadata for the transaction
  const { error: metaError } = await supabase
    .from('credit_transactions')
    .update({
      metadata: {
        plan,
        subscriptionId: subscription.id,
        invoiceId: invoice.id,
      }
    })
    .eq('user_id', userId)
    .eq('description', `Monthly ${planConfig.name} credits - ${planConfig.credits} credits`)
    .order('created_at', { ascending: false })
    .limit(1)

  if (metaError) {
    console.error('Error updating transaction metadata:', metaError)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Handle failed payments - you might want to notify the user
  console.log('Payment failed for invoice:', invoice.id)
  
  // You could implement logic here to:
  // 1. Send email notification to user
  // 2. Temporarily suspend premium features
  // 3. Log the failed payment attempt
}

async function handleCreditPackPurchase(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const packId = session.metadata?.packId
  const credits = parseInt(session.metadata?.credits || '0')
  
  if (!userId || !packId || !credits) {
    console.error('Missing metadata in credit pack purchase session')
    return
  }

  const supabase = createClient()

  // Get pack details for verification
  const { data: pack, error: packError } = await supabase
    .from('credit_purchase_packs')
    .select('*')
    .eq('id', packId)
    .single()

  if (packError || !pack) {
    console.error('Error fetching credit pack:', packError)
    return
  }

  // Add credits to user's balance using RPC function
  const { error: creditsError } = await supabase.rpc('spend_credits', {
    user_id: userId,
    credit_amount: -credits, // Negative to add credits
    feature_name: 'credit_pack_purchase',
    transaction_description: `${pack.pack_name} purchase - ${credits} credits`
  })

  if (creditsError) {
    console.error('Error adding credits from pack purchase:', creditsError)
    return
  }

  // Record credit transaction
  const { error: transactionError } = await supabase
    .from('credit_transactions')
    .insert({
      user_id: userId,
      transaction_type: 'purchased',
      amount: credits,
      stripe_payment_intent_id: session.payment_intent as string,
      description: `${pack.pack_name} purchase - ${credits} credits`,
      metadata: {
        pack_id: packId,
        pack_name: pack.pack_name,
        price_paid: pack.price_usd,
        session_id: session.id,
      },
    })

  if (transactionError) {
    console.error('Error creating credit pack transaction:', transactionError)
  }

  console.log(`Successfully processed credit pack purchase: ${credits} credits for user ${userId}`)
}

async function handlePremiumFeaturePurchase(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const featureId = session.metadata?.featureId
  const featureKey = session.metadata?.featureKey
  const featureName = session.metadata?.featureName
  
  if (!userId || !featureId || !featureKey) {
    console.error('Missing metadata in premium feature purchase session')
    return
  }

  const supabase = createClient()

  // Get feature details for verification
  const { data: feature, error: featureError } = await supabase
    .from('premium_features')
    .select('*')
    .eq('id', featureId)
    .single()

  if (featureError || !feature) {
    console.error('Error fetching premium feature:', featureError)
    return
  }

  // Record feature purchase in activity log
  const { error: activityError } = await supabase
    .from('user_activity_logs')
    .insert({
      user_id: userId,
      action: 'premium_feature_purchase',
      entity_type: 'premium_feature',
      entity_id: featureId,
      metadata: {
        feature_key: featureKey,
        feature_name: featureName,
        purchase_type: 'usd',
        amount_paid: feature.pricing_usd,
        session_id: session.id,
        timestamp: new Date().toISOString()
      }
    })

  if (activityError) {
    console.error('Error recording premium feature purchase:', activityError)
  }

  console.log(`Successfully processed premium feature purchase: ${featureName} for user ${userId}`)
}
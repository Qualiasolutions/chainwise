// Stripe Helper Functions
// Utilities for Stripe integration and customer management

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

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  // Check if user already has a Stripe customer ID
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single()

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      supabase_user_id: userId
    }
  })

  // Update profile with Stripe customer ID
  await supabaseAdmin
    .from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId)

  return customer.id
}

/**
 * Create a Stripe checkout session for subscription
 */
export async function createCheckoutSession(
  userId: string,
  email: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const customerId = await getOrCreateStripeCustomer(userId, email)

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    metadata: {
      user_id: userId
    }
  })

  return session
}

/**
 * Create a Stripe portal session for managing subscription
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.cancel(subscriptionId)
}

/**
 * Get subscription details
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.retrieve(subscriptionId)
}

/**
 * Update subscription (change plan)
 */
export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  })
}

/**
 * Get customer's payment methods
 */
export async function getPaymentMethods(
  customerId: string
): Promise<Stripe.PaymentMethod[]> {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  })

  return paymentMethods.data
}

/**
 * Get customer's invoices
 */
export async function getInvoices(
  customerId: string,
  limit: number = 10
): Promise<Stripe.Invoice[]> {
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit,
  })

  return invoices.data
}

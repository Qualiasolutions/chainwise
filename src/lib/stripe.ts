import Stripe from 'stripe'

// Create stripe instance only if the secret key is available
// During build time, this might not be available
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    })
  : null

export const STRIPE_CONFIG = {
  plans: {
    pro: {
      priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
      amount: 1299, // $12.99 in cents
      credits: 50,
      name: 'Pro Plan',
      interval: 'month' as const,
    },
    elite: {
      priceId: process.env.STRIPE_ELITE_PRICE_ID || 'price_elite_monthly',
      amount: 2499, // $24.99 in cents
      credits: 200, // Updated to match pricing document
      name: 'Elite Plan',  
      interval: 'month' as const,
    },
  },
  currency: 'usd',
  successUrl: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
  cancelUrl: `${process.env.NEXTAUTH_URL}/pricing?cancelled=true`,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
}

export type StripePlan = keyof typeof STRIPE_CONFIG.plans
import { z } from 'zod'

export const subscriptionTierSchema = z.enum(['free', 'pro', 'elite'])

export const createCheckoutSchema = z.object({
  plan: z.enum(['pro', 'elite']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
})

export const subscriptionUpdateSchema = z.object({
  tier: subscriptionTierSchema,
  status: z.enum(['active', 'canceled', 'past_due', 'unpaid', 'trialing']),
})

export const creditTransactionSchema = z.object({
  amount: z.number().int(),
  transactionType: z.enum(['earned', 'purchased', 'spent']),
  featureUsed: z.string().optional(),
  description: z.string().optional(),
})

export type SubscriptionTier = z.infer<typeof subscriptionTierSchema>
export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>
export type SubscriptionUpdateInput = z.infer<typeof subscriptionUpdateSchema>
export type CreditTransactionInput = z.infer<typeof creditTransactionSchema>
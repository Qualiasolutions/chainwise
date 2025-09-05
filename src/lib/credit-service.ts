import { createClient } from '@/lib/supabase/server'
import { createClient as createClientServer } from '@supabase/supabase-js'

export interface CreditTransaction {
  id: string
  user_id: string
  transaction_type: 'earned' | 'spent' | 'purchased' | 'refunded'
  amount: number
  feature_used?: string
  description?: string
  stripe_payment_intent_id?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface CreditBalance {
  balance: number
  tier: string
  points: number
  last_updated: string
}

export interface FeatureCost {
  feature_key: string
  name: string
  category: string
  credit_cost: number
  pricing_usd?: number
  required_tier?: string
  is_active: boolean
  metadata?: Record<string, any>
}

export class CreditService {
  private supabase: ReturnType<typeof createClient>

  constructor(supabaseClient?: ReturnType<typeof createClient>) {
    this.supabase = supabaseClient || createClient()
  }

  /**
   * Get user's current credit balance and tier information
   */
  async getBalance(userId: string): Promise<CreditBalance | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('credits_balance, subscription_tier, total_points, updated_at')
      .eq('id', userId)
      .single()

    if (error || !data) {
      throw new Error(`Failed to fetch credit balance: ${error?.message}`)
    }

    return {
      balance: data.credits_balance,
      tier: data.subscription_tier,
      points: data.total_points,
      last_updated: data.updated_at
    }
  }

  /**
   * Get feature costs and tier requirements
   */
  async getFeatureCosts(): Promise<FeatureCost[]> {
    const { data, error } = await this.supabase
      .from('premium_features')
      .select('*')
      .eq('is_active', true)
      .order('category')

    if (error) {
      throw new Error(`Failed to fetch feature costs: ${error.message}`)
    }

    return data.map(feature => ({
      feature_key: feature.feature_key,
      name: feature.name,
      category: feature.category,
      credit_cost: feature.credit_cost,
      pricing_usd: feature.pricing_usd,
      required_tier: feature.required_tier,
      is_active: feature.is_active,
      metadata: feature.metadata
    }))
  }

  /**
   * Get specific feature cost by key
   */
  async getFeatureCost(featureKey: string): Promise<FeatureCost | null> {
    const { data, error } = await this.supabase
      .from('premium_features')
      .select('*')
      .eq('feature_key', featureKey)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return null
    }

    return {
      feature_key: data.feature_key,
      name: data.name,
      category: data.category,
      credit_cost: data.credit_cost,
      pricing_usd: data.pricing_usd,
      required_tier: data.required_tier,
      is_active: data.is_active,
      metadata: data.metadata
    }
  }

  /**
   * Check if user has sufficient credits for a feature
   */
  async canAffordFeature(userId: string, featureKey: string): Promise<{
    canAfford: boolean
    balance: number
    required: number
    shortfall: number
    tierRequired?: string
    userTier: string
  }> {
    const [balance, feature] = await Promise.all([
      this.getBalance(userId),
      this.getFeatureCost(featureKey)
    ])

    if (!balance || !feature) {
      throw new Error('Unable to check feature affordability')
    }

    const canAfford = balance.balance >= feature.credit_cost
    const shortfall = Math.max(0, feature.credit_cost - balance.balance)

    return {
      canAfford,
      balance: balance.balance,
      required: feature.credit_cost,
      shortfall,
      tierRequired: feature.required_tier,
      userTier: balance.tier
    }
  }

  /**
   * Spend credits using the database function for atomicity
   */
  async spendCredits(
    userId: string, 
    amount: number, 
    featureUsed: string,
    description?: string,
    metadata?: Record<string, any>
  ): Promise<{ newBalance: number }> {
    const { data, error } = await this.supabase.rpc('spend_credits', {
      user_id: userId,
      credit_amount: amount,
      feature_name: featureUsed,
      transaction_description: description || `Used ${amount} credits for ${featureUsed}`,
      transaction_metadata: metadata || {}
    })

    if (error) {
      throw error
    }

    return { newBalance: data.new_balance }
  }

  /**
   * Add credits to user's balance (for purchases, bonuses, etc.)
   */
  async addCredits(
    userId: string, 
    amount: number, 
    transactionType: 'earned' | 'purchased' | 'refunded' = 'earned',
    description?: string,
    stripePaymentIntentId?: string,
    metadata?: Record<string, any>
  ): Promise<{ newBalance: number }> {
    // Get current balance first
    const balance = await this.getBalance(userId)
    if (!balance) {
      throw new Error('User not found')
    }

    const newBalance = balance.balance + amount

    // Update balance
    const { error: updateError } = await this.supabase
      .from('users')
      .update({ 
        credits_balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      throw updateError
    }

    // Record transaction
    const { error: transactionError } = await this.supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        transaction_type: transactionType,
        amount: amount,
        description: description || `Added ${amount} credits`,
        stripe_payment_intent_id: stripePaymentIntentId,
        metadata: metadata || {}
      })

    if (transactionError) {
      throw transactionError
    }

    return { newBalance }
  }

  /**
   * Get credit transaction history for a user
   */
  async getTransactionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    transactions: CreditTransaction[]
    total: number
    hasMore: boolean
  }> {
    const [transactionsResult, countResult] = await Promise.all([
      this.supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1),
      this.supabase
        .from('credit_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
    ])

    if (transactionsResult.error) {
      throw transactionsResult.error
    }

    return {
      transactions: transactionsResult.data || [],
      total: countResult.count || 0,
      hasMore: offset + limit < (countResult.count || 0)
    }
  }

  /**
   * Get credit usage analytics for a user
   */
  async getUserCreditAnalytics(
    userId: string,
    days: number = 30
  ): Promise<{
    totalSpent: number
    totalEarned: number
    netChange: number
    topFeatures: Array<{ feature: string; amount: number; count: number }>
    dailyUsage: Array<{ date: string; spent: number; earned: number }>
  }> {
    const sinceDate = new Date()
    sinceDate.setDate(sinceDate.getDate() - days)

    const { data, error } = await this.supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', sinceDate.toISOString())

    if (error) {
      throw error
    }

    const transactions = data || []
    
    const totalSpent = transactions
      .filter(t => t.transaction_type === 'spent')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    
    const totalEarned = transactions
      .filter(t => ['earned', 'purchased'].includes(t.transaction_type))
      .reduce((sum, t) => sum + t.amount, 0)

    const netChange = totalEarned - totalSpent

    // Group by features
    const featureUsage = transactions
      .filter(t => t.transaction_type === 'spent' && t.feature_used)
      .reduce((acc, t) => {
        const key = t.feature_used!
        if (!acc[key]) {
          acc[key] = { feature: key, amount: 0, count: 0 }
        }
        acc[key].amount += Math.abs(t.amount)
        acc[key].count += 1
        return acc
      }, {} as Record<string, { feature: string; amount: number; count: number }>)

    const topFeatures = Object.values(featureUsage)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)

    // Daily usage (simplified - would need more complex grouping for real implementation)
    const dailyUsage: Array<{ date: string; spent: number; earned: number }> = []
    
    return {
      totalSpent,
      totalEarned,
      netChange,
      topFeatures,
      dailyUsage
    }
  }

  /**
   * Validate user tier access for a feature
   */
  async validateTierAccess(userId: string, featureKey: string): Promise<{
    hasAccess: boolean
    userTier: string
    requiredTier?: string
    message?: string
  }> {
    const [balance, feature] = await Promise.all([
      this.getBalance(userId),
      this.getFeatureCost(featureKey)
    ])

    if (!balance || !feature) {
      return {
        hasAccess: false,
        userTier: balance?.tier || 'unknown',
        message: 'Feature or user not found'
      }
    }

    const tierHierarchy = {
      free: 0,
      pro: 1,
      elite: 2
    }

    const userTierLevel = tierHierarchy[balance.tier as keyof typeof tierHierarchy] || 0
    const requiredTierLevel = feature.required_tier 
      ? tierHierarchy[feature.required_tier as keyof typeof tierHierarchy] || 0 
      : 0

    const hasAccess = userTierLevel >= requiredTierLevel

    return {
      hasAccess,
      userTier: balance.tier,
      requiredTier: feature.required_tier,
      message: hasAccess 
        ? undefined 
        : `This feature requires ${feature.required_tier || 'pro'} tier. Your current tier: ${balance.tier}`
    }
  }
}

// Export a singleton instance for server-side usage
export const creditService = new CreditService()

// Export factory function for custom Supabase clients
export const createCreditService = (supabaseClient: ReturnType<typeof createClient>) => 
  new CreditService(supabaseClient)
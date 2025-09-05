import { createClient } from '@/lib/supabase/server'

// Define subscription tiers
export type SubscriptionTier = 'free' | 'pro' | 'elite'

// Define available features
export type Feature = 
  | 'ai_chat_buddy'
  | 'ai_chat_professor'
  | 'ai_chat_trader'
  | 'portfolio_basic'
  | 'portfolio_analysis'
  | 'portfolio_advanced'
  | 'alerts_basic'
  | 'alerts_advanced'
  | 'reports_weekly'
  | 'reports_monthly'
  | 'whale_tracking'
  | 'sentiment_analysis'
  | 'academy_basic'
  | 'academy_intermediate'
  | 'academy_advanced'

// Permission definitions for each tier
export const TIER_PERMISSIONS: Record<SubscriptionTier, {
  maxPortfolios: number
  maxHoldingsPerPortfolio: number
  maxAlerts: number
  aiPersonas: Array<'buddy' | 'professor' | 'trader'>
  features: Feature[]
  creditsPerMonth: number
  canUseWhaleTracking: boolean
  canUseSentimentAnalysis: boolean
  canGenerateReports: boolean
  maxReportsPerMonth: number
}> = {
  free: {
    maxPortfolios: 1,
    maxHoldingsPerPortfolio: 3,
    maxAlerts: 3,
    aiPersonas: ['buddy'],
    features: [
      'ai_chat_buddy',
      'portfolio_basic',
      'academy_basic'
    ],
    creditsPerMonth: 3,
    canUseWhaleTracking: false,
    canUseSentimentAnalysis: false,
    canGenerateReports: false,
    maxReportsPerMonth: 0
  },
  pro: {
    maxPortfolios: 3,
    maxHoldingsPerPortfolio: 20,
    maxAlerts: 10,
    aiPersonas: ['buddy', 'professor'],
    features: [
      'ai_chat_buddy',
      'ai_chat_professor',
      'portfolio_basic',
      'portfolio_analysis',
      'alerts_basic',
      'reports_weekly',
      'academy_basic',
      'academy_intermediate'
    ],
    creditsPerMonth: 50,
    canUseWhaleTracking: false,
    canUseSentimentAnalysis: false,
    canGenerateReports: true,
    maxReportsPerMonth: 4 // Weekly reports
  },
  elite: {
    maxPortfolios: 10,
    maxHoldingsPerPortfolio: -1, // Unlimited
    maxAlerts: -1, // Unlimited
    aiPersonas: ['buddy', 'professor', 'trader'],
    features: [
      'ai_chat_buddy',
      'ai_chat_professor',
      'ai_chat_trader',
      'portfolio_basic',
      'portfolio_analysis',
      'portfolio_advanced',
      'alerts_basic',
      'alerts_advanced',
      'reports_weekly',
      'reports_monthly',
      'whale_tracking',
      'sentiment_analysis',
      'academy_basic',
      'academy_intermediate',
      'academy_advanced'
    ],
    creditsPerMonth: 200, // Updated from 150 to match pricing doc
    canUseWhaleTracking: true,
    canUseSentimentAnalysis: true,
    canGenerateReports: true,
    maxReportsPerMonth: -1 // Unlimited
  }
}

// Feature credit costs
export const FEATURE_CREDIT_COSTS: Record<string, number> = {
  'ai_chat_buddy': 1,
  'ai_chat_professor': 2,
  'ai_chat_trader': 2,
  'whale_tracking': 5,
  'report_generation': 5,
  'sentiment_analysis': 3,
  'portfolio_analysis_advanced': 2
}

// Permission checker class
export class PermissionChecker {
  static async checkUserPermissions(userId: string) {
    const supabase = createClient()

    // Get user with subscription info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        subscriptions(*),
        portfolios!portfolios_user_id_fkey(
          *,
          portfolio_holdings(*)
        )
      `)
      .eq('id', userId)
      .single()

    if (userError || !user) {
      throw new Error('User not found')
    }

    // Get portfolio and alert counts
    const { count: portfolioCount } = await supabase
      .from('portfolios')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('deleted_at', null)

    const { count: alertCount } = await supabase
      .from('user_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true)

    const tier = user.subscription_tier as SubscriptionTier
    const permissions = TIER_PERMISSIONS[tier]
    
    // Calculate total holdings across all portfolios
    const totalHoldings = user.portfolios?.reduce((acc: number, p: any) => 
      acc + (p.portfolio_holdings?.length || 0), 0
    ) || 0
    
    return {
      user,
      tier,
      permissions,
      usage: {
        portfolios: portfolioCount || 0,
        alerts: alertCount || 0,
        totalHoldings
      }
    }
  }

  static async canUseFeature(userId: string, feature: Feature): Promise<boolean> {
    const { permissions } = await this.checkUserPermissions(userId)
    return permissions.features.includes(feature)
  }

  static async canCreatePortfolio(userId: string): Promise<boolean> {
    const { permissions, usage } = await this.checkUserPermissions(userId)
    return permissions.maxPortfolios === -1 || usage.portfolios < permissions.maxPortfolios
  }

  static async canAddHolding(userId: string, portfolioId: string): Promise<boolean> {
    const { permissions } = await this.checkUserPermissions(userId)
    
    if (permissions.maxHoldingsPerPortfolio === -1) return true

    const supabase = createClient()
    
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        portfolio_holdings(*)
      `)
      .eq('id', portfolioId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (error || !portfolio) return false

    return (portfolio.portfolio_holdings?.length || 0) < permissions.maxHoldingsPerPortfolio
  }

  static async canCreateAlert(userId: string): Promise<boolean> {
    const { permissions, usage } = await this.checkUserPermissions(userId)
    return permissions.maxAlerts === -1 || usage.alerts < permissions.maxAlerts
  }

  static async canUseAIPersona(userId: string, persona: 'buddy' | 'professor' | 'trader'): Promise<boolean> {
    const { permissions } = await this.checkUserPermissions(userId)
    return permissions.aiPersonas.includes(persona)
  }

  static async hasEnoughCredits(userId: string, requiredCredits: number): Promise<boolean> {
    const supabase = createClient()
    
    const { data: user, error } = await supabase
      .from('users')
      .select('credits_balance')
      .eq('id', userId)
      .single()

    return user && !error ? (user.credits_balance || 0) >= requiredCredits : false
  }

  static async canGenerateReport(userId: string, reportType: 'weekly' | 'monthly'): Promise<boolean> {
    const { permissions } = await this.checkUserPermissions(userId)
    
    if (!permissions.canGenerateReports) return false
    if (permissions.maxReportsPerMonth === -1) return true

    // Check how many reports generated this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const supabase = createClient()

    const { count: reportsThisMonth } = await supabase
      .from('ai_reports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString())

    return (reportsThisMonth || 0) < permissions.maxReportsPerMonth
  }

  // Check if user can upgrade to a specific tier
  static canUpgradeToTier(currentTier: SubscriptionTier, targetTier: SubscriptionTier): boolean {
    const tierOrder: SubscriptionTier[] = ['free', 'pro', 'elite']
    const currentIndex = tierOrder.indexOf(currentTier)
    const targetIndex = tierOrder.indexOf(targetTier)
    
    return targetIndex > currentIndex
  }

  // Check if user can downgrade to a specific tier
  static canDowngradeToTier(currentTier: SubscriptionTier, targetTier: SubscriptionTier): boolean {
    const tierOrder: SubscriptionTier[] = ['free', 'pro', 'elite']
    const currentIndex = tierOrder.indexOf(currentTier)
    const targetIndex = tierOrder.indexOf(targetTier)
    
    return targetIndex < currentIndex
  }

  // Get feature requirements for upgrade prompts
  static getFeatureRequirements(feature: Feature): {
    requiredTier: SubscriptionTier
    description: string
  } {
    const requirements = {
      'ai_chat_professor': {
        requiredTier: 'pro' as SubscriptionTier,
        description: 'Access to Professor AI persona requires Pro or Elite subscription'
      },
      'ai_chat_trader': {
        requiredTier: 'elite' as SubscriptionTier,
        description: 'Access to Trader AI persona requires Elite subscription'
      },
      'portfolio_analysis': {
        requiredTier: 'pro' as SubscriptionTier,
        description: 'Portfolio analysis features require Pro or Elite subscription'
      },
      'portfolio_advanced': {
        requiredTier: 'elite' as SubscriptionTier,
        description: 'Advanced portfolio analytics require Elite subscription'
      },
      'whale_tracking': {
        requiredTier: 'elite' as SubscriptionTier,
        description: 'Whale tracking requires Elite subscription'
      },
      'sentiment_analysis': {
        requiredTier: 'elite' as SubscriptionTier,
        description: 'Sentiment analysis requires Elite subscription'
      },
      'reports_weekly': {
        requiredTier: 'pro' as SubscriptionTier,
        description: 'Weekly reports require Pro or Elite subscription'
      },
      'reports_monthly': {
        requiredTier: 'elite' as SubscriptionTier,
        description: 'Monthly deep reports require Elite subscription'
      }
    }

    return requirements[feature] || {
      requiredTier: 'free' as SubscriptionTier,
      description: 'This feature is available to all users'
    }
  }
}

// Utility function to get user's current permissions
export async function getUserPermissions(userId: string) {
  return await PermissionChecker.checkUserPermissions(userId)
}

// Utility function to check if user can perform an action
export async function hasPermission(userId: string, feature: Feature): Promise<boolean> {
  return await PermissionChecker.canUseFeature(userId, feature)
}

// Utility function to get upgrade suggestion for blocked features
export function getUpgradeMessage(feature: Feature, currentTier: SubscriptionTier): string {
  const requirements = PermissionChecker.getFeatureRequirements(feature)
  
  if (currentTier === 'free') {
    return `${requirements.description}. Upgrade to ${requirements.requiredTier.charAt(0).toUpperCase() + requirements.requiredTier.slice(1)} to unlock this feature.`
  } else if (currentTier === 'pro' && requirements.requiredTier === 'elite') {
    return `${requirements.description}. Upgrade to Elite to unlock this feature.`
  }
  
  return requirements.description
}

// Feature usage tracking
export async function trackFeatureUsage(userId: string, feature: string, metadata?: any) {
  const supabase = createClient()
  
  await supabase
    .from('user_activity_logs')
    .insert({
      user_id: userId,
      action: 'feature_usage',
      entity_type: 'feature',
      entity_id: feature,
      metadata: {
        feature,
        timestamp: new Date().toISOString(),
        ...metadata
      }
    })
}
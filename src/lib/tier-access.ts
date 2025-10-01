/**
 * Tier-Based Access Control System
 * Centralized logic for determining feature access based on user tier
 */

export type UserTier = 'free' | 'pro' | 'elite';

export type FeatureName =
  | 'ai_buddy'
  | 'ai_professor'
  | 'ai_trader'
  | 'whale_tracker'
  | 'ai_reports'
  | 'narrative_scanner'
  | 'smart_alerts'
  | 'altcoin_detector'
  | 'signals_pack'
  | 'portfolio_allocator'
  | 'dca_planner'
  | 'whale_copy'
  | 'scam_detector'
  | 'advanced_analytics'
  | 'priority_support';

export interface TierFeatures {
  name: string;
  monthlyCredits: number;
  maxPortfolios: number;
  features: FeatureName[];
  price: number;
  stripePriceId?: string;
}

export const TIER_CONFIG: Record<UserTier, TierFeatures> = {
  free: {
    name: 'Buddy',
    monthlyCredits: 100,
    maxPortfolios: 2,
    features: [
      'ai_buddy',
      'scam_detector'
    ],
    price: 0
  },
  pro: {
    name: 'Professor',
    monthlyCredits: 500,
    maxPortfolios: 10,
    features: [
      'ai_buddy',
      'ai_professor',
      'whale_tracker',
      'ai_reports',
      'narrative_scanner',
      'dca_planner',
      'portfolio_allocator',
      'scam_detector',
      'advanced_analytics'
    ],
    price: 12.99,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO
  },
  elite: {
    name: 'Trader',
    monthlyCredits: 2000,
    maxPortfolios: -1, // unlimited
    features: [
      'ai_buddy',
      'ai_professor',
      'ai_trader',
      'whale_tracker',
      'ai_reports',
      'narrative_scanner',
      'smart_alerts',
      'altcoin_detector',
      'signals_pack',
      'portfolio_allocator',
      'dca_planner',
      'whale_copy',
      'scam_detector',
      'advanced_analytics',
      'priority_support'
    ],
    price: 24.99,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ELITE
  }
};

/**
 * Check if a user tier has access to a specific feature
 */
export function hasFeatureAccess(userTier: UserTier, feature: FeatureName): boolean {
  return TIER_CONFIG[userTier].features.includes(feature);
}

/**
 * Get the minimum tier required for a feature
 */
export function getRequiredTier(feature: FeatureName): UserTier {
  if (hasFeatureAccess('free', feature)) return 'free';
  if (hasFeatureAccess('pro', feature)) return 'pro';
  return 'elite';
}

/**
 * Check if a user can create more portfolios
 */
export function canCreatePortfolio(userTier: UserTier, currentCount: number): boolean {
  const max = TIER_CONFIG[userTier].maxPortfolios;
  return max === -1 || currentCount < max;
}

/**
 * Get tier features for display
 */
export function getTierFeatures(tier: UserTier): TierFeatures {
  return TIER_CONFIG[tier];
}

/**
 * Get all tiers for comparison
 */
export function getAllTiers(): Record<UserTier, TierFeatures> {
  return TIER_CONFIG;
}

/**
 * Check if user needs to upgrade for a feature
 */
export function needsUpgrade(userTier: UserTier, feature: FeatureName): boolean {
  return !hasFeatureAccess(userTier, feature);
}

/**
 * Get upgrade path suggestions
 */
export function getUpgradeSuggestion(currentTier: UserTier, desiredFeature: FeatureName): {
  requiredTier: UserTier;
  price: number;
  additionalFeatures: FeatureName[];
} {
  const requiredTier = getRequiredTier(desiredFeature);
  const currentFeatures = TIER_CONFIG[currentTier].features;
  const newFeatures = TIER_CONFIG[requiredTier].features;
  const additionalFeatures = newFeatures.filter(f => !currentFeatures.includes(f));

  return {
    requiredTier,
    price: TIER_CONFIG[requiredTier].price,
    additionalFeatures
  };
}

/**
 * Feature display names for UI
 */
export const FEATURE_NAMES: Record<FeatureName, string> = {
  ai_buddy: 'Buddy AI Assistant',
  ai_professor: 'Professor AI Assistant',
  ai_trader: 'Trader AI Assistant',
  whale_tracker: 'Whale Tracker',
  ai_reports: 'AI Market Reports',
  narrative_scanner: 'Narrative Scanner',
  smart_alerts: 'Smart Alerts',
  altcoin_detector: 'Altcoin Detector',
  signals_pack: 'Trading Signals Pack',
  portfolio_allocator: 'Portfolio Allocator',
  dca_planner: 'DCA Strategy Planner',
  whale_copy: 'Whale Copy Trading',
  scam_detector: 'Scam Detector',
  advanced_analytics: 'Advanced Analytics',
  priority_support: 'Priority Support'
};

/**
 * Get feature display name
 */
export function getFeatureName(feature: FeatureName): string {
  return FEATURE_NAMES[feature];
}

/**
 * Tier comparison for displaying benefits
 */
export function compareTiers(tier1: UserTier, tier2: UserTier): {
  additionalFeatures: FeatureName[];
  additionalCredits: number;
  priceDifference: number;
} {
  const config1 = TIER_CONFIG[tier1];
  const config2 = TIER_CONFIG[tier2];

  return {
    additionalFeatures: config2.features.filter(f => !config1.features.includes(f)),
    additionalCredits: config2.monthlyCredits - config1.monthlyCredits,
    priceDifference: config2.price - config1.price
  };
}

"use client";

import { ReactNode, useState } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { hasFeatureAccess, getRequiredTier, getFeatureName, FeatureName, UserTier } from '@/lib/tier-access';
import { UpgradeModal } from '@/components/UpgradeModal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface RequireFeatureProps {
  feature: FeatureName;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
}

/**
 * Component that renders children only if user has access to the feature
 * Shows upgrade prompt if user doesn't have access
 */
export function RequireFeature({
  feature,
  children,
  fallback,
  showUpgradePrompt = true
}: RequireFeatureProps) {
  const { profile, loading } = useSupabaseAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Not authenticated
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Please sign in to access this feature.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const userTier = (profile.tier || 'free') as UserTier;
  const hasAccess = hasFeatureAccess(userTier, feature);

  // User has access - render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // User doesn't have access
  const requiredTier = getRequiredTier(feature);
  const featureName = getFeatureName(feature);

  // Custom fallback provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  if (showUpgradePrompt) {
    return (
      <div className="flex items-center justify-center min-h-[500px] p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              {requiredTier === 'elite' ? (
                <Crown className="h-10 w-10 text-white" />
              ) : (
                <Sparkles className="h-10 w-10 text-white" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Premium Feature
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              <span className="font-semibold">{featureName}</span> is available for {' '}
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)}
              </span>{' '}
              tier members.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setShowUpgradeModal(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              size="lg"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)}
            </Button>

            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full"
            >
              Go Back
            </Button>
          </div>

          <UpgradeModal
            requiredTier={requiredTier}
            personaName={featureName}
            open={showUpgradeModal}
            onOpenChange={setShowUpgradeModal}
          />
        </div>
      </div>
    );
  }

  // No upgrade prompt - just show locked message
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Alert className="max-w-md">
        <Lock className="h-4 w-4" />
        <AlertDescription>
          This feature requires {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} tier.
        </AlertDescription>
      </Alert>
    </div>
  );
}

/**
 * Hook to check feature access programmatically
 */
export function useFeatureAccess(feature: FeatureName) {
  const { profile, loading } = useSupabaseAuth();

  if (loading || !profile) {
    return { hasAccess: false, loading, requiredTier: getRequiredTier(feature) };
  }

  const userTier = (profile.tier || 'free') as UserTier;
  const hasAccess = hasFeatureAccess(userTier, feature);
  const requiredTier = getRequiredTier(feature);

  return { hasAccess, loading: false, requiredTier, userTier };
}

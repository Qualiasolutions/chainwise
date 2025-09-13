'use client'

import { PremiumFeaturesMarketplaceEnhanced } from '@/components/marketplace/premium-features-marketplace-enhanced'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function MarketplacePage() {
  return (
    <ProtectedRoute>
      <PremiumFeaturesMarketplaceEnhanced />
    </ProtectedRoute>
  )
}
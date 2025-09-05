'use client'

import { PremiumFeaturesMarketplace } from '@/components/marketplace/premium-features-marketplace'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function MarketplacePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <PremiumFeaturesMarketplace />
        </div>
      </div>
    </ProtectedRoute>
  )
}
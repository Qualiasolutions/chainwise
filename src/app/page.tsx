'use client'

import ChainWiseHero from "@/components/chainwise-hero"
import TrustIndicators from "@/components/trust-indicators"
import AIPersonas from "@/components/ai-personas"
import FeatureShowcase from "@/components/feature-showcase"
import PricingSection from "@/components/pricing-section"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <ChainWiseHero />
      <TrustIndicators />
      <AIPersonas />
      <FeatureShowcase />
      <PricingSection />
    </div>
  )
}
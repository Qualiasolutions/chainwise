'use client'

import { useState, useEffect } from "react"
import ChainWiseHero from "@/components/chainwise-hero"
import PlatformDemo from "@/components/platform-demo"
import AIPersonas from "@/components/ai-personas"
import FeatureShowcase from "@/components/feature-showcase"
import PricingSection from "@/components/pricing-section"
import { LoadingScreen } from "@/components/ui/loading-screen"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate initial loading time
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100) // Let the loading screen handle its own timing

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />
  }

  return (
    <div className="min-h-screen">
      <ChainWiseHero />
      <PlatformDemo />
      <AIPersonas />
      <FeatureShowcase />
      <PricingSection />
    </div>
  )
}
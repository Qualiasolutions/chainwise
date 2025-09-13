'use client'

import { useState, useEffect, lazy, Suspense } from "react"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { BuddyAIWidget } from "@/components/buddy-ai-widget"

// Lazy load all components for better performance
const ChainWiseHero = lazy(() => import("@/components/chainwise-hero"))
const PlatformDemo = lazy(() => import("@/components/platform-demo"))
const AIPersonas = lazy(() => import("@/components/ai-personas"))
const FeatureShowcase = lazy(() => import("@/components/feature-showcase"))
const PricingSection = lazy(() => import("@/components/pricing-section"))
const Footer = lazy(() => import("@/components/footer"))

// Component skeleton loaders for better UX
const SectionSkeleton = ({ height = "h-96" }: { height?: string }) => (
  <div className={`${height} bg-gray-900/50 animate-pulse rounded-lg`} />
)

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if mobile for performance optimizations
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // Faster initial load
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 50)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section - Always loaded first */}
      <Suspense fallback={<SectionSkeleton height="h-screen" />}>
        <ChainWiseHero />
      </Suspense>
      
      {/* Other sections lazy loaded with intersection observer could be added */}
      <Suspense fallback={<SectionSkeleton />}>
        <PlatformDemo />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <AIPersonas />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <FeatureShowcase />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <PricingSection />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton height="h-64" />}>
        <Footer />
      </Suspense>
      
      {/* Buddy AI Widget - Fixed positioning */}
      <BuddyAIWidget />
    </div>
  )
}
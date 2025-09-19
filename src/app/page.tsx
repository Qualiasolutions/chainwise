import HeroSection from "@/components/hero-section"
import ChainWisePricing from "@/components/chainwise-pricing"
import { CyberneticBentoGrid } from "@/components/ui/cybernetic-bento-grid"
import { Footer } from "@/components/ui/footer"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with 3D Globe */}
      <HeroSection />

      {/* Core Features Bento Grid */}
      <CyberneticBentoGrid />

      {/* Pricing Section */}
      <ChainWisePricing />

      {/* Footer */}
      <Footer />
    </div>
  )
}

import HeroSection from "@/components/hero-section"
import ChainWisePricing from "@/components/chainwise-pricing"
import { CyberneticBentoGrid } from "@/components/ui/cybernetic-bento-grid"
import { Footer } from "@/components/ui/footer"
import TestimonialsSection from "@/components/testimonials-section"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Section 1: Hero Section with 3D Globe - DARK */}
      <HeroSection />

      {/* Section 2: Core Features Bento Grid - BRIGHT */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-100 dark:via-blue-100 dark:to-purple-100">
        <CyberneticBentoGrid />
      </div>

      {/* Section 3: Pricing Section - DARK */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <ChainWisePricing />
      </div>

      {/* Section 4: Testimonials/About Section - BRIGHT */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-100 dark:via-blue-100 dark:to-purple-100">
        <TestimonialsSection />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

"use client";

import { motion } from "framer-motion";
import HeroSection from "@/components/hero-section";
import ChainWisePricing from "@/components/chainwise-pricing";
import { CyberneticBentoGrid } from "@/components/ui/cybernetic-bento-grid";
import { Footer } from "@/components/ui/footer";
import { CryptoInsightsSection } from "@/components/crypto-insights-section";
import { SectionDivider } from "@/components/ui/section-divider";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with 3D Globe */}
      <HeroSection />

      {/* Elegant transition from hero to features */}
      <SectionDivider variant="wave" />

      {/* Core Features Bento Grid - Enhanced with dark background */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-b from-slate-950/50 to-background"
      >
        <CyberneticBentoGrid />
      </motion.div>

      {/* Smooth transition to stats */}
      <SectionDivider variant="geometric" />

      {/* Crypto Insights Section - Educational and interactive content */}
      <CryptoInsightsSection />

      {/* Elegant transition to pricing */}
      <SectionDivider variant="dots" />

      {/* Pricing Section - Dark background */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-b from-slate-950/30 to-slate-950/50"
      >
        <ChainWisePricing />
      </motion.div>

      {/* Final transition to footer */}
      <SectionDivider variant="gradient" />

      {/* Footer */}
      <Footer />
    </div>
  );
}

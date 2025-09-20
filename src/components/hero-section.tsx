"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Globe3D from "@/components/ui/globe-3d";

export default function HeroSection() {
  const scrollToFeatures = () => {
    const element = document.querySelector('.main-container');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      className="relative w-full h-screen overflow-hidden bg-[#0a0613] font-light text-white antialiased flex flex-col"
      style={{
        background: "linear-gradient(135deg, #0a0613 0%, #150d27 100%)",
      }}
    >
      {/* Full-screen 3D Globe Background */}
      <div className="absolute inset-0 z-0">
        <Globe3D isFullScreen={true} />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
      </div>

      {/* Gradient overlays for visual enhancement */}
      <div
        className="absolute right-0 top-0 h-1/2 w-1/2 z-[1]"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(155, 135, 245, 0.15) 0%, rgba(13, 10, 25, 0) 60%)",
        }}
      />
      <div
        className="absolute left-0 top-0 h-1/2 w-1/2 -scale-x-100 z-[1]"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(155, 135, 245, 0.15) 0%, rgba(13, 10, 25, 0) 60%)",
        }}
      />

      <div className="container relative z-20 mx-auto max-w-2xl px-4 text-center md:max-w-4xl md:px-6 lg:max-w-7xl h-full flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16"
        >
          <span className="mb-6 inline-block rounded-full border border-[#9b87f5]/30 px-3 py-1 text-xs text-[#9b87f5]">
            AI-POWERED CRYPTO ADVISORY PLATFORM
          </span>
          <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-light md:text-5xl lg:text-7xl">
            Make Smarter Crypto Decisions with{" "}
            <br />
            <span className="text-[#9b87f5]">ChainWise AI</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/60 md:text-xl">
            ChainWise combines advanced artificial intelligence with professional-grade
            market analysis to provide you with intelligent crypto investment insights
            and personalized advisory recommendations.
          </p>

          <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth/signup"
              className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-[#9b87f5] to-[#7c3aed] px-8 py-4 text-white shadow-lg transition-all duration-300 hover:shadow-[0_8px_30px_rgba(155, 135, 245, 0.4)] sm:w-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative font-medium">Get Started Free</span>
            </Link>
            <button
              onClick={scrollToFeatures}
              className="group flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white sm:w-auto"
            >
              <span className="font-medium">View Features</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:translate-y-0.5"
              >
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Globe3D from "@/components/ui/globe-3d";

export default function HeroSection() {
  const scrollToHowItWorks = () => {
    const element = document.getElementById('how-it-works');
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
              className="neumorphic-button hover:shadow-[0_0_20px_rgba(155, 135, 245, 0.5)] relative w-full overflow-hidden rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-white/5 px-8 py-4 text-white shadow-lg transition-all duration-300 hover:border-[#9b87f5]/30 sm:w-auto"
            >
              Get Started Free
            </Link>
            <button
              onClick={scrollToHowItWorks}
              className="flex w-full items-center justify-center gap-2 text-white/70 transition-colors hover:text-white sm:w-auto cursor-pointer"
            >
              <span>Learn how it works</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </button>
          </div>
        </motion.div>

        {/* Dashboard Preview - positioned in bottom half */}
        <motion.div
          className="relative flex-1 flex items-end pb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        >
          <div className="relative z-10 mx-auto w-full max-w-5xl overflow-hidden rounded-lg shadow-[0_0_50px_rgba(155,135,245,0.3)]">
            <div className="relative bg-gradient-to-br from-slate-50/95 via-blue-50/95 to-purple-50/95 dark:from-slate-950/95 dark:via-blue-950/95 dark:to-purple-950/95 backdrop-blur-sm p-6 rounded-lg border border-white/20">
              {/* Mock Dashboard Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Image
                    src="/logo.png"
                    alt="ChainWise Logo"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">ChainWise Dashboard</h2>
                </div>
                <div className="flex space-x-2">
                  <div className="w-16 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded opacity-80"></div>
                  <div className="w-20 h-6 bg-white/20 dark:bg-slate-700 rounded"></div>
                </div>
              </div>

              {/* Mock Dashboard Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Portfolio", value: "$54,750", change: "+5.2%" },
                  { label: "24h Change", value: "+$2,847", change: "+5.2%" },
                  { label: "AI Insights", value: "8", change: "New" },
                  { label: "Market", value: "Bullish", change: "82%" }
                ].map((stat, index) => (
                  <div key={index} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-3 rounded-lg border border-white/30">
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">{stat.label}</div>
                    <div className="text-lg font-bold text-slate-800 dark:text-white mb-1">{stat.value}</div>
                    <div className="text-xs text-green-500">{stat.change}</div>
                  </div>
                ))}
              </div>

              {/* Mock Chart Area */}
              <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-slate-800 dark:text-white">Portfolio Performance</h3>
                  <div className="text-sm text-slate-600 dark:text-slate-400">24h view</div>
                </div>
                <div className="h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded flex items-end space-x-1 p-2">
                  {Array.from({length: 12}).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-[#9b87f5] to-[#9b87f5]/60 rounded-sm opacity-80"
                      style={{height: `${Math.random() * 80 + 20}%`}}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
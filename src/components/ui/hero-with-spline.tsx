"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MessageSquare, ArrowRight, TrendingUp } from "lucide-react";
import { SplineScene } from "@/components/ui/spline";
import { Spotlight, SpotlightIbelick } from "@/components/ui/spotlight";

export default function ChainWiseHeroWithSpline() {
  // Clean hero component without duplicate portfolio section
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Hero Section with 3D Robot - Full Screen */}
      <section className="relative w-full min-h-screen flex items-center justify-center">
        {/* Multi-layered Professional Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 bg-gradient-to-tr from-crypto-primary/20 via-transparent to-crypto-secondary/20" />
        <div className="absolute inset-0 bg-crypto-mesh opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-crypto-primary/5 to-crypto-secondary/10" />
        
        {/* Animated background elements */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-crypto-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-crypto-secondary/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        
        {/* Main Content Container */}
        <div className="relative z-10 w-full h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="white"
          />
          
          <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl mx-auto min-h-[600px] gap-8 lg:gap-12">
            {/* Left content */}
            <div className="flex-1 p-8 lg:p-12 relative z-10 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* ChainWise Logo */}
                <div className="flex justify-center lg:justify-start mb-8">
                  <div className="relative">
                    <Image
                      src="/logo.png"
                      alt="ChainWise Logo"
                      width={120}
                      height={120}
                      className="w-30 h-30 rounded-full shadow-2xl"
                      style={{
                        filter: 'drop-shadow(0 0 20px rgba(79, 70, 229, 0.4)) drop-shadow(0 0 40px rgba(139, 92, 246, 0.2))',
                        boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.1), 0 0 0 6px rgba(79, 70, 229, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
                      }}
                    />
                    <div 
                      className="absolute inset-0 rounded-full animate-pulse"
                      style={{
                        background: 'conic-gradient(from 0deg, rgba(79, 70, 229, 0.3), rgba(139, 92, 246, 0.1), rgba(79, 70, 229, 0.3))',
                        filter: 'blur(1px)'
                      }}
                    />
                  </div>
                </div>

                <span className="mb-4 inline-block rounded-full border border-crypto-primary/30 px-3 py-1 text-xs text-crypto-primary">
                  AI-POWERED CRYPTO INVESTMENT PLATFORM
                </span>
                
                <h1 className="mb-4 text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                  Invest Smarter with{" "}
                  <span className="text-crypto-primary">AI-Powered</span> Insights
                </h1>
                
                <p className="mb-8 text-lg text-neutral-300 max-w-lg">
                  ChainWise combines artificial intelligence with cutting-edge market analysis
                  to help you maximize your crypto investments with precision and confidence.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/chat"
                    className="neumorphic-button hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] relative overflow-hidden rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-white/5 px-8 py-4 text-white shadow-lg transition-all duration-300 hover:border-crypto-primary/30 inline-flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={20} />
                    Start AI Chat
                    <ArrowRight size={20} />
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center gap-2 text-white/70 transition-colors hover:text-white px-8 py-4"
                  >
                    <TrendingUp size={16} />
                    <span>View Markets</span>
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Right content - 3D Robot */}
            <div className="flex-1 relative h-[300px] sm:h-[400px] lg:h-[600px] w-full">
              <SpotlightIbelick size={300} className="z-10 hidden sm:block" />
              <SplineScene 
                className="w-full h-full"
                fallbackMessage="ChainWise AI Assistant - Interactive 3D Robot"
                enableIntersectionObserver={true}
              />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
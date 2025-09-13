"use client"

import { Button } from "@/components/ui/button"
import { Bitcoin, Shield, Zap, Activity, Coins, BarChart3, MessageSquare } from "lucide-react"
import { useState, useEffect, lazy, Suspense } from "react"
import Link from "next/link"
import { ArrowRightIcon } from "@radix-ui/react-icons"
import { motion } from "framer-motion"

// Lazy load heavy components
const BackgroundBeams = lazy(() => import("@/components/ui/background-beams").then(mod => ({ default: mod.BackgroundBeams })))

export default function ChainWiseHero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const features = [
    {
      icon: <Bitcoin className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Real-Time Data",
      description: "Live crypto prices and market analysis"
    },
    {
      icon: <Shield className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Secure Trading",
      description: "Bank-level security for your assets"
    },
    {
      icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "AI-Powered",
      description: "Advanced algorithms for smart trading"
    },
    {
      icon: <Activity className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Portfolio Analytics",
      description: "Track performance with detailed insights"
    }
  ]

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background Effects - Lazy loaded and optimized */}
      <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20" />}>
        <div className="absolute inset-0 z-0 opacity-30 sm:opacity-50 lg:opacity-70">
          <BackgroundBeams className="w-full h-full" />
        </div>
      </Suspense>
      
      {/* Gradient Overlays - Optimized for mobile */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-10 left-5 w-32 h-32 sm:w-48 sm:h-48 md:w-72 md:h-72 bg-purple-500/20 rounded-full blur-2xl sm:blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-10 right-5 w-40 h-40 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-indigo-500/20 rounded-full blur-2xl sm:blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-40 sm:h-40 md:w-64 md:h-64 bg-blue-500/10 rounded-full blur-xl sm:blur-2xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
        />
      </div>

      {/* Main Content - Mobile-first responsive */}
      <div className="relative z-10 container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-24 min-h-screen flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col justify-center space-y-4 sm:space-y-6 order-2 lg:order-1"
            >
              {/* Main Headline - Responsive sizing */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-center lg:text-left leading-tight">
                <span className="text-white">Your AI-Powered</span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
                  Crypto Investment
                </span>
                <br />
                <span className="text-white">Advisor</span>
              </h1>

              {/* Subheadline - Responsive text */}
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 text-center lg:text-left max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Make smarter trading decisions with advanced AI analytics, real-time market insights, 
                and personalized investment strategies tailored to your goals.
              </p>

              {/* CTA Buttons - Mobile-optimized */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-0"
                >
                  <Link href="/dashboard" className="flex items-center justify-center gap-2 sm:gap-3">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Get Started Free</span>
                    <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Link>
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-2 border-purple-500/50 bg-transparent hover:bg-purple-500/10 text-white font-semibold px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base rounded-xl backdrop-blur-sm hover:border-purple-400 transition-all duration-300"
                >
                  <Link href="/chat" className="flex items-center justify-center gap-2 sm:gap-3">
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Try AI Assistant</span>
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Right Content - Animated Crypto Visual (Replaces Spline) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] order-1 lg:order-2"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent rounded-2xl blur-3xl" />
                
                {/* Animated Trading Graph Visualization */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="w-full h-full max-w-lg relative"
                  >
                    <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-4 sm:p-6">
                      {/* Graph Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Bitcoin className="w-5 h-5 text-orange-400" />
                          <span className="text-white font-medium">BTC/USD</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                            <span className="text-xs text-gray-400">BTC</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                            <span className="text-xs text-gray-400">ETH</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                            <span className="text-xs text-gray-400">SOL</span>
                          </div>
                        </div>
                      </div>

                      {/* Animated Chart Area */}
                      <div className="relative w-full h-48 sm:h-56 md:h-64">
                        {/* Grid Lines */}
                        <div className="absolute inset-0">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="absolute w-full border-t border-gray-700/30" style={{ top: `${i * 25}%` }} />
                          ))}
                          {[...Array(8)].map((_, i) => (
                            <div key={i} className="absolute h-full border-l border-gray-700/30" style={{ left: `${i * 14.28}%` }} />
                          ))}
                        </div>

                        {/* Animated Price Lines */}
                        <svg className="absolute inset-0 w-full h-full overflow-visible">
                          {/* Bitcoin Line */}
                          <motion.path
                            d="M 20 120 Q 80 60 140 80 T 260 100 T 380 70"
                            fill="none"
                            stroke="url(#gradient-purple)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
                          />
                          
                          {/* Ethereum Line */}
                          <motion.path
                            d="M 20 140 Q 90 90 150 110 T 280 130 T 380 100"
                            fill="none"
                            stroke="url(#gradient-blue)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, ease: "easeInOut", delay: 1 }}
                          />
                          
                          {/* Solana Line */}
                          <motion.path
                            d="M 20 160 Q 70 120 130 140 T 250 150 T 380 130"
                            fill="none"
                            stroke="url(#gradient-green)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, ease: "easeInOut", delay: 1.5 }}
                          />

                          {/* Gradient Definitions */}
                          <defs>
                            <linearGradient id="gradient-purple" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#9333ea" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.4" />
                            </linearGradient>
                            <linearGradient id="gradient-blue" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.4" />
                            </linearGradient>
                            <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#059669" stopOpacity="0.4" />
                            </linearGradient>
                          </defs>
                        </svg>

                        {/* Animated Dots */}
                        <motion.div
                          className="absolute w-3 h-3 bg-purple-400 rounded-full shadow-lg"
                          animate={{ 
                            x: [20, 80, 140, 200, 260, 320, 380],
                            y: [120, 60, 80, 90, 100, 85, 70]
                          }}
                          transition={{ 
                            duration: 4, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 2.5
                          }}
                        />
                        
                        <motion.div
                          className="absolute w-2.5 h-2.5 bg-blue-400 rounded-full shadow-lg"
                          animate={{ 
                            x: [20, 90, 150, 210, 280, 340, 380],
                            y: [140, 90, 110, 120, 130, 115, 100]
                          }}
                          transition={{ 
                            duration: 4, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 3
                          }}
                        />
                        
                        <motion.div
                          className="absolute w-2 h-2 bg-green-400 rounded-full shadow-lg"
                          animate={{ 
                            x: [20, 70, 130, 190, 250, 310, 380],
                            y: [160, 120, 140, 145, 150, 140, 130]
                          }}
                          transition={{ 
                            duration: 4, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 3.5
                          }}
                        />
                      </div>

                      {/* Price Values */}
                      <div className="mt-4 flex justify-between text-xs sm:text-sm">
                        <div className="text-center">
                          <div className="text-purple-400 font-medium">$94,250</div>
                          <div className="text-green-400 text-xs">+2.4%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-blue-400 font-medium">$3,445</div>
                          <div className="text-green-400 text-xs">+1.8%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-green-400 font-medium">$185</div>
                          <div className="text-red-400 text-xs">-0.5%</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Feature Grid - Responsive */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-8 sm:mt-12 lg:mt-16"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 hover:bg-white/10 transition-all duration-300"
              >
                <div className="text-purple-400 mb-2 sm:mb-3 lg:mb-4">{feature.icon}</div>
                <h3 className="text-white font-semibold mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base">{feature.title}</h3>
                <p className="text-gray-400 text-xs lg:text-sm line-clamp-2">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
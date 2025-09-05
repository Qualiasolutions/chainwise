"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MessageSquare, ArrowRight, TrendingUp, Wallet, BarChart3, Bell } from "lucide-react";
import { SplineScene } from "@/components/ui/spline";
import { Spotlight } from "@/components/ui/spotlight";

export default function ChainWiseHero() {
  // Sample dashboard data for preview
  const dashboardPreview = {
    totalValue: '$92,239.41',
    dailyChange: '+$4,521.67',
    portfolios: 3,
    activeAlerts: 12,
    topHoldings: [
      { symbol: 'BTC', name: 'Bitcoin', price: '$67,432.10', change: '+2.34%', positive: true },
      { symbol: 'ETH', name: 'Ethereum', price: '$3,456.78', change: '+5.67%', positive: true },
      { symbol: 'SOL', name: 'Solana', price: '$198.45', change: '-1.23%', positive: false },
    ]
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-[#0a0613] pb-10 pt-32 font-light text-white antialiased md:pb-16 md:pt-20"
      style={{
        background: "linear-gradient(135deg, #0a0613 0%, #150d27 100%)",
      }}
    >
      {/* Background Effects */}
      <div
        className="absolute right-0 top-0 h-1/2 w-1/2"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(155, 135, 245, 0.15) 0%, rgba(13, 10, 25, 0) 60%)",
        }}
      />
      <div
        className="absolute left-0 top-0 h-1/2 w-1/2 -scale-x-100"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(155, 135, 245, 0.15) 0%, rgba(13, 10, 25, 0) 60%)",
        }}
      />

      {/* Spotlight Effects */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="rgba(155, 135, 245, 0.3)"
      />

      <div className="container relative z-10 mx-auto max-w-2xl px-4 text-center md:max-w-4xl md:px-6 lg:max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* ChainWise Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Image
                src="/logo.png"
                alt="ChainWise Logo"
                width={120}
                height={120}
                className="w-30 h-30 rounded-full shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(155, 135, 245, 0.4)) drop-shadow(0 0 40px rgba(155, 135, 245, 0.2))',
                  boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.1), 0 0 0 6px rgba(155, 135, 245, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
                }}
              />
              <div 
                className="absolute inset-0 rounded-full animate-pulse"
                style={{
                  background: 'conic-gradient(from 0deg, rgba(155, 135, 245, 0.3), rgba(155, 135, 245, 0.1), rgba(155, 135, 245, 0.3))',
                  filter: 'blur(1px)'
                }}
              />
            </div>
          </div>

          <span className="mb-6 inline-block rounded-full border border-[#9b87f5]/30 px-3 py-1 text-xs text-[#9b87f5]">
            AI-POWERED CRYPTO INVESTMENT PLATFORM
          </span>
          <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-light md:text-5xl lg:text-7xl">
            Trade Smarter with{" "}
            <span className="text-[#9b87f5]">AI-Powered</span> Crypto Insights
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/60 md:text-xl">
            ChainWise combines artificial intelligence with cutting-edge trading
            strategies to help you maximize your crypto investments with
            precision and ease.
          </p>

          <div className="mb-10 sm:mb-0 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/chat"
              className="neumorphic-button hover:shadow-[0_0_20px_rgba(155,135,245,0.5)] relative w-full overflow-hidden rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-white/5 px-8 py-4 text-white shadow-lg transition-all duration-300 hover:border-[#9b87f5]/30 sm:w-auto"
            >
              <MessageSquare className="w-4 h-4 mr-2 inline" />
              Start AI Chat
            </Link>
            <Link
              href="/dashboard"
              className="flex w-full items-center justify-center gap-2 text-white/70 transition-colors hover:text-white sm:w-auto"
            >
              <span>View Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Hero Visual Section */}
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        >
          {/* 3D Robot/Spline Scene - Keep the existing robot */}
          <div className="w-full flex h-40 md:h-64 relative overflow-hidden mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <SplineScene />
            </div>
            {/* Fallback globe image if Spline doesn't load */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <Image
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop&crop=center"
                alt="Earth Globe"
                width={400}
                height={300}
                className="rounded-lg opacity-60"
                priority
              />
            </div>
          </div>

          {/* Dashboard Preview - Similar to actual dashboard */}
          <div className="relative z-10 mx-auto max-w-5xl overflow-hidden rounded-lg shadow-[0_0_50px_rgba(155,135,245,0.2)]">
            <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/10 rounded-lg p-6">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">Portfolio Dashboard</h3>
                  <p className="text-white/60 text-sm">Real-time crypto analytics</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-green-400 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>+15.2%</span>
                  </div>
                </div>
              </div>

              {/* Dashboard Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-4 h-4 text-[#9b87f5]" />
                    <span className="text-white/60 text-xs">Total Value</span>
                  </div>
                  <p className="text-white font-semibold">{dashboardPreview.totalValue}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-white/60 text-xs">24h Change</span>
                  </div>
                  <p className="text-green-400 font-semibold">{dashboardPreview.dailyChange}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    <span className="text-white/60 text-xs">Portfolios</span>
                  </div>
                  <p className="text-white font-semibold">{dashboardPreview.portfolios}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="w-4 h-4 text-yellow-400" />
                    <span className="text-white/60 text-xs">Alerts</span>
                  </div>
                  <p className="text-white font-semibold">{dashboardPreview.activeAlerts}</p>
                </div>
              </div>

              {/* Top Holdings Preview */}
              <div className="space-y-3">
                <h4 className="text-white/80 text-sm font-medium">Top Holdings</h4>
                {dashboardPreview.topHoldings.map((holding, index) => (
                  <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#9b87f5]/20 rounded-full flex items-center justify-center">
                        <span className="text-[#9b87f5] text-xs font-bold">{holding.symbol}</span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{holding.name}</p>
                        <p className="text-white/60 text-xs">{holding.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm font-medium">{holding.price}</p>
                      <p className={`text-xs ${holding.positive ? 'text-green-400' : 'text-red-400'}`}>
                        {holding.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
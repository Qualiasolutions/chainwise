"use client";
 
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MessageSquare, ArrowRight, TrendingUp, TrendingDown, DollarSign, PieChart, Wallet } from "lucide-react";
 
export default function ChainWiseHero() {
  // Sample portfolio data for preview
  const samplePortfolioData = [
    { symbol: 'BTC', name: 'Bitcoin', price: '$67,234.56', change: '+2.34%', positive: true, amount: '0.5432', value: '$36,521.78' },
    { symbol: 'ETH', name: 'Ethereum', price: '$3,456.78', change: '+5.67%', positive: true, amount: '12.8765', value: '$44,512.34' },
    { symbol: 'SOL', name: 'Solana', price: '$198.45', change: '-1.23%', positive: false, amount: '45.67', value: '$9,067.89' },
    { symbol: 'ADA', name: 'Cardano', price: '$0.87', change: '+8.91%', positive: true, amount: '2,456.78', value: '$2,137.40' }
  ];

  const totalValue = '$92,239.41';
  const totalGain = '+$12,456.78';
  const gainPercentage = '+15.63%';

  return (
    <section
      className="relative w-full overflow-hidden pb-10 pt-32 font-light text-white antialiased md:pb-16 md:pt-20"
      style={{
        background: "#0f172a", // Unified single color background
      }}
    >
 
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
                width={144}
                height={144}
                className="w-36 h-36 rounded-full shadow-2xl"
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

          <span className="mb-6 inline-block rounded-full border border-crypto-primary/30 px-3 py-1 text-xs text-crypto-primary">
            AI-POWERED CRYPTO INVESTMENT PLATFORM
          </span>
          <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-light md:text-5xl lg:text-7xl">
            Invest Smarter with{" "}
            <span className="text-crypto-primary">AI-Powered</span> Crypto Insights
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/60 md:text-xl">
            ChainWise combines artificial intelligence with cutting-edge market analysis
            to help you maximize your crypto investments with precision and confidence.
          </p>
 
          <div className="mb-16 sm:mb-20 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/chat"
              className="neumorphic-button hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] relative w-full overflow-hidden rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-white/5 px-8 py-4 text-white shadow-lg transition-all duration-300 hover:border-crypto-primary/30 sm:w-auto inline-flex items-center justify-center gap-2"
            >
              <MessageSquare size={20} />
              Start AI Chat
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/dashboard"
              className="flex w-full items-center justify-center gap-2 text-white/70 transition-colors hover:text-white sm:w-auto"
            >
              <TrendingUp size={16} />
              <span>View Markets</span>
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
            </Link>
          </div>
        </motion.div>
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        >
          {/* Portfolio Dashboard Preview */}
          <div className="relative z-10 mx-auto max-w-6xl overflow-hidden rounded-xl shadow-[0_0_50px_rgba(79,70,229,0.3)]">
            <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 md:p-8">
              
              {/* Portfolio Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-crypto-primary/20 rounded-full flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-crypto-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">My Portfolio</h3>
                    <p className="text-sm text-slate-400">4 Assets</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{totalValue}</p>
                  <div className="flex items-center gap-1 text-green-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">{totalGain} ({gainPercentage})</span>
                  </div>
                </div>
              </div>

              {/* Portfolio Holdings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {samplePortfolioData.map((asset, index) => (
                  <motion.div
                    key={asset.symbol}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30 hover:border-crypto-primary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-crypto-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-crypto-primary">{asset.symbol}</span>
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{asset.symbol}</p>
                          <p className="text-xs text-slate-400">{asset.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">{asset.value}</p>
                        <div className={`flex items-center gap-1 ${asset.positive ? 'text-green-400' : 'text-red-400'}`}>
                          {asset.positive ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span className="text-xs">{asset.change}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{asset.amount} {asset.symbol}</span>
                      <span>{asset.price}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Portfolio Stats */}
              <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-700/50">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <PieChart className="w-4 h-4 text-crypto-primary" />
                  <span>Diversified Portfolio</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span>AI Optimized</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <DollarSign className="w-4 h-4 text-crypto-secondary" />
                  <span>Real-time Tracking</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

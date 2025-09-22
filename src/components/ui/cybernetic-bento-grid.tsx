'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Zap, Database, Bot, BarChart3 } from 'lucide-react';

interface BentoItemProps {
  className?: string;
  children: React.ReactNode;
  delay?: number;
}

// Enhanced BentoItem component with modern glassmorphism
const BentoItem: React.FC<BentoItemProps> = ({ className = '', children, delay = 0 }) => {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const item = itemRef.current;
    if (!item) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      item.style.setProperty('--mouse-x', `${x}px`);
      item.style.setProperty('--mouse-y', `${y}px`);
    };

    item.addEventListener('mousemove', handleMouseMove);

    return () => {
      item.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <motion.div
      ref={itemRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className={`enhanced-bento-item group ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Main Component
export const CyberneticBentoGrid: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Enhanced background with modern gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-slate-950/80" />

      {/* Animated background particles */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(139, 92, 246, 0.3) 1px, transparent 0)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-block px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm font-medium mb-6"
          >
            Platform Features
          </motion.span>
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-6">
            Everything You Need
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Comprehensive tools and AI-powered insights to elevate your cryptocurrency investment strategy.
          </p>
        </motion.div>

        <div className="enhanced-bento-grid">
          <BentoItem delay={0.1} className="col-span-2 row-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl border border-blue-500/30">
                  <TrendingUp className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Real-time Market Analytics</h3>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Monitor cryptocurrency markets with up-to-the-second data streams, advanced charting, and AI-powered insights for smarter investment decisions.
              </p>
            </div>
            <div className="mt-auto h-56 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700/50 backdrop-blur-sm flex items-center justify-center group-hover:border-blue-500/50 transition-colors duration-300">
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <BarChart3 className="w-16 h-16 text-blue-400 mx-auto mb-3" />
                </motion.div>
                <span className="text-gray-300 text-lg font-medium">Live Market Data</span>
              </div>
            </div>
          </BentoItem>

          <BentoItem delay={0.2}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl border border-purple-500/30">
                <Bot className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">AI-Powered Insights</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Get personalized investment advice from our advanced AI algorithms trained on market patterns and expert strategies.
            </p>
          </BentoItem>

          <BentoItem delay={0.3}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl border border-green-500/30">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Secure Portfolio</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Enterprise-grade security with encrypted data storage and multi-factor authentication protection for peace of mind.
            </p>
          </BentoItem>

          <BentoItem delay={0.4} className="row-span-2 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl border border-orange-500/30">
                <Database className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Portfolio Management</h3>
            </div>
            <p className="text-gray-300 leading-relaxed mb-6">
              Track your investments across multiple exchanges with automated P&L calculations and performance analytics.
            </p>
            <div className="mt-auto">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-400">Total Portfolio Value</span>
                  <span className="text-green-400 text-sm font-mono bg-green-500/10 px-2 py-1 rounded">+12.34%</span>
                </div>
                <div className="text-white font-bold text-2xl">$45,678.90</div>
                <div className="w-full bg-slate-700/50 rounded-full h-2 mt-3">
                  <div className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full w-3/4"></div>
                </div>
              </div>
            </div>
          </BentoItem>

          <BentoItem delay={0.5} className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-xl border border-cyan-500/30">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Lightning-Fast Execution</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Execute trades and access market data with millisecond precision. Our infrastructure scales infinitely to handle any volume while maintaining peak performance.
            </p>
          </BentoItem>

          <BentoItem delay={0.6}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-xl border border-pink-500/30">
                <BarChart3 className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Advanced Analytics</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Deep dive into market trends with our comprehensive analytics dashboard and custom indicators for professional trading.
            </p>
          </BentoItem>
        </div>
      </div>
    </section>
  );
};
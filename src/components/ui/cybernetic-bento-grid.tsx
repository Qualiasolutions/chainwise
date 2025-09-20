'use client';

import React, { useEffect, useRef } from 'react';
import { TrendingUp, Shield, Zap, Database, Bot, BarChart3 } from 'lucide-react';

interface BentoItemProps {
  className?: string;
  children: React.ReactNode;
}

// Reusable BentoItem component
const BentoItem: React.FC<BentoItemProps> = ({ className = '', children }) => {
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
    <div ref={itemRef} className={`bento-item ${className}`}>
      {children}
    </div>
  );
};

// Main Component
export const CyberneticBentoGrid: React.FC = () => {
  return (
    <div className="main-container">
      <div className="w-full max-w-6xl z-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-white text-center mb-8">
          Core Features
        </h1>
        <div className="bento-grid">
          <BentoItem className="col-span-2 row-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Real-time Market Analytics</h2>
              </div>
              <p className="text-gray-400">
                Monitor cryptocurrency markets with up-to-the-second data streams, advanced charting, and AI-powered insights for smarter investment decisions.
              </p>
            </div>
            <div className="mt-4 h-48 bg-neutral-800/50 rounded-lg flex items-center justify-center border border-neutral-700">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                <span className="text-gray-400">Live Market Data</span>
              </div>
            </div>
          </BentoItem>

          <BentoItem>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Bot className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">AI-Powered Insights</h2>
            </div>
            <p className="text-gray-400 text-sm">
              Get personalized investment advice from our advanced AI algorithms trained on market patterns.
            </p>
          </BentoItem>

          <BentoItem>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Secure Portfolio</h2>
            </div>
            <p className="text-gray-400 text-sm">
              Enterprise-grade security with encrypted data storage and multi-factor authentication protection.
            </p>
          </BentoItem>

          <BentoItem className="row-span-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Database className="w-5 h-5 text-orange-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Portfolio Management</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Track your investments across multiple exchanges with automated P&L calculations and performance analytics.
            </p>
            <div className="mt-auto">
              <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">Total Value</span>
                  <span className="text-green-400 text-sm font-mono">+12.34%</span>
                </div>
                <div className="text-white font-bold text-lg">$45,678.90</div>
              </div>
            </div>
          </BentoItem>

          <BentoItem className="col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Lightning-Fast Execution</h2>
            </div>
            <p className="text-gray-400 text-sm">
              Execute trades and access market data with millisecond precision. Our infrastructure scales infinitely to handle any volume.
            </p>
          </BentoItem>

          <BentoItem>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-pink-500/20 rounded-lg">
                <BarChart3 className="w-5 h-5 text-pink-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Advanced Analytics</h2>
            </div>
            <p className="text-gray-400 text-sm">
              Deep dive into market trends with our comprehensive analytics dashboard and custom indicators.
            </p>
          </BentoItem>
        </div>
      </div>
    </div>
  );
};
"use client";

import { Brain, BarChart3, Shield, Target, TrendingUp, Users } from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";

const chainwiseTimelineData = [
  {
    id: 1,
    title: "AI Foundation",
    date: "Q1 2024",
    content: "Advanced AI algorithms developed for cryptocurrency market analysis and prediction. Machine learning models trained on vast datasets for optimal performance.",
    category: "AI Development",
    icon: Brain,
    relatedIds: [2, 3],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "Market Integration",
    date: "Q2 2024",
    content: "Real-time cryptocurrency market data integration with CoinGecko API. Live price feeds, market trends, and portfolio tracking capabilities.",
    category: "Data Integration",
    icon: BarChart3,
    relatedIds: [1, 3, 4],
    status: "completed" as const,
    energy: 95,
  },
  {
    id: 3,
    title: "Security Hardening",
    date: "Q3 2024",
    content: "Enterprise-grade security implementation with Supabase Row Level Security. All 41 security warnings resolved for production deployment.",
    category: "Security",
    icon: Shield,
    relatedIds: [1, 2, 4],
    status: "completed" as const,
    energy: 90,
  },
  {
    id: 4,
    title: "Portfolio Analytics",
    date: "Q4 2024",
    content: "Advanced portfolio management with P&L calculations, risk assessment, and AI-powered investment recommendations.",
    category: "Analytics",
    icon: Target,
    relatedIds: [2, 3, 5],
    status: "in-progress" as const,
    energy: 75,
  },
  {
    id: 5,
    title: "Advisory Platform",
    date: "Q1 2025",
    content: "Professional AI crypto advisory with three personas: Buddy (free), Professor (pro), and Trader (elite). Credit-based usage system.",
    category: "Platform",
    icon: TrendingUp,
    relatedIds: [4, 6],
    status: "in-progress" as const,
    energy: 65,
  },
  {
    id: 6,
    title: "Community Features",
    date: "Q2 2025",
    content: "Social trading features, community insights, and collaborative investment strategies. Learn from experienced crypto professionals.",
    category: "Community",
    icon: Users,
    relatedIds: [5],
    status: "pending" as const,
    energy: 30,
  },
];

export function ChainWiseTimeline() {
  return (
    <div className="relative">
      {/* Section Header */}
      <div className="absolute top-8 left-8 z-50">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          ChainWise Development Journey
        </h2>
        <p className="text-white/70 text-sm max-w-md">
          Explore our AI-powered crypto platform evolution through an interactive orbital timeline
        </p>
      </div>

      {/* Instructions */}
      <div className="absolute top-8 right-8 z-50">
        <div className="bg-black/50 backdrop-blur-lg border border-white/20 rounded-lg p-4 max-w-xs">
          <h3 className="text-white font-semibold mb-2 text-sm">How to Navigate</h3>
          <ul className="text-white/70 text-xs space-y-1">
            <li>• Click any orbital node to explore</li>
            <li>• View connections and relationships</li>
            <li>• Auto-rotation pauses on interaction</li>
            <li>• Click background to reset view</li>
          </ul>
        </div>
      </div>

      <RadialOrbitalTimeline timelineData={chainwiseTimelineData} />
    </div>
  );
}

export default ChainWiseTimeline;
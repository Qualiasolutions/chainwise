"use client";

import {
  Brain,
  Shield,
  BarChart3,
  Coins,
  TrendingUp,
  Users,
  Zap,
  Target
} from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";

const chainwiseTimelineData = [
  {
    id: 1,
    title: "AI Foundation",
    date: "Q1 2024",
    content: "Advanced machine learning algorithms developed for cryptocurrency market analysis, sentiment tracking, and predictive modeling with 95% accuracy rate.",
    category: "AI Development",
    icon: Brain,
    relatedIds: [2, 3],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "Security Architecture",
    date: "Q2 2024",
    content: "Enterprise-grade security infrastructure with end-to-end encryption, multi-factor authentication, and bank-level data protection protocols.",
    category: "Security",
    icon: Shield,
    relatedIds: [1, 4, 6],
    status: "completed" as const,
    energy: 95,
  },
  {
    id: 3,
    title: "Market Intelligence",
    date: "Q2 2024",
    content: "Real-time market data integration from 500+ exchanges, social sentiment analysis, and institutional flow tracking for comprehensive market insights.",
    category: "Data Integration",
    icon: TrendingUp,
    relatedIds: [1, 4, 5],
    status: "completed" as const,
    energy: 90,
  },
  {
    id: 4,
    title: "Portfolio Analytics",
    date: "Q3 2024",
    content: "Advanced portfolio management tools with risk assessment, rebalancing algorithms, and performance tracking across multiple asset classes.",
    category: "Analytics",
    icon: BarChart3,
    relatedIds: [2, 3, 7],
    status: "in-progress" as const,
    energy: 75,
  },
  {
    id: 5,
    title: "DeFi Integration",
    date: "Q3 2024",
    content: "Seamless integration with major DeFi protocols, yield farming strategies, and liquidity pool optimization for maximum returns.",
    category: "DeFi",
    icon: Coins,
    relatedIds: [3, 6, 8],
    status: "in-progress" as const,
    energy: 65,
  },
  {
    id: 6,
    title: "Smart Alerts",
    date: "Q4 2024",
    content: "Intelligent notification system with customizable price alerts, portfolio rebalancing suggestions, and market opportunity notifications.",
    category: "Automation",
    icon: Zap,
    relatedIds: [2, 5, 7],
    status: "pending" as const,
    energy: 45,
  },
  {
    id: 7,
    title: "Social Trading",
    date: "Q4 2024",
    content: "Community-driven trading platform where users can follow top performers, copy strategies, and share insights with verified track records.",
    category: "Social",
    icon: Users,
    relatedIds: [4, 6, 8],
    status: "pending" as const,
    energy: 30,
  },
  {
    id: 8,
    title: "AI Advisor Pro",
    date: "Q1 2025",
    content: "Next-generation AI advisor with personalized investment strategies, automated rebalancing, and institutional-grade market predictions.",
    category: "AI Premium",
    icon: Target,
    relatedIds: [5, 7],
    status: "pending" as const,
    energy: 15,
  },
];

export function ChainWiseOrbitalTimeline() {
  return (
    <div className="relative w-full">
      {/* Header Section */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
          ChainWise Development Roadmap
        </h2>
        <p className="text-white/70 max-w-2xl">
          Explore our AI-powered crypto platform's evolution through interactive timeline nodes
        </p>
      </div>

      {/* Timeline Component */}
      <RadialOrbitalTimeline timelineData={chainwiseTimelineData} />

      {/* Footer Info */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 text-center">
        <p className="text-white/50 text-sm">
          Click on any node to explore features • Auto-rotating orbital view
        </p>
      </div>
    </div>
  );
}

export default ChainWiseOrbitalTimeline;
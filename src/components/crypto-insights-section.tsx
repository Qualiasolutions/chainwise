"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, Activity, Lightbulb, BarChart3 } from "lucide-react";

interface MarketData {
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
}

interface CryptoInsight {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ElementType;
  impact: "positive" | "negative" | "neutral";
}

const insights: CryptoInsight[] = [
  {
    id: "1",
    title: "Market Volatility Analysis",
    description: "Understanding price movements through technical indicators and sentiment analysis helps identify optimal entry and exit points.",
    category: "Technical Analysis",
    icon: Activity,
    impact: "neutral"
  },
  {
    id: "2",
    title: "DeFi Ecosystem Growth",
    description: "Decentralized Finance protocols continue expanding, offering new yield opportunities while requiring careful risk assessment.",
    category: "DeFi Trends",
    icon: TrendingUp,
    impact: "positive"
  },
  {
    id: "3",
    title: "Regulatory Landscape",
    description: "Global regulatory developments shape market dynamics. Stay informed about compliance requirements in your jurisdiction.",
    category: "Regulation",
    icon: BarChart3,
    impact: "neutral"
  },
  {
    id: "4",
    title: "Portfolio Diversification",
    description: "Balanced exposure across different crypto sectors and risk levels helps manage volatility and maximize long-term returns.",
    category: "Risk Management",
    icon: DollarSign,
    impact: "positive"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut"
    }
  }
};

export function CryptoInsightsSection() {
  const [marketData, setMarketData] = useState<MarketData>({
    price: 45234,
    change24h: 2.3,
    marketCap: 1.2,
    volume24h: 18.5
  });

  // Simulate real-time market data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => ({
        price: prev.price + (Math.random() - 0.5) * 100,
        change24h: prev.change24h + (Math.random() - 0.5) * 0.5,
        marketCap: prev.marketCap + (Math.random() - 0.5) * 0.1,
        volume24h: prev.volume24h + (Math.random() - 0.5) * 2
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-24 bg-gradient-to-b from-background via-slate-950/30 to-background overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.2) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.span
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium mb-6"
          >
            <Lightbulb className="w-4 h-4" />
            Market Insights
          </motion.span>
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-6"
          >
            Real-Time Crypto Intelligence
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Stay ahead of market movements with AI-powered insights, educational content, and real-time analysis.
          </motion.p>
        </motion.div>

        {/* Live Market Overview */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
        >
          <motion.div variants={itemVariants} className="p-6 rounded-xl bg-card/40 backdrop-blur-xl border border-border/40">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-sm text-muted-foreground">BTC Price</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              ${marketData.price.toLocaleString()}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="p-6 rounded-xl bg-card/40 backdrop-blur-xl border border-border/40">
            <div className="flex items-center gap-3 mb-2">
              {marketData.change24h >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
              <span className="text-sm text-muted-foreground">24h Change</span>
            </div>
            <div className={`text-2xl font-bold ${marketData.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {marketData.change24h >= 0 ? '+' : ''}{marketData.change24h.toFixed(1)}%
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="p-6 rounded-xl bg-card/40 backdrop-blur-xl border border-border/40">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-muted-foreground">Market Cap</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              ${marketData.marketCap.toFixed(1)}T
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="p-6 rounded-xl bg-card/40 backdrop-blur-xl border border-border/40">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-muted-foreground">24h Volume</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              ${marketData.volume24h.toFixed(1)}B
            </div>
          </motion.div>
        </motion.div>

        {/* Educational Insights */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              variants={itemVariants}
              className="group relative"
            >
              <div className="relative p-8 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/50 hover:border-border transition-all duration-300 group-hover:transform group-hover:scale-[1.02]">
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Category Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <insight.icon className="w-5 h-5 text-blue-400" />
                  <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
                    {insight.category}
                  </span>
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-blue-300 transition-colors">
                    {insight.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {insight.description}
                  </p>
                </div>

                {/* Impact indicator */}
                <div className="mt-4 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    insight.impact === 'positive' ? 'bg-green-400' :
                    insight.impact === 'negative' ? 'bg-red-400' : 'bg-blue-400'
                  }`} />
                  <span className="text-xs text-muted-foreground capitalize">
                    {insight.impact} impact
                  </span>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-16 transition-all duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Educational CTA */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="mt-16 text-center"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-300 hover:border-blue-500/40 transition-colors cursor-pointer"
          >
            <Lightbulb className="w-4 h-4" />
            <span className="text-sm font-medium">Learn more about crypto trading strategies</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
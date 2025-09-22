"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, Brain, Shield } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "10K+",
    label: "Active Users",
    description: "Traders and investors using our platform",
    gradient: "from-blue-400 to-blue-600"
  },
  {
    icon: Brain,
    value: "1M+",
    label: "AI Insights",
    description: "Delivered to help make smarter decisions",
    gradient: "from-purple-400 to-purple-600"
  },
  {
    icon: TrendingUp,
    value: "$2.5B+",
    label: "Assets Tracked",
    description: "In cryptocurrency portfolios managed",
    gradient: "from-green-400 to-green-600"
  },
  {
    icon: Shield,
    value: "99.9%",
    label: "Uptime",
    description: "Reliable service you can depend on",
    gradient: "from-orange-400 to-orange-600"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

export function StatsSection() {
  return (
    <section className="relative py-24 bg-gradient-to-b from-background via-background/50 to-background overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.15) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
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
            className="inline-block px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm font-medium mb-6"
          >
            Trusted by Thousands
          </motion.span>
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-6"
          >
            Platform You Can Trust
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Join thousands of traders and investors who rely on ChainWise for intelligent
            cryptocurrency insights and portfolio management.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="group relative"
            >
              <div className="relative p-8 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/50 hover:border-border transition-all duration-300 group-hover:transform group-hover:scale-105">
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Icon */}
                <div className={`relative w-16 h-16 rounded-xl bg-gradient-to-r ${stat.gradient} p-3 mb-6 mx-auto`}>
                  <stat.icon className="w-full h-full text-white" />
                </div>

                {/* Content */}
                <div className="relative text-center">
                  <div className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-lg font-semibold text-foreground mb-2">
                    {stat.label}
                  </div>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    {stat.description}
                  </div>
                </div>

                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r ${stat.gradient} group-hover:w-16 transition-all duration-300`} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
"use client";

import { motion } from "framer-motion";
import { Brain, BarChart3, Shield, Target, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Connect Your Portfolio",
      description: "Securely link your crypto wallets and exchanges to get a complete view of your investments.",
      icon: Shield,
      color: "from-blue-500 to-blue-600"
    },
    {
      step: "02",
      title: "AI Analysis",
      description: "Our advanced AI algorithms analyze market trends, your portfolio performance, and risk factors in real-time.",
      icon: Brain,
      color: "from-purple-500 to-purple-600"
    },
    {
      step: "03",
      title: "Get Insights",
      description: "Receive personalized recommendations, market insights, and actionable advice tailored to your investment goals.",
      icon: Target,
      color: "from-green-500 to-green-600"
    }
  ];

  const features = [
    {
      title: "AI-Powered Market Analysis",
      description: "Advanced machine learning algorithms analyze thousands of data points to provide accurate market predictions and trends.",
      icon: Brain,
      gradient: "from-purple-500 to-purple-600"
    },
    {
      title: "Real-Time Portfolio Tracking",
      description: "Monitor your investments across multiple wallets and exchanges with live updates and performance metrics.",
      icon: BarChart3,
      gradient: "from-blue-500 to-blue-600"
    },
    {
      title: "Risk Assessment",
      description: "Comprehensive risk analysis helps you make informed decisions and protect your investments from market volatility.",
      icon: Shield,
      gradient: "from-green-500 to-green-600"
    },
    {
      title: "Personalized Recommendations",
      description: "Get tailored investment advice based on your risk tolerance, goals, and market conditions.",
      icon: Target,
      gradient: "from-orange-500 to-orange-600"
    },
    {
      title: "Market Intelligence",
      description: "Access professional-grade market research, sentiment analysis, and institutional-level insights.",
      icon: TrendingUp,
      gradient: "from-pink-500 to-pink-600"
    },
    {
      title: "Community Insights",
      description: "Learn from experienced traders and analysts in our curated community of crypto professionals.",
      icon: Users,
      gradient: "from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
            How ChainWise Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our AI-powered platform transforms complex crypto market data into actionable insights,
            helping you make smarter investment decisions with confidence.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="text-center border-0 shadow-lg bg-white/50 backdrop-blur-sm h-full">
                <CardHeader className="pb-6">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center mx-auto mb-4`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-sm font-mono text-muted-foreground mb-2">STEP {step.step}</div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Powerful Features for Smart Crypto Investing
          </h3>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm h-full hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
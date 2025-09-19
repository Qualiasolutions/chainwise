"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Brain, Crown } from "lucide-react";
import { AnimatedGlassyPricing } from "@/components/ui/animated-glassy-pricing";

const chainwisePricingTiers = [
  {
    id: "free",
    name: "Buddy",
    price: 0,
    period: "month",
    description: "Perfect for crypto beginners who want to explore AI insights",
    features: [
      "Basic AI crypto insights",
      "5 questions per day",
      "Market overview access",
      "Educational resources",
      "Community access",
      "Email support"
    ],
    icon: User,
    gradient: "bg-gradient-to-br from-slate-600 to-slate-800",
    borderColor: "border-slate-500",
  },
  {
    id: "pro",
    name: "Professor",
    price: 12.99,
    originalPrice: 19.99,
    period: "month",
    description: "Advanced features for serious crypto investors",
    features: [
      "Advanced AI market analysis",
      "Unlimited questions",
      "Portfolio tracking & insights",
      "Risk assessment tools",
      "Price alerts & notifications",
      "Technical analysis",
      "Priority support",
      "API access"
    ],
    popular: true,
    icon: Brain,
    gradient: "bg-gradient-to-br from-purple-600 to-blue-600",
    borderColor: "border-purple-500",
  },
  {
    id: "elite",
    name: "Trader",
    price: 24.99,
    originalPrice: 34.99,
    period: "month",
    description: "Professional-grade tools for crypto trading experts",
    features: [
      "Everything in Professor",
      "Advanced trading signals",
      "Institutional-grade analysis",
      "Custom AI model training",
      "White-label solutions",
      "DeFi strategy optimization",
      "Dedicated account manager",
      "1-on-1 strategy sessions"
    ],
    icon: Crown,
    gradient: "bg-gradient-to-br from-yellow-500 to-orange-600",
    borderColor: "border-yellow-500",
  },
];

export function ChainWisePricing() {
  const router = useRouter();

  const handleSelectTier = (tierId: string) => {
    // Route to appropriate page based on tier selection
    if (tierId === "free") {
      router.push("/auth/signup");
    } else {
      router.push(`/checkout?plan=${tierId}`);
    }
  };

  return (
    <div id="pricing" className="relative">
      <AnimatedGlassyPricing
        tiers={chainwisePricingTiers}
        onSelectTier={handleSelectTier}
      />
    </div>
  );
}

export default ChainWisePricing;
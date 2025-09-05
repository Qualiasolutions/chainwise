import React from 'react';
import { ModernPricingPage, PricingCardProps } from "@/components/ui/animated-glassy-pricing";

const chainWisePricingPlans: PricingCardProps[] = [
  { 
    planName: 'Free', 
    description: 'Perfect for crypto beginners exploring AI-powered insights.', 
    price: '0', 
    features: [
      'Buddy persona (basic Q&A)',
      'Live prices (top 10 coins)',
      'Portfolio tracking (3 coins max)',
      'Basic coin comparisons (2 max)',
      'Daily generic news',
      'ChainWise Academy (2 intro lessons)',
      'Community access',
      '3 credits/month'
    ], 
    buttonText: 'Get Started Free',
    buttonHref: '/auth/signup',
    buttonVariant: 'secondary'
  },
  { 
    planName: 'Pro', 
    description: 'The value-for-money plan for serious retail investors.', 
    price: '12.99', 
    features: [
      'Everything in Free',
      'Buddy + Professor personas',
      'Unlimited coin comparisons',
      'Portfolio tracking (20 coins)',
      'Smart alerts (up to 10)',
      'Weekly Pro AI reports',
      'Advanced portfolio analysis',
      'ChainWise Academy (Beginner + Intermediate)',
      '50 credits/month'
    ], 
    buttonText: 'Choose Pro Plan',
    buttonHref: '/pricing',
    isPopular: true, 
    buttonVariant: 'primary' 
  },
  { 
    planName: 'Elite', 
    description: 'Premium tools and VIP experience for professional traders.', 
    price: '24.99', 
    features: [
      'Everything in Pro',
      'Trader persona (advanced strategies)',
      'Unlimited custom alerts',
      'Advanced portfolio correlations',
      'Social sentiment analysis',
      'Thematic crypto baskets',
      'Monthly Elite Deep AI reports',
      'Priority support & early access',
      '200 credits/month'
    ], 
    buttonText: 'Go Elite',
    buttonHref: '/pricing',
    buttonVariant: 'primary' 
  },
];

export const ChainWisePricingSection = () => {
  return (
    <ModernPricingPage
      title={
        <>
          Choose Your <span className="text-cyan-400">ChainWise</span> Plan
        </>
      }
      subtitle="Start free and scale with AI-powered crypto insights. From beginner-friendly tools to professional-grade analytics."
      plans={chainWisePricingPlans}
      showAnimatedBackground={false} // Don't show background on homepage section
    />
  );
};

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Star, Zap, Crown } from "lucide-react"
import { CheckIcon } from "@radix-ui/react-icons"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { Button as MovingBorderButton } from "@/components/ui/moving-border"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Awareness & a taste of AI, not full use",
    features: [
      "Buddy persona (basic Q&A)",
      "Live prices (top 10 coins only)",
      "Portfolio tracking (up to 3 coins)",
      "Coin comparisons (2 Max)",
      "Daily generic news (no personalization)",
      "ChainWise Academy: 2 intro lessons",
      "ChainWise Community access",
      "3 credits/month (to test premium features)"
    ],
    buttonText: "Get Started",
    buttonVariant: "outline" as const,
    popular: false,
    icon: Star,
  },
  {
    name: "Pro",
    price: "$12.99",
    period: "per month",
    description: "The value-for-money plan. 60-70% of users will land here",
    features: [
      "Buddy + Professor personas",
      "Unlimited coin comparisons",
      "ChainWise Community access",
      "Daily personalized insights",
      "Portfolio tracking (up to 20 coins)",
      "Portfolio analysis (basic: performance, diversification, risk score)",
      "Smart alerts (up to 10: price, %, volume, drawdown)",
      "Scam/risk checks (basic red flags)",
      "Weekly Pro AI Report (1 included)",
      "ChainWise Academy: Beginner + Intermediate courses",
      "Gamified missions & badges",
      "50 credits/month"
    ],
    buttonText: "Start Pro Trial",
    buttonVariant: "default" as const,
    popular: true,
    icon: Zap,
  },
  {
    name: "Elite",
    price: "$24.99",
    period: "per month",
    description: "Prestige + VIP tools → for serious traders & power users",
    features: [
      "Everything in Pro",
      "Trader persona (advanced strategies, bull/bear scenarios)",
      "Unlimited custom alerts",
      "Advanced portfolio analysis (correlations & diversification)",
      "Basic social sentiment index (bullish/bearish overview)",
      "Basic thematic baskets (AI coins, DeFi, etc.)",
      "Monthly Elite Deep AI Report (1 included)",
      "ChainWise Academy: Full (Beginner → Advanced + Strategy lessons)",
      "Early access to new features",
      "Priority support",
      "200 credits/month"
    ],
    buttonText: "Go Elite",
    buttonVariant: "default" as const,
    popular: false,
    icon: Crown,
  },
]

export default function PricingSection() {
  return (
    <div className="relative py-20 bg-gray-950 overflow-hidden">
      <BackgroundBeams className="absolute inset-0 z-0" />
      <div className="relative z-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">Plan</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            From free portfolio tracking to professional-grade AI-powered crypto analysis.
            Start free and upgrade as you grow.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon
            return (
              <Card
                key={index}
                className={`glass-card border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 relative ${plan.popular ? "ring-2 ring-purple-500/50 scale-105" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-violet-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Most Popular
                    </div>
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="text-purple-400">
                      <IconComponent className="w-8 h-8" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400">/{plan.period}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{plan.description}</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <CheckIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-white text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.popular ? (
                    <MovingBorderButton
                      borderRadius="1.75rem"
                      className="w-full bg-white dark:bg-slate-900 text-black dark:text-white border-neutral-200 dark:border-slate-800 py-6 text-lg"
                      borderClassName="bg-gradient-to-r from-purple-500 to-violet-500"
                    >
                      <div className="flex items-center justify-center">
                        <Zap className="w-5 h-5 mr-2" />
                        {plan.buttonText}
                      </div>
                    </MovingBorderButton>
                  ) : (
                    <MovingBorderButton
                      borderRadius="1.75rem"
                      className="w-full bg-transparent text-white border-purple-500 py-6 text-lg"
                      borderClassName="bg-gradient-to-r from-purple-400 to-violet-500"
                    >
                      <div className="flex items-center justify-center">
                        {plan.buttonText}
                      </div>
                    </MovingBorderButton>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

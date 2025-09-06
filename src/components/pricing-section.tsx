import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Star, Zap } from "lucide-react"
import { CheckIcon } from "@radix-ui/react-icons"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for getting started",
    features: [
      "AI Assistant (Buddy persona)",
      "Live prices for top 10 cryptocurrencies",
      "Portfolio tracking (up to 3 coins)",
      "3 credits/month for premium features",
      "Basic community access",
    ],
    buttonText: "Get Started",
    buttonVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Pro",
    price: "$12.99",
    period: "/month",
    description: "Most popular choice",
    features: [
      "AI Assistants (Buddy + Professor)",
      "Portfolio tracking (up to 20 coins)",
      "Smart alerts (up to 10 custom alerts)",
      "Weekly Pro AI Report",
      "ChainWise Academy (Beginner + Intermediate)",
      "50 credits/month",
      "Full community access",
    ],
    buttonText: "Start Pro Trial",
    buttonVariant: "default" as const,
    popular: true,
  },
  {
    name: "Elite",
    price: "$24.99",
    period: "/month",
    description: "For serious investors",
    features: [
      "All 3 AI personas (Buddy + Professor + Trader)",
      "Unlimited portfolio tracking",
      "Advanced analytics & correlation analysis",
      "Social sentiment tracking",
      "Monthly Elite Deep AI Report",
      "Priority support & beta access",
      "200 credits/month",
    ],
    buttonText: "Go Elite",
    buttonVariant: "default" as const,
    popular: false,
  },
]

export default function PricingSection() {
  return (
    <div className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Plan</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Start free and upgrade as your crypto investment journey grows.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`glass-card border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 relative ${plan.popular ? "ring-2 ring-indigo-500/50 scale-105" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <p className="text-gray-400">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.buttonVariant}
                  className={`w-full py-6 text-lg rounded-full ${
                    plan.buttonVariant === "default"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      : "border-gray-600 hover:bg-white/10"
                  }`}
                >
                  {plan.popular && <Zap className="w-5 h-5 mr-2" />}
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

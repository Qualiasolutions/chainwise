"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Lock, ArrowLeft, Brain, Crown } from "lucide-react";
import Link from "next/link";

const plans = {
  pro: {
    name: "PRO",
    price: 12.99,
    originalPrice: 19.99,
    period: "month",
    description: "Advanced features for serious crypto investors",
    icon: Brain,
    features: [
      "Advanced AI market analysis",
      "Unlimited questions",
      "Portfolio tracking & insights",
      "Risk assessment tools",
      "Price alerts & notifications",
      "Technical analysis",
      "Priority support",
      "API access"
    ]
  },
  elite: {
    name: "ELITE",
    price: 24.99,
    originalPrice: 34.99,
    period: "month",
    description: "Professional-grade tools for crypto trading experts",
    icon: Crown,
    features: [
      "Everything in PRO",
      "Advanced trading signals",
      "Institutional-grade analysis",
      "Custom AI model training",
      "White-label solutions",
      "DeFi strategy optimization",
      "Dedicated account manager",
      "1-on-1 strategy sessions"
    ]
  }
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    const plan = searchParams.get("plan");
    if (plan && (plan === "pro" || plan === "elite")) {
      setSelectedPlan(plan);
    } else {
      // Redirect to pricing if invalid plan
      router.push("/#pricing");
    }
  }, [searchParams, router]);

  const handleCheckout = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      // TODO: Integrate with Stripe checkout
      // For now, redirect to success page
      setTimeout(() => {
        router.push("/checkout/success");
      }, 2000);
    } catch (error) {
      console.error("Checkout error:", error);
      setLoading(false);
    }
  };

  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const plan = plans[selectedPlan as keyof typeof plans];
  const Icon = plan.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/#pricing">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pricing
            </Link>
          </Button>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">{plan.name} Plan</CardTitle>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">${plan.price}</span>
                {plan.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    ${plan.originalPrice}
                  </span>
                )}
                <span className="text-muted-foreground">/{plan.period}</span>
                <Badge variant="secondary" className="ml-2">
                  Save ${((plan.originalPrice || plan.price) - plan.price).toFixed(2)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                  What's included:
                </h4>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                  <Lock className="w-4 h-4" />
                  <span className="font-medium">Secure Payment</span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Your payment information is encrypted and secure. Cancel anytime.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Information
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Payment Method */}
              <div className="space-y-4">
                <div className="p-4 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Credit Card</div>
                        <div className="text-xs text-muted-foreground">Visa, Mastercard, American Express</div>
                      </div>
                    </div>
                    <Badge variant="outline">Recommended</Badge>
                  </div>
                </div>
              </div>

              {/* Stripe Integration Placeholder */}
              <div className="space-y-4">
                <div className="p-6 border-2 border-dashed border-muted rounded-lg text-center">
                  <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground">
                    Stripe payment form will be integrated here
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Secure payment processing with industry-standard encryption
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="text-xs text-muted-foreground">
                By clicking "Subscribe Now", you agree to our{" "}
                <Link href="/terms" className="text-purple-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-purple-600 hover:underline">
                  Privacy Policy
                </Link>
                . You will be charged ${plan.price} monthly until you cancel.
              </div>

              {/* Subscribe Button */}
              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </div>
                ) : (
                  `Subscribe to ${plan.name} - $${plan.price}/month`
                )}
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                Cancel anytime in your account settings
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
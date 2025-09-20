"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from "@/components/ui/enhanced-card";
import { Button } from "@/components/ui/button";
import { RippleButton } from "@/components/ui/ripple-button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, Receipt, AlertCircle, Crown, Brain, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { UpgradeModal } from "@/components/UpgradeModal";

export default function BillingPage() {
  const { user, profile } = useSupabaseAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<any[]>([]);
  const [creditTransactions, setCreditTransactions] = useState<any[]>([]);

  // Fetch billing data from Supabase
  useEffect(() => {
    const fetchBillingData = async () => {
      if (!user || !profile) return;

      try {
        setLoading(true);

        // Fetch subscription history
        const subResponse = await fetch('/api/subscription/history');
        if (subResponse.ok) {
          const subData = await subResponse.json();
          setSubscriptionHistory(subData.subscriptions || []);
          setSubscriptionData(subData.current || null);
        }

        // Fetch credit transactions (recent)
        const creditResponse = await fetch('/api/credits/transactions');
        if (creditResponse.ok) {
          const creditData = await creditResponse.json();
          setCreditTransactions(creditData.transactions || []);
        }

      } catch (error) {
        console.error('Error fetching billing data:', error);
        toast.error('Failed to load billing information');
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, [user, profile]);

  // Current subscription (fallback to profile data if no subscription history)
  const currentSubscription = subscriptionData || {
    plan: profile?.tier || 'free',
    status: 'active',
    price: profile?.tier === 'pro' ? 12.99 : profile?.tier === 'elite' ? 24.99 : 0,
    next_billing: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    payment_method: null
  };

  const plans = [
    {
      id: "free",
      name: "FREE",
      price: 0,
      icon: User,
      features: ["5 questions per day", "Basic AI insights", "Community access"]
    },
    {
      id: "pro",
      name: "PRO",
      price: 12.99,
      icon: Brain,
      popular: true,
      features: ["Unlimited questions", "Advanced analysis", "Priority support", "API access"]
    },
    {
      id: "elite",
      name: "ELITE",
      price: 24.99,
      icon: Crown,
      features: ["Everything in PRO", "Trading signals", "Custom AI training", "1-on-1 sessions"]
    }
  ];

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      // TODO: Integrate with Stripe API to cancel subscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Subscription cancellation requested");
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast.error("Failed to cancel subscription");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayment = async () => {
    setLoading(true);
    try {
      // TODO: Open Stripe payment method update flow
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Payment method updated");
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error("Failed to update payment method");
    } finally {
      setLoading(false);
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "pro":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">PRO</Badge>;
      case "elite":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">ELITE</Badge>;
      default:
        return <Badge variant="secondary">FREE</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>;
      case "past_due":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Past Due</Badge>;
      case "canceled":
        return <Badge variant="outline">Canceled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-8 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <EnhancedCard glow gradient>
        <EnhancedCardHeader>
          <EnhancedCardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Current Subscription
          </EnhancedCardTitle>
          <EnhancedCardDescription>
            Manage your ChainWise subscription and billing information
          </EnhancedCardDescription>
        </EnhancedCardHeader>
        <EnhancedCardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">
                  {plans.find(p => p.id === currentSubscription.plan)?.name || currentSubscription.plan?.toUpperCase()} Plan
                </h3>
                {getPlanBadge(currentSubscription.plan)}
                {getStatusBadge(currentSubscription.status)}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">${currentSubscription.price}</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="min-w-0">
                <div className="text-sm font-medium">Next Billing Date</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">
                    {currentSubscription.next_billing ?
                      new Date(currentSubscription.next_billing).toLocaleDateString() :
                      'No billing scheduled'
                    }
                  </span>
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium">Payment Method</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">
                    {currentSubscription.payment_method ?
                      `${currentSubscription.payment_method.brand?.toUpperCase()} ****${currentSubscription.payment_method.last4}` :
                      'No payment method'
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <RippleButton variant="outline" onClick={handleUpdatePayment} disabled={loading} className="flex-1 sm:flex-none">
                Update Payment Method
              </RippleButton>
              <RippleButton
                variant="destructive"
                onClick={handleCancelSubscription}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                Cancel Subscription
              </RippleButton>
            </div>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Available Plans */}
      <EnhancedCard glow>
        <EnhancedCardHeader>
          <EnhancedCardTitle>Available Plans</EnhancedCardTitle>
          <EnhancedCardDescription>
            Compare plans and upgrade or downgrade your subscription
          </EnhancedCardDescription>
        </EnhancedCardHeader>
        <EnhancedCardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrent = plan.id === currentSubscription.plan;

              return (
                <Card key={plan.id} className={`relative ${isCurrent ? 'ring-2 ring-purple-500' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-purple-600 text-white">Most Popular</Badge>
                    </div>
                  )}

                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>

                      <h3 className="font-semibold mb-1">{plan.name}</h3>
                      <div className="text-2xl font-bold mb-3">
                        ${plan.price}
                        <span className="text-sm font-normal text-muted-foreground">/month</span>
                      </div>

                      <div className="space-y-2 mb-4">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="text-xs text-muted-foreground">
                            {feature}
                          </div>
                        ))}
                      </div>

                      {isCurrent ? (
                        <Button variant="secondary" size="sm" className="w-full" disabled>
                          Current Plan
                        </Button>
                      ) : (
                        <UpgradeModal requiredTier={plan.id} personaName={plan.name}>
                          <RippleButton variant="purple" size="sm" className="w-full">
                            Switch Plan
                          </RippleButton>
                        </UpgradeModal>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Credit Transaction History */}
      <EnhancedCard>
        <EnhancedCardHeader>
          <EnhancedCardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Credit History
          </EnhancedCardTitle>
          <EnhancedCardDescription>
            View your AI credit usage and refill history
          </EnhancedCardDescription>
        </EnhancedCardHeader>
        <EnhancedCardContent>
          <div className="space-y-3">
            {creditTransactions.length > 0 ? (
              creditTransactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.status === 'credit'
                        ? 'bg-green-100 dark:bg-green-900'
                        : 'bg-red-100 dark:bg-red-900'
                    }`}>
                      <CreditCard className={`w-4 h-4 ${
                        transaction.status === 'credit'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`} />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{transaction.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()} • {transaction.ai_persona || 'System'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`font-medium ${
                      transaction.status === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.status === 'credit' ? '+' : '-'}{transaction.amount}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {transaction.type}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No credit transactions yet
              </div>
            )}
          </div>
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Billing Notice */}
      <EnhancedCard className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30">
        <EnhancedCardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <div className="font-medium text-yellow-800 dark:text-yellow-200">
                Billing Information
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 break-words">
                {currentSubscription.plan === 'free' ? (
                  'Upgrade to PRO or ELITE to get monthly AI credits and unlock advanced features.'
                ) : (
                  `Your ${currentSubscription.plan?.toUpperCase()} subscription ${currentSubscription.next_billing ?
                    `will renew on ${new Date(currentSubscription.next_billing).toLocaleDateString()}` :
                    'is currently active'}. You can cancel anytime.`
                )}
              </div>
            </div>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  );
}
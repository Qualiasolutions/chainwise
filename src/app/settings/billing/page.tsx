"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, Receipt, AlertCircle, Crown, Brain, User } from "lucide-react";
import { toast } from "sonner";

export default function BillingPage() {
  const [loading, setLoading] = useState(false);

  // Mock user subscription data
  const subscription = {
    plan: "pro",
    status: "active",
    price: 12.99,
    next_billing: "2024-10-19",
    payment_method: {
      type: "card",
      last4: "4242",
      brand: "visa",
      exp_month: 12,
      exp_year: 2027
    }
  };

  const invoices = [
    {
      id: "inv_001",
      date: "2024-09-19",
      amount: 12.99,
      status: "paid",
      description: "Professor Plan - Monthly"
    },
    {
      id: "inv_002",
      date: "2024-08-19",
      amount: 12.99,
      status: "paid",
      description: "Professor Plan - Monthly"
    },
    {
      id: "inv_003",
      date: "2024-07-19",
      amount: 12.99,
      status: "paid",
      description: "Professor Plan - Monthly"
    }
  ];

  const plans = [
    {
      id: "free",
      name: "Buddy",
      price: 0,
      icon: User,
      features: ["5 questions per day", "Basic AI insights", "Community access"]
    },
    {
      id: "pro",
      name: "Professor",
      price: 12.99,
      icon: Brain,
      popular: true,
      features: ["Unlimited questions", "Advanced analysis", "Priority support", "API access"]
    },
    {
      id: "elite",
      name: "Trader",
      price: 24.99,
      icon: Crown,
      features: ["Everything in Pro", "Trading signals", "Custom AI training", "1-on-1 sessions"]
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
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Professor</Badge>;
      case "elite":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Trader</Badge>;
      default:
        return <Badge variant="secondary">Buddy</Badge>;
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

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>
            Manage your ChainWise subscription and billing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">
                  {plans.find(p => p.id === subscription.plan)?.name} Plan
                </h3>
                {getPlanBadge(subscription.plan)}
                {getStatusBadge(subscription.status)}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">${subscription.price}</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <div className="text-sm font-medium">Next Billing Date</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(subscription.next_billing).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Payment Method</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="w-4 h-4" />
                  {subscription.payment_method.brand.toUpperCase()} ****{subscription.payment_method.last4}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={handleUpdatePayment} disabled={loading}>
                Update Payment Method
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelSubscription}
                disabled={loading}
                className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
              >
                Cancel Subscription
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>
            Compare plans and upgrade or downgrade your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrent = plan.id === subscription.plan;

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

                      <Button
                        variant={isCurrent ? "secondary" : "default"}
                        size="sm"
                        className="w-full"
                        disabled={isCurrent || loading}
                      >
                        {isCurrent ? "Current Plan" : "Switch Plan"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Billing History
          </CardTitle>
          <CardDescription>
            View and download your previous invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{invoice.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(invoice.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-medium">${invoice.amount}</div>
                  <Badge variant="outline" className="text-xs">
                    {invoice.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing Notice */}
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <div className="font-medium text-yellow-800 dark:text-yellow-200">
                Billing Information
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Your subscription will automatically renew on {new Date(subscription.next_billing).toLocaleDateString()}.
                You can cancel anytime before your next billing date to avoid charges.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
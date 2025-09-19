"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Crown, Brain, User, Zap, CreditCard, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import { toast } from "sonner"

interface Plan {
  id: string
  name: string
  price: number
  icon: React.ElementType
  popular?: boolean
  credits: number
  features: string[]
  tier: string
}

const plans: Plan[] = [
  {
    id: "pro",
    name: "PRO",
    price: 12.99,
    icon: Brain,
    popular: true,
    credits: 50,
    tier: "pro",
    features: [
      "Unlimited Professor AI access",
      "50 AI credits per month",
      "Up to 20 portfolio holdings",
      "Advanced market analysis",
      "Priority support",
      "Email notifications"
    ]
  },
  {
    id: "elite",
    name: "ELITE",
    price: 24.99,
    icon: Crown,
    credits: 100,
    tier: "elite",
    features: [
      "Full Trader AI access",
      "100 AI credits per month",
      "Unlimited portfolio holdings",
      "Professional trading signals",
      "Risk management tools",
      "Real-time alerts",
      "Priority support",
      "Custom AI training"
    ]
  }
]

interface UpgradeModalProps {
  requiredTier: string
  personaName: string
  children?: React.ReactNode
}

export function UpgradeModal({ requiredTier, personaName, children }: UpgradeModalProps) {
  const { profile } = useSupabaseAuth()
  const [open, setOpen] = useState(false)
  const [upgrading, setUpgrading] = useState(false)

  const currentTier = profile?.tier || 'free'
  const availablePlans = plans.filter(plan =>
    plan.tier === requiredTier ||
    (requiredTier === 'pro' && plan.tier === 'elite')
  )

  const handleUpgrade = async (planId: string) => {
    setUpgrading(true)

    try {
      // TODO: Integrate with Stripe for real payments
      // For now, simulate upgrade process
      await new Promise(resolve => setTimeout(resolve, 2000))

      const selectedPlan = plans.find(p => p.id === planId)
      if (!selectedPlan) return

      // Update user tier and credits in database
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planId,
          tier: selectedPlan.tier,
          credits: selectedPlan.credits
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upgrade failed')
      }

      toast.success(`Successfully upgraded to ${selectedPlan.name}! You now have access to ${personaName}.`)
      setOpen(false)

      // Refresh the page to update user state
      window.location.reload()

    } catch (error: any) {
      console.error('Upgrade error:', error)
      toast.error(error.message || 'Upgrade failed. Please try again.')
    } finally {
      setUpgrading(false)
    }
  }

  const getPlanBadge = (planTier: string) => {
    switch (planTier) {
      case "pro":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">PRO</Badge>
      case "elite":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">ELITE</Badge>
      default:
        return <Badge variant="secondary">FREE</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-purple-600" />
            Upgrade Required
          </DialogTitle>
          <DialogDescription>
            Unlock {personaName} and advanced features with a PRO or ELITE subscription
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-muted-foreground" />
              <div>
                <div className="font-medium">Current Plan</div>
                <div className="text-sm text-muted-foreground">FREE Tier - Limited access</div>
              </div>
            </div>
            {getPlanBadge(currentTier)}
          </div>

          {/* Available Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availablePlans.map((plan) => {
              const Icon = plan.icon
              const isRecommended = plan.tier === requiredTier

              return (
                <Card key={plan.id} className={cn(
                  "relative transition-all duration-200",
                  isRecommended ? "ring-2 ring-purple-500 scale-105" : "hover:shadow-lg"
                )}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-purple-600 text-white">Most Popular</Badge>
                    </div>
                  )}

                  {isRecommended && (
                    <div className="absolute -top-3 right-4">
                      <Badge className="bg-green-600 text-white">Recommended</Badge>
                    </div>
                  )}

                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>Perfect for {plan.tier === 'pro' ? 'enthusiasts' : 'professionals'}</CardDescription>

                    <div className="text-4xl font-bold text-purple-600">
                      ${plan.price}
                      <span className="text-lg font-normal text-muted-foreground">/month</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center gap-2 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                      <Zap className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">{plan.credits} AI Credits/month</span>
                    </div>

                    <div className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full mt-6"
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={upgrading}
                      variant={isRecommended ? "default" : "outline"}
                    >
                      {upgrading ? (
                        "Processing..."
                      ) : (
                        <>
                          Upgrade to {plan.name}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Benefits Summary */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              <span className="font-medium">What you get immediately:</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>✨ Instant access to {personaName} AI advisor</div>
              <div>🚀 Monthly AI credits automatically refilled</div>
              <div>📈 Enhanced portfolio management features</div>
              <div>🔔 Real-time market alerts and notifications</div>
              <div>💎 Priority customer support</div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="text-center text-sm text-muted-foreground">
            <div>💳 Secure payments • 🔄 Cancel anytime • 📞 24/7 support</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
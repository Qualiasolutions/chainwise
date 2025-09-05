import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SubscriptionManager } from '@/components/ui/subscription-manager'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function BillingPage() {
  const supabase = createClient()
  
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !authUser) {
    redirect('/auth/signin')
  }

  const { data: user, error: userError } = await supabase
    .from('users')
    .select(`
      *,
      subscriptions(*),
      credit_transactions(*)
    `)
    .eq('id', authUser.id)
    .single()

  if (userError || !user) {
    redirect('/auth/signin')
  }

  // Sort credit transactions by date (most recent first) and take 5
  const recentTransactions = user.credit_transactions
    ?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    ?.slice(0, 5) || []

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground mt-2">
            Manage your subscription, credits, and billing information
          </p>
        </div>

        <SubscriptionManager
          currentTier={user.subscription_tier}
          creditsBalance={user.credits_balance}
          subscription={user.subscriptions?.[0] ? {
            status: user.subscriptions[0].status,
            currentPeriodEnd: user.subscriptions[0].current_period_end,
            cancelAtPeriodEnd: user.subscriptions[0].cancel_at_period_end,
          } : undefined}
        />

        {/* Recent Credit Transactions */}
        {recentTransactions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Credit Activity</CardTitle>
              <CardDescription>
                Your latest credit transactions and usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((txn: any) => (
                  <div key={txn.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{txn.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(txn.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`font-mono ${txn.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {txn.amount > 0 ? '+' : ''}{txn.amount}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
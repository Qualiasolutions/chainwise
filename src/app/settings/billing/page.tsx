'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard, Clock, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

interface UserData {
  id: string
  email: string
  credits_balance: number
  subscription_tier: 'free' | 'pro' | 'elite'
  total_points: number
}

interface CreditTransaction {
  id: string
  transaction_type: 'spent' | 'granted' | 'purchased'
  amount: number
  description: string
  created_at: string
}

export default function BillingPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const loadBillingData = useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push('/auth/login')
        return
      }

      // Load user data
      const { data: userInfo, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!userError && userInfo) {
        setUserData({
          id: userInfo.id,
          email: user.email || '',
          credits_balance: userInfo.credits_balance || 0,
          subscription_tier: userInfo.subscription_tier || 'free',
          total_points: userInfo.total_points || 0
        })
      }

      // Load recent credit transactions
      const { data: txnData, error: txnError } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (!txnError && txnData) {
        setTransactions(txnData)
      }

    } catch (error) {
      console.error('Error loading billing data:', error)
      toast.error('Failed to load billing information')
    } finally {
      setLoading(false)
    }
  }, [supabase, router])

  useEffect(() => {
    loadBillingData()
  }, [loadBillingData])

  if (loading) {
    return (
      <ProtectedRoute requireAuth={true}>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
            <p className="text-white/70">Loading billing information...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const tierInfo = {
    free: { name: 'Free', color: 'bg-gray-500', price: '$0/month' },
    pro: { name: 'Pro', color: 'bg-blue-500', price: '$12.99/month' },
    elite: { name: 'Elite', color: 'bg-purple-500', price: '$24.99/month' }
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Billing & Subscription</h1>
              <p className="text-white/70 mt-2">
                Manage your subscription, credits, and billing information
              </p>
            </div>

            {/* Current Plan */}
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Current Plan</CardTitle>
                <CardDescription className="text-white/70">
                  Your subscription details and credits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <CreditCard className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-white">Plan</h3>
                    <Badge className={`${tierInfo[userData?.subscription_tier || 'free'].color} text-white capitalize mt-2`}>
                      {tierInfo[userData?.subscription_tier || 'free'].name}
                    </Badge>
                    <p className="text-sm text-white/70 mt-1">
                      {tierInfo[userData?.subscription_tier || 'free'].price}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-white">Credits</h3>
                    <p className="text-2xl font-bold text-white">{userData?.credits_balance || 0}</p>
                    <p className="text-sm text-white/70">Available credits</p>
                  </div>
                  
                  <div className="text-center">
                    <Clock className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-white">Points</h3>
                    <p className="text-2xl font-bold text-white">{userData?.total_points || 0}</p>
                    <p className="text-sm text-white/70">Loyalty points</p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button 
                    onClick={() => toast.info('Subscription management coming soon!')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Manage Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Credit Transactions */}
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Recent Credit Activity</CardTitle>
                <CardDescription className="text-white/70">
                  Your latest credit transactions and usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((txn) => (
                      <div key={txn.id} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                        <div>
                          <p className="font-medium text-white">{txn.description}</p>
                          <p className="text-sm text-white/60">
                            {new Date(txn.created_at).toLocaleDateString()} • {txn.transaction_type}
                          </p>
                        </div>
                        <div className={`font-mono text-lg ${txn.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {txn.amount > 0 ? '+' : ''}{txn.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-white/30 mx-auto mb-4" />
                    <p className="text-white/70">No credit transactions yet</p>
                    <p className="text-sm text-white/50">Start using ChainWise AI to see your activity here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Loader2, CreditCard } from "lucide-react"
import { useSupabase } from '@/components/providers/supabase-provider'
import { useSubscription } from '@/hooks/use-subscription'

interface CreditPack {
  id: string
  pack_name: string
  credits: number
  price_usd: number
  metadata: any
}

interface CreditPacksProps {
  showTitle?: boolean
  className?: string
}

export function CreditPacks({ showTitle = true, className = '' }: CreditPacksProps) {
  const { session } = useSupabase()
  const { creditBalance } = useSubscription()
  const [packs, setPacks] = useState<CreditPack[]>([])
  const [loading, setLoading] = useState(true)
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCreditPacks()
  }, [])

  const fetchCreditPacks = async () => {
    try {
      const response = await fetch('/api/credits/packs')
      if (!response.ok) {
        throw new Error('Failed to fetch credit packs')
      }
      const data = await response.json()
      setPacks(data.packs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (packId: string) => {
    if (!session) {
      window.location.href = '/auth/signin?redirect=/pricing'
      return
    }

    setPurchaseLoading(packId)
    setError(null)

    try {
      const response = await fetch('/api/credits/purchase-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create purchase session')
      }

      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setPurchaseLoading(null)
    }
  }

  const getPopularBadge = (credits: number) => {
    if (credits === 200) return 'Most Popular'
    if (credits === 500) return 'Best Value'
    return null
  }

  const getValuePercentage = (credits: number, price: number) => {
    const baseValue = 50 / 4.99 // Credits per dollar for starter pack
    const currentValue = credits / price
    const savings = ((currentValue - baseValue) / baseValue) * 100
    return Math.round(savings)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className={className}>
      {showTitle && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Buy More Credits</h2>
          <p className="text-gray-600">
            Need more credits? Purchase credit packs to unlock premium features
          </p>
          {creditBalance && (
            <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700">
                Current Balance: <strong>{creditBalance.balance} credits</strong>
              </span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {packs.map((pack) => {
          const popular = getPopularBadge(pack.credits)
          const savings = getValuePercentage(pack.credits, pack.price_usd)
          
          return (
            <Card 
              key={pack.id} 
              className={`relative ${popular ? 'scale-105 shadow-xl border-blue-500' : 'shadow-lg'}`}
            >
              {popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">{popular}</Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">{pack.pack_name}</CardTitle>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">${pack.price_usd}</span>
                  <span className="text-gray-600">one-time</span>
                </div>
                <CardDescription className="text-center mt-2">
                  {pack.credits} AI Credits
                </CardDescription>
                
                {savings > 0 && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Save {savings}%
                    </Badge>
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-4">
                <Button 
                  onClick={() => handlePurchase(pack.id)}
                  disabled={!!purchaseLoading}
                  className={`w-full mb-4 ${popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  variant={popular ? "default" : "outline"}
                >
                  {purchaseLoading === pack.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Buy {pack.credits} Credits
                </Button>

                <div className="space-y-2 text-center text-sm text-gray-600">
                  <p>{(pack.credits / pack.price_usd).toFixed(1)} credits per dollar</p>
                  <p>Perfect for premium features & AI reports</p>
                  <p className="text-xs">Credits never expire</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>All purchases are one-time payments. Credits are added to your account immediately.</p>
        <p className="mt-1">Secure payments powered by Stripe</p>
      </div>
    </div>
  )
}

export default CreditPacks
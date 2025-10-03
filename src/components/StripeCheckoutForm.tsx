"use client"

import { useState } from 'react'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, Check } from 'lucide-react'
import { motion } from 'framer-motion'

interface StripeCheckoutFormProps {
  priceId: string
  planName: string
  amount: number
  onSuccess?: () => void
}

export function StripeCheckoutForm({ priceId, planName, amount, onSuccess }: StripeCheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please wait a moment and try again.')
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setError('Payment form not found. Please refresh the page.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          planType: planName.toLowerCase(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { sessionId, url } = await response.json()

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url
      } else if (sessionId) {
        // Fallback: use redirectToCheckout
        const { error: stripeError } = await stripe.redirectToCheckout({ sessionId })
        if (stripeError) {
          throw new Error(stripeError.message)
        }
      } else {
        throw new Error('No checkout URL received')
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      console.error('Checkout error:', err)
      setError(err.message || 'Payment failed. Please try again.')
      setLoading(false)
    }
  }

  const handleCardChange = (event: any) => {
    setCardComplete(event.complete)
    if (event.error) {
      setError(event.error.message)
    } else {
      setError(null)
    }
  }

  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1e293b',
        fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
        fontSmoothing: 'antialiased',
        '::placeholder': {
          color: '#94a3b8',
        },
        iconColor: '#6366f1',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: false,
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Card Information
        </label>
        <div className="relative">
          <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 transition-all duration-200 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent">
            <CardElement
              options={CARD_ELEMENT_OPTIONS}
              onChange={handleCardChange}
            />
          </div>
        </div>
      </div>

      {/* Security Badge */}
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
          <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
        </div>
        <span>Secured by Stripe • SSL encrypted • PCI compliant</span>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.div
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
      >
        <Button
          type="submit"
          disabled={!stripe || loading || !cardComplete}
          className="w-full h-12 text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Subscribe to {planName} - ${amount}/month
            </>
          )}
        </Button>
      </motion.div>

      {/* Terms */}
      <p className="text-xs text-center text-slate-500 dark:text-slate-400">
        By subscribing, you agree to automatic monthly billing. You can cancel anytime from your account settings.
      </p>
    </form>
  )
}

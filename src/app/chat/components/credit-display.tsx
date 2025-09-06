'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, AlertTriangle, TrendingUp, Plus, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChatCredits } from '../hooks/use-chat-credits'

export function CreditDisplay() {
  const { creditBalance, getCreditStatus, purchaseCredits, subscriptionTier } = useChatCredits()
  const [showPurchaseMenu, setShowPurchaseMenu] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  
  const creditStatus = getCreditStatus()

  const handlePurchase = async (packSize: 50 | 200 | 500) => {
    setIsPurchasing(true)
    try {
      await purchaseCredits(packSize)
    } catch (error) {
      console.error('Failed to purchase credits:', error)
    } finally {
      setIsPurchasing(false)
      setShowPurchaseMenu(false)
    }
  }

  const getStatusColor = () => {
    switch (creditStatus.status) {
      case 'empty': return 'from-red-500/20 to-red-600/20 border-red-400/30'
      case 'low': return 'from-yellow-500/20 to-orange-600/20 border-yellow-400/30'
      case 'good': return 'from-green-500/20 to-emerald-600/20 border-green-400/30'
      default: return 'from-purple-500/20 to-indigo-600/20 border-purple-400/20'
    }
  }

  const getStatusIcon = () => {
    switch (creditStatus.status) {
      case 'empty':
      case 'low': 
        return <AlertTriangle className="w-4 h-4 text-yellow-300" />
      case 'good': 
        return <CreditCard className="w-4 h-4 text-green-300" />
      default: 
        return <CreditCard className="w-4 h-4 text-purple-300" />
    }
  }

  return (
    <div className="relative">
      <motion.div 
        className={cn(
          "backdrop-blur-2xl bg-gradient-to-br rounded-xl border p-3 shadow-2xl cursor-pointer group",
          getStatusColor()
        )}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => setShowPurchaseMenu(!showPurchaseMenu)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
            {getStatusIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-white font-bold text-lg">
                {creditStatus.status === 'loading' ? '...' : creditBalance}
              </span>
              <span className="text-white/60 text-sm font-medium">
                Credits
              </span>
            </div>
            <div className="text-xs text-white/50 truncate">
              {subscriptionTier?.charAt(0).toUpperCase() + subscriptionTier?.slice(1) || 'Free'} Plan
            </div>
          </div>
          <Plus className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" />
        </div>
      </motion.div>

      <AnimatePresence>
        {showPurchaseMenu && (
          <>
            {/* Backdrop */}
            <motion.div 
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPurchaseMenu(false)}
            />
            
            {/* Purchase Menu */}
            <motion.div 
              className="absolute top-full right-0 mt-2 w-80 backdrop-blur-2xl bg-gradient-to-br from-purple-900/90 to-indigo-900/90 rounded-2xl border border-purple-300/20 shadow-2xl p-6 z-50"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-white font-bold text-lg">Purchase Credits</h3>
                  <p className="text-purple-200/70 text-sm mt-1">
                    Get more credits to continue chatting with our AI personas
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { size: 50, price: 4.99, popular: false },
                    { size: 200, price: 14.99, popular: true },
                    { size: 500, price: 29.99, popular: false }
                  ].map((pack) => (
                    <motion.button
                      key={pack.size}
                      onClick={() => handlePurchase(pack.size as 50 | 200 | 500)}
                      disabled={isPurchasing}
                      className={cn(
                        "w-full p-4 rounded-xl border text-left group relative overflow-hidden",
                        "bg-white/5 hover:bg-white/10 border-purple-300/20 hover:border-purple-400/40",
                        "transition-all duration-200",
                        isPurchasing && "opacity-50 cursor-not-allowed",
                        pack.popular && "ring-2 ring-purple-400/50"
                      )}
                      whileHover={{ scale: isPurchasing ? 1 : 1.02 }}
                      whileTap={{ scale: isPurchasing ? 1 : 0.98 }}
                    >
                      {pack.popular && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          Popular
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-bold text-lg">
                            {pack.size} Credits
                          </div>
                          <div className="text-purple-200/70 text-sm">
                            ${pack.price} • ${(pack.price / pack.size).toFixed(3)} per credit
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-5 h-5 text-purple-300" />
                          <ExternalLink className="w-4 h-4 text-purple-300/60 group-hover:text-purple-300 transition-colors" />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="pt-3 border-t border-purple-300/20">
                  <p className="text-xs text-purple-200/50 text-center">
                    Credits never expire • Secure payment via Stripe
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Status message tooltip */}
      {creditStatus.status !== 'good' && (
        <motion.div 
          className="absolute top-full left-0 mt-2 max-w-xs bg-black/90 backdrop-blur-xl text-white text-xs rounded-lg p-3 border border-white/10"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {creditStatus.message}
        </motion.div>
      )}
    </div>
  )
}
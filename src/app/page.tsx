'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowRight,
  Shield
} from 'lucide-react'
import { CryptoService } from '@/lib/crypto-service'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { CryptoData } from '@/types'
import ChainWiseHero from "@/components/chainwise-hero"
import TrustIndicators from "@/components/trust-indicators"
import AIPersonas from "@/components/ai-personas"
import FeatureShowcase from "@/components/feature-showcase"
import PricingSection from "@/components/pricing-section"
import { ChainWisePricingSection } from '@/components/ui/chainwise-pricing-section'

export default function HomePage() {
  const [topCryptos, setTopCryptos] = useState<CryptoData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTopCryptos()
  }, [])

  const loadTopCryptos = async () => {
    const data = await CryptoService.getTopCryptos(6)
    setTopCryptos(data)
    setLoading(false)
  }

  return (
    <>
      {/* New v0 Hero Section */}
      <ChainWiseHero />
      
      {/* v0 Additional Sections */}
      <TrustIndicators />
      <AIPersonas />
      <FeatureShowcase />
      
      {/* Content sections with proper background */}
      <div className="bg-gray-50 dark:bg-gray-900 space-y-16 py-16">
        <div className="container mx-auto px-4">
          <section className="py-12">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Trending Cryptocurrencies
            </h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topCryptos.map((crypto) => (
              <div
                key={crypto.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={crypto.image}
                      alt={crypto.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {crypto.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                        {crypto.symbol}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    #{crypto.market_cap_rank}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(crypto.current_price)}
                    </span>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${
                      crypto.price_change_percentage_24h > 0 
                        ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/20' 
                        : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
                    }`}>
                      {crypto.price_change_percentage_24h > 0 ? '+' : ''}
                      {formatPercentage(crypto.price_change_percentage_24h)}
                    </span>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Market Cap</span>
                      <span>{formatCurrency(crypto.market_cap)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-crypto-primary hover:text-crypto-secondary font-semibold"
          >
            View All Markets
            <ArrowRight className="ml-2" size={16} />
          </Link>
        </div>
      </section>
        </div>
      </div>

      {/* ChainWise Pricing Section */}
      <ChainWisePricingSection />

      {/* Investment Disclaimer */}
      <div className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center max-w-4xl mx-auto">
            <Shield className="w-12 h-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Investment Disclaimer
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Cryptocurrency investments carry significant risk. Past performance does not guarantee future results.
              This platform provides educational information only, not financial advice. Always do your own research
              and consult with qualified financial advisors before making investment decisions.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

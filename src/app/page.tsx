'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  TrendingUp, 
  MessageSquare, 
  BookOpen, 
  Shield,
  Zap,
  BarChart3,
  ArrowRight,
  Bitcoin,
  DollarSign
} from 'lucide-react'
import { CryptoService } from '@/lib/crypto-service'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { CryptoData } from '@/types'
import ChainWiseHeroWithSpline from '@/components/ui/hero-with-spline'

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

  const features = [
    {
      icon: MessageSquare,
      title: 'AI-Powered Chat',
      description: 'Get instant answers to your crypto questions from our intelligent AI assistant.',
      href: '/chat',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: BarChart3,
      title: 'Market Dashboard',
      description: 'Track real-time prices, trends, and market movements of top cryptocurrencies.',
      href: '/dashboard',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Shield,
      title: 'Portfolio Simulator',
      description: 'Practice your investment strategies with our risk-free portfolio simulator.',
      href: '/portfolio',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: BookOpen,
      title: 'Learning Center',
      description: 'Master crypto investing with our comprehensive educational resources.',
      href: '/learn',
      color: 'from-orange-500 to-red-500',
    },
  ]

  return (
    <>
      {/* Full-Screen Hero - Break out of layout constraints */}
      <div className="fixed inset-0 z-0">
        <ChainWiseHeroWithSpline />
      </div>
      
      {/* Content sections with proper spacing */}
      <div className="relative z-10 space-y-16" style={{ marginTop: '100vh' }}>

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
                    <span
                      className={`text-sm font-semibold ${
                        crypto.price_change_percentage_24h >= 0
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {formatPercentage(crypto.price_change_percentage_24h)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>24h High</span>
                    <span>{formatCurrency(crypto.high_24h)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>24h Low</span>
                    <span>{formatCurrency(crypto.low_24h)}</span>
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

      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Platform Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className="group bg-white dark:bg-gray-800 rounded-xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 bg-gradient-to-r ${feature.color} rounded-lg text-white group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-crypto-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="py-12 bg-gradient-to-r from-crypto-primary to-crypto-secondary rounded-2xl">
        <div className="text-center px-8">
          <Zap className="w-16 h-16 text-white mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Start Your Crypto Journey Today
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of investors who trust ChainWise for intelligent crypto insights
            and market analysis. Our AI-powered platform is here to guide you every step of the way.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center px-8 py-4 bg-white text-crypto-primary rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Get Started Now
            <ArrowRight className="ml-2" size={20} />
          </Link>
        </div>
      </section>

      <section className="py-12 text-center">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <Shield className="w-12 h-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Investment Disclaimer
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Cryptocurrency investments carry significant risk. Past performance does not guarantee future results.
            This platform provides educational information only, not financial advice. Always do your own research
            and consult with qualified financial advisors before making investment decisions.
          </p>
        </div>
      </section>
      </div>
    </>
  )
}
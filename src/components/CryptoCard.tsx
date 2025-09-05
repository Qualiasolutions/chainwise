import { CryptoData } from '@/types'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface CryptoCardProps {
  crypto: CryptoData
  compact?: boolean
}

export default function CryptoCard({ crypto, compact = false }: CryptoCardProps) {
  const isPositive = crypto.price_change_percentage_24h >= 0

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <div className="flex items-center space-x-3">
          <img
            src={crypto.image}
            alt={crypto.name}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {crypto.symbol.toUpperCase()}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {crypto.name}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="font-semibold text-gray-900 dark:text-white">
            {formatCurrency(crypto.current_price)}
          </p>
          <div className="flex items-center justify-end space-x-1">
            {isPositive ? (
              <TrendingUp className="w-3 h-3 text-green-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500" />
            )}
            <span
              className={`text-sm font-medium ${
                isPositive ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {formatPercentage(crypto.price_change_percentage_24h)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={crypto.image}
            alt={crypto.name}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {crypto.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">
              {crypto.symbol}
            </p>
          </div>
        </div>
        <span className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          #{crypto.market_cap_rank}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Price</span>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(crypto.current_price)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">24h Change</span>
          <div className="flex items-center space-x-1">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span
              className={`font-semibold ${
                isPositive ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {formatPercentage(crypto.price_change_percentage_24h)}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">24h High</span>
          <span className="text-gray-900 dark:text-white">
            {formatCurrency(crypto.high_24h)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">24h Low</span>
          <span className="text-gray-900 dark:text-white">
            {formatCurrency(crypto.low_24h)}
          </span>
        </div>
      </div>
    </div>
  )
}
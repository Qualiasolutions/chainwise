import { MarketStats } from '@/types'
import { formatLargeNumber, formatPercentage } from '@/lib/utils'
import { 
  TrendingUp, 
  DollarSign, 
  Activity, 
  PieChart,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

interface MarketOverviewProps {
  stats: MarketStats
}

export default function MarketOverview({ stats }: MarketOverviewProps) {
  const isPositive = stats.marketCapChangePercentage24h >= 0

  const statCards = [
    {
      title: 'Total Market Cap',
      value: `$${formatLargeNumber(stats.totalMarketCap)}`,
      change: formatPercentage(stats.marketCapChangePercentage24h),
      icon: DollarSign,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: '24h Trading Volume',
      value: `$${formatLargeNumber(stats.totalVolume)}`,
      icon: Activity,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Bitcoin Dominance',
      value: `${stats.bitcoinDominance.toFixed(1)}%`,
      icon: PieChart,
      color: 'from-orange-500 to-yellow-500',
    },
    {
      title: 'Market Trend',
      value: isPositive ? 'Bullish' : 'Bearish',
      change: formatPercentage(stats.marketCapChangePercentage24h),
      icon: isPositive ? ArrowUp : ArrowDown,
      color: isPositive ? 'from-green-500 to-emerald-500' : 'from-red-500 to-rose-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-lg text-white`}>
                <Icon size={24} />
              </div>
              {stat.change && (
                <span
                  className={`text-sm font-semibold ${
                    stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {stat.title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        )
      })}
    </div>
  )
}
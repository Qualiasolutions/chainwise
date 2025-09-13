'use client'

import { useState } from 'react'
import { 
  BookOpen, 
  GraduationCap, 
  Shield, 
  TrendingUp,
  Coins,
  Lock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
  Target,
  Lightbulb
} from 'lucide-react'

interface Lesson {
  id: string
  title: string
  icon: any
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  content: string[]
  keyPoints: string[]
}

const lessons: Lesson[] = [
  {
    id: 'what-is-crypto',
    title: 'What is Cryptocurrency?',
    icon: Coins,
    category: 'Basics',
    difficulty: 'beginner',
    content: [
      'Cryptocurrency is a digital or virtual form of currency that uses cryptography for security. Unlike traditional currencies issued by governments (fiat currencies), cryptocurrencies operate on decentralized networks based on blockchain technology.',
      'The first and most well-known cryptocurrency is Bitcoin, created in 2009 by an anonymous person or group using the pseudonym Satoshi Nakamoto. Since then, thousands of alternative cryptocurrencies have been created.',
      'Cryptocurrencies enable peer-to-peer transactions without the need for intermediaries like banks. Transactions are verified by network nodes through cryptography and recorded in a public distributed ledger called a blockchain.',
    ],
    keyPoints: [
      'Digital currency secured by cryptography',
      'Operates on decentralized networks',
      'No central authority or government control',
      'Transactions recorded on blockchain',
      'Enables peer-to-peer transfers globally',
    ],
  },
  {
    id: 'blockchain-explained',
    title: 'Understanding Blockchain Technology',
    icon: Lock,
    category: 'Technology',
    difficulty: 'beginner',
    content: [
      'A blockchain is a distributed, immutable ledger that records transactions across many computers in a way that prevents retroactive alteration. Think of it as a chain of blocks, where each block contains a list of transactions.',
      'When a new transaction occurs, it is broadcast to all nodes in the network. These nodes validate the transaction and, once confirmed, add it to a new block. This block is then cryptographically linked to the previous block, forming a chain.',
      'The decentralized nature of blockchain means no single entity controls the entire network. This makes it highly secure and resistant to manipulation or hacking attempts.',
    ],
    keyPoints: [
      'Distributed ledger technology',
      'Immutable record of transactions',
      'Cryptographically secured',
      'Decentralized and transparent',
      'Consensus mechanisms for validation',
    ],
  },
  {
    id: 'investment-strategies',
    title: 'Crypto Investment Strategies',
    icon: TrendingUp,
    category: 'Investing',
    difficulty: 'intermediate',
    content: [
      'Dollar-Cost Averaging (DCA) is a popular strategy where you invest a fixed amount regularly, regardless of price. This helps reduce the impact of volatility and removes the pressure of timing the market perfectly.',
      'HODLing (Hold On for Dear Life) is a long-term investment strategy where investors buy and hold cryptocurrencies for extended periods, believing in their long-term value proposition despite short-term volatility.',
      'Portfolio diversification involves spreading investments across different cryptocurrencies to reduce risk. A balanced portfolio might include established coins like Bitcoin and Ethereum, along with carefully selected altcoins.',
    ],
    keyPoints: [
      'Dollar-Cost Averaging (DCA) for regular investing',
      'HODLing for long-term growth',
      'Diversification to manage risk',
      'Research before investing (DYOR)',
      'Only invest what you can afford to lose',
    ],
  },
  {
    id: 'security-best-practices',
    title: 'Security & Wallet Management',
    icon: Shield,
    category: 'Security',
    difficulty: 'intermediate',
    content: [
      'Hardware wallets are physical devices that store your private keys offline, providing the highest level of security for long-term storage. Popular options include Ledger and Trezor devices.',
      'Software wallets are applications on your computer or mobile device. While more convenient for frequent transactions, they are more vulnerable to hacking if your device is compromised.',
      'Never share your private keys or seed phrases with anyone. These are the keys to your crypto kingdom. Store them securely offline, preferably in multiple secure locations.',
    ],
    keyPoints: [
      'Use hardware wallets for large holdings',
      'Enable two-factor authentication (2FA)',
      'Never share private keys or seed phrases',
      'Use reputable exchanges and wallets',
      'Keep software updated',
    ],
  },
  {
    id: 'market-analysis',
    title: 'Understanding Market Analysis',
    icon: Target,
    category: 'Trading',
    difficulty: 'advanced',
    content: [
      'Technical analysis involves studying price charts and using various indicators to predict future price movements. Common indicators include Moving Averages, RSI (Relative Strength Index), and MACD (Moving Average Convergence Divergence).',
      'Fundamental analysis focuses on evaluating a cryptocurrency based on its underlying technology, use case, team, adoption rate, and market potential. This approach looks at the intrinsic value rather than price patterns.',
      'Market sentiment analysis involves gauging the overall attitude of investors toward a particular cryptocurrency or the market as a whole. Tools include social media monitoring, fear and greed indices, and on-chain analytics.',
    ],
    keyPoints: [
      'Technical analysis for price patterns',
      'Fundamental analysis for value assessment',
      'Market sentiment indicators',
      'On-chain metrics and analytics',
      'Risk management is crucial',
    ],
  },
  {
    id: 'common-risks',
    title: 'Understanding Crypto Risks',
    icon: AlertTriangle,
    category: 'Risk Management',
    difficulty: 'beginner',
    content: [
      'Volatility is perhaps the most obvious risk in cryptocurrency investing. Prices can fluctuate dramatically within hours or days, leading to significant gains or losses.',
      'Regulatory risk exists as governments worldwide are still developing frameworks for cryptocurrency. New regulations could significantly impact the value and usability of certain cryptocurrencies.',
      'Security risks include exchange hacks, phishing attacks, and lost private keys. Unlike traditional banking, there is often no recourse if your cryptocurrency is stolen or lost.',
    ],
    keyPoints: [
      'Extreme price volatility',
      'Regulatory uncertainty',
      'Security and hacking risks',
      'Market manipulation',
      'Technology and scalability issues',
    ],
  },
]

export default function LearnPage() {
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')

  const categories = ['all', ...Array.from(new Set(lessons.map(l => l.category)))]
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced']

  const filteredLessons = lessons.filter(lesson => {
    const categoryMatch = selectedCategory === 'all' || lesson.category === selectedCategory
    const difficultyMatch = selectedDifficulty === 'all' || lesson.difficulty === selectedDifficulty
    return categoryMatch && difficultyMatch
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-r from-crypto-primary to-crypto-secondary rounded-2xl">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Crypto Learning Center
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Master the fundamentals of cryptocurrency and blockchain technology with our comprehensive educational resources
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-crypto-primary text-gray-900 dark:text-white"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-crypto-primary text-gray-900 dark:text-white"
        >
          {difficulties.map(diff => (
            <option key={diff} value={diff}>
              {diff === 'all' ? 'All Levels' : diff.charAt(0).toUpperCase() + diff.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6">
        {filteredLessons.map((lesson) => {
          const Icon = lesson.icon
          const isExpanded = expandedLesson === lesson.id

          return (
            <div
              key={lesson.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-crypto-primary to-crypto-secondary rounded-lg text-white">
                    <Icon size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {lesson.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {lesson.category}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(lesson.difficulty)}`}>
                        {lesson.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 animate-fade-in">
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="space-y-4">
                      {lesson.content.map((paragraph, index) => (
                        <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h4 className="font-semibold text-blue-900 dark:text-blue-300">
                          Key Takeaways
                        </h4>
                      </div>
                      <ul className="space-y-2">
                        {lesson.keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                            <span className="text-gray-700 dark:text-gray-300">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-gradient-to-r from-crypto-primary to-crypto-secondary rounded-xl p-8 text-center">
        <BookOpen className="w-12 h-12 text-white mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">
          Continue Your Learning Journey
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Ready to put your knowledge into practice? Try our AI Chat for personalized guidance or explore the Market Dashboard to see real-time data.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/chat"
            className="inline-flex items-center px-6 py-3 bg-white text-crypto-primary rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
          >
            Ask AI Assistant
          </a>
          <a
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-all duration-200"
          >
            View Markets
          </a>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Educational Content Only
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              This learning center provides general educational information about cryptocurrencies and blockchain technology. 
              It is not financial advice. Always conduct your own research and consult with qualified financial professionals 
              before making investment decisions. Remember that cryptocurrency investments carry significant risks.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
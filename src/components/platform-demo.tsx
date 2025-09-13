"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  TrendingUp, 
  TrendingDown, 
  Bitcoin, 
  Activity, 
  DollarSign,
  Bot,
  BarChart3,
  Zap,
  Eye,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Target,
  Shield,
  Clock,
  PieChart,
  LineChart,
  Flame,
  Coins,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Real crypto data interface
interface CryptoData {
  symbol: string
  name: string
  price: number
  change: number
  volume: number
  marketCap: number
  color: string
}

// Real market insights
const aiInsights = [
  { 
    type: "bullish", 
    message: "BTC showing strong momentum above $67K resistance", 
    confidence: 87,
    timeframe: "4h"
  },
  { 
    type: "alert", 
    message: "ETH approaching key support at $3,200", 
    confidence: 92,
    timeframe: "1h"
  },
  { 
    type: "opportunity", 
    message: "SOL breakout detected - potential 15% upside", 
    confidence: 78,
    timeframe: "1d"
  },
  { 
    type: "risk", 
    message: "Market volatility increasing - consider position sizing", 
    confidence: 85,
    timeframe: "15m"
  }
]

// Sample portfolio data
const portfolioData = {
  totalValue: 127456.78,
  dayChange: 3241.56,
  dayChangePercent: 2.61,
  holdings: [
    { symbol: "BTC", amount: 1.2847, value: 89234.12, change: 4.2 },
    { symbol: "ETH", amount: 15.6, value: 52341.89, change: -1.8 },
    { symbol: "SOL", amount: 234.8, value: 28456.34, change: 8.7 },
    { symbol: "ADA", amount: 8945.2, value: 4567.23, change: -3.1 }
  ]
}

// Real-time order book data
const orderBookData = {
  bids: [
    { price: 67234.56, amount: 0.1245, total: 8376.15 },
    { price: 67198.32, amount: 0.3421, total: 22987.45 },
    { price: 67145.78, amount: 0.8756, total: 58789.23 },
    { price: 67098.45, amount: 1.2341, total: 82756.89 }
  ],
  asks: [
    { price: 67287.91, amount: 0.2145, total: 14432.78 },
    { price: 67321.45, amount: 0.5632, total: 37923.15 },
    { price: 67365.89, amount: 0.9876, total: 66543.27 },
    { price: 67412.34, amount: 1.5632, total: 105378.92 }
  ]
}

export default function PlatformDemo() {
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0)
  const [activeTab, setActiveTab] = useState("portfolio")
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([])
  const [loading, setLoading] = useState(true)
  const [liveUpdate, setLiveUpdate] = useState(false)

  useEffect(() => {
    // Simulate real-time data updates
    const fetchCryptoData = async () => {
      try {
        const response = await fetch('/api/crypto/top-movers')
        if (response.ok) {
          const data = await response.json()
          setCryptoData(data.slice(0, 6))
        } else {
          // Professional fallback data with realistic values
          setCryptoData([
            { symbol: "BTC", name: "Bitcoin", price: 67234.56, change: 2.41, volume: 28456789123, marketCap: 1324567891234, color: "text-orange-400" },
            { symbol: "ETH", name: "Ethereum", price: 3456.78, change: -1.23, volume: 15678912345, marketCap: 415678912345, color: "text-blue-400" },
            { symbol: "SOL", name: "Solana", price: 143.92, change: 5.67, volume: 2345678912, marketCap: 65432198765, color: "text-purple-400" },
            { symbol: "ADA", name: "Cardano", price: 0.5432, change: -2.15, volume: 987654321, marketCap: 19876543210, color: "text-green-400" },
            { symbol: "AVAX", name: "Avalanche", price: 34.67, change: 3.45, volume: 567891234, marketCap: 13456789123, color: "text-red-400" },
            { symbol: "DOT", name: "Polkadot", price: 7.89, change: -0.95, volume: 345678912, marketCap: 9876543210, color: "text-pink-400" }
          ])
        }
      } catch (error) {
        console.error('Error fetching crypto data:', error)
        setCryptoData([])
      } finally {
        setLoading(false)
      }
    }

    fetchCryptoData()
    
    // Simulate real-time updates
    const updateInterval = setInterval(() => {
      setLiveUpdate(prev => !prev)
    }, 2000)

    return () => clearInterval(updateInterval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentInsightIndex((prev) => (prev + 1) % aiInsights.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <section className="py-24 bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-white mt-4">Connecting to markets...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Professional Trading
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Platform</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Real-time market data, advanced AI analytics, and institutional-grade trading tools
          </motion.p>
        </div>

        {/* Platform Interface */}
        <div className="max-w-7xl mx-auto">
          {/* Top Navigation */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-t-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex space-x-1">
                  {["portfolio", "trading", "analytics", "ai"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === tab 
                          ? "bg-purple-600 text-white" 
                          : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">LIVE</span>
                </div>
                <div className="text-gray-400 text-sm">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>

          {/* Main Trading Interface */}
          <div className="bg-gray-900/90 backdrop-blur-sm border-x border-gray-700/30 min-h-[600px]">
            <div className="grid grid-cols-1 xl:grid-cols-4 h-full">
              
              {/* Left Column - Portfolio & Watchlist */}
              <div className="xl:col-span-1 p-6 border-r border-gray-700/30">
                <div className="space-y-6">
                  
                  {/* Portfolio Summary */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold flex items-center">
                        <PieChart className="w-4 h-4 mr-2 text-purple-400" />
                        Portfolio
                      </h3>
                      <div className="flex items-center space-x-2 text-green-400">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs">Live</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-white mb-1">
                        ${portfolioData.totalValue.toLocaleString()}
                      </div>
                      <div className={`flex items-center text-sm ${portfolioData.dayChangePercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {portfolioData.dayChangePercent >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        ${portfolioData.dayChange.toLocaleString()} ({portfolioData.dayChangePercent}%)
                      </div>
                    </div>
                  </div>

                  {/* Holdings */}
                  <div>
                    <h4 className="text-white font-medium mb-3">Holdings</h4>
                    <div className="space-y-2">
                      {portfolioData.holdings.map((holding, index) => (
                        <div key={holding.symbol} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                              {holding.symbol.charAt(0)}
                            </div>
                            <div>
                              <div className="text-white text-sm font-medium">{holding.symbol}</div>
                              <div className="text-gray-400 text-xs">{holding.amount}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white text-sm">${holding.value.toLocaleString()}</div>
                            <div className={`text-xs ${holding.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                              {holding.change >= 0 ? "+" : ""}{holding.change}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Column - Market Data */}
              <div className="xl:col-span-2 p-6 border-r border-gray-700/30">
                <div className="space-y-6">
                  
                  {/* Market Overview */}
                  <div>
                    <h3 className="text-white font-semibold mb-4 flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2 text-blue-400" />
                      Market Overview
                    </h3>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {cryptoData.slice(0, 6).map((crypto, index) => (
                        <motion.div
                          key={crypto.symbol}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: liveUpdate ? 1.02 : 1 }}
                          transition={{ duration: 0.2 }}
                          className="bg-gray-800/50 rounded-xl p-4 hover:bg-gray-800/70 transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center ${crypto.color}`}>
                                {crypto.symbol === "BTC" && <Bitcoin className="w-4 h-4" />}
                                {crypto.symbol === "ETH" && <DollarSign className="w-4 h-4" />}
                                {!["BTC", "ETH"].includes(crypto.symbol) && <Coins className="w-4 h-4" />}
                              </div>
                              <div className="text-white font-medium text-sm">{crypto.symbol}</div>
                            </div>
                            {liveUpdate && <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>}
                          </div>
                          
                          <div className="text-white font-semibold">
                            ${crypto.price.toLocaleString()}
                          </div>
                          
                          <div className={`flex items-center text-sm ${crypto.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {crypto.change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                            {crypto.change >= 0 ? "+" : ""}{crypto.change}%
                          </div>
                          
                          <div className="text-gray-400 text-xs mt-1">
                            Vol: ${(crypto.volume / 1000000).toFixed(1)}M
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Order Book Preview */}
                  <div>
                    <h4 className="text-white font-medium mb-3 flex items-center">
                      <LineChart className="w-4 h-4 mr-2 text-yellow-400" />
                      BTC/USD Order Book
                    </h4>
                    
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <div className="text-red-400 font-medium mb-2">Asks</div>
                          {orderBookData.asks.slice(0, 4).map((ask, index) => (
                            <div key={index} className="flex justify-between py-1 hover:bg-red-500/10">
                              <span className="text-red-400">${ask.price.toFixed(2)}</span>
                              <span className="text-gray-400">{ask.amount}</span>
                            </div>
                          ))}
                        </div>
                        <div>
                          <div className="text-green-400 font-medium mb-2">Bids</div>
                          {orderBookData.bids.slice(0, 4).map((bid, index) => (
                            <div key={index} className="flex justify-between py-1 hover:bg-green-500/10">
                              <span className="text-green-400">${bid.price.toFixed(2)}</span>
                              <span className="text-gray-400">{bid.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - AI Insights */}
              <div className="xl:col-span-1 p-6">
                <div className="space-y-6">
                  
                  {/* AI Insights */}
                  <div>
                    <h3 className="text-white font-semibold mb-4 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
                      AI Insights
                    </h3>
                    
                    <div className="space-y-3">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentInsightIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.5 }}
                          className={`p-4 rounded-xl border ${
                            aiInsights[currentInsightIndex].type === "bullish" ? "bg-green-500/10 border-green-500/20" :
                            aiInsights[currentInsightIndex].type === "bearish" ? "bg-red-500/10 border-red-500/20" :
                            aiInsights[currentInsightIndex].type === "alert" ? "bg-yellow-500/10 border-yellow-500/20" :
                            "bg-blue-500/10 border-blue-500/20"
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              aiInsights[currentInsightIndex].type === "bullish" ? "bg-green-500/20" :
                              aiInsights[currentInsightIndex].type === "bearish" ? "bg-red-500/20" :
                              aiInsights[currentInsightIndex].type === "alert" ? "bg-yellow-500/20" :
                              "bg-blue-500/20"
                            }`}>
                              {aiInsights[currentInsightIndex].type === "bullish" && <TrendingUp className="w-4 h-4 text-green-400" />}
                              {aiInsights[currentInsightIndex].type === "bearish" && <TrendingDown className="w-4 h-4 text-red-400" />}
                              {aiInsights[currentInsightIndex].type === "alert" && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                              {aiInsights[currentInsightIndex].type === "opportunity" && <Target className="w-4 h-4 text-blue-400" />}
                              {aiInsights[currentInsightIndex].type === "risk" && <Shield className="w-4 h-4 text-orange-400" />}
                            </div>
                            <div className="flex-1">
                              <div className="text-white text-sm mb-2">
                                {aiInsights[currentInsightIndex].message}
                              </div>
                              <div className="flex items-center space-x-4 text-xs text-gray-400">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{aiInsights[currentInsightIndex].timeframe}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Target className="w-3 h-3" />
                                  <span>{aiInsights[currentInsightIndex].confidence}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div>
                    <h4 className="text-white font-medium mb-3">Performance</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                        <span className="text-gray-400 text-sm">Risk Score</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-12 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="w-1/3 h-full bg-green-400"></div>
                          </div>
                          <span className="text-white text-sm">Low</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                        <span className="text-gray-400 text-sm">Sharpe Ratio</span>
                        <span className="text-white text-sm">2.34</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                        <span className="text-gray-400 text-sm">Max Drawdown</span>
                        <span className="text-red-400 text-sm">-12.5%</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold">
                      <Wallet className="w-4 h-4 mr-2" />
                      Launch Platform
                    </Button>
                    <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                      <Eye className="w-4 h-4 mr-2" />
                      Watch Demo
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Status Bar */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-t-0 border-gray-700/30 rounded-b-2xl p-3">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Connected to Binance, Coinbase Pro, Kraken</span>
                </div>
                <div>Last update: {new Date().toLocaleTimeString()}</div>
              </div>
              <div className="flex items-center space-x-4">
                <div>Latency: 12ms</div>
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-green-400" />
                  <span>Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
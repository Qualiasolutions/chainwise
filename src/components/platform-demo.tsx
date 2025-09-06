"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  Play, 
  TrendingUp, 
  TrendingDown, 
  Bitcoin, 
  Activity, 
  DollarSign,
  Bot,
  BarChart3,
  Zap,
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card"

const mockPortfolioData = [
  { symbol: "BTC", name: "Bitcoin", price: 65432, change: 5.23, color: "text-orange-400" },
  { symbol: "ETH", name: "Ethereum", price: 3247, change: -2.14, color: "text-blue-400" },
  { symbol: "SOL", name: "Solana", price: 198, change: 8.76, color: "text-purple-400" },
  { symbol: "ADA", name: "Cardano", price: 1.23, change: 3.45, color: "text-green-400" },
]

const aiMessages = [
  "📊 Bitcoin is showing strong bullish momentum...",
  "⚡ Detected whale movement in ETH markets",
  "🎯 Your portfolio is up 12.4% this month!",
  "📈 Solana breaking resistance at $195",
]

export default function PlatformDemo() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % aiMessages.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="py-20 chainwise-gradient relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Experience{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              ChainWise Live
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            See how our AI-powered platform transforms crypto investing with real-time insights, 
            portfolio analytics, and intelligent trading recommendations.
          </p>
        </div>

        {/* Interactive Demo Container */}
        <CardContainer className="inter-var mx-auto">
          <CardBody className="relative group/card w-full max-w-6xl mx-auto h-auto rounded-3xl">
            <CardItem
              translateZ="50"
              className="w-full"
            >
              <div className="bg-black/80 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-8 shadow-2xl">
                {/* Demo Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Dashboard Overview</h3>
                      <p className="text-sm text-gray-400">Live Demo Environment</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-xl flex items-center space-x-2 shadow-lg hover:shadow-purple-500/25"
                  >
                    {isPlaying ? <Eye className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? "Live View" : "Play Demo"}</span>
                  </Button>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Left Side - Portfolio Overview */}
                  <CardItem translateZ="30" className="space-y-6">
                    {/* Portfolio Value */}
                    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-6 border border-purple-500/20">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-white">Portfolio Value</h4>
                        <TrendingUp className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="text-3xl font-bold text-white mb-2">$234,567</div>
                      <div className="text-green-400 text-sm font-medium">+$12,443 (+5.62%) Today</div>
                    </div>

                    {/* Holdings List */}
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-white">Top Holdings</h4>
                      {mockPortfolioData.map((crypto, index) => (
                        <motion.div
                          key={crypto.symbol}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/30 hover:border-purple-500/30 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center ${crypto.color}`}>
                              {crypto.symbol === "BTC" && <Bitcoin className="w-5 h-5" />}
                              {crypto.symbol !== "BTC" && <DollarSign className="w-5 h-5" />}
                            </div>
                            <div>
                              <div className="text-white font-medium">{crypto.name}</div>
                              <div className="text-gray-400 text-sm">{crypto.symbol}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-semibold">${crypto.price.toLocaleString()}</div>
                            <div className={`text-sm font-medium flex items-center ${crypto.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                              {crypto.change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                              {crypto.change >= 0 ? "+" : ""}{crypto.change}%
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardItem>

                  {/* Right Side - AI Assistant & Analytics */}
                  <CardItem translateZ="30" className="space-y-6">
                    {/* AI Assistant */}
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-500/20">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white">AI Assistant</h4>
                          <div className="text-green-400 text-sm font-medium flex items-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                            Active
                          </div>
                        </div>
                      </div>
                      
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentMessageIndex}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.5 }}
                          className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30"
                        >
                          <p className="text-gray-200 text-sm leading-relaxed">
                            {aiMessages[currentMessageIndex]}
                          </p>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Live Chart Simulation */}
                    <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl p-6 border border-green-500/20">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-white">Market Analysis</h4>
                        <Activity className="w-5 h-5 text-green-400" />
                      </div>
                      
                      {/* Simulated Chart */}
                      <div className="relative h-32 bg-gray-800/30 rounded-xl overflow-hidden">
                        <div className="absolute inset-0 flex items-end justify-center space-x-1 p-4">
                          {[...Array(20)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.random() * 80 + 20}%` }}
                              transition={{ delay: i * 0.05, duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                              className="w-2 bg-gradient-to-t from-purple-600 to-blue-400 rounded-t"
                            />
                          ))}
                        </div>
                        <div className="absolute top-4 left-4">
                          <div className="text-green-400 font-semibold text-sm">+94.2% Accuracy</div>
                          <div className="text-gray-400 text-xs">AI Predictions</div>
                        </div>
                      </div>
                    </div>
                  </CardItem>
                </div>

                {/* Demo CTA */}
                <CardItem translateZ="20" className="mt-8 text-center">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button 
                      asChild
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-200"
                    >
                      <a href="/dashboard">
                        <Zap className="mr-2 w-4 h-4" />
                        Try Full Platform
                      </a>
                    </Button>
                    <Button 
                      asChild
                      className="border-2 border-purple-400/50 text-purple-400 hover:text-purple-300 hover:bg-purple-400/10 hover:border-purple-300/60 px-8 py-3 rounded-xl backdrop-blur-sm transition-all duration-200"
                    >
                      <a href="/chat">
                        <Bot className="mr-2 w-4 h-4" />
                        Chat with AI
                      </a>
                    </Button>
                  </div>
                </CardItem>
              </div>
            </CardItem>
          </CardBody>
        </CardContainer>
      </div>
    </div>
  )
}
"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Zap, Bitcoin, TrendingUp } from "lucide-react"

interface LoadingScreenProps {
  onLoadingComplete?: () => void
}

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 15 + 5
        if (newProgress >= 100) {
          clearInterval(timer)
          setIsComplete(true)
          setTimeout(() => {
            onLoadingComplete?.()
          }, 800)
          return 100
        }
        return newProgress
      })
    }, 200)

    return () => clearInterval(timer)
  }, [onLoadingComplete])

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black via-purple-950/20 to-black"
        >
          {/* Animated background effects */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "2s" }} />
          </div>

          <div className="relative z-10 flex flex-col items-center space-y-8">
            {/* Main Logo and Branding */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex items-center space-x-4"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-2xl border-2 border-purple-500/30"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  CHAINWISE
                </h1>
                <p className="text-sm text-gray-400">AI-Powered Crypto Intelligence</p>
              </div>
            </motion.div>

            {/* Floating Crypto Icons */}
            <div className="relative w-32 h-32">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <Bitcoin className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-6 text-orange-400" />
                <TrendingUp className="absolute top-1/2 right-0 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-5 h-5 rounded-full bg-purple-500" />
                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-4 h-4 rounded-full bg-blue-500" />
              </motion.div>
            </div>

            {/* Progress Bar */}
            <div className="w-80 space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Loading Platform</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
                />
              </div>
            </div>

            {/* Loading Messages */}
            <motion.div
              key={Math.floor(progress / 25)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <p className="text-gray-300">
                {progress < 25 && "Initializing AI Engine..."}
                {progress >= 25 && progress < 50 && "Loading Market Data..."}
                {progress >= 50 && progress < 75 && "Connecting to Exchanges..."}
                {progress >= 75 && progress < 100 && "Finalizing Setup..."}
                {progress >= 100 && "Welcome to ChainWise!"}
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
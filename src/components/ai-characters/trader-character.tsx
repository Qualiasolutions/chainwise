"use client"

import React from "react"
import { motion } from "framer-motion"
import { TrendingUp, Zap, BarChart3, DollarSign, Target } from "lucide-react"

export function TraderCharacter() {
  return (
    <div className="relative w-32 h-32 mx-auto">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-2xl animate-pulse" />
      
      {/* Main coin container */}
      <motion.div
        initial={{ scale: 0.9, rotateY: -15 }}
        animate={{ scale: 1, rotateY: 0 }}
        whileHover={{ scale: 1.1, rotateY: 180 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20,
          rotateY: { duration: 0.8, ease: "easeInOut" }
        }}
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Coin front face */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-300 via-pink-400 to-purple-500 shadow-2xl shadow-purple-500/50 border-4 border-purple-200/30">
          {/* Metallic rim effect */}
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-purple-400 via-pink-500 to-purple-600">
            {/* Inner coin design */}
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-purple-100 to-pink-50 flex items-center justify-center overflow-hidden">
              
              {/* Central trending up icon */}
              <div className="relative z-10 flex items-center justify-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotateZ: [0, -5, 5, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 3.5,
                    ease: "easeInOut"
                  }}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg"
                >
                  <TrendingUp className="w-7 h-7 text-white" />
                </motion.div>
              </div>

              {/* Decorative trading elements around the edge */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full"
              >
                <BarChart3 className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 text-purple-400" />
                <DollarSign className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-purple-400" />
                <Target className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 text-purple-400" />
                <Zap className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-purple-400" />
              </motion.div>

              {/* Trading chart visualization */}
              <div className="absolute inset-2 rounded-full overflow-hidden opacity-30">
                {/* Candlestick chart simulation */}
                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        height: i % 2 === 0 ? ["4px", "8px", "4px"] : ["6px", "4px", "6px"]
                      }}
                      transition={{ 
                        duration: 1.8, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: i * 0.2
                      }}
                      className={`w-0.5 rounded-sm ${
                        i % 2 === 0 ? 'bg-green-400' : 'bg-red-400'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Profit indicator */}
                <motion.div
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute top-1 right-1 text-[8px] text-green-400 font-bold"
                >
                  +24%
                </motion.div>
              </div>

              {/* Coin text */}
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs font-bold text-purple-600 tracking-wider">
                TRADE
              </div>
            </div>
          </div>

          {/* Coin ridges */}
          <div className="absolute inset-0 rounded-full">
            {[...Array(32)].map((_, i) => (
              <div
                key={i}
                className="absolute w-px h-2 bg-purple-200/40"
                style={{
                  top: '2px',
                  left: '50%',
                  transformOrigin: '0 62px',
                  transform: `rotate(${i * (360 / 32)}deg) translateX(-0.5px)`
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Floating performance indicator */}
        <motion.div
          animate={{ 
            y: [-5, -10, -5],
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-300/50"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </motion.div>
        
        {/* Base shadow */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-3 bg-purple-500/20 rounded-full blur-md" />
      </motion.div>
    </div>
  )
}
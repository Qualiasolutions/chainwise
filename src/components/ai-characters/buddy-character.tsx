"use client"

import React from "react"
import { motion } from "framer-motion"
import { MessageCircle, Heart, Sparkles } from "lucide-react"

export function BuddyCharacter() {
  return (
    <div className="relative w-32 h-32 mx-auto">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-500/20 rounded-full blur-2xl animate-pulse" />
      
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
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-300 via-emerald-400 to-green-500 shadow-2xl shadow-green-500/50 border-4 border-green-200/30">
          {/* Metallic rim effect */}
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-green-400 via-emerald-500 to-green-600">
            {/* Inner coin design */}
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-emerald-100 to-green-50 flex items-center justify-center overflow-hidden">
              
              {/* Central message icon */}
              <div className="relative z-10 flex items-center justify-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 3,
                    ease: "easeInOut"
                  }}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg"
                >
                  <MessageCircle className="w-6 h-6 text-white" />
                </motion.div>
              </div>

              {/* Decorative elements around the edge */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full"
              >
                <Sparkles className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 text-green-400" />
                <Heart className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-green-400 fill-green-400" />
                <Sparkles className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 text-green-400" />
                <Heart className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-green-400 fill-green-400" />
              </motion.div>

              {/* Coin text */}
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs font-bold text-green-600 tracking-wider">
                BUDDY
              </div>
            </div>
          </div>

          {/* Coin ridges */}
          <div className="absolute inset-0 rounded-full">
            {[...Array(32)].map((_, i) => (
              <div
                key={i}
                className="absolute w-px h-2 bg-green-200/40"
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
        
        {/* Floating indicator */}
        <motion.div
          animate={{ 
            y: [-4, -8, -4],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-green-300/50"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </motion.div>
        
        {/* Base shadow */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-3 bg-green-500/20 rounded-full blur-md" />
      </motion.div>
    </div>
  )
}
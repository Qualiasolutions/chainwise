"use client"

import React from "react"
import { motion } from "framer-motion"
import { GraduationCap, BookOpen, Brain, TrendingUp } from "lucide-react"

export function ProfessorCharacter() {
  return (
    <div className="relative w-32 h-32 mx-auto">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 rounded-full blur-2xl animate-pulse" />
      
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
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-300 via-indigo-400 to-blue-500 shadow-2xl shadow-blue-500/50 border-4 border-blue-200/30">
          {/* Metallic rim effect */}
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-blue-400 via-indigo-500 to-blue-600">
            {/* Inner coin design */}
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center overflow-hidden">
              
              {/* Central graduation cap icon */}
              <div className="relative z-10 flex items-center justify-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotateZ: [-2, 2, -2]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 4,
                    ease: "easeInOut"
                  }}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg"
                >
                  <GraduationCap className="w-7 h-7 text-white" />
                </motion.div>
              </div>

              {/* Decorative academic elements around the edge */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full"
              >
                <BookOpen className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 text-blue-400" />
                <Brain className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-blue-400" />
                <TrendingUp className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 text-blue-400" />
                <BookOpen className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-blue-400" />
              </motion.div>

              {/* Academic data visualization */}
              <div className="absolute inset-2 rounded-full overflow-hidden opacity-30">
                <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ["4px", "10px", "4px"] }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: i * 0.3
                      }}
                      className="w-0.5 bg-blue-400 rounded-full"
                    />
                  ))}
                </div>
              </div>

              {/* Coin text */}
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs font-bold text-blue-600 tracking-wider">
                PROF
              </div>
            </div>
          </div>

          {/* Coin ridges */}
          <div className="absolute inset-0 rounded-full">
            {[...Array(32)].map((_, i) => (
              <div
                key={i}
                className="absolute w-px h-2 bg-blue-200/40"
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
        
        {/* Floating analytics indicator */}
        <motion.div
          animate={{ 
            y: [-4, -8, -4],
            rotate: [0, -15, 15, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg border-2 border-blue-300/50"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </motion.div>
        
        {/* Base shadow */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-3 bg-blue-500/20 rounded-full blur-md" />
      </motion.div>
    </div>
  )
}
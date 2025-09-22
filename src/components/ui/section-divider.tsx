"use client";

import { motion } from "framer-motion";

interface SectionDividerProps {
  variant?: "gradient" | "dots" | "wave" | "geometric";
  className?: string;
}

export function SectionDivider({ variant = "gradient", className = "" }: SectionDividerProps) {
  const baseClasses = "w-full relative overflow-hidden";

  const renderDivider = () => {
    switch (variant) {
      case "gradient":
        return (
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        );

      case "dots":
        return (
          <div className="flex justify-center items-center gap-2 py-8">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0.3 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
                className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-blue-400"
              />
            ))}
          </div>
        );

      case "wave":
        return (
          <div className="relative h-16">
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.6 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                d="M0,60 C300,100 900,20 1200,60 L1200,60 L0,60 Z"
                fill="none"
                stroke="url(#waveGradient)"
                strokeWidth="2"
              />
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0" />
                  <stop offset="50%" stopColor="rgb(139, 92, 246)" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        );

      case "geometric":
        return (
          <div className="flex justify-center items-center py-12">
            <motion.div
              initial={{ rotate: 0, scale: 0.8, opacity: 0 }}
              whileInView={{ rotate: 180, scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              {/* Outer ring */}
              <div className="w-16 h-16 rounded-full border-2 border-gradient-to-r from-purple-400 to-blue-400 p-2">
                {/* Inner diamond */}
                <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 rotate-45 rounded-sm backdrop-blur-sm" />
              </div>
              {/* Animated particles */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-purple-400 rounded-full"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: `translate(-50%, -50%) rotate(${i * 90}deg) translateY(-24px)`
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`${baseClasses} ${className}`}>
      {renderDivider()}
    </div>
  );
}
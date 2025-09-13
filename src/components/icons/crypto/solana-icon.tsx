"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SolanaIconProps {
  className?: string;
  size?: number;
  animated?: boolean;
  glowEffect?: boolean;
}

export const SolanaIcon: React.FC<SolanaIconProps> = ({ 
  className, 
  size = 32, 
  animated = false,
  glowEffect = false 
}) => {
  const MotionSvg = animated ? motion.svg : 'svg';
  
  const animationProps = animated ? {
    animate: { 
      rotate: 360,
      scale: [1, 1.1, 1]
    },
    transition: { 
      rotate: { duration: 22, repeat: Infinity, ease: "linear" },
      scale: { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
    }
  } : {};

  return (
    <MotionSvg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn(
        "crypto-icon",
        glowEffect && "drop-shadow-[0_0_8px_rgba(156,72,255,0.6)]",
        className
      )}
      {...animationProps}
    >
      <defs>
        <linearGradient id="solana-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9c48ff" />
          <stop offset="50%" stopColor="#00d4aa" />
          <stop offset="100%" stopColor="#7928ca" />
        </linearGradient>
        <filter id="solana-glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <circle 
        cx="16" 
        cy="16" 
        r="15" 
        fill="url(#solana-gradient)" 
        filter={glowEffect ? "url(#solana-glow)" : undefined}
      />
      
      {/* Solana logo paths */}
      <g fill="white">
        <path d="M7.5 20.5l2-2h15l-2 2h-15z" />
        <path d="M7.5 15.5h15l-2-2h-15l2 2z" />
        <path d="M9.5 11.5h15l-2-2h-15l2 2z" />
      </g>
    </MotionSvg>
  );
};
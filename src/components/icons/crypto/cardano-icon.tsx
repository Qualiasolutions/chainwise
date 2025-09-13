"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardanoIconProps {
  className?: string;
  size?: number;
  animated?: boolean;
  glowEffect?: boolean;
}

export const CardanoIcon: React.FC<CardanoIconProps> = ({ 
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
      rotate: { duration: 24, repeat: Infinity, ease: "linear" },
      scale: { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
    }
  } : {};

  return (
    <MotionSvg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn(
        "crypto-icon",
        glowEffect && "drop-shadow-[0_0_8px_rgba(0,51,173,0.6)]",
        className
      )}
      {...animationProps}
    >
      <defs>
        <linearGradient id="cardano-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0033ad" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
        <filter id="cardano-glow">
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
        fill="url(#cardano-gradient)" 
        filter={glowEffect ? "url(#cardano-glow)" : undefined}
      />
      
      {/* Cardano logo - simplified circular pattern */}
      <g fill="white">
        <circle cx="16" cy="8" r="1.5" />
        <circle cx="11" cy="12" r="1.2" />
        <circle cx="21" cy="12" r="1.2" />
        <circle cx="8" cy="16" r="1" />
        <circle cx="16" cy="16" r="2" />
        <circle cx="24" cy="16" r="1" />
        <circle cx="11" cy="20" r="1.2" />
        <circle cx="21" cy="20" r="1.2" />
        <circle cx="16" cy="24" r="1.5" />
      </g>
    </MotionSvg>
  );
};
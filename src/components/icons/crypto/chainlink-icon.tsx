"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChainlinkIconProps {
  className?: string;
  size?: number;
  animated?: boolean;
  glowEffect?: boolean;
}

export const ChainlinkIcon: React.FC<ChainlinkIconProps> = ({ 
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
      rotate: { duration: 19, repeat: Infinity, ease: "linear" },
      scale: { duration: 2.9, repeat: Infinity, ease: "easeInOut" }
    }
  } : {};

  return (
    <MotionSvg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn(
        "crypto-icon",
        glowEffect && "drop-shadow-[0_0_8px_rgba(55,111,255,0.6)]",
        className
      )}
      {...animationProps}
    >
      <defs>
        <linearGradient id="chainlink-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#376fff" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <filter id="chainlink-glow">
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
        fill="url(#chainlink-gradient)" 
        filter={glowEffect ? "url(#chainlink-glow)" : undefined}
      />
      
      {/* Chainlink hexagonal pattern */}
      <g fill="white">
        <polygon points="16,6 21,9 21,15 16,18 11,15 11,9" fillOpacity="0.9" />
        <polygon points="16,14 19,16 19,20 16,22 13,20 13,16" fillOpacity="0.6" />
        <polygon points="16,10 18,11 18,13 16,14 14,13 14,11" />
      </g>
    </MotionSvg>
  );
};
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EthereumIconProps {
  className?: string;
  size?: number;
  animated?: boolean;
  glowEffect?: boolean;
}

export const EthereumIcon: React.FC<EthereumIconProps> = ({ 
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
      rotate: { duration: 18, repeat: Infinity, ease: "linear" },
      scale: { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
    }
  } : {};

  return (
    <MotionSvg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn(
        "crypto-icon",
        glowEffect && "drop-shadow-[0_0_8px_rgba(98,126,234,0.6)]",
        className
      )}
      {...animationProps}
    >
      <defs>
        <linearGradient id="ethereum-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#627eea" />
          <stop offset="100%" stopColor="#4c6ef5" />
        </linearGradient>
        <filter id="ethereum-glow">
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
        fill="url(#ethereum-gradient)" 
        filter={glowEffect ? "url(#ethereum-glow)" : undefined}
      />
      
      {/* Ethereum diamond symbol */}
      <g fill="white" fillOpacity="0.8">
        <polygon points="16,4 23.5,15.2 16,19.5 8.5,15.2" />
        <polygon points="16,20.9 23.5,16.6 16,28 8.5,16.6" fillOpacity="0.6" />
        <polygon points="16,4 16,19.5 23.5,15.2" fillOpacity="0.2" />
        <polygon points="16,20.9 16,28 23.5,16.6" fillOpacity="0.8" />
      </g>
    </MotionSvg>
  );
};
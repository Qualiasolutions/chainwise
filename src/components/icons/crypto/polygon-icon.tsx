"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PolygonIconProps {
  className?: string;
  size?: number;
  animated?: boolean;
  glowEffect?: boolean;
}

export const PolygonIcon: React.FC<PolygonIconProps> = ({ 
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
      rotate: { duration: 16, repeat: Infinity, ease: "linear" },
      scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
    }
  } : {};

  return (
    <MotionSvg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn(
        "crypto-icon",
        glowEffect && "drop-shadow-[0_0_8px_rgba(130,71,229,0.6)]",
        className
      )}
      {...animationProps}
    >
      <defs>
        <linearGradient id="polygon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8247e5" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <filter id="polygon-glow">
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
        fill="url(#polygon-gradient)" 
        filter={glowEffect ? "url(#polygon-glow)" : undefined}
      />
      
      {/* Polygon logo - geometric pattern */}
      <g fill="white">
        <path d="M12 8l4 2.3v4.6L12 17l-4-2.3V10.3L12 8z" />
        <path d="M20 12l4 2.3v4.6L20 21l-4-2.3V14.3L20 12z" />
        <path d="M12 16l4 2.3v4.6L12 25l-4-2.3V18.3L12 16z" />
      </g>
    </MotionSvg>
  );
};
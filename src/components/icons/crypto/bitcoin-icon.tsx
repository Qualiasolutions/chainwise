"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BitcoinIconProps {
  className?: string;
  size?: number;
  animated?: boolean;
  glowEffect?: boolean;
}

export const BitcoinIcon: React.FC<BitcoinIconProps> = ({ 
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
      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
      scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    }
  } : {};

  return (
    <MotionSvg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn(
        "crypto-icon",
        glowEffect && "drop-shadow-[0_0_8px_rgba(247,147,26,0.6)]",
        className
      )}
      {...animationProps}
    >
      <defs>
        <linearGradient id="bitcoin-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f7931a" />
          <stop offset="100%" stopColor="#ff6b35" />
        </linearGradient>
        <filter id="bitcoin-glow">
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
        fill="url(#bitcoin-gradient)" 
        filter={glowEffect ? "url(#bitcoin-glow)" : undefined}
      />
      
      {/* Bitcoin B symbol */}
      <path
        d="M12.116 8.112V7h2.072v1.112h1.424V7h2.072v1.112h3.536v1.936h-1.0v10.704h1.0v1.936h-3.536V23.5h-2.072v-1.4h-1.424V23.5h-2.072v-1.4H8.536v-1.936h1.0V10.048h-1.0V8.112h3.08Zm2.6 2.56v2.656h2.688c.736 0 1.344-.608 1.344-1.328s-.608-1.328-1.344-1.328H14.716Zm0 4.384v2.976h3.008c.8 0 1.472-.608 1.472-1.488s-.672-1.488-1.472-1.488H14.716Z"
        fill="white"
      />
    </MotionSvg>
  );
};
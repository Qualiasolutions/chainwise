"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { cryptoIcons } from "@/components/icons/crypto";

interface FloatingCoin {
  id: string;
  Icon: React.ComponentType<any>;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

interface CryptoBackgroundProps {
  intensity?: 'light' | 'medium' | 'heavy';
  className?: string;
}

export const CryptoBackground: React.FC<CryptoBackgroundProps> = ({
  intensity = 'medium',
  className = ''
}) => {
  const [floatingCoins, setFloatingCoins] = useState<FloatingCoin[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const coinCounts = {
    light: 8,
    medium: 12,
    heavy: 18
  };

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const generateCoins = (): FloatingCoin[] => {
      const coins: FloatingCoin[] = [];
      const coinCount = coinCounts[intensity];

      for (let i = 0; i < coinCount; i++) {
        const iconData = cryptoIcons[i % cryptoIcons.length];
        
        coins.push({
          id: `coin-${i}`,
          Icon: iconData.component,
          x: Math.random() * dimensions.width,
          y: Math.random() * dimensions.height,
          size: Math.random() * 40 + 20, // 20-60px
          duration: Math.random() * 20 + 10, // 10-30 seconds
          delay: Math.random() * 5, // 0-5 second delay
          color: iconData.color
        });
      }
      
      return coins;
    };

    setFloatingCoins(generateCoins());
  }, [dimensions, intensity]);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/20 via-purple-50/10 to-blue-50/20 dark:from-cyan-950/20 dark:via-purple-950/10 dark:to-blue-950/20" />
      
      {/* Floating crypto coins */}
      {floatingCoins.map((coin) => (
        <motion.div
          key={coin.id}
          className="absolute"
          initial={{
            x: coin.x,
            y: coin.y,
            rotate: 0,
            opacity: 0.1
          }}
          animate={{
            x: [coin.x, coin.x + 50, coin.x - 30, coin.x + 20, coin.x],
            y: [coin.y, coin.y - 40, coin.y + 20, coin.y - 60, coin.y],
            rotate: [0, 360],
            opacity: [0.1, 0.4, 0.2, 0.3, 0.1]
          }}
          transition={{
            duration: coin.duration,
            repeat: Infinity,
            delay: coin.delay,
            ease: "easeInOut"
          }}
        >
          <coin.Icon 
            size={coin.size} 
            animated={true}
            glowEffect={Math.random() > 0.7} // Random glow effect
            className="opacity-60"
          />
        </motion.div>
      ))}

      {/* Animated particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"
            initial={{
              x: Math.random() * dimensions.width,
              y: Math.random() * dimensions.height,
              scale: 0
            }}
            animate={{
              x: Math.random() * dimensions.width,
              y: Math.random() * dimensions.height,
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: Math.random() * 8 + 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
};
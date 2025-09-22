"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"

interface CryptoIcon {
  id: string
  name: string
  symbol: string
  image: string
  x: number
  y: number
  size: number
  delay: number
  opacity: number
}

interface CryptoIconsBackgroundProps {
  className?: string
  density?: "low" | "medium" | "high"
  interactive?: boolean
}

// Real cryptocurrency data with actual CoinGecko image URLs
const cryptoData = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png"
  },
  {
    id: "binancecoin",
    name: "BNB",
    symbol: "BNB",
    image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png"
  },
  {
    id: "ripple",
    name: "XRP",
    symbol: "XRP",
    image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png"
  },
  {
    id: "cardano",
    name: "Cardano",
    symbol: "ADA",
    image: "https://assets.coingecko.com/coins/images/975/large/cardano.png"
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png"
  },
  {
    id: "dogecoin",
    name: "Dogecoin",
    symbol: "DOGE",
    image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png"
  },
  {
    id: "polygon",
    name: "Polygon",
    symbol: "MATIC",
    image: "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png"
  },
  {
    id: "chainlink",
    name: "Chainlink",
    symbol: "LINK",
    image: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png"
  },
  {
    id: "polkadot",
    name: "Polkadot",
    symbol: "DOT",
    image: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png"
  }
]

const densityMap = {
  low: 8,
  medium: 12,
  high: 16
}

export function CryptoIconsBackground({
  className = "",
  density = "medium",
  interactive = true
}: CryptoIconsBackgroundProps) {
  const [icons, setIcons] = useState<CryptoIcon[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Initialize crypto icons
  useEffect(() => {
    if (typeof window === "undefined") return

    const count = densityMap[density]
    const newIcons: CryptoIcon[] = []

    for (let i = 0; i < count; i++) {
      const crypto = cryptoData[i % cryptoData.length]
      newIcons.push({
        ...crypto,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 24 + 32, // 32-56px
        delay: Math.random() * 2,
        opacity: Math.random() * 0.4 + 0.1 // 0.1-0.5
      })
    }

    setIcons(newIcons)
  }, [density])

  // Handle mouse movement for interactive effects
  useEffect(() => {
    if (!interactive) return

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [interactive])

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {icons.map((icon, index) => (
        <motion.div
          key={`${icon.id}-${index}`}
          className="absolute pointer-events-none"
          style={{
            left: icon.x,
            top: icon.y,
            opacity: icon.opacity
          }}
          initial={{
            scale: 0,
            rotate: 0,
            opacity: 0
          }}
          animate={{
            scale: 1,
            rotate: 360,
            opacity: icon.opacity,
            y: [0, -20, 0],
            x: interactive ? [
              0,
              (mousePosition.x - icon.x) * 0.01,
              0
            ] : [0, Math.sin(Date.now() * 0.001 + index) * 10, 0]
          }}
          transition={{
            scale: {
              duration: 0.8,
              delay: icon.delay,
              ease: "easeOut"
            },
            rotate: {
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear"
            },
            y: {
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: icon.delay
            },
            x: {
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: icon.delay
            },
            opacity: {
              duration: 0.5,
              delay: icon.delay
            }
          }}
        >
          <div
            className="rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-lg"
            style={{
              width: icon.size,
              height: icon.size
            }}
          >
            <img
              src={icon.image}
              alt={icon.name}
              className="rounded-full"
              style={{
                width: icon.size * 0.7,
                height: icon.size * 0.7
              }}
              onError={(e) => {
                // Fallback to symbol text if image fails
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                target.parentElement!.innerHTML = `
                  <div class="text-white/60 font-bold text-xs flex items-center justify-center w-full h-full">
                    ${icon.symbol}
                  </div>
                `
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
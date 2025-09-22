"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useEffect, useState, useMemo } from "react"
import { Bitcoin, Coins, TrendingUp, Zap, DollarSign, Target, BarChart3, Shield } from "lucide-react"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  speed: number
  angle: number
  opacity: number
  icon: React.ComponentType<any>
  color: string
}

interface FloatingParticlesProps {
  className?: string
  count?: number
  speed?: "slow" | "normal" | "fast"
  size?: "sm" | "md" | "lg"
  variant?: "crypto" | "finance" | "mixed"
  interactive?: boolean
  density?: "low" | "medium" | "high"
}

const cryptoIcons = [Bitcoin, Coins, TrendingUp, Zap, DollarSign, Target, BarChart3, Shield]

const colorPalettes = {
  crypto: [
    "text-orange-400", // Bitcoin orange
    "text-blue-400",   // Ethereum blue
    "text-purple-400", // Generic crypto purple
    "text-green-400",  // Success green
    "text-yellow-400"  // Gold/warning
  ],
  finance: [
    "text-emerald-400",
    "text-blue-400",
    "text-indigo-400",
    "text-cyan-400",
    "text-teal-400"
  ],
  mixed: [
    "text-orange-400",
    "text-blue-400",
    "text-purple-400",
    "text-green-400",
    "text-yellow-400",
    "text-emerald-400",
    "text-cyan-400",
    "text-indigo-400"
  ]
}

const speedMultipliers = {
  slow: 0.5,
  normal: 1,
  fast: 2
}

const sizeMultipliers = {
  sm: 0.7,
  md: 1,
  lg: 1.4
}

const densityMap = {
  low: 15,
  medium: 25,
  high: 40
}

export function FloatingParticles({
  className,
  count: propCount,
  speed = "normal",
  size = "md",
  variant = "crypto",
  interactive = true,
  density = "medium",
  ...props
}: FloatingParticlesProps) {
  const count = propCount || densityMap[density]
  const [particles, setParticles] = useState<Particle[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  const colors = colorPalettes[variant]
  const speedMultiplier = speedMultipliers[speed]
  const sizeMultiplier = sizeMultipliers[size]

  // Initialize particles
  const initialParticles = useMemo(() => {
    if (typeof window === "undefined") return []

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
      y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
      size: (Math.random() * 20 + 10) * sizeMultiplier,
      speed: (Math.random() * 0.5 + 0.3) * speedMultiplier,
      angle: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.6 + 0.2,
      icon: cryptoIcons[Math.floor(Math.random() * cryptoIcons.length)],
      color: colors[Math.floor(Math.random() * colors.length)]
    }))
  }, [count, sizeMultiplier, speedMultiplier, colors])

  useEffect(() => {
    setParticles(initialParticles)
  }, [initialParticles])

  // Handle mouse movement for interactivity
  useEffect(() => {
    if (!interactive) return

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    const handleResize = () => {
      setContainerSize({
        width: typeof window !== 'undefined' ? window.innerWidth : 1200,
        height: typeof window !== 'undefined' ? window.innerHeight : 800
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("resize", handleResize)
    handleResize()

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
    }
  }, [interactive])

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return

    const animateParticles = () => {
      setParticles(prevParticles =>
        prevParticles.map(particle => {
          let newX = particle.x + Math.cos(particle.angle) * particle.speed
          let newY = particle.y + Math.sin(particle.angle) * particle.speed

          // Interactive mouse repulsion
          if (interactive) {
            const dx = mousePosition.x - newX
            const dy = mousePosition.y - newY
            const distance = Math.sqrt(dx * dx + dy * dy)
            const repulsionRadius = 100

            if (distance < repulsionRadius) {
              const force = (repulsionRadius - distance) / repulsionRadius
              newX -= (dx / distance) * force * 3
              newY -= (dy / distance) * force * 3
            }
          }

          // Boundary wrapping
          if (newX < -50) newX = containerSize.width + 50
          if (newX > containerSize.width + 50) newX = -50
          if (newY < -50) newY = containerSize.height + 50
          if (newY > containerSize.height + 50) newY = -50

          return {
            ...particle,
            x: newX,
            y: newY,
            angle: particle.angle + (Math.random() - 0.5) * 0.02
          }
        })
      )
    }

    const interval = setInterval(animateParticles, 16) // ~60fps
    return () => clearInterval(interval)
  }, [particles.length, mousePosition, interactive, containerSize])

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className
      )}
      {...props}
    >
      {particles.map(particle => {
        const IconComponent = particle.icon
        return (
          <motion.div
            key={particle.id}
            className={cn(
              "absolute pointer-events-none",
              particle.color
            )}
            style={{
              left: particle.x,
              top: particle.y,
              opacity: particle.opacity
            }}
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              scale: {
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut"
              },
              rotate: {
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                ease: "linear"
              }
            }}
          >
            <IconComponent
              size={particle.size}
              className="drop-shadow-sm"
            />
          </motion.div>
        )
      })}
    </div>
  )
}

// Constellation effect - connects nearby particles with lines
interface ConstellationProps {
  className?: string
  connectionDistance?: number
  maxConnections?: number
  lineOpacity?: number
  animated?: boolean
}

export function Constellation({
  className,
  connectionDistance = 150,
  maxConnections = 3,
  lineOpacity = 0.1,
  animated = true,
  ...props
}: ConstellationProps) {
  const [points, setPoints] = useState<Array<{ x: number; y: number; id: number }>>([])
  const [connections, setConnections] = useState<Array<{ from: number; to: number }>>([])

  useEffect(() => {
    // Generate random points
    const newPoints = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
      y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)
    }))
    setPoints(newPoints)

    // Calculate connections
    const newConnections: Array<{ from: number; to: number }> = []
    newPoints.forEach(point => {
      const nearbyPoints = newPoints
        .filter(other => other.id !== point.id)
        .map(other => ({
          ...other,
          distance: Math.sqrt(
            Math.pow(point.x - other.x, 2) + Math.pow(point.y - other.y, 2)
          )
        }))
        .filter(other => other.distance < connectionDistance)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, maxConnections)

      nearbyPoints.forEach(nearby => {
        if (!newConnections.some(conn =>
          (conn.from === point.id && conn.to === nearby.id) ||
          (conn.from === nearby.id && conn.to === point.id)
        )) {
          newConnections.push({ from: point.id, to: nearby.id })
        }
      })
    })
    setConnections(newConnections)
  }, [connectionDistance, maxConnections])

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className
      )}
      {...props}
    >
      <svg className="w-full h-full">
        {connections.map((connection, index) => {
          const fromPoint = points.find(p => p.id === connection.from)
          const toPoint = points.find(p => p.id === connection.to)

          if (!fromPoint || !toPoint) return null

          return (
            <motion.line
              key={index}
              x1={fromPoint.x}
              y1={fromPoint.y}
              x2={toPoint.x}
              y2={toPoint.y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-primary/20"
              style={{ opacity: lineOpacity }}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={animated ? {
                pathLength: 1,
                opacity: lineOpacity,
                strokeDasharray: ["0 100", "20 80", "0 100"]
              } : { pathLength: 1, opacity: lineOpacity }}
              transition={{
                duration: 2,
                repeat: animated ? Infinity : 0,
                repeatType: "reverse",
                delay: index * 0.1
              }}
            />
          )
        })}

        {points.map(point => (
          <motion.circle
            key={point.id}
            cx={point.x}
            cy={point.y}
            r="2"
            fill="currentColor"
            className="text-primary/40"
            animate={animated ? {
              scale: [1, 1.5, 1],
              opacity: [0.4, 0.8, 0.4]
            } : {}}
            transition={{
              duration: 2,
              repeat: animated ? Infinity : 0,
              delay: point.id * 0.1
            }}
          />
        ))}
      </svg>
    </div>
  )
}

// Gradient orbs that move around
interface GradientOrbsProps {
  className?: string
  count?: number
  size?: "sm" | "md" | "lg"
  speed?: "slow" | "normal" | "fast"
  colors?: string[]
}

export function GradientOrbs({
  className,
  count = 3,
  size = "lg",
  speed = "slow",
  colors = ["from-purple-400/20", "from-blue-400/20", "from-green-400/20"],
  ...props
}: GradientOrbsProps) {
  const sizeMap = {
    sm: "w-32 h-32",
    md: "w-48 h-48",
    lg: "w-64 h-64"
  }

  const speedMap = {
    slow: 20,
    normal: 15,
    fast: 10
  }

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className
      )}
      {...props}
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            "absolute rounded-full blur-3xl",
            sizeMap[size],
            "bg-gradient-radial",
            colors[i % colors.length],
            "to-transparent"
          )}
          animate={{
            x: [
              Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200)
            ],
            y: [
              Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)
            ]
          }}
          transition={{
            duration: speedMap[speed] + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}
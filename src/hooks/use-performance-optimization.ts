'use client'

import { useState, useEffect, useCallback } from 'react'

interface PerformanceOptions {
  reducedMotion?: boolean
  lowPowerMode?: boolean
  connectionSpeed?: 'slow' | 'fast' | 'unknown'
}

export function usePerformanceOptimization() {
  const [performanceOptions, setPerformanceOptions] = useState<PerformanceOptions>({
    reducedMotion: false,
    lowPowerMode: false,
    connectionSpeed: 'unknown'
  })

  useEffect(() => {
    // Check for reduced motion preference
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Check for low power mode (if available)
    let lowPowerMode = false
    if ('getBattery' in navigator) {
      // @ts-ignore - getBattery is experimental
      navigator.getBattery?.().then((battery: any) => {
        lowPowerMode = battery.level < 0.2 || battery.charging === false
        setPerformanceOptions(prev => ({ ...prev, lowPowerMode }))
      })
    }

    // Check connection speed
    let connectionSpeed: 'slow' | 'fast' | 'unknown' = 'unknown'
    // @ts-ignore - connection is experimental
    if ('connection' in navigator && navigator.connection) {
      // @ts-ignore
      const conn = navigator.connection
      const slowConnections = ['slow-2g', '2g', '3g']
      connectionSpeed = slowConnections.includes(conn.effectiveType) ? 'slow' : 'fast'
    }

    setPerformanceOptions({
      reducedMotion,
      lowPowerMode,
      connectionSpeed
    })
  }, [])

  const getOptimizedAnimationProps = useCallback((baseProps: any) => {
    if (performanceOptions.reducedMotion) {
      return {
        ...baseProps,
        transition: { duration: 0.1 },
        animate: baseProps.animate,
        initial: baseProps.animate // Skip initial animation
      }
    }

    if (performanceOptions.lowPowerMode || performanceOptions.connectionSpeed === 'slow') {
      return {
        ...baseProps,
        transition: {
          ...baseProps.transition,
          duration: (baseProps.transition?.duration || 0.5) * 0.5 // Reduce duration by half
        }
      }
    }

    return baseProps
  }, [performanceOptions])

  const shouldReduceEffects = performanceOptions.reducedMotion || 
                             performanceOptions.lowPowerMode || 
                             performanceOptions.connectionSpeed === 'slow'

  const getOptimizedBlur = useCallback((baseBlur: string) => {
    if (shouldReduceEffects) {
      // Reduce blur amount for performance
      const blurValue = parseFloat(baseBlur.replace('blur(', '').replace('px)', ''))
      return `blur(${Math.max(4, blurValue * 0.5)}px)`
    }
    return baseBlur
  }, [shouldReduceEffects])

  const getOptimizedClasses = useCallback((baseClasses: string) => {
    let classes = baseClasses
    
    if (shouldReduceEffects) {
      classes += ' reduce-animations'
    } else {
      classes += ' optimize-animations smooth-animation'
    }

    // Add mobile optimization classes
    if (window.innerWidth <= 768) {
      classes += ' mobile-optimized-blur'
    }

    return classes
  }, [shouldReduceEffects])

  return {
    performanceOptions,
    shouldReduceEffects,
    getOptimizedAnimationProps,
    getOptimizedBlur,
    getOptimizedClasses
  }
}
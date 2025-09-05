'use client'

import { Suspense, lazy, useState, useRef, useEffect } from 'react'
import { Bot, RefreshCw, AlertTriangle } from 'lucide-react'

const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene?: string
  className?: string
  fallbackMessage?: string
  enableIntersectionObserver?: boolean
}

export function SplineScene({ 
  scene = process.env.NEXT_PUBLIC_SPLINE_SCENE_URL || "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode",
  className = "",
  fallbackMessage = "Interactive 3D experience",
  enableIntersectionObserver = true
}: SplineSceneProps) {
  const [hasError, setHasError] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isVisible, setIsVisible] = useState(!enableIntersectionObserver)
  const containerRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for performance
  useEffect(() => {
    if (!enableIntersectionObserver || !containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [enableIntersectionObserver])

  const handleRetry = async () => {
    if (retryCount >= 3) return
    
    setIsRetrying(true)
    setHasError(false)
    setRetryCount(prev => prev + 1)
    
    // Wait a bit before retrying
    setTimeout(() => {
      setIsRetrying(false)
    }, 1000)
  }

  const LoadingSpinner = () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-crypto-primary/20 border-t-crypto-primary rounded-full animate-spin" />
        <div className="absolute inset-0 w-16 h-16 border-4 border-crypto-secondary/20 border-b-crypto-secondary rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
    </div>
  )

  const ErrorFallback = () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-800/50 rounded-lg border border-slate-700/50">
      <div className="text-center p-8">
        <div className="w-20 h-20 mx-auto mb-4 bg-crypto-primary/10 rounded-full flex items-center justify-center">
          <Bot className="w-10 h-10 text-crypto-primary" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">3D Experience Unavailable</h3>
        <p className="text-sm text-slate-400 mb-4 max-w-sm">
          {retryCount >= 3 
            ? "Unable to load the interactive 3D robot. Please check your connection and refresh the page." 
            : "Having trouble loading the 3D scene."}
        </p>
        {retryCount < 3 && (
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 px-4 py-2 bg-crypto-primary/20 hover:bg-crypto-primary/30 text-crypto-primary rounded-lg transition-colors disabled:opacity-50"
            aria-label="Retry loading 3D scene"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </button>
        )}
      </div>
    </div>
  )

  const ReducedMotionFallback = () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-crypto-primary/10 to-crypto-secondary/10 rounded-lg border border-slate-700/50">
      <div className="text-center p-8">
        <div className="w-24 h-24 mx-auto mb-4 bg-crypto-primary/20 rounded-full flex items-center justify-center">
          <Bot className="w-12 h-12 text-crypto-primary" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">ChainWise AI Assistant</h3>
        <p className="text-sm text-slate-400 max-w-sm">
          {fallbackMessage}
        </p>
      </div>
    </div>
  )

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    return (
      <div ref={containerRef} className={className} role="img" aria-label={fallbackMessage}>
        <ReducedMotionFallback />
      </div>
    )
  }

  if (hasError) {
    return (
      <div ref={containerRef} className={className}>
        <ErrorFallback />
      </div>
    )
  }

  if (!isVisible) {
    return (
      <div ref={containerRef} className={className}>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div ref={containerRef} className={className}>
      <Suspense fallback={<LoadingSpinner />}>
        <Spline
          scene={scene}
          className="w-full h-full"
          onLoad={() => setHasError(false)}
          onError={() => setHasError(true)}
          role="img"
          aria-label={fallbackMessage}
        />
      </Suspense>
    </div>
  )
}
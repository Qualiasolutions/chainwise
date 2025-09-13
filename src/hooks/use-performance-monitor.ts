import React, { useEffect, useRef, useCallback, useState } from 'react'
import { logger } from '@/lib/enhanced-logger'

export interface PerformanceMetrics {
  renderTime: number
  memoryUsage?: number
  componentMounts: number
  rerenderCount: number
  lastRenderReason?: string
}

export interface PerformanceThresholds {
  maxRenderTime: number
  maxMemoryUsage?: number
  maxRerenders: number
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  maxRenderTime: 16, // 60fps
  maxMemoryUsage: 50 * 1024 * 1024, // 50MB
  maxRerenders: 10
}

export function usePerformanceMonitor(
  componentName: string,
  thresholds: Partial<PerformanceThresholds> = {}
) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentMounts: 0,
    rerenderCount: 0
  })
  
  const renderStartTime = useRef<number>(0)
  const mountCount = useRef<number>(0)
  const rerenderCount = useRef<number>(0)
  const lastProps = useRef<any>()
  const lastState = useRef<any>()
  const finalThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds }

  const startRenderMeasurement = useCallback(() => {
    renderStartTime.current = performance.now()
  }, [])

  const endRenderMeasurement = useCallback(() => {
    const renderTime = performance.now() - renderStartTime.current
    rerenderCount.current++
    
    // Get memory usage if available
    const memoryUsage = (performance as any)?.memory?.usedJSHeapSize

    const newMetrics: PerformanceMetrics = {
      renderTime,
      memoryUsage,
      componentMounts: mountCount.current,
      rerenderCount: rerenderCount.current
    }

    setMetrics(newMetrics)

    // Log performance warnings
    if (renderTime > finalThresholds.maxRenderTime) {
      logger.warn(`Slow render detected in ${componentName}`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        threshold: `${finalThresholds.maxRenderTime}ms`,
        componentName
      })
    }

    if (memoryUsage && finalThresholds.maxMemoryUsage && memoryUsage > finalThresholds.maxMemoryUsage) {
      logger.warn(`High memory usage in ${componentName}`, {
        memoryUsage: `${(memoryUsage / 1024 / 1024).toFixed(2)}MB`,
        threshold: `${(finalThresholds.maxMemoryUsage / 1024 / 1024).toFixed(2)}MB`,
        componentName
      })
    }

    if (rerenderCount.current > finalThresholds.maxRerenders) {
      logger.warn(`Excessive rerenders in ${componentName}`, {
        rerenderCount: rerenderCount.current,
        threshold: finalThresholds.maxRerenders,
        componentName
      })
    }

    logger.logComponentRender(componentName, renderTime, {
      memoryUsage: memoryUsage ? `${(memoryUsage / 1024 / 1024).toFixed(2)}MB` : 'N/A',
      rerenderCount: rerenderCount.current,
      mountCount: mountCount.current
    })
  }, [componentName, finalThresholds])

  const checkRerenderReason = useCallback((props: any, state?: any) => {
    let reasons: string[] = []

    if (lastProps.current) {
      Object.keys(props).forEach(key => {
        if (props[key] !== lastProps.current[key]) {
          reasons.push(`prop.${key}`)
        }
      })
    }

    if (state && lastState.current) {
      Object.keys(state).forEach(key => {
        if (state[key] !== lastState.current[key]) {
          reasons.push(`state.${key}`)
        }
      })
    }

    if (reasons.length > 0) {
      setMetrics(prev => ({
        ...prev,
        lastRenderReason: reasons.join(', ')
      }))
    }

    lastProps.current = props
    lastState.current = state
  }, [])

  useEffect(() => {
    mountCount.current++
    logger.debug(`Component mounted: ${componentName}`, {
      componentName,
      mountNumber: mountCount.current
    })

    return () => {
      logger.debug(`Component unmounted: ${componentName}`, {
        componentName,
        totalRerenders: rerenderCount.current,
        totalMounts: mountCount.current
      })
    }
  }, [componentName])

  // Reset rerender count periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (rerenderCount.current > 0) {
        logger.info(`Component render summary: ${componentName}`, {
          componentName,
          totalRerenders: rerenderCount.current,
          averageRenderTime: `${(metrics.renderTime / rerenderCount.current).toFixed(2)}ms`
        })
        rerenderCount.current = 0
      }
    }, 60000) // Reset every minute

    return () => clearInterval(interval)
  }, [componentName, metrics.renderTime])

  return {
    metrics,
    startRenderMeasurement,
    endRenderMeasurement,
    checkRerenderReason,
    isPerformant: metrics.renderTime <= finalThresholds.maxRenderTime &&
                  metrics.rerenderCount <= finalThresholds.maxRerenders &&
                  (!metrics.memoryUsage || !finalThresholds.maxMemoryUsage || 
                   metrics.memoryUsage <= finalThresholds.maxMemoryUsage)
  }
}

// Higher-order component for automatic performance monitoring
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    const displayName = componentName || Component.displayName || Component.name || 'Anonymous'
    const { startRenderMeasurement, endRenderMeasurement, checkRerenderReason } = 
      usePerformanceMonitor(displayName)

    useEffect(() => {
      startRenderMeasurement()
      checkRerenderReason(props)
      
      // Use setTimeout to capture render completion
      setTimeout(endRenderMeasurement, 0)
    })

    return React.createElement(Component, { ...props, ref })
  })

  WrappedComponent.displayName = `withPerformanceMonitoring(${
    componentName || Component.displayName || Component.name || 'Anonymous'
  })`

  return WrappedComponent
}

// Custom hook for measuring async operations
export function useAsyncPerformanceMonitor() {
  const measureAsync = useCallback(async <T>(
    operationName: string,
    asyncOperation: () => Promise<T>
  ): Promise<T> => {
    return logger.measureAsync(operationName, asyncOperation)
  }, [])

  const measure = useCallback(<T>(
    operationName: string,
    operation: () => T
  ): T => {
    return logger.measure(operationName, operation)
  }, [])

  return { measureAsync, measure }
}

// Hook for monitoring API calls
export function useApiPerformanceMonitor() {
  const monitorApiCall = useCallback(async <T>(
    url: string,
    method: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now()
    
    try {
      const result = await apiCall()
      const duration = performance.now() - startTime
      
      logger.logApiCall(url, method, duration, 200, { success: true })
      return result
    } catch (error: any) {
      const duration = performance.now() - startTime
      const status = error?.status || error?.response?.status || 500
      
      logger.logApiCall(url, method, duration, status, { 
        success: false,
        error: error?.message 
      })
      throw error
    }
  }, [])

  return { monitorApiCall }
}
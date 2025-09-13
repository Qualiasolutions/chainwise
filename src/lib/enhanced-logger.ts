/**
 * Enhanced Logger System
 * Provides structured logging with performance monitoring, error tracking, and analytics
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
  userId?: string
  sessionId?: string
  userAgent?: string
  url?: string
  stack?: string
  performance?: PerformanceMetrics
}

export interface PerformanceMetrics {
  duration?: number
  memoryUsage?: number
  apiResponseTime?: number
  renderTime?: number
  bundleSize?: number
}

class EnhancedLogger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private enableConsoleLogging = this.isDevelopment || process.env.ENABLE_CONSOLE_LOGGING === 'true'
  private logBuffer: LogEntry[] = []
  private maxBufferSize = 100
  private sessionId = this.generateSessionId()

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private createLogEntry(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      sessionId: this.sessionId,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    }

    // Add performance metrics if available
    if (typeof window !== 'undefined' && window.performance) {
      entry.performance = {
        memoryUsage: (window.performance as any)?.memory?.usedJSHeapSize,
        duration: performance.now()
      }
    }

    return entry
  }

  private addToBuffer(entry: LogEntry) {
    this.logBuffer.push(entry)
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift()
    }
  }

  private async sendToAnalytics(entry: LogEntry) {
    // Only send errors and critical logs to analytics in production
    if (!this.isDevelopment && (entry.level >= LogLevel.ERROR)) {
      try {
        // Send to analytics endpoint
        await fetch('/api/analytics/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        })
      } catch (error) {
        // Fail silently for logging errors
        console.error('Failed to send log to analytics:', error)
      }
    }
  }

  private formatConsoleOutput(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString()
    const levelName = LogLevel[entry.level]
    const context = entry.context ? ` | ${JSON.stringify(entry.context)}` : ''
    const performance = entry.performance ? ` | ${entry.performance.duration?.toFixed(2)}ms` : ''
    
    return `[${timestamp}] [${levelName}] ${entry.message}${context}${performance}`
  }

  debug(message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context)
    this.addToBuffer(entry)
    
    if (this.enableConsoleLogging) {
      console.debug(this.formatConsoleOutput(entry))
    }
  }

  info(message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry(LogLevel.INFO, message, context)
    this.addToBuffer(entry)
    
    if (this.enableConsoleLogging) {
      console.info(this.formatConsoleOutput(entry))
    }
  }

  warn(message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry(LogLevel.WARN, message, context)
    this.addToBuffer(entry)
    
    if (this.enableConsoleLogging) {
      console.warn(this.formatConsoleOutput(entry))
    }
    
    this.sendToAnalytics(entry)
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    const entry = this.createLogEntry(LogLevel.ERROR, message, {
      ...context,
      errorName: error?.name,
      errorMessage: error?.message,
      stack: error?.stack
    })
    
    if (error?.stack) {
      entry.stack = error.stack
    }
    
    this.addToBuffer(entry)
    
    if (this.enableConsoleLogging) {
      console.error(this.formatConsoleOutput(entry))
      if (error) console.error(error)
    }
    
    this.sendToAnalytics(entry)
  }

  critical(message: string, error?: Error, context?: Record<string, any>) {
    const entry = this.createLogEntry(LogLevel.CRITICAL, message, {
      ...context,
      errorName: error?.name,
      errorMessage: error?.message,
      stack: error?.stack
    })
    
    if (error?.stack) {
      entry.stack = error.stack
    }
    
    this.addToBuffer(entry)
    
    console.error(`[CRITICAL] ${this.formatConsoleOutput(entry)}`)
    if (error) console.error(error)
    
    this.sendToAnalytics(entry)
  }

  // Performance monitoring methods
  time(label: string): () => void {
    const startTime = performance.now()
    return () => {
      const duration = performance.now() - startTime
      this.info(`Performance: ${label}`, { duration: `${duration.toFixed(2)}ms` })
    }
  }

  async measureAsync<T>(label: string, asyncFn: () => Promise<T>): Promise<T> {
    const endTimer = this.time(label)
    try {
      const result = await asyncFn()
      endTimer()
      return result
    } catch (error) {
      endTimer()
      this.error(`Error in ${label}`, error as Error)
      throw error
    }
  }

  measure<T>(label: string, fn: () => T): T {
    const endTimer = this.time(label)
    try {
      const result = fn()
      endTimer()
      return result
    } catch (error) {
      endTimer()
      this.error(`Error in ${label}`, error as Error)
      throw error
    }
  }

  // Get recent logs for debugging
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logBuffer.slice(-count)
  }

  // Clear log buffer
  clearBuffer() {
    this.logBuffer = []
  }

  // API performance logging
  logApiCall(url: string, method: string, duration: number, status: number, context?: Record<string, any>) {
    const level = status >= 400 ? LogLevel.ERROR : status >= 300 ? LogLevel.WARN : LogLevel.INFO
    this.createLogEntry(level, `API Call: ${method} ${url}`, {
      ...context,
      method,
      status,
      duration: `${duration.toFixed(2)}ms`,
      url
    })
  }

  // User interaction logging
  logUserInteraction(action: string, element?: string, context?: Record<string, any>) {
    this.info(`User Interaction: ${action}`, {
      ...context,
      element,
      action
    })
  }

  // Component render logging
  logComponentRender(componentName: string, renderTime: number, context?: Record<string, any>) {
    this.debug(`Component Render: ${componentName}`, {
      ...context,
      componentName,
      renderTime: `${renderTime.toFixed(2)}ms`
    })
  }
}

// Export singleton instance
export const logger = new EnhancedLogger()

// React hook for component-level logging
export function useLogger() {
  return logger
}
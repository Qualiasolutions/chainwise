// Production-ready logging system
// Structured logging with levels and context

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogContext {
  [key: string]: any
}

export interface LogEntry {
  level: LogLevel
  message: string
  context?: LogContext
  timestamp: string
  environment: string
}

class Logger {
  private minLevel: LogLevel
  private environment: string

  constructor() {
    this.environment = process.env.NODE_ENV || 'development'
    this.minLevel = this.environment === 'production' ? LogLevel.INFO : LogLevel.DEBUG
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel
  }

  private formatLogEntry(level: LogLevel, message: string, context?: LogContext): LogEntry {
    return {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      environment: this.environment,
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) return

    const entry = this.formatLogEntry(level, message, context)

    // In production, you'd send this to a logging service (e.g., Sentry, LogRocket, DataDog)
    // For now, we'll use console with structured output
    const logMethod = level === LogLevel.ERROR ? console.error :
                     level === LogLevel.WARN ? console.warn :
                     level === LogLevel.INFO ? console.info :
                     console.log

    if (this.environment === 'production') {
      // Structured JSON logging for production
      logMethod(JSON.stringify(entry))
    } else {
      // Pretty logging for development
      const emoji = level === LogLevel.ERROR ? '❌' :
                   level === LogLevel.WARN ? '⚠️' :
                   level === LogLevel.INFO ? 'ℹ️' : '🔍'

      logMethod(`${emoji} [${LogLevel[level]}] ${message}`, context || '')
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context)
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context)
  }

  error(message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context)
  }

  // API-specific logging
  apiRequest(method: string, path: string, context?: LogContext): void {
    this.info(`API Request: ${method} ${path}`, context)
  }

  apiResponse(method: string, path: string, status: number, duration?: number): void {
    const message = `API Response: ${method} ${path} - ${status}`
    const context = duration ? { duration: `${duration}ms` } : undefined

    if (status >= 500) {
      this.error(message, context)
    } else if (status >= 400) {
      this.warn(message, context)
    } else {
      this.info(message, context)
    }
  }

  apiError(method: string, path: string, error: Error | unknown): void {
    const message = `API Error: ${method} ${path}`
    const context = {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }
    this.error(message, context)
  }
}

// Export singleton instance
export const logger = new Logger()

// Middleware wrapper for API routes
export function withLogging<T extends (...args: any[]) => Promise<Response>>(
  handler: T,
  handlerName: string
): T {
  return (async (...args: any[]) => {
    const request = args[0] as Request
    const method = request.method
    const path = new URL(request.url).pathname
    const startTime = Date.now()

    logger.apiRequest(method, path, { handler: handlerName })

    try {
      const response = await handler(...args)
      const duration = Date.now() - startTime
      logger.apiResponse(method, path, response.status, duration)
      return response
    } catch (error) {
      logger.apiError(method, path, error)
      throw error
    }
  }) as T
}

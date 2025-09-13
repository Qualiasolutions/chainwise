import { toast } from 'sonner'

export interface ErrorDetails {
  code: string
  message: string
  context?: Record<string, any>
  timestamp: number
  stack?: string
  userAgent?: string
  url?: string
}

export interface RetryConfig {
  maxRetries: number
  delay: number
  backoffFactor: number
  retryCondition: (error: any) => boolean
}

export class ErrorHandlingService {
  private static instance: ErrorHandlingService
  private errorQueue: ErrorDetails[] = []
  private maxQueueSize = 100

  private constructor() {}

  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService()
    }
    return ErrorHandlingService.instance
  }

  /**
   * Handle API errors with context and user feedback
   */
  handleApiError(error: any, context: string, options?: {
    showToast?: boolean
    logError?: boolean
    retryCallback?: () => Promise<any>
    fallbackAction?: () => void
  }): ErrorDetails {
    const errorDetails = this.createErrorDetails(error, context)
    
    if (options?.logError !== false) {
      this.logError(errorDetails)
    }

    if (options?.showToast !== false) {
      this.showUserFriendlyError(errorDetails)
    }

    return errorDetails
  }

  /**
   * Handle portfolio-specific errors
   */
  handlePortfolioError(error: any, operation: string, portfolioId?: string): ErrorDetails {
    const context = {
      operation,
      portfolioId,
      component: 'portfolio'
    }

    const errorDetails = this.createErrorDetails(error, `Portfolio ${operation}`, context)
    this.logError(errorDetails)

    // Show specific portfolio error messages
    switch (operation) {
      case 'fetch':
        toast.error('Unable to load portfolio data. Please refresh the page.')
        break
      case 'create':
        toast.error('Failed to create portfolio. Please check your input and try again.')
        break
      case 'update':
        toast.error('Failed to update portfolio. Your changes were not saved.')
        break
      case 'delete':
        toast.error('Failed to delete portfolio. Please try again.')
        break
      case 'add_holding':
        toast.error('Failed to add holding. Please verify the cryptocurrency data.')
        break
      case 'update_holding':
        toast.error('Failed to update holding. Your changes were not saved.')
        break
      case 'delete_holding':
        toast.error('Failed to delete holding. Please try again.')
        break
      default:
        toast.error('A portfolio error occurred. Please try again.')
    }

    return errorDetails
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(error: any, context: string = 'authentication'): ErrorDetails {
    const errorDetails = this.createErrorDetails(error, context)
    this.logError(errorDetails)

    // Check for specific auth error types
    if (error?.message?.includes('Invalid login credentials')) {
      toast.error('Invalid email or password. Please check your credentials.')
    } else if (error?.message?.includes('Email not confirmed')) {
      toast.error('Please check your email and confirm your account.')
    } else if (error?.message?.includes('Too many requests')) {
      toast.error('Too many login attempts. Please wait a moment and try again.')
    } else if (error?.message?.includes('Session expired') || error?.status === 401) {
      toast.error('Your session has expired. Please sign in again.')
      // Could trigger automatic redirect to login
    } else {
      toast.error('Authentication failed. Please try again.')
    }

    return errorDetails
  }

  /**
   * Handle network errors with retry logic
   */
  async handleNetworkError<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const defaultConfig: RetryConfig = {
      maxRetries: 3,
      delay: 1000,
      backoffFactor: 2,
      retryCondition: (error) => {
        // Retry on network errors, timeouts, and 5xx errors
        return error?.name === 'NetworkError' ||
               error?.code === 'NETWORK_ERROR' ||
               error?.status >= 500 ||
               error?.message?.includes('fetch')
      }
    }

    const finalConfig = { ...defaultConfig, ...config }
    let lastError: any

    for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        
        if (attempt === finalConfig.maxRetries || !finalConfig.retryCondition(error)) {
          break
        }

        // Wait before retrying with exponential backoff
        const delay = finalConfig.delay * Math.pow(finalConfig.backoffFactor, attempt)
        await this.sleep(delay)
      }
    }

    // All retries failed
    const errorDetails = this.handleApiError(lastError, 'Network operation failed after retries', {
      showToast: false
    })

    toast.error('Network error. Please check your connection and try again.')
    throw lastError
  }

  /**
   * Handle validation errors
   */
  handleValidationError(error: any, context: string = 'validation'): ErrorDetails {
    const errorDetails = this.createErrorDetails(error, context)
    this.logError(errorDetails)

    // Handle Zod validation errors
    if (error?.name === 'ZodError' || error?.errors) {
      const validationErrors = error.errors || error.issues || []
      const messages = validationErrors.map((err: any) => 
        `${err.path?.join?.('.') || 'Field'}: ${err.message}`
      )
      
      toast.error('Please correct the following errors:', {
        description: messages.join('\n')
      })
    } else {
      toast.error('Invalid input. Please check your data and try again.')
    }

    return errorDetails
  }

  /**
   * Handle crypto service errors
   */
  handleCryptoServiceError(error: any, operation: string): ErrorDetails {
    const context = {
      operation,
      service: 'crypto'
    }

    const errorDetails = this.createErrorDetails(error, `Crypto service ${operation}`, context)
    this.logError(errorDetails)

    switch (operation) {
      case 'fetch_prices':
        toast.error('Unable to fetch current prices. Using cached data.')
        break
      case 'search_crypto':
        toast.error('Cryptocurrency search failed. Please try a different query.')
        break
      case 'fetch_market_data':
        toast.error('Market data unavailable. Some features may be limited.')
        break
      default:
        toast.error('Cryptocurrency service error. Some data may be outdated.')
    }

    return errorDetails
  }

  /**
   * Create standardized error details
   */
  private createErrorDetails(error: any, context: string, additionalContext?: Record<string, any>): ErrorDetails {
    const timestamp = Date.now()
    
    let code = 'UNKNOWN_ERROR'
    let message = 'An unexpected error occurred'

    if (error?.response?.status) {
      code = `HTTP_${error.response.status}`
      message = error?.response?.data?.message || error.message || message
    } else if (error?.code) {
      code = error.code
      message = error.message || message
    } else if (error?.name) {
      code = error.name.toUpperCase()
      message = error.message || message
    } else if (typeof error === 'string') {
      message = error
    } else if (error?.message) {
      message = error.message
    }

    const errorDetails: ErrorDetails = {
      code,
      message,
      context: {
        ...additionalContext,
        originalContext: context
      },
      timestamp,
      stack: error?.stack,
      userAgent: typeof window !== 'undefined' ? window.navigator?.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location?.href : undefined
    }

    return errorDetails
  }

  /**
   * Log error to queue and potentially external service
   */
  private logError(errorDetails: ErrorDetails): void {
    // Add to local queue
    this.errorQueue.push(errorDetails)
    
    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift()
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorDetails)
    }

    // In production, you might want to send to external logging service
    // this.sendToExternalLogger(errorDetails)
  }

  /**
   * Show user-friendly error messages
   */
  private showUserFriendlyError(errorDetails: ErrorDetails): void {
    // Map technical errors to user-friendly messages
    const userFriendlyMessages: Record<string, string> = {
      'NETWORK_ERROR': 'Network connection problem. Please check your internet.',
      'HTTP_401': 'Authentication required. Please sign in.',
      'HTTP_403': 'Access denied. You do not have permission for this action.',
      'HTTP_404': 'Requested resource not found.',
      'HTTP_429': 'Too many requests. Please wait a moment and try again.',
      'HTTP_500': 'Server error. Please try again later.',
      'HTTP_503': 'Service temporarily unavailable. Please try again later.',
      'VALIDATION_ERROR': 'Please check your input and try again.',
      'TIMEOUT_ERROR': 'Request timed out. Please try again.',
    }

    const friendlyMessage = userFriendlyMessages[errorDetails.code] || errorDetails.message
    
    // Don't show toast if message is too technical
    if (!this.isTechnicalError(errorDetails)) {
      toast.error(friendlyMessage)
    }
  }

  /**
   * Check if error is too technical for user display
   */
  private isTechnicalError(errorDetails: ErrorDetails): boolean {
    const technicalKeywords = [
      'stack trace',
      'undefined is not a function',
      'cannot read property',
      'syntax error',
      'reference error'
    ]

    return technicalKeywords.some(keyword => 
      errorDetails.message.toLowerCase().includes(keyword)
    )
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(limit: number = 10): ErrorDetails[] {
    return this.errorQueue.slice(-limit)
  }

  /**
   * Clear error queue
   */
  clearErrors(): void {
    this.errorQueue = []
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Create error boundary handler
   */
  createErrorBoundaryHandler() {
    return (error: Error, errorInfo: any) => {
      const errorDetails = this.createErrorDetails(error, 'React Error Boundary', {
        componentStack: errorInfo.componentStack
      })
      
      this.logError(errorDetails)
      toast.error('An unexpected error occurred. The page will reload automatically.', {
        duration: 5000
      })

      // Auto-reload after a brief delay in production
      if (process.env.NODE_ENV === 'production') {
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      }
    }
  }

  /**
   * Handle global uncaught errors
   */
  setupGlobalErrorHandling(): void {
    if (typeof window === 'undefined') return

    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      const errorDetails = this.createErrorDetails(event.error, 'Uncaught JavaScript Error')
      this.logError(errorDetails)
    })

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const errorDetails = this.createErrorDetails(event.reason, 'Unhandled Promise Rejection')
      this.logError(errorDetails)
    })
  }
}

// Export singleton instance
export const errorHandler = ErrorHandlingService.getInstance()
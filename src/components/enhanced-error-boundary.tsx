'use client'

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { logger } from '@/lib/enhanced-logger'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorId: string
  showDetails: boolean
  retryCount: number
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo, errorId: string) => void
  showErrorDetails?: boolean
  maxRetries?: number
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
}

export class EnhancedErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      showDetails: false,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError } = this.props
    const { errorId } = this.state

    // Log error with enhanced logger
    logger.critical('React Error Boundary Caught Error', error, {
      errorId,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
      retryCount: this.state.retryCount,
      userAgent: navigator?.userAgent,
      url: window?.location?.href,
      timestamp: new Date().toISOString()
    })

    this.setState({
      error,
      errorInfo,
      errorId
    })

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo, errorId)
    }

    // Send error to analytics/monitoring service
    this.sendErrorToMonitoring(error, errorInfo, errorId)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props
    const { hasError } = this.state

    if (hasError && resetOnPropsChange) {
      if (resetKeys) {
        const hasResetKeyChanged = resetKeys.some(
          (key, index) => key !== (prevProps.resetKeys?.[index])
        )
        if (hasResetKeyChanged) {
          this.resetErrorBoundary()
        }
      } else {
        // Reset on any prop change
        const propsChanged = Object.keys(this.props).some(
          key => this.props[key as keyof ErrorBoundaryProps] !== prevProps[key as keyof ErrorBoundaryProps]
        )
        if (propsChanged) {
          this.resetErrorBoundary()
        }
      }
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  private async sendErrorToMonitoring(error: Error, errorInfo: React.ErrorInfo, errorId: string) {
    try {
      await fetch('/api/error-monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errorId,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          userAgent: navigator?.userAgent,
          url: window?.location?.href,
          timestamp: new Date().toISOString(),
          retryCount: this.state.retryCount
        })
      })
    } catch (monitoringError) {
      console.error('Failed to send error to monitoring service:', monitoringError)
    }
  }

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      showDetails: false,
      retryCount: 0
    })

    logger.info('Error boundary reset', {
      previousErrorId: this.state.errorId,
      retryCount: this.state.retryCount
    })
  }

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props
    const { retryCount } = this.state

    if (retryCount >= maxRetries) {
      logger.warn('Maximum retry attempts reached', {
        errorId: this.state.errorId,
        maxRetries,
        retryCount
      })
      return
    }

    logger.info('Retrying after error', {
      errorId: this.state.errorId,
      retryCount: retryCount + 1,
      maxRetries
    })

    this.setState(prevState => ({
      retryCount: prevState.retryCount + 1
    }))

    // Add delay before retry to prevent rapid retries
    this.retryTimeoutId = setTimeout(() => {
      this.resetErrorBoundary()
    }, 1000 * (retryCount + 1)) // Exponential backoff
  }

  private toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }))
  }

  private copyErrorDetails = () => {
    const { error, errorInfo, errorId } = this.state
    const errorDetails = {
      errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      url: window?.location?.href,
      userAgent: navigator?.userAgent,
      timestamp: new Date().toISOString()
    }

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        logger.info('Error details copied to clipboard', { errorId })
      })
      .catch(err => {
        logger.warn('Failed to copy error details', err)
      })
  }

  render() {
    const { hasError, error, errorInfo, errorId, showDetails, retryCount } = this.state
    const { children, fallback, showErrorDetails = true, maxRetries = 3 } = this.props

    if (hasError) {
      if (fallback) {
        return fallback
      }

      const canRetry = retryCount < maxRetries

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-red-900 dark:text-red-100">
                Something went wrong
              </CardTitle>
              <CardDescription>
                An unexpected error occurred. Our team has been notified and is working on a fix.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Error ID:</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {errorId}
                </Badge>
              </div>

              {retryCount > 0 && (
                <div className="text-center">
                  <Badge variant="secondary">
                    Retry attempt: {retryCount} / {maxRetries}
                  </Badge>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {canRetry && (
                  <Button onClick={this.handleRetry} className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'}
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </Button>
              </div>

              {showErrorDetails && (
                <div className="border-t pt-4">
                  <Button
                    variant="ghost"
                    onClick={this.toggleDetails}
                    className="w-full flex items-center justify-center gap-2 text-sm"
                  >
                    <Bug className="w-4 h-4" />
                    Technical Details
                    {showDetails ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>

                  {showDetails && (
                    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <div className="mb-3 flex justify-between items-center">
                        <h4 className="font-semibold text-sm">Error Details</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={this.copyErrorDetails}
                          className="text-xs"
                        >
                          Copy Details
                        </Button>
                      </div>
                      
                      <div className="space-y-2 text-xs font-mono">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Message: </span>
                          <span className="text-red-600 dark:text-red-400">
                            {error?.message}
                          </span>
                        </div>
                        
                        {error?.stack && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Stack: </span>
                            <pre className="mt-1 text-xs overflow-x-auto whitespace-pre-wrap bg-white dark:bg-gray-900 p-2 rounded border">
                              {error.stack}
                            </pre>
                          </div>
                        )}
                        
                        {errorInfo?.componentStack && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Component Stack: </span>
                            <pre className="mt-1 text-xs overflow-x-auto whitespace-pre-wrap bg-white dark:bg-gray-900 p-2 rounded border">
                              {errorInfo.componentStack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                If this problem persists, please contact support with Error ID: {errorId}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return children
  }
}

// Hook version for functional components
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error, errorInfo?: any) => {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    logger.critical('Manual Error Handler', error, {
      errorId,
      errorInfo,
      timestamp: new Date().toISOString()
    })

    // Could trigger error reporting here
    return errorId
  }, [])

  return { handleError }
}

export default EnhancedErrorBoundary
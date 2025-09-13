"use client"

import * as React from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/unified-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  showDetails?: boolean
  className?: string
}

interface ErrorFallbackProps {
  error: Error | null
  resetError: () => void
  showDetails?: boolean
  className?: string
}

// Default error fallback component
function DefaultErrorFallback({ 
  error, 
  resetError, 
  showDetails = false,
  className 
}: ErrorFallbackProps) {
  return (
    <div className={cn("flex items-center justify-center min-h-[400px] p-6", className)}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-red-700 dark:text-red-300">
            Something went wrong
          </CardTitle>
          <CardDescription>
            An unexpected error occurred. Please try again or return to the home page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showDetails && error && (
            <details className="text-sm text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground">
                Error details
              </summary>
              <pre className="mt-2 whitespace-pre-wrap break-all bg-muted p-2 rounded text-xs">
                {error.message}
              </pre>
            </details>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={resetError}
              variant="default"
              className="flex-1"
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Try again
            </Button>
            <Button 
              variant="outline"
              className="flex-1"
              onClick={() => window.location.href = '/'}
              icon={<Home className="w-4 h-4" />}
            >
              Go home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Crypto-themed error fallback
function CryptoErrorFallback({ 
  error, 
  resetError, 
  showDetails = false,
  className 
}: ErrorFallbackProps) {
  return (
    <div className={cn(
      "flex items-center justify-center min-h-[400px] p-6 bg-gradient-to-br from-purple-900/20 via-purple-800/20 to-indigo-900/20", 
      className
    )}>
      <Card className="w-full max-w-md border-purple-300/20 bg-white/5 backdrop-blur-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <CardTitle className="text-purple-700 dark:text-purple-300">
            ChainWise Error
          </CardTitle>
          <CardDescription>
            Our AI systems encountered an unexpected issue. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showDetails && error && (
            <details className="text-sm text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground">
                Technical details
              </summary>
              <pre className="mt-2 whitespace-pre-wrap break-all bg-purple-900/10 p-2 rounded text-xs">
                {error.message}
              </pre>
            </details>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={resetError}
              variant="crypto"
              className="flex-1"
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Retry
            </Button>
            <Button 
              variant="crypto-outline"
              className="flex-1"
              onClick={() => window.location.href = '/dashboard'}
              icon={<Home className="w-4 h-4" />}
            >
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Call optional error callback
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.handleReset}
          showDetails={this.props.showDetails}
          className={this.props.className}
        />
      )
    }

    return this.props.children
  }
}

// Hook for functional error boundaries (client-side only)
export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Error caught by error handler:', error, errorInfo)
    // You could send this to an error reporting service
  }, [])
}

// Async error boundary for handling async operations
export function AsyncErrorBoundary({ 
  children, 
  ...props 
}: Omit<ErrorBoundaryProps, 'fallback'> & { fallback?: React.ComponentType<ErrorFallbackProps> }) {
  const [asyncError, setAsyncError] = React.useState<Error | null>(null)
  
  // Handle async errors
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setAsyncError(new Error(event.reason))
    }
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  // If we have an async error, render the fallback
  if (asyncError) {
    const FallbackComponent = props.fallback || DefaultErrorFallback
    return (
      <FallbackComponent
        error={asyncError}
        resetError={() => setAsyncError(null)}
        showDetails={props.showDetails}
        className={props.className}
      />
    )
  }

  return (
    <ErrorBoundary {...props}>
      {children}
    </ErrorBoundary>
  )
}

// Export pre-configured error boundaries for common use cases
export const CryptoErrorBoundary = (props: Omit<ErrorBoundaryProps, 'fallback'>) => (
  <ErrorBoundary {...props} fallback={CryptoErrorFallback} />
)

export const PageErrorBoundary = (props: Omit<ErrorBoundaryProps, 'className'>) => (
  <ErrorBoundary {...props} className="min-h-screen" />
)

export const ComponentErrorBoundary = (props: ErrorBoundaryProps) => (
  <ErrorBoundary {...props} showDetails={process.env.NODE_ENV === 'development'} />
)
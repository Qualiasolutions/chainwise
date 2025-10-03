"use client"

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error to console
    console.error('Error caught by ErrorBoundary:', error, errorInfo)

    // Store error info
    this.setState({
      errorInfo: errorInfo?.componentStack || 'No additional info',
    })

    // Send to monitoring service (Sentry, etc.)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // TODO: Send to Sentry or error monitoring service
      // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } })
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Something went wrong</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    We encountered an unexpected error
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error details (dev mode only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-mono text-red-600 dark:text-red-400 mb-2">
                    {this.state.error.name}: {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <pre className="text-xs text-slate-600 dark:text-slate-400 overflow-auto max-h-40">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              )}

              {/* Production message */}
              {process.env.NODE_ENV === 'production' && (
                <div className="space-y-2">
                  <p className="text-slate-600 dark:text-slate-400">
                    Don't worry, this issue has been reported to our team. You can try the following:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
                    <li>Refresh the page to try again</li>
                    <li>Go back to the home page</li>
                    <li>Clear your browser cache and cookies</li>
                    <li>Contact support if the problem persists</li>
                  </ul>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  asChild
                >
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Link>
                </Button>
              </div>

              {/* Support link */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Need help?{' '}
                  <Link href="/contact" className="text-purple-600 hover:underline">
                    Contact Support
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for functional components to trigger error boundaries
export function useErrorHandler() {
  const handleError = (error: Error) => {
    // Throw error to trigger error boundary
    throw error
  }

  return handleError
}

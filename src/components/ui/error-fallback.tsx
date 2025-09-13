'use client'

import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { cn } from '@/lib/utils'

interface ErrorFallbackProps {
  error?: Error | string | null
  retry?: () => void
  className?: string
  title?: string
  description?: string
  showRetry?: boolean
  variant?: 'inline' | 'card' | 'full'
}

export function ErrorFallback({
  error,
  retry,
  className,
  title = 'Something went wrong',
  description,
  showRetry = true,
  variant = 'card'
}: ErrorFallbackProps) {
  const errorMessage = error instanceof Error ? error.message : (error || 'An unexpected error occurred')
  const errorDescription = description || 'We encountered an issue loading this content.'

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
        <AlertCircle className="h-4 w-4 text-destructive" />
        <span>{errorMessage}</span>
        {showRetry && retry && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={retry}
            className="h-auto p-1 hover:bg-transparent"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    )
  }

  if (variant === 'full') {
    return (
      <div className={cn(
        'flex min-h-[400px] w-full flex-col items-center justify-center space-y-4 p-8 text-center',
        className
      )}>
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-md">{errorDescription}</p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-xs">
              <summary className="cursor-pointer text-muted-foreground">Debug info</summary>
              <pre className="mt-2 whitespace-pre-wrap text-left bg-muted p-2 rounded">
                {errorMessage}
              </pre>
            </details>
          )}
        </div>
        {showRetry && retry && (
          <Button onClick={retry} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card className={cn('border-destructive/20', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{errorDescription}</p>
        {process.env.NODE_ENV === 'development' && (
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground">Debug info</summary>
            <pre className="mt-2 whitespace-pre-wrap bg-muted p-2 rounded">
              {errorMessage}
            </pre>
          </details>
        )}
        {showRetry && retry && (
          <Button onClick={retry} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-3 w-3" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

interface LoadingFallbackProps {
  className?: string
  message?: string
  variant?: 'spinner' | 'skeleton' | 'pulse'
}

export function LoadingFallback({ 
  className, 
  message = 'Loading...', 
  variant = 'spinner' 
}: LoadingFallbackProps) {
  if (variant === 'skeleton') {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={cn(
        'flex items-center justify-center p-8 bg-muted/20 rounded animate-pulse',
        className
      )}>
        <div className="w-8 h-8 bg-muted rounded" />
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
        {message}
      </div>
    </div>
  )
}

interface DataWrapperProps {
  loading?: boolean
  error?: Error | string | null
  data?: any
  isEmpty?: boolean
  retry?: () => void
  loadingComponent?: React.ReactNode
  errorComponent?: React.ReactNode
  emptyComponent?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function DataWrapper({
  loading,
  error,
  data,
  isEmpty,
  retry,
  loadingComponent,
  errorComponent,
  emptyComponent,
  children,
  className
}: DataWrapperProps) {
  if (loading) {
    return (
      <div className={className}>
        {loadingComponent || <LoadingFallback />}
      </div>
    )
  }

  if (error) {
    return (
      <div className={className}>
        {errorComponent || <ErrorFallback error={error} retry={retry} />}
      </div>
    )
  }

  if (isEmpty && emptyComponent) {
    return (
      <div className={className}>
        {emptyComponent}
      </div>
    )
  }

  return <div className={className}>{children}</div>
}
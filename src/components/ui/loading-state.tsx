import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2, Zap } from "lucide-react"

interface LoadingStateProps {
  variant?: "default" | "card" | "page" | "inline" | "crypto"
  size?: "sm" | "md" | "lg" | "xl"
  message?: string
  className?: string
}

const loadingVariants = {
  default: "flex items-center justify-center",
  card: "flex items-center justify-center min-h-[200px] bg-background/5 rounded-lg border border-border/50 backdrop-blur-sm",
  page: "flex flex-col items-center justify-center min-h-screen",
  inline: "inline-flex items-center gap-2",
  crypto: "flex flex-col items-center justify-center min-h-[200px] bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-300/20 backdrop-blur-sm"
}

const sizeVariants = {
  sm: { spinner: "h-4 w-4", text: "text-sm" },
  md: { spinner: "h-6 w-6", text: "text-base" },
  lg: { spinner: "h-8 w-8", text: "text-lg" },
  xl: { spinner: "h-12 w-12", text: "text-xl" }
}

export function LoadingState({ 
  variant = "default", 
  size = "md", 
  message = "Loading...",
  className 
}: LoadingStateProps) {
  const sizes = sizeVariants[size]
  const isCrypto = variant === "crypto"
  
  return (
    <div className={cn(loadingVariants[variant], className)}>
      {isCrypto ? (
        <div className="relative">
          <Zap className={cn(sizes.spinner, "text-purple-500 animate-pulse")} />
          <div className="absolute inset-0 animate-spin">
            <Loader2 className={cn(sizes.spinner, "text-purple-400")} />
          </div>
        </div>
      ) : (
        <Loader2 className={cn(sizes.spinner, "animate-spin text-muted-foreground")} />
      )}
      {message && (
        <p className={cn(
          sizes.text, 
          "text-muted-foreground font-medium mt-2",
          variant === "inline" && "mt-0 ml-2",
          isCrypto && "text-purple-600 dark:text-purple-300"
        )}>
          {message}
        </p>
      )}
    </div>
  )
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "text" | "card" | "avatar" | "button"
}

const skeletonVariants = {
  default: "h-4 w-full",
  text: "h-4 w-3/4",
  card: "h-48 w-full rounded-lg",
  avatar: "h-12 w-12 rounded-full",
  button: "h-9 w-24 rounded-md"
}

export function Skeleton({ 
  className, 
  variant = "default",
  ...props 
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-muted rounded-md",
        skeletonVariants[variant],
        className
      )}
      {...props}
    />
  )
}

interface LoadingSkeletonProps {
  rows?: number
  variant?: "card" | "list" | "table"
  className?: string
}

export function LoadingSkeleton({ 
  rows = 3, 
  variant = "card", 
  className 
}: LoadingSkeletonProps) {
  if (variant === "card") {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 border border-border rounded-lg space-y-3">
            <div className="flex items-center space-x-3">
              <Skeleton variant="avatar" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton variant="text" className="h-3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-3">
            <Skeleton variant="avatar" className="h-8 w-8" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton variant="button" className="h-8 w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (variant === "table") {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex space-x-4 p-3 border-b">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex space-x-4 p-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    )
  }

  return null
}
"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatPrice, formatPercentage } from "@/lib/crypto-api"

interface PriceCardProps {
  title: string
  symbol?: string
  price: number
  change?: number
  subtitle?: string
  className?: string
}

export function PriceCard({
  title,
  symbol,
  price,
  change,
  subtitle,
  className
}: PriceCardProps) {
  const isPositive = change ? change >= 0 : true

  return (
    <Card className={cn("ai-card theme-transition", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {symbol && (
          <Badge variant="outline" className="text-xs">
            {symbol}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{formatPrice(price)}</div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {change !== undefined && (
            <div className={cn(
              "flex items-center space-x-1 text-sm font-medium",
              isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            )}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{formatPercentage(change)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
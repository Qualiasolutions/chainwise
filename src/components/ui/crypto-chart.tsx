"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/crypto-api"

interface PricePoint {
  date: string
  price: number
  timestamp: Date
}

interface CryptoChartProps {
  data: PricePoint[]
  title?: string
  height?: number
  showGrid?: boolean
  color?: string
}

export function CryptoChart({
  data,
  title,
  height = 300,
  showGrid = true,
  color = "hsl(var(--chart-1))"
}: CryptoChartProps) {
  const formatTooltipValue = (value: number) => {
    return formatPrice(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-sm">
            <span className="text-muted-foreground">Price: </span>
            <span className="font-semibold text-primary">
              {formatTooltipValue(payload[0].value)}
            </span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="ai-card">
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--muted-foreground))"
                opacity={0.3}
              />
            )}
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              fontWeight={500}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              fontWeight={500}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: color,
                stroke: color,
                strokeWidth: 2
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
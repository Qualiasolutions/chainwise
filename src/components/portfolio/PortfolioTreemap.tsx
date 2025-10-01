"use client"

import { Treemap, ResponsiveContainer, Tooltip } from 'recharts'
import { formatPrice, formatPercentage } from '@/lib/crypto-api'
import { motion } from 'framer-motion'

interface TreemapData {
  name: string
  symbol: string
  size: number
  pnl: number
  pnlPercentage: number
}

interface Props {
  data: TreemapData[]
}

const COLORS = {
  profit: ['#10b981', '#059669', '#047857', '#065f46'],
  loss: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b'],
  neutral: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6']
}

export function PortfolioTreemap({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-sm">No allocation data available</p>
          <p className="text-xs mt-1">Add holdings to see allocation map</p>
        </div>
      </div>
    )
  }

  // Transform data for treemap with color coding
  const treemapData = data.map((item, index) => {
    let fill: string
    if (item.pnl > 0) {
      fill = COLORS.profit[index % COLORS.profit.length]
    } else if (item.pnl < 0) {
      fill = COLORS.loss[index % COLORS.loss.length]
    } else {
      fill = COLORS.neutral[index % COLORS.neutral.length]
    }

    return {
      ...item,
      fill
    }
  })

  const CustomContent = (props: any) => {
    const { x, y, width, height, name, symbol, size, pnl, pnlPercentage, fill } = props

    // Only render if the area is large enough
    if (width < 50 || height < 40) {
      return (
        <g>
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={fill}
            stroke="#fff"
            strokeWidth={2}
            opacity={0.9}
            className="transition-all duration-200 hover:opacity-100"
          />
        </g>
      )
    }

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          stroke="#fff"
          strokeWidth={2}
          opacity={0.9}
          className="transition-all duration-200 hover:opacity-100 cursor-pointer"
        />
        <text
          x={x + width / 2}
          y={y + height / 2 - 10}
          textAnchor="middle"
          fill="#fff"
          fontSize={width > 100 ? 16 : 12}
          fontWeight="600"
        >
          {symbol}
        </text>
        <text
          x={x + width / 2}
          y={y + height / 2 + 8}
          textAnchor="middle"
          fill="#fff"
          fontSize={width > 100 ? 14 : 10}
          opacity={0.9}
        >
          {formatPrice(size)}
        </text>
        {width > 120 && height > 60 && (
          <text
            x={x + width / 2}
            y={y + height / 2 + 24}
            textAnchor="middle"
            fill="#fff"
            fontSize={12}
            opacity={0.8}
            fontWeight="500"
          >
            {pnl >= 0 ? '+' : ''}{formatPercentage(pnlPercentage)}
          </text>
        )}
      </g>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="h-[400px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={treemapData}
          dataKey="size"
          stroke="#fff"
          fill="#8884d8"
          content={<CustomContent />}
        >
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-card/95 backdrop-blur-sm border rounded-lg p-3 shadow-xl">
                    <p className="font-semibold text-foreground mb-1">{data.name}</p>
                    <p className="text-sm text-muted-foreground mb-2">{data.symbol}</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Value:</span>
                        <span className="font-semibold text-foreground">{formatPrice(data.size)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">P&L:</span>
                        <span className={`font-semibold ${data.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {data.pnl >= 0 ? '+' : ''}{formatPrice(data.pnl)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Change:</span>
                        <span className={`font-semibold ${data.pnlPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatPercentage(data.pnlPercentage)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
        </Treemap>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-green-500"></div>
          <span className="text-muted-foreground">Profitable</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-red-500"></div>
          <span className="text-muted-foreground">Losing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-purple-500"></div>
          <span className="text-muted-foreground">Neutral</span>
        </div>
      </div>
    </motion.div>
  )
}

'use client'

import React, { useState } from 'react'
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  MessageSquare, 
  Zap,
  Target,
  BarChart3,
  Bot,
  ChevronRight,
  Lightbulb,
  PieChart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface AIWiseAssistantProps {
  variant?: 'button' | 'card' | 'inline'
  className?: string
}

const aiFeatures = [
  {
    id: 'portfolio-analysis',
    title: 'Portfolio Analysis',
    description: 'Get AI-powered insights into your portfolio performance',
    icon: PieChart,
    color: 'text-blue-500',
    href: '/ai/portfolio-analysis',
    category: 'Analysis'
  },
  {
    id: 'market-insights',
    title: 'Market Insights',
    description: 'Real-time market analysis and trend predictions',
    icon: BarChart3,
    color: 'text-green-500',
    href: '/ai/market-insights',
    category: 'Insights'
  },
  {
    id: 'trading-signals',
    title: 'Trading Signals',
    description: 'AI-generated trading opportunities and alerts',
    icon: Target,
    color: 'text-purple-500',
    href: '/ai/trading-signals',
    category: 'Trading'
  },
  {
    id: 'risk-assessment',
    title: 'Risk Assessment',
    description: 'Evaluate portfolio risk and get recommendations',
    icon: TrendingUp,
    color: 'text-orange-500',
    href: '/ai/risk-assessment',
    category: 'Risk'
  },
  {
    id: 'ai-chat',
    title: 'Ask AI Wise',
    description: 'Chat with your personal AI trading assistant',
    icon: MessageSquare,
    color: 'text-indigo-500',
    href: '/chat',
    category: 'Chat'
  },
  {
    id: 'strategy-builder',
    title: 'Strategy Builder',
    description: 'Build custom trading strategies with AI assistance',
    icon: Lightbulb,
    color: 'text-yellow-500',
    href: '/ai/strategy-builder',
    category: 'Strategy'
  }
]

export function AIWiseAssistant({ variant = 'button', className }: AIWiseAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (variant === 'card') {
    return (
      <Card className={cn("border-purple-500/20 bg-gradient-to-br from-purple-900/10 to-blue-900/10 backdrop-blur-sm", className)}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center">
                AI Wise Assistant
                <Sparkles className="h-4 w-4 ml-1 text-yellow-400" />
              </h3>
              <p className="text-sm text-gray-400">Your intelligent trading companion</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {aiFeatures.slice(0, 4).map((feature) => {
              const Icon = feature.icon
              return (
                <Link key={feature.id} href={feature.href}>
                  <Button
                    variant="ghost"
                    className="h-auto p-3 justify-start hover:bg-purple-500/10 hover:border-purple-500/30 transition-all duration-200"
                  >
                    <Icon className={cn("h-4 w-4 mr-2", feature.color)} />
                    <div className="text-left">
                      <div className="text-sm font-medium text-white">{feature.title}</div>
                    </div>
                  </Button>
                </Link>
              )
            })}
          </div>

          <Button 
            variant="outline"
            className="w-full mt-4 border-purple-400/30 text-purple-300 hover:bg-purple-500/10"
            asChild
          >
            <Link href="/ai">
              <Bot className="h-4 w-4 mr-2" />
              Explore All AI Features
              <ChevronRight className="h-4 w-4 ml-auto" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {aiFeatures.slice(0, 3).map((feature) => {
          const Icon = feature.icon
          return (
            <Button
              key={feature.id}
              variant="outline"
              size="sm"
              className="border-gray-600/50 text-gray-300 hover:bg-purple-500/10 hover:border-purple-500/30"
              asChild
            >
              <Link href={feature.href}>
                <Icon className={cn("h-3 w-3 mr-1", feature.color)} />
                {feature.title}
              </Link>
            </Button>
          )
        })}
        <Button
          variant="ghost"
          size="sm"
          className="text-purple-400 hover:text-purple-300"
          asChild
        >
          <Link href="/ai">
            View All <ChevronRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </div>
    )
  }

  // Default button variant with dropdown
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="default"
          className={cn(
            "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg shadow-purple-500/25",
            className
          )}
        >
          <Brain className="h-4 w-4 mr-2" />
          AI Wise Assistant
          <Sparkles className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 bg-black/95 backdrop-blur-md border-purple-500/20" align="end">
        <DropdownMenuLabel className="flex items-center text-purple-300">
          <Brain className="h-4 w-4 mr-2" />
          AI Wise Trading Assistant
          <Badge className="ml-auto bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
            AI
          </Badge>
        </DropdownMenuLabel>
        
        <div className="p-2">
          <p className="text-xs text-gray-400 mb-3">
            Leverage advanced AI to enhance your trading decisions
          </p>
          
          <div className="space-y-1">
            {aiFeatures.map((feature, index) => {
              const Icon = feature.icon
              
              return (
                <div key={feature.id}>
                  {index === 2 && <DropdownMenuSeparator className="bg-gray-700/50 my-2" />}
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link 
                      href={feature.href}
                      className="flex items-start space-x-3 p-3 rounded-md hover:bg-purple-500/10 transition-all duration-200"
                    >
                      <div className={cn("p-1.5 rounded-md bg-gray-800/50", feature.color)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white mb-1">
                          {feature.title}
                        </div>
                        <div className="text-xs text-gray-400 line-clamp-2">
                          {feature.description}
                        </div>
                        <Badge 
                          variant="secondary" 
                          className="mt-1 text-xs bg-gray-800/50 text-gray-300"
                        >
                          {feature.category}
                        </Badge>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-500 mt-1" />
                    </Link>
                  </DropdownMenuItem>
                </div>
              )
            })}
          </div>
        </div>

        <div className="p-2 border-t border-gray-700/50">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
            asChild
          >
            <Link href="/ai">
              <Zap className="h-4 w-4 mr-2" />
              Explore Full AI Suite
              <ChevronRight className="h-4 w-4 ml-auto" />
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
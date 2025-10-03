"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ChatContainerProps {
  children: ReactNode
  className?: string
}

export function ChatContainer({ children, className }: ChatContainerProps) {
  return (
    <div className={cn(
      "flex flex-col h-screen w-full",
      "bg-white dark:bg-gray-950",
      className
    )}>
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.02] via-transparent to-purple-500/[0.02] pointer-events-none" />

      {/* Main content */}
      <div className="relative flex flex-col h-full">
        {children}
      </div>
    </div>
  )
}

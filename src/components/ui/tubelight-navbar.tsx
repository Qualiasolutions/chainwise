"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface TubelightNavBarProps {
  items: NavItem[]
  className?: string
}

export function TubelightNavBar({ items, className }: TubelightNavBarProps) {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState("")
  const [isMobile, setIsMobile] = useState(false)

  // Set active tab based on current pathname
  useEffect(() => {
    const currentItem = items.find(item => pathname === item.url || (item.url !== '/' && pathname.startsWith(item.url)))
    if (currentItem) {
      setActiveTab(currentItem.name)
    } else if (pathname === '/') {
      setActiveTab(items[0]?.name || "")
    }
  }, [pathname, items])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      className={cn(
        "fixed bottom-6 sm:top-6 left-1/2 -translate-x-1/2 z-50",
        className,
      )}
    >
      <div className="flex items-center gap-2 bg-background/80 dark:bg-background/90 border border-border/50 backdrop-blur-xl py-2 px-2 rounded-full shadow-2xl shadow-black/10 dark:shadow-black/30">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-sm font-medium px-4 py-2.5 rounded-full transition-all duration-300 ease-out",
                "text-foreground/70 hover:text-foreground hover:scale-105",
                isActive && "text-primary",
                "group"
              )}
            >
              <span className="hidden md:inline relative z-10">{item.name}</span>
              <span className="md:hidden relative z-10">
                <Icon size={20} strokeWidth={2} />
              </span>
              
              {isActive && (
                <motion.div
                  layoutId="tubelight"
                  className="absolute inset-0 w-full rounded-full -z-0"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                >
                  {/* Main background glow */}
                  <div className="absolute inset-0 bg-primary/10 dark:bg-primary/15 rounded-full" />
                  
                  {/* Top tube light effect */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full">
                    {/* Outer glow */}
                    <div className="absolute w-16 h-3 bg-primary/30 rounded-full blur-md -top-1.5 -left-2" />
                    {/* Inner glow */}
                    <div className="absolute w-12 h-2 bg-primary/40 rounded-full blur-sm -top-1" />
                    {/* Core light */}
                    <div className="absolute w-8 h-1 bg-primary/60 rounded-full blur-[1px] top-0 left-2" />
                  </div>
                  
                  {/* Bottom subtle glow */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary/20 rounded-full blur-sm" />
                  
                  {/* Side accent lights */}
                  <div className="absolute top-1/2 -translate-y-1/2 -left-0.5 w-0.5 h-4 bg-primary/30 rounded-full blur-[1px]" />
                  <div className="absolute top-1/2 -translate-y-1/2 -right-0.5 w-0.5 h-4 bg-primary/30 rounded-full blur-[1px]" />
                </motion.div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

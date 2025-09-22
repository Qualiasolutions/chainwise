"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useState } from "react"

interface ProfessionalCardProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "elevated" | "flat" | "accent"
  hover?: boolean
  bordered?: boolean
  padding?: "none" | "sm" | "md" | "lg"
}

const variantStyles = {
  default: {
    background: "bg-white dark:bg-slate-900",
    border: "border border-slate-200 dark:border-slate-800",
    shadow: "shadow-sm"
  },
  elevated: {
    background: "bg-white dark:bg-slate-900",
    border: "border border-slate-200 dark:border-slate-800",
    shadow: "shadow-md"
  },
  flat: {
    background: "bg-slate-50 dark:bg-slate-800/50",
    border: "border-0",
    shadow: "shadow-none"
  },
  accent: {
    background: "bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900",
    border: "border border-slate-200 dark:border-slate-800",
    shadow: "shadow-sm"
  }
}

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6"
}

export function ProfessionalCard({
  children,
  className,
  variant = "default",
  hover = true,
  bordered = true,
  padding = "md",
  ...props
}: ProfessionalCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const styles = variantStyles[variant]

  return (
    <motion.div
      className={cn(
        "rounded-sm overflow-hidden transition-all duration-200",
        styles.background,
        bordered && styles.border,
        styles.shadow,
        paddingStyles[padding],
        hover && "hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700",
        className
      )}
      animate={hover && isHovered ? { y: -1 } : { y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Specialized variants for different use cases
export function MetricsCard({
  children,
  className,
  ...props
}: Omit<ProfessionalCardProps, "variant" | "padding">) {
  return (
    <ProfessionalCard
      variant="elevated"
      padding="lg"
      className={cn("relative", className)}
      {...props}
    >
      {children}
    </ProfessionalCard>
  )
}

export function ChartCard({
  children,
  className,
  ...props
}: Omit<ProfessionalCardProps, "variant" | "padding">) {
  return (
    <ProfessionalCard
      variant="default"
      padding="md"
      className={cn("min-h-[400px]", className)}
      {...props}
    >
      {children}
    </ProfessionalCard>
  )
}

export function DataCard({
  children,
  className,
  ...props
}: Omit<ProfessionalCardProps, "variant">) {
  return (
    <ProfessionalCard
      variant="flat"
      className={cn("", className)}
      {...props}
    >
      {children}
    </ProfessionalCard>
  )
}

// Professional table wrapper
export function TableCard({
  children,
  className,
  ...props
}: Omit<ProfessionalCardProps, "variant" | "padding">) {
  return (
    <ProfessionalCard
      variant="default"
      padding="none"
      className={cn("overflow-hidden", className)}
      {...props}
    >
      {children}
    </ProfessionalCard>
  )
}
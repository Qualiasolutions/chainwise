import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base button styles with ChainWise design system
  "interactive-base inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainwise-primary-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed touch-target [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary brand button - ChainWise gradient
        primary: "bg-gradient-to-r from-chainwise-primary-600 to-chainwise-secondary-500 text-white shadow-brand hover:from-chainwise-primary-700 hover:to-chainwise-secondary-600 hover:shadow-brand-lg active:scale-[0.98]",
        
        // Secondary brand button
        secondary: "bg-gradient-to-r from-chainwise-secondary-500 to-chainwise-accent-600 text-white shadow-md hover:from-chainwise-secondary-600 hover:to-chainwise-accent-700 hover:shadow-lg active:scale-[0.98]",
        
        // Outline button
        outline: "border-2 border-chainwise-primary-600 text-chainwise-primary-700 bg-white shadow-sm hover:bg-chainwise-primary-50 hover:border-chainwise-primary-700 active:bg-chainwise-primary-100",
        
        // Ghost button
        ghost: "text-chainwise-neutral-700 hover:bg-chainwise-neutral-100 hover:text-chainwise-neutral-900 active:bg-chainwise-neutral-200",
        
        // Destructive button
        destructive: "bg-chainwise-error-500 text-white shadow-sm hover:bg-chainwise-error-600 active:scale-[0.98]",
        
        // Success button  
        success: "bg-chainwise-success-500 text-white shadow-sm hover:bg-chainwise-success-600 active:scale-[0.98]",
        
        // Link button
        link: "text-chainwise-primary-600 underline-offset-4 hover:underline hover:text-chainwise-primary-700 p-0 h-auto",
      },
      size: {
        // Touch-friendly sizes (minimum 44px)
        sm: "h-10 px-4 text-sm rounded-lg", // 40px + padding = 44px touch target
        md: "h-11 px-6 text-base rounded-lg", // Default comfortable size  
        lg: "h-12 px-8 text-lg rounded-xl", // Large CTAs
        xl: "h-14 px-10 text-xl rounded-xl", // Hero buttons
        icon: "h-11 w-11 rounded-lg", // Square icon buttons
        "icon-sm": "h-10 w-10 rounded-lg", // Small icon buttons
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

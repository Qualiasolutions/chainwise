"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogIn, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"

interface AuthButtonsProps {
  mobile?: boolean
}

export function AuthButtons({ mobile = false }: AuthButtonsProps) {
  if (mobile) {
    return (
      <div className="space-y-3">
        <Button
          asChild
          variant="outline"
          className="w-full justify-center border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950"
        >
          <Link href="/auth/signin">
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Link>
        </Button>
        <Button
          asChild
          className="w-full justify-center bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25 dark:shadow-purple-500/20"
        >
          <Link href="/auth/signup">
            <UserPlus className="mr-2 h-4 w-4" />
            Get Started
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground"
      >
        <Link href="/auth/signin">
          Sign In
        </Link>
      </Button>
      <Button
        asChild
        size="sm"
        className={cn(
          "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800",
          "text-white shadow-lg shadow-purple-500/25 dark:shadow-purple-500/20",
          "border-0 transition-all duration-200 hover:scale-105"
        )}
      >
        <Link href="/auth/signup">
          Get Started
        </Link>
      </Button>
    </div>
  )
}
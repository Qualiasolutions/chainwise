"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Bot, User, LogIn, UserPlus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SimpleThemeToggle } from "@/components/theme-toggle"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import { cn } from "@/lib/utils"

export function HeaderNavigation() {
  const { user, signOut } = useSupabaseAuth()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="fixed top-0 z-50 w-full">
      {/* Glassmorphism Header */}
      <div className="relative">
        {/* Background with gradient and blur */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-purple-950/85 to-slate-950/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-purple-500/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/5 to-purple-600/10" />
        {/* Subtle bottom glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />

        {/* Content */}
        <div className="relative container flex h-16 max-w-screen-2xl items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logo.png"
            alt="ChainWise Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="text-xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            ChainWise
          </span>
        </Link>

        {/* Center Navigation - Only show if user is authenticated */}
        {user && (
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link
                    href="/dashboard"
                    className={cn(
                      pathname === "/dashboard" && "bg-accent text-accent-foreground"
                    )}
                  >
                    Dashboard
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link
                    href="/portfolio"
                    className={cn(
                      pathname === "/portfolio" && "bg-accent text-accent-foreground"
                    )}
                  >
                    Portfolio
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link
                    href="/dashboard/ai"
                    className={cn(
                      pathname === "/dashboard/ai" && "bg-accent text-accent-foreground"
                    )}
                  >
                    AI Assistant
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link href="/contact">
                    Contact Us
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        )}

        {/* Right side - Auth buttons or User menu */}
        <div className="flex items-center space-x-2">
          <SimpleThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt="Profile" />
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.user_metadata?.full_name || user.email}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/portfolio">
                    <Bot className="mr-2 h-4 w-4" />
                    Portfolio
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/ai">
                    <Bot className="mr-2 h-4 w-4" />
                    AI Assistant
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/signin">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
        </div>
        </div>

      {/* Mobile Navigation - Only show if user is authenticated */}
      {user && (
        <div className="md:hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-purple-950/90 to-slate-950/95 backdrop-blur-xl border-t border-white/10 shadow-lg shadow-purple-500/10" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
          <div className="relative">
          <nav className="flex items-center justify-around py-2">
            <Link
              href="/dashboard"
              className={cn(
                "flex flex-col items-center py-2 px-3 text-xs",
                pathname === "/dashboard" ? "text-purple-300" : "text-white/70"
              )}
            >
              <Bot className="h-5 w-5 mb-1" />
              Dashboard
            </Link>
            <Link
              href="/portfolio"
              className={cn(
                "flex flex-col items-center py-2 px-3 text-xs",
                pathname === "/portfolio" ? "text-purple-300" : "text-white/70"
              )}
            >
              <User className="h-5 w-5 mb-1" />
              Portfolio
            </Link>
            <Link
              href="/dashboard/ai"
              className={cn(
                "flex flex-col items-center py-2 px-3 text-xs",
                pathname === "/dashboard/ai" ? "text-purple-300" : "text-white/70"
              )}
            >
              <Bot className="h-5 w-5 mb-1" />
              AI Assistant
            </Link>
            <Link
              href="/contact"
              className={cn(
                "flex flex-col items-center py-2 px-3 text-xs",
                pathname === "/contact" ? "text-purple-300" : "text-white/70"
              )}
            >
              <User className="h-5 w-5 mb-1" />
              Contact
            </Link>
          </nav>
          </div>
        </div>
      )}
    </header>
  )
}
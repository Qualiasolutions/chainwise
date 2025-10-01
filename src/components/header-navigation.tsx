"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Bot, User, LogIn, UserPlus, ChevronDown, Wrench, FileText, TrendingUp, Zap, Bell, Brain, Gem, Activity, Waves, Flame } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
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
                    href="/market"
                    className={cn(
                      pathname === "/market" && "bg-accent text-accent-foreground"
                    )}
                  >
                    Market
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link
                    href="/highlights"
                    className={cn(
                      pathname === "/highlights" && "bg-accent text-accent-foreground"
                    )}
                  >
                    Highlights
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link
                    href="/alerts"
                    className={cn(
                      pathname === "/alerts" && "bg-accent text-accent-foreground"
                    )}
                  >
                    Alerts
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
                <NavigationMenuTrigger>
                  <Wrench className="mr-2 h-4 w-4" />
                  Tools
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <div className="row-span-3">
                      <NavigationMenuLink asChild>
                        <div className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md">
                          <Wrench className="h-6 w-6" />
                          <div className="mb-2 mt-4 text-lg font-medium">
                            Pro Tools
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Advanced tools for crypto analysis and portfolio management
                          </p>
                        </div>
                      </NavigationMenuLink>
                    </div>
                    <div className="grid gap-2">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/tools/whale-tracker"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            <div className="text-sm font-medium leading-none">Whale Tracker</div>
                          </div>
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                            Track whale wallets and analyze their trading patterns
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/dashboard/whale-feed"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="flex items-center gap-2">
                            <Waves className="h-4 w-4 text-purple-500" />
                            <div className="text-sm font-medium leading-none">Whale Feed <Badge className="ml-1 bg-purple-500 text-xs">Elite</Badge></div>
                          </div>
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                            Real-time feed of significant crypto transactions
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/tools/ai-reports"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <div className="text-sm font-medium leading-none">AI Reports</div>
                          </div>
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                            Generate weekly Pro and monthly Elite market reports
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/tools/smart-alerts"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            <div className="text-sm font-medium leading-none">Smart Alerts</div>
                          </div>
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                            Get notified about important market movements
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/tools/narrative-scanner"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            <div className="text-sm font-medium leading-none">Narrative Scanner</div>
                          </div>
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                            AI-powered narrative and sentiment analysis
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/tools/portfolio-allocator"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            <div className="text-sm font-medium leading-none">Portfolio Allocator</div>
                          </div>
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                            Optimize your portfolio allocation using AI
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/tools/altcoin-detector"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="flex items-center gap-2">
                            <Gem className="h-4 w-4" />
                            <div className="text-sm font-medium leading-none">Altcoin Early Detector</div>
                          </div>
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                            Discover hidden gem altcoins before they moon
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/tools/signals-pack"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            <div className="text-sm font-medium leading-none">ChainWise Signals Pack</div>
                          </div>
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                            AI-powered trading signals for maximum profit
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/tools/whale-copy"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            <div className="text-sm font-medium leading-none">Whale Copy Signals</div>
                          </div>
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                            Copy whale trading patterns for Elite profits
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </div>
                </NavigationMenuContent>
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
              <DropdownMenuContent className="w-56 z-[9999]" align="end" forceMount>
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
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <User className="mr-2 h-4 w-4" />
                    Settings
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
                href="/highlights"
                className={cn(
                  "flex flex-col items-center py-2 px-3 text-xs",
                  pathname === "/highlights" ? "text-purple-300" : "text-white/70"
                )}
              >
                <Flame className="h-5 w-5 mb-1" />
                Highlights
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
                href="/tools/whale-tracker"
                className={cn(
                  "flex flex-col items-center py-2 px-3 text-xs",
                  pathname.startsWith("/tools") ? "text-purple-300" : "text-white/70"
                )}
              >
                <Wrench className="h-5 w-5 mb-1" />
                Tools
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
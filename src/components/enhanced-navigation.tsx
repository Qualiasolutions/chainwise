"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  Home,
  TrendingUp,
  Wallet,
  Bot,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Sparkles,
  CreditCard,
  User,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  badge?: string
  description?: string
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Home,
    description: "Overview of your crypto portfolio and performance"
  },
  {
    href: "/market",
    label: "Market",
    icon: TrendingUp,
    description: "Real-time cryptocurrency market data and trends"
  },
  {
    href: "/portfolio",
    label: "Portfolio",
    icon: Wallet,
    description: "Manage your crypto holdings and investments"
  },
  {
    href: "/dashboard/ai",
    label: "AI Chat",
    icon: Bot,
    badge: "AI",
    description: "Get AI-powered crypto investment advice"
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: BarChart3,
    description: "Deep insights into your portfolio performance"
  }
]

const profileMenuItems = [
  { href: "/settings/profile", label: "Profile Settings", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function EnhancedNavigation() {
  const { user, profile, signOut } = useSupabaseAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const isActivePath = (href: string) => pathname === href || pathname.startsWith(href + "/")

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40">
      {/* Modern Header Background */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-blue-500/5" />
      </div>

      {/* Header Content */}
      <div className="relative flex h-16 items-center">
        {/* Logo Section - Far Left */}
        <div className="flex items-center px-6">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-blue-600 rounded-lg blur-md opacity-30 group-hover:opacity-50 transition-all duration-300" />
              <Image
                src="/logo.png"
                alt="ChainWise"
                width={32}
                height={32}
                className="relative rounded-lg ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              ChainWise
            </span>
          </Link>
        </div>

        {/* Desktop Navigation - Center */}
        <div className="flex-1 flex justify-center">
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = isActivePath(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                    isActive
                      ? "bg-gradient-to-r from-violet-500/10 to-blue-500/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-primary hover:bg-accent/50"
                  )}
                >
                  <Icon className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                  )} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-xs bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right Section - User & Auth */}
        <div className="flex items-center space-x-4 px-6">
          {user ? (
            <>
              {/* Credits Display */}
              {profile && (
                <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-primary/20">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">{profile.credits}</span>
                  <span className="text-xs text-muted-foreground">Credits</span>
                </div>
              )}

              {/* Enhanced User Menu */}
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50 p-2">
                      <Avatar className="w-8 h-8 border-2 border-primary/20 mr-2">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-violet-600 to-blue-600 text-white text-sm">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="w-3 h-3" />
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-64 p-2">
                        {/* User Info Header */}
                        <div className="px-3 py-3 border-b border-border/50">
                          <p className="text-sm font-semibold">{profile?.full_name || 'User'}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          {profile && (
                            <div className="flex items-center mt-2 text-xs text-muted-foreground">
                              <CreditCard className="w-3 h-3 mr-1" />
                              {profile.credits} Credits Available
                            </div>
                          )}
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          {profileMenuItems.map((item) => {
                            const Icon = item.icon
                            return (
                              <NavigationMenuLink asChild key={item.href}>
                                <Link
                                  href={item.href}
                                  className="flex items-center space-x-3 px-3 py-2 text-sm rounded-md hover:bg-accent/50 transition-colors"
                                >
                                  <Icon className="w-4 h-4 text-muted-foreground" />
                                  <span>{item.label}</span>
                                </Link>
                              </NavigationMenuLink>
                            )
                          })}
                        </div>

                        {/* Sign Out */}
                        <div className="pt-2 border-t border-border/50">
                          <button
                            onClick={signOut}
                            className="flex items-center space-x-3 px-3 py-2 text-sm rounded-md hover:bg-accent/50 transition-colors w-full text-left text-destructive"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-lg">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-background/95 backdrop-blur-xl border-l border-border/50">
              <SheetHeader className="pb-6">
                <SheetTitle className="flex items-center space-x-3">
                  <Image
                    src="/logo.png"
                    alt="ChainWise"
                    width={28}
                    height={28}
                    className="rounded-lg"
                  />
                  <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent font-bold">
                    ChainWise
                  </span>
                </SheetTitle>
              </SheetHeader>

              {/* Mobile Navigation */}
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = isActivePath(item.href)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-violet-500/20 to-blue-500/20 border border-primary/30 text-primary"
                          : "hover:bg-accent/50"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto px-2 py-0.5 text-xs bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>

              {/* Mobile User Section */}
              {user && (
                <div className="mt-8 pt-6 border-t border-border/50 space-y-2">
                  {/* Credits in Mobile */}
                  {profile && (
                    <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-violet-500/10 to-blue-500/10 rounded-lg border border-primary/20">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Credits</span>
                      </div>
                      <span className="text-sm font-semibold text-primary">{profile.credits}</span>
                    </div>
                  )}

                  {/* Profile Menu Items */}
                  {profileMenuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <Icon className="w-5 h-5 text-muted-foreground" />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}

                  {/* Mobile Sign Out */}
                  <button
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-accent/50 transition-colors w-full text-left text-destructive"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
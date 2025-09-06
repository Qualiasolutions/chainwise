"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { 
  Menu, 
  X,
  BarChart3,
  MessageSquare,
  Briefcase,
  ShoppingCart,
  BookOpen,
  Settings,
  LogOut,
  User,
  Bell
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useSupabase } from "@/components/providers/supabase-provider"
import { MobileMenu } from "./mobile-menu"
import { AuthButtons } from "./auth-buttons"

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
  { name: 'AI Chat', href: '/chat', icon: MessageSquare },
  { name: 'Marketplace', href: '/marketplace', icon: ShoppingCart },
  { name: 'Learn', href: '/learn', icon: BookOpen },
]

export function MainHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useSupabase()

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-200 p-2">
                  <Image
                    src="/logo.png"
                    alt="ChainWise Logo"
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain group-hover:scale-110 transition-transform"
                  />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400 to-blue-400 opacity-0 group-hover:opacity-30 blur-md transition-opacity" />
                <div className="absolute -inset-1 rounded-2xl border border-purple-400/20 group-hover:border-purple-400/40 transition-colors" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-blue-300 transition-all duration-200 tracking-wide">
                  CHAINWISE
                </span>
                <span className="text-xs text-gray-400 font-medium tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
                  AI CRYPTO INTELLIGENCE
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavigationMenu>
              <NavigationMenuList>
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname.startsWith(item.href)
                  
                  return (
                    <NavigationMenuItem key={item.name}>
                      <Link href={item.href} legacyBehavior passHref>
                        <NavigationMenuLink
                          className={cn(
                            "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                            isActive && "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                          )}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          {item.name}
                          {isActive && (
                            <div className="absolute -bottom-1 left-1/2 h-0.5 w-8 -translate-x-1/2 bg-purple-500 rounded-full" />
                          )}
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  )
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* Right side - Auth or User Menu */}
          <div className="flex items-center space-x-3">
            
            {user ? (
              <div className="hidden md:flex items-center space-x-3">
                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="relative h-10 w-10 rounded-full hover:bg-purple-500/10 hover:text-purple-400 transition-all duration-200 group"
                    >
                      <Bell className="h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white border-2 border-background animate-pulse">
                        3
                      </Badge>
                      <span className="sr-only">View notifications</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end">
                    <div className="flex items-center justify-between p-3 border-b border-border">
                      <h3 className="font-semibold text-lg">Notifications</h3>
                      <Badge variant="secondary" className="text-xs">
                        3 new
                      </Badge>
                    </div>
                    <div className="py-2">
                      {/* Sample notifications */}
                      <DropdownMenuItem className="flex flex-col items-start p-3 hover:bg-purple-500/5 cursor-pointer">
                        <div className="flex items-start justify-between w-full">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Portfolio Alert</p>
                              <p className="text-xs text-muted-foreground mt-1">Your BTC holdings increased by 5.2% today</p>
                              <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex flex-col items-start p-3 hover:bg-purple-500/5 cursor-pointer">
                        <div className="flex items-start justify-between w-full">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">AI Analysis Ready</p>
                              <p className="text-xs text-muted-foreground mt-1">New market analysis available for your portfolio</p>
                              <p className="text-xs text-muted-foreground mt-1">15 minutes ago</p>
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex flex-col items-start p-3 hover:bg-purple-500/5 cursor-pointer">
                        <div className="flex items-start justify-between w-full">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Credits Refilled</p>
                              <p className="text-xs text-muted-foreground mt-1">Your monthly credits have been restored</p>
                              <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    </div>
                    <div className="border-t border-border p-3">
                      <Button variant="ghost" size="sm" className="w-full text-purple-400 hover:text-purple-300 hover:bg-purple-500/10">
                        View All Notifications
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ''} />
                        <AvatarFallback className="bg-purple-100 dark:bg-purple-900">
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.email}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          Free Plan
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5">
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <AuthButtons />
            )}

            {/* Mobile controls */}
            <div className="flex items-center space-x-2 md:hidden">
              {/* Mobile notifications */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="relative h-9 w-9 rounded-full hover:bg-purple-500/10"
                    >
                      <Bell className="h-4 w-4 text-gray-400" />
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white border border-background">
                        3
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72 max-h-80 overflow-y-auto" align="end">
                    <div className="flex items-center justify-between p-3 border-b border-border">
                      <h3 className="font-medium">Notifications</h3>
                      <Badge variant="secondary" className="text-xs">3 new</Badge>
                    </div>
                    <div className="py-2">
                      <DropdownMenuItem className="flex flex-col items-start p-3">
                        <p className="text-sm font-medium">Portfolio Alert</p>
                        <p className="text-xs text-muted-foreground mt-1">BTC increased by 5.2%</p>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex flex-col items-start p-3">
                        <p className="text-sm font-medium">AI Analysis Ready</p>
                        <p className="text-xs text-muted-foreground mt-1">New analysis available</p>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="hover:bg-purple-500/10 hover:text-purple-400 transition-all duration-200"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navigation={navigation}
        user={user}
        onSignOut={handleSignOut}
      />
    </header>
  )
}
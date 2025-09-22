"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home,
  TrendingUp,
  Wallet,
  Bot,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  CreditCard,
  User,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  badge?: string
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/market", label: "Market", icon: TrendingUp },
  { href: "/portfolio", label: "Portfolio", icon: Wallet },
  { href: "/dashboard/ai", label: "AI Chat", icon: Bot, badge: "AI" },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 }
]

export function ModernNavigation() {
  const { user, profile, signOut } = useSupabaseAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <header className="fixed top-0 z-50 w-full">
      {/* Modern Glassmorphic Header */}
      <div className="relative">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background backdrop-blur-2xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-transparent to-blue-600/10" />
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        {/* Bottom Border Glow */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        {/* Navigation Content */}
        <div className="relative">
          <div className="container mx-auto pl-2 pr-6 md:pl-4 md:pr-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-blue-600 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <Image
                    src="/logo.png"
                    alt="ChainWise"
                    width={36}
                    height={36}
                    className="relative rounded-lg"
                  />
                </div>
                <span className="text-xl font-bold text-gradient">
                  ChainWise
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "nav-item-modern flex items-center space-x-2 group",
                        isActive && "active"
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
                    </Link>
                  )
                })}
              </nav>

              {/* Right Section */}
              <div className="flex items-center space-x-2 md:space-x-4 ml-auto">
                {user ? (
                  <>
                    {/* Credits Display */}
                    {profile && (
                      <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                        <CreditCard className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{profile.credits} Credits</span>
                      </div>
                    )}

                    {/* User Menu */}
                    <div className="relative group">
                      <Button
                        variant="ghost"
                        className="relative flex items-center space-x-2 p-1.5 rounded-lg hover:bg-accent/10"
                      >
                        <Avatar className="w-8 h-8 border-2 border-primary/20">
                          <AvatarImage src={user.user_metadata?.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-br from-violet-600 to-blue-600 text-white">
                            {user.email?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:rotate-90" />
                      </Button>

                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-2 w-64 py-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
                        <div className="px-4 py-3 border-b border-border/50">
                          <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>

                        <div className="py-2">
                          <Link
                            href="/settings/profile"
                            className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-accent/10 transition-colors"
                          >
                            <User className="w-4 h-4" />
                            <span>Profile Settings</span>
                          </Link>
                          <Link
                            href="/settings"
                            className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-accent/10 transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                          </Link>
                        </div>

                        <div className="pt-2 border-t border-border/50">
                          <button
                            onClick={signOut}
                            className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-accent/10 transition-colors w-full text-left text-destructive"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href="/auth/signin">
                      <Button variant="ghost" className="btn-modern-outline">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button className="btn-modern">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X /> : <Menu />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/50"
          >
            <nav className="container mx-auto px-4 py-4">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                      isActive ? "bg-primary/10 text-primary" : "hover:bg-accent/10"
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

              {user && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <button
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-accent/10 transition-colors w-full text-left text-destructive"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Menu, 
  X,
  BarChart3,
  MessageSquare,
  Briefcase,
  ShoppingCart,
  BookOpen,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Home,
  AlertCircle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useSupabase } from "@/components/providers/supabase-provider"
import { useNotifications } from "@/hooks/use-notifications"

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
  { name: 'AI Chat', href: '/chat', icon: MessageSquare },
  { name: 'Marketplace', href: '/marketplace', icon: ShoppingCart },
  { name: 'Alerts', href: '/alerts', icon: AlertCircle },
]

export function ModernNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useSupabase()
  
  // Real-time notifications
  const { 
    notifications, 
    unreadCount, 
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead 
  } = useNotifications({ 
    channel: 'in_app', 
    limit: 10,
    realTime: true 
  })

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <motion.header
      data-header="true"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled 
          ? "bg-black/90 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-purple-500/20" 
          : "bg-black/20 backdrop-blur-sm"
      )}
      style={{
        backdropFilter: isScrolled ? 'blur(24px) saturate(180%)' : 'blur(8px)',
        WebkitBackdropFilter: isScrolled ? 'blur(24px) saturate(180%)' : 'blur(8px)'
      }}
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
          
          {/* Logo Section - Responsive */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 sm:space-x-3"
          >
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="ChainWise Logo"
                  width={48}
                  height={48}
                  className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 object-contain transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg lg:text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  CHAINWISE
                </span>
                <span className="text-[10px] sm:text-xs text-gray-400 font-medium tracking-wider hidden sm:block">
                  AI CRYPTO INTELLIGENCE
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              
              return (
                <motion.div
                  key={item.name}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "relative px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 group",
                      isActive
                        ? "text-white bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                    
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-400 rounded-full"
                      />
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/5 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                  </Link>
                </motion.div>
              )
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {user ? (
              <>
                {/* Desktop User Actions */}
                <div className="hidden lg:flex items-center space-x-3">
                  {/* Notifications */}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="relative h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
                        >
                          <Bell className="h-4 w-4 text-gray-300" />
                          {unreadCount > 0 && (
                            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white border-2 border-black flex items-center justify-center animate-pulse">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </Badge>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-80 bg-black/90 backdrop-blur-md border-white/10">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-white">Notifications</h3>
                          {unreadCount > 0 && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-xs text-purple-400 hover:text-purple-300 h-auto p-1"
                              onClick={markAllAsRead}
                            >
                              Mark all read
                            </Button>
                          )}
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto">
                          {notificationsLoading ? (
                            <div className="p-4 text-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto mb-2"></div>
                              <p className="text-xs text-gray-400">Loading notifications...</p>
                            </div>
                          ) : notifications.length > 0 ? (
                            notifications.slice(0, 5).map((notification) => (
                              <DropdownMenuItem 
                                key={notification.id}
                                className={cn(
                                  "flex flex-col items-start p-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-all duration-200",
                                  !notification.read && "bg-purple-500/5 border-l-2 border-l-purple-500"
                                )}
                                onClick={() => !notification.read && markAsRead(notification.id)}
                              >
                                <h4 className="text-sm font-medium text-white mb-1 line-clamp-1">
                                  {notification.title}
                                </h4>
                                <p className="text-xs text-gray-400 line-clamp-2">
                                  {notification.message}
                                </p>
                              </DropdownMenuItem>
                            ))
                          ) : (
                            <div className="p-6 text-center">
                              <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-300">No new notifications</p>
                            </div>
                          )}
                        </div>
                        
                        {notifications.length > 0 && (
                          <div className="p-3 border-t border-white/10">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                              onClick={() => window.location.href = '/notifications'}
                            >
                              View all notifications
                            </Button>
                          </div>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>

                  {/* User Menu */}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 px-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={user.user_metadata?.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                              {user.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-300 hidden xl:block max-w-24 truncate">
                            {user.email?.split('@')[0]}
                          </span>
                          <ChevronDown className="w-3 h-3 text-gray-400 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 bg-black/90 backdrop-blur-md border-white/10" align="end">
                        <div className="p-2">
                          <p className="text-sm text-gray-300">{user.email}</p>
                          <p className="text-xs text-gray-500">Free Plan</p>
                        </div>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem asChild>
                          <Link href="/settings" className="text-gray-300 hover:text-white">
                            <User className="mr-2 h-4 w-4" />
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/settings" className="text-gray-300 hover:text-white">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem onClick={handleSignOut} className="text-gray-300 hover:text-white">
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                </div>

                {/* Mobile Notification Badge */}
                <div className="flex lg:hidden items-center space-x-2">
                  <Link href="/notifications">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
                    >
                      <Bell className="h-4 w-4 text-gray-300" />
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-[10px] bg-gradient-to-r from-purple-500 to-blue-500 text-white border border-black flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="hidden lg:flex items-center space-x-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" asChild className="text-gray-300 hover:text-white">
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0">
                    <Link href="/auth/signup">Get Started</Link>
                  </Button>
                </motion.div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
                    >
                      <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300" />
                    </Button>
                  </motion.div>
                </SheetTrigger>
                <SheetContent 
                  side="right" 
                  className="w-[280px] sm:w-[320px] bg-black/95 backdrop-blur-md border-white/10 p-0"
                >
                  <div className="flex flex-col h-full">
                    {/* Mobile Header */}
                    <div className="p-4 sm:p-6 border-b border-white/10">
                      <div className="flex items-center space-x-3">
                        <Image
                          src="/logo.png"
                          alt="ChainWise Logo"
                          width={32}
                          height={32}
                          className="w-8 h-8 object-contain"
                        />
                        <div>
                          <h3 className="text-lg font-bold text-white">ChainWise</h3>
                          <p className="text-xs text-gray-400">AI Crypto Intelligence</p>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="flex-1 py-4 sm:py-6 overflow-y-auto">
                      <div className="space-y-1 px-3">
                        {navigation.map((item) => {
                          const Icon = item.icon
                          const isActive = pathname.startsWith(item.href)
                          
                          return (
                            <motion.div
                              key={item.name}
                              whileHover={{ x: 4 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Link
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                  "flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300",
                                  isActive
                                    ? "text-white bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30"
                                    : "text-gray-300 hover:text-white hover:bg-white/5"
                                )}
                              >
                                <Icon className="w-5 h-5" />
                                <span>{item.name}</span>
                                {isActive && (
                                  <div className="ml-auto w-1.5 h-1.5 bg-purple-400 rounded-full" />
                                )}
                              </Link>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Mobile User Actions */}
                    {user ? (
                      <div className="p-4 sm:p-6 border-t border-white/10 space-y-3">
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.user_metadata?.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm">
                              {user.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{user.email}</p>
                            <p className="text-xs text-gray-400">Free Plan</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-gray-300 hover:text-white"
                          >
                            <Link href="/settings">
                              <Settings className="mr-1 h-3 w-3" />
                              Settings
                            </Link>
                          </Button>
                          <Button
                            onClick={handleSignOut}
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-gray-300 hover:text-white"
                          >
                            <LogOut className="mr-1 h-3 w-3" />
                            Sign out
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 sm:p-6 border-t border-white/10 space-y-3">
                        <Button asChild variant="outline" className="w-full border-white/20 text-gray-300 hover:text-white">
                          <Link href="/auth/signin">Sign In</Link>
                        </Button>
                        <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0">
                          <Link href="/auth/signup">Get Started Free</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar for Key Actions */}
      {user && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 z-40 safe-area-inset-bottom">
          <div className="grid grid-cols-4 h-16 sm:h-18">
            {navigation.slice(0, 4).map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center space-y-1 transition-all duration-300",
                    isActive
                      ? "text-purple-400"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </motion.header>
  )
}
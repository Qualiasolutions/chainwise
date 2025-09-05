'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSupabase } from '@/components/providers/supabase-provider'
import { TubelightNavBar } from '@/components/ui/tubelight-navbar'
import { 
  Home, 
  MessageSquare, 
  TrendingUp, 
  BookOpen, 
  Briefcase,
  ShoppingCart,
  Moon,
  Sun,
  User,
  Settings,
  CreditCard,
  LogOut,
  LogIn,
  UserPlus,
  Coins,
  ChevronDown
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useTheme } from './ThemeProvider'
import { useSubscription } from '@/hooks/use-subscription'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Main navigation items for tubelight navbar
const mainNavItems = [
  { name: 'Home', url: '/', icon: Home },
  { name: 'Chat', url: '/chat', icon: MessageSquare },
  { name: 'Market', url: '/dashboard', icon: TrendingUp },
  { name: 'Portfolio', url: '/portfolio', icon: Briefcase },
  { name: 'Marketplace', url: '/marketplace', icon: ShoppingCart },
  { name: 'Learn', url: '/learn', icon: BookOpen },
]

export default function Navigation() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { user, session, loading, signOut } = useSupabase()
  const { creditBalance } = useSubscription()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isHomePage = pathname === '/'
  const isDashboardPage = pathname.startsWith('/dashboard')

  // Don't render navigation on dashboard pages (they have their own sidebar)
  if (isDashboardPage) {
    return null
  }

  return (
    <>
      {/* Minimal Top Bar - Only logo and user actions */}
      <nav className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        isHomePage 
          ? "bg-transparent" 
          : "bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg"
      )}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/logo.png"
                alt="ChainWise Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className={cn(
                "text-xl font-bold transition-colors",
                isHomePage ? "text-white" : "text-gray-900 dark:text-white"
              )}>
                ChainWise
              </span>
            </Link>

            {/* Right side actions */}
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className={cn(
                  "transition-colors rounded-full",
                  isHomePage 
                    ? "text-white/80 hover:text-white hover:bg-white/10" 
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </Button>

              {/* User Menu */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={cn(
                      "flex items-center space-x-2 transition-colors rounded-full px-3",
                      isHomePage 
                        ? "text-white/80 hover:text-white hover:bg-white/10" 
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    <User size={18} />
                    {creditBalance !== null && (
                      <Badge variant="secondary" className="text-xs ml-1">
                        <Coins size={12} className="mr-1" />
                        {creditBalance}
                      </Badge>
                    )}
                    <ChevronDown size={14} />
                  </Button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.user_metadata?.name || user.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                      
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings size={16} className="mr-3" />
                        Settings
                      </Link>
                      
                      <Link
                        href="/settings/billing"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <CreditCard size={16} className="mr-3" />
                        Billing
                      </Link>
                      
                      <div className="border-t border-gray-200/50 dark:border-gray-700/50 mt-1 pt-1">
                        <button
                          onClick={() => {
                            signOut()
                            setUserMenuOpen(false)
                          }}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut size={16} className="mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/auth/signin">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "transition-colors rounded-full",
                        isHomePage 
                          ? "text-white/80 hover:text-white hover:bg-white/10" 
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      <LogIn size={16} className="mr-2" />
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button
                      size="sm"
                      className="bg-crypto-primary hover:bg-crypto-secondary text-white rounded-full shadow-lg"
                    >
                      <UserPlus size={16} className="mr-2" />
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Tubelight Navigation Bar - Primary navigation */}
      <TubelightNavBar items={mainNavItems} />
    </>
  )
}
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSupabase } from '@/components/providers/supabase-provider'
import { 
  Home, 
  MessageSquare, 
  TrendingUp, 
  BookOpen, 
  Briefcase,
  Moon,
  Sun,
  Menu,
  X,
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

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/chat', label: 'AI Chat', icon: MessageSquare },
  { href: '/dashboard', label: 'Market', icon: TrendingUp },
  { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/learn', label: 'Learn', icon: BookOpen },
]

export default function Navigation() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { user, session, loading, signOut } = useSupabase()
  const { creditBalance } = useSubscription()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

  return (
    <nav className={cn(
      "sticky top-0 z-50 transition-all duration-300",
      isHomePage 
        ? "bg-transparent backdrop-blur-md border-b border-white/10" 
        : "bg-white dark:bg-gray-800 shadow-lg"
    )}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
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

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-crypto-primary text-white'
                      : isHomePage
                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="flex items-center space-x-4">
            {/* Credits Display (authenticated users) */}
            {session && (
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Coins className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  {creditBalance?.balance ?? 0} credits
                </span>
                {creditBalance?.tier && creditBalance.tier !== 'free' && (
                  <Badge variant="secondary" className="text-xs ml-1">
                    {creditBalance.tier.toUpperCase()}
                  </Badge>
                )}
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* User Menu */}
            {loading ? (
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            ) : session ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.user_metadata?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300 hidden md:block" />
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {user?.user_metadata?.name || user?.email || 'User'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {user?.email}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-1">
                          <Coins className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            {creditBalance?.balance ?? 0} credits
                          </span>
                        </div>
                        {creditBalance?.tier && (
                          <Badge variant="outline" className="text-xs">
                            {creditBalance.tier.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <Link
                        href="/settings/billing"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Billing & Credits</span>
                      </Link>
                      
                      {creditBalance?.tier === 'free' && (
                        <Link
                          href="/pricing"
                          className="flex items-center space-x-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          <span>Upgrade to Pro</span>
                        </Link>
                      )}
                      
                      <button
                        onClick={() => {
                          setUserMenuOpen(false)
                          signOut()
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/signin">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/signup">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            {/* Mobile Auth Section */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {session ? (
                <div className="space-y-2">
                  {/* User Info */}
                  <div className="px-4 py-2">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {user?.user_metadata?.name || user?.email || 'User'}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Coins className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-700 dark:text-blue-300">
                        {creditBalance?.balance ?? 0} credits
                      </span>
                      {creditBalance?.tier && creditBalance.tier !== 'free' && (
                        <Badge variant="secondary" className="text-xs">
                          {creditBalance.tier.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Mobile Menu Items */}
                  <Link
                    href="/settings/billing"
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Billing & Credits</span>
                  </Link>
                  
                  {creditBalance?.tier === 'free' && (
                    <Link
                      href="/pricing"
                      className="flex items-center space-x-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Upgrade to Pro</span>
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut()
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2 px-4">
                  <Link
                    href="/auth/signin"
                    className="flex items-center justify-center space-x-2 py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="flex items-center justify-center space-x-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
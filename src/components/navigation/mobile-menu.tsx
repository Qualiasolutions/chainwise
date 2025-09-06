"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LucideIcon, User, Settings, LogOut, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { AuthButtons } from "./auth-buttons"
import { User as SupabaseUser } from "@supabase/supabase-js"

interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
}

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  navigation: NavigationItem[]
  user: SupabaseUser | null
  onSignOut: () => void
}

export function MobileMenu({ isOpen, onClose, navigation, user, onSignOut }: MobileMenuProps) {
  const pathname = usePathname()

  if (!isOpen) return null

  return (
    <div className="md:hidden">
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5" onClick={onClose}>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                ChainWise
              </span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="-m-2.5 rounded-md p-2.5"
              onClick={onClose}
            >
              <span className="sr-only">Close menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              {/* Navigation Links */}
              <div className="space-y-2 py-6">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname.startsWith(item.href)
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "group flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                        isActive && "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                      )}
                      onClick={onClose}
                    >
                      <Icon className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0",
                        isActive ? "text-purple-600 dark:text-purple-400" : "text-muted-foreground"
                      )} />
                      {item.name}
                    </Link>
                  )
                })}
              </div>

              <Separator />

              {/* User Section */}
              {user ? (
                <div className="py-6">
                  {/* User Info */}
                  <div className="flex items-center px-3 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ''} />
                      <AvatarFallback className="bg-purple-100 dark:bg-purple-900">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{user.email}</p>
                      <p className="text-xs text-muted-foreground">Free Plan</p>
                    </div>
                  </div>

                  {/* Notifications */}
                  <Link
                    href="/notifications"
                    className="group flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={onClose}
                  >
                    <Bell className="mr-3 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    Notifications
                    <Badge className="ml-auto h-5 w-5 rounded-full p-0 text-xs bg-purple-500">
                      2
                    </Badge>
                  </Link>

                  {/* Profile */}
                  <Link
                    href="/settings"
                    className="group flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={onClose}
                  >
                    <User className="mr-3 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    Profile
                  </Link>

                  {/* Settings */}
                  <Link
                    href="/settings"
                    className="group flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={onClose}
                  >
                    <Settings className="mr-3 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    Settings
                  </Link>

                  {/* Sign Out */}
                  <button
                    onClick={() => {
                      onSignOut()
                      onClose()
                    }}
                    className="w-full group flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                  >
                    <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="py-6 px-3">
                  <AuthButtons mobile />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
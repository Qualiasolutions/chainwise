"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSupabase } from "@/components/providers/supabase-provider"
import {
  Bot,
  Home,
  TrendingUp,
  Bell,
  Wallet,
  Settings,
  BookOpen,
  CreditCard,
  LogOut,
  Star,
  Zap,
  Crown,
  ChevronUp,
  User2,
  BarChart3,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useSubscription } from "@/hooks/use-subscription"

// Menu items
const mainMenuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Portfolio",
    url: "/portfolio",
    icon: BarChart3,
  },
  {
    title: "Alerts",
    url: "/alerts",
    icon: Bell,
  },
  {
    title: "AI Chat",
    url: "/chat",
    icon: Bot,
  },
  {
    title: "Learn",
    url: "/learn",
    icon: BookOpen,
  },
]

const settingsMenuItems = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Billing",
    url: "/settings/billing",
    icon: CreditCard,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { session, user, signOut } = useSupabase()
  const { creditBalance } = useSubscription()
  const pathname = usePathname()

  const handleSignOut = () => {
    signOut()
  }

  // Get subscription tier from creditBalance
  const subscriptionTier = creditBalance?.tier || 'free'

  const getTierIcon = () => {
    switch (subscriptionTier) {
      case "elite":
        return <Crown className="h-4 w-4 text-purple-500" />
      case "pro":
        return <Zap className="h-4 w-4 text-blue-500" />
      default:
        return <Star className="h-4 w-4 text-gray-400" />
    }
  }

  const getTierColor = () => {
    switch (subscriptionTier) {
      case "elite":
        return "from-purple-500/20 to-pink-500/20 border-purple-500/30"
      case "pro":
        return "from-blue-500/20 to-cyan-500/20 border-blue-500/30"
      default:
        return "from-gray-500/20 to-gray-600/20 border-gray-500/30"
    }
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-3 p-2">
          <Image
            src="/logo.png"
            alt="ChainWise Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-crypto-primary">ChainWise</span>
            <span className="truncate text-xs text-muted-foreground">AI Crypto Platform</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Subscription Status Card */}
        <SidebarGroup className="mt-auto">
          <div className={`mx-2 rounded-lg border bg-gradient-to-br p-3 ${getTierColor()}`}>
            <div className="flex items-center gap-2 mb-2">
              {getTierIcon()}
              <span className="text-sm font-medium capitalize">
                {subscriptionTier} Plan
              </span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Credits:</span>
                <span className="font-medium text-crypto-primary">
                  {creditBalance?.balance || 0}
                </span>
              </div>
              {subscriptionTier !== "elite" && (
                <Link href="/pricing">
                  <Button variant="outline" size="sm" className="w-full mt-2 h-7">
                    Upgrade
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src=""
                      alt={user?.user_metadata?.name || user?.email || "User"}
                    />
                    <AvatarFallback className="rounded-lg bg-crypto-primary text-white">
                      {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.user_metadata?.name || user?.email || "User"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src=""
                        alt={user?.user_metadata?.name || user?.email || "User"}
                      />
                      <AvatarFallback className="rounded-lg bg-crypto-primary text-white">
                        {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.user_metadata?.name || user?.email || "User"}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <User2 className="mr-2 h-4 w-4" />
                    Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings/billing">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
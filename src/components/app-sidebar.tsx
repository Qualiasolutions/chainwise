"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  TrendingUp,
  Users,
  BarChart3,
  DollarSign,
  Wallet,
  Bell,
  User,
  Settings,
  CreditCard,
  Zap,
  Bitcoin,
  Coins,
  Target,
  Activity,
  Brain,
  Calculator,
  Shield,
  TrendingDown
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Dynamic data for ChainWise AI advisory platform
const getDynamicData = (user: any) => {
  // Navigation for authenticated users
  const authenticatedNavMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/dashboard",
        },
        {
          title: "Analytics",
          url: "/dashboard/analytics",
        },
      ],
    },
    {
      title: "Portfolio",
      url: "/portfolio",
      icon: PieChart,
    },
    {
      title: "Market",
      url: "/market",
      icon: Bitcoin,
    },
    {
      title: "AI Assistant",
      url: "/dashboard/ai",
      icon: Bot,
    },
    {
      title: "AI Tools",
      url: "#",
      icon: Brain,
      items: [
        {
          title: "DCA Planner",
          url: "/tools/dca-planner",
        },
        {
          title: "Portfolio Allocator",
          url: "/tools/portfolio-allocator",
        },
        {
          title: "Scam Detector",
          url: "/tools/scam-detector",
        },
      ],
    },
  ]

  // Navigation for unauthenticated users - only public pages
  const publicNavMain = [
    {
      title: "Home",
      url: "/",
      icon: Frame,
    },
    {
      title: "Features",
      url: "/#features",
      icon: SquareTerminal,
    },
    {
      title: "Pricing",
      url: "/#pricing",
      icon: CreditCard,
    },
    {
      title: "Contact",
      url: "/contact",
      icon: Users,
    },
  ]

  return {
    user: {
      name: user?.user_metadata?.full_name || user?.email || "User",
      email: user?.email || "",
      avatar: user?.user_metadata?.avatar_url || "",
    },
    teams: [
      {
        name: "ChainWise AI",
        logo: Bot,
        plan: user ? "AI Advisory" : "Get Started",
      },
    ],
    navMain: user ? authenticatedNavMain : publicNavMain,
  }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useSupabaseAuth()
  const data = getDynamicData(user)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
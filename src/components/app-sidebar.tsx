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
  Brain
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
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
const getDynamicData = (user: any) => ({
  user: {
    name: user?.user_metadata?.full_name || user?.email || "User",
    email: user?.email || "",
    avatar: user?.user_metadata?.avatar_url || "",
  },
  teams: [
    {
      name: "ChainWise AI",
      logo: Bot,
      plan: "AI Advisory",
    },
  ],
  navMain: [
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
      items: [
        {
          title: "View Portfolio",
          url: "/portfolio",
        },
        {
          title: "Analytics",
          url: "/portfolio/analytics",
        },
      ],
    },
    {
      title: "Market",
      url: "/market",
      icon: Bitcoin,
      items: [
        {
          title: "Live Prices",
          url: "/market",
        },
        {
          title: "Market Overview",
          url: "/market/overview",
        },
      ],
    },
    {
      title: "AI Assistant",
      url: "/dashboard/ai",
      icon: Bot,
      items: [
        {
          title: "Chat",
          url: "/dashboard/ai",
        },
        {
          title: "AI Insights",
          url: "/dashboard/ai/insights",
        },
      ],
    },
  ],
  projects: [
    {
      name: "AI Market Analysis",
      url: "/dashboard/ai",
      icon: Brain,
    },
    {
      name: "Portfolio Insights",
      url: "/portfolio",
      icon: Activity,
    },
  ],
})

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
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
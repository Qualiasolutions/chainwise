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
  Activity
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data for the stunning crypto trading platform
const data = {
  user: {
    name: "Alex Thompson",
    email: "alex@chainwise.app",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Personal Portfolio",
      logo: PieChart,
      plan: "Elite",
    },
    {
      name: "Trading Team",
      logo: TrendingUp,
      plan: "Pro",
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
        {
          title: "Performance",
          url: "/dashboard/performance",
        },
      ],
    },
    {
      title: "Portfolio",
      url: "/portfolio",
      icon: PieChart,
      items: [
        {
          title: "Holdings",
          url: "/portfolio/holdings",
        },
        {
          title: "Allocation",
          url: "/portfolio/allocation",
        },
        {
          title: "History",
          url: "/portfolio/history",
        },
        {
          title: "P&L Report",
          url: "/portfolio/pnl",
        },
      ],
    },
    {
      title: "Trading",
      url: "/trading",
      icon: TrendingUp,
      items: [
        {
          title: "Spot Trading",
          url: "/trading/spot",
        },
        {
          title: "Futures",
          url: "/trading/futures",
        },
        {
          title: "Options",
          url: "/trading/options",
        },
        {
          title: "Order History",
          url: "/trading/orders",
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
          url: "/market/prices",
        },
        {
          title: "Watchlist",
          url: "/market/watchlist",
        },
        {
          title: "Heatmap",
          url: "/market/heatmap",
        },
        {
          title: "News & Analysis",
          url: "/market/news",
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
          title: "Market Insights",
          url: "/dashboard/ai/insights",
        },
        {
          title: "Strategy Builder",
          url: "/dashboard/ai/strategy",
        },
      ],
    },
    {
      title: "Wallet",
      url: "/wallet",
      icon: Wallet,
      items: [
        {
          title: "Deposits",
          url: "/wallet/deposits",
        },
        {
          title: "Withdrawals",
          url: "/wallet/withdrawals",
        },
        {
          title: "Transfer",
          url: "/wallet/transfer",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Bitcoin Strategy",
      url: "/strategies/bitcoin",
      icon: Bitcoin,
    },
    {
      name: "DeFi Portfolio",
      url: "/strategies/defi",
      icon: Coins,
    },
    {
      name: "Swing Trading",
      url: "/strategies/swing",
      icon: Target,
    },
    {
      name: "Scalping Bot",
      url: "/strategies/scalping",
      icon: Zap,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
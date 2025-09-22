"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import DashboardSkeleton from "@/components/ui/dashboard-skeleton"
import AuthRequired from "@/components/auth/AuthRequired"

function DashboardBreadcrumb() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/">
            ChainWise
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>Dashboard</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useSupabaseAuth()

  // Show loading skeleton while checking authentication
  if (loading) {
    return <DashboardSkeleton />
  }

  // Show auth required if not authenticated
  if (!user) {
    return <AuthRequired />
  }

  // Return children directly since sidebar is handled globally
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {children}
    </div>
  )
}
"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"

interface GlobalSidebarLayoutProps {
  children: React.ReactNode
}

function DynamicBreadcrumb() {
  const pathname = usePathname()

  const getBreadcrumbData = () => {
    const segments = pathname.split('/').filter(Boolean)

    if (pathname === '/') return { title: 'Home', segments: [{ label: 'Home', href: '/' }] }
    if (pathname === '/market') return { title: 'Market', segments: [{ label: 'Market', href: '/market' }] }
    if (pathname === '/portfolio') return { title: 'Portfolio', segments: [{ label: 'Portfolio', href: '/portfolio' }] }
    if (pathname.startsWith('/dashboard/ai')) return { title: 'AI Assistant', segments: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'AI Assistant', href: '/dashboard/ai' }] }
    if (pathname.startsWith('/dashboard/analytics')) return { title: 'Analytics', segments: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Analytics', href: '/dashboard/analytics' }] }
    if (pathname.startsWith('/dashboard')) return { title: 'Dashboard', segments: [{ label: 'Dashboard', href: '/dashboard' }] }
    if (pathname.startsWith('/settings')) return { title: 'Settings', segments: [{ label: 'Settings', href: '/settings' }] }

    // Fallback for other pages
    const title = segments[segments.length - 1] || 'Page'
    return {
      title: title.charAt(0).toUpperCase() + title.slice(1),
      segments: segments.map((segment, index) => ({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        href: '/' + segments.slice(0, index + 1).join('/')
      }))
    }
  }

  const { segments } = getBreadcrumbData()

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/">
            ChainWise
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, index) => (
          <React.Fragment key={segment.href}>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              {index === segments.length - 1 ? (
                <BreadcrumbPage>{segment.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={segment.href}>
                  {segment.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export function GlobalSidebarLayout({ children }: GlobalSidebarLayoutProps) {
  const { user } = useSupabaseAuth()
  const pathname = usePathname()

  // Pages that should not show the sidebar
  const excludedPaths = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/checkout',
    '/checkout/success',
    '/checkout/cancel'
  ]

  const shouldShowSidebar = user && !excludedPaths.includes(pathname) && !pathname.startsWith('/auth/')

  if (!shouldShowSidebar) {
    return <>{children}</>
  }

  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-8 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-6">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <DynamicBreadcrumb />
            </div>
          </header>
          <motion.div
            className="flex flex-1 flex-col"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
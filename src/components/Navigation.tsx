'use client'

import { usePathname } from 'next/navigation'
import { ModernNavbar } from '@/components/navigation/modern-navbar'

export default function Navigation() {
  const pathname = usePathname()
  
  // Hide navigation on auth pages only
  const hideNavigation = [
    '/auth/',
  ].some(path => pathname.startsWith(path))

  if (hideNavigation) {
    return null
  }

  return <ModernNavbar />
}
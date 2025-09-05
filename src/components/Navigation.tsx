'use client'

import { usePathname } from 'next/navigation'
import { TubelightNavBar } from '@/components/ui/tubelight-navbar'
import { 
  Home, 
  MessageSquare, 
  TrendingUp, 
  BookOpen, 
  Briefcase,
  ShoppingCart,
} from 'lucide-react'

// Main navigation items for tubelight navbar - only for landing/marketing pages
const mainNavItems = [
  { name: 'Home', url: '/', icon: Home },
  { name: 'Chat', url: '/chat', icon: MessageSquare },
  { name: 'Dashboard', url: '/dashboard', icon: TrendingUp },
  { name: 'Portfolio', url: '/portfolio', icon: Briefcase },
  { name: 'Marketplace', url: '/marketplace', icon: ShoppingCart },
  { name: 'Learn', url: '/learn', icon: BookOpen },
]

export default function Navigation() {
  const pathname = usePathname()
  
  // Hide navigation on application pages that have their own navigation systems
  const hideNavigation = [
    '/auth/',
    '/dashboard/',
    '/portfolio/',
    '/alerts/',
    '/settings/',
    '/pricing'
  ].some(path => pathname.startsWith(path))

  if (hideNavigation) {
    return null
  }

  return (
    <>
      {/* Tubelight Navigation Bar - Only for marketing/landing pages */}
      <TubelightNavBar items={mainNavItems} />
    </>
  )
}
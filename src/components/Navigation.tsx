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

// Main navigation items for tubelight navbar
const mainNavItems = [
  { name: 'Home', url: '/', icon: Home },
  { name: 'Chat', url: '/chat', icon: MessageSquare },
  { name: 'Market', url: '/dashboard', icon: TrendingUp },
  { name: 'Portfolio', url: '/portfolio', icon: Briefcase },
  { name: 'Marketplace', url: '/marketplace', icon: ShoppingCart },
  { name: 'Learn', url: '/learn', icon: BookOpen },
]

export default function Navigation() {
  const pathname = usePathname()
  const isDashboardPage = pathname.startsWith('/dashboard')

  // Don't render navigation on dashboard pages (they have their own sidebar)
  if (isDashboardPage) {
    return null
  }

  return (
    <>
      {/* Tubelight Navigation Bar - Primary navigation */}
      <TubelightNavBar items={mainNavItems} />
    </>
  )
}
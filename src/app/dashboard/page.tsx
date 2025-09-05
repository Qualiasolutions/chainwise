'use client'

import { ChainWiseDashboard } from '@/components/ui/dashboard-with-collapsible-sidebar'
import { useSupabase } from '@/components/providers/supabase-provider'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { session, loading } = useSupabase()

  useEffect(() => {
    if (!loading && !session) {
      redirect('/auth/signin')
    }
  }, [session, loading])

  if (loading) {
  return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return <ChainWiseDashboard />
}
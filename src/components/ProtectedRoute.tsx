'use client'

import { useSupabase } from '@/components/providers/supabase-provider'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'
import { Loader2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ProtectedRouteProps {
  children: ReactNode
  requireAuth?: boolean
  requiredTier?: 'free' | 'pro' | 'elite'
  fallback?: ReactNode
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true,
  requiredTier,
  fallback
}: ProtectedRouteProps) {
  const { session, user, loading } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    if (requireAuth && !loading && !session) {
      router.push('/auth/signin')
    }
  }, [requireAuth, session, loading, router])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (requireAuth && !session) {
    return fallback || (
      <Card className="max-w-md mx-auto mt-20">
        <CardHeader className="text-center">
          <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>
            Please sign in to access this page
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => router.push('/auth/signin')}>
            Sign In
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Check subscription tier if required
  // Note: For Supabase, tier checking should be done in the useSubscription hook
  // This component focuses on authentication, tier checks are handled by specific components

  return <>{children}</>
}
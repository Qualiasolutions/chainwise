"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to analytics page
    router.replace("/dashboard/analytics")
  }, [router])

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  )
}

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
      <div className="flex h-screen">
        {/* Sidebar Skeleton */}
        <div className="w-64 border-r bg-white/50 backdrop-blur-sm dark:bg-gray-900/50 p-4 space-y-4">
          <Skeleton className="h-8 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div className="space-y-2 pt-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            {/* Main Chart */}
            <Card className="col-span-4 border-0 shadow-lg">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-80 w-full" />
              </CardContent>
            </Card>

            {/* Side Panel */}
            <Card className="col-span-3 border-0 shadow-lg">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-56" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-12 mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
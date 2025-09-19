import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, BarChart3, Shield, Zap, Users, Target } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 pt-24"> {/* Add top padding for header */}
        <div className="text-center space-y-8">
          <div className="space-y-6">
            {/* Logo and Brand */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-4">
                <Image
                  src="/logo.png"
                  alt="ChainWise Logo"
                  width={64}
                  height={64}
                  className="rounded-xl shadow-lg"
                />
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  ChainWise
                </h1>
              </div>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              AI-powered crypto advisory platform with intelligent insights, real-time market data,
              and professional-grade analysis tools.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <Link href="/dashboard">
                <BarChart3 className="mr-2 h-5 w-5" />
                Launch Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/signup">
                <Users className="mr-2 h-5 w-5" />
                Get Started Free
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Professional trading charts with advanced technical analysis and custom indicators
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <CardTitle>AI-Powered Trading</CardTitle>
              <CardDescription>
                Smart algorithms analyze market trends and provide personalized trading signals
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Secure Trading</CardTitle>
              <CardDescription>
                Advanced security protocols and encrypted transactions for safe crypto trading
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Real-Time Data</CardTitle>
              <CardDescription>
                Real-time cryptocurrency data and market feeds with low-latency updates
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Social Trading</CardTitle>
              <CardDescription>
                Follow top traders, copy strategies, and build your trading community
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Portfolio Management</CardTitle>
              <CardDescription>
                Advanced portfolio analytics with risk management and rebalancing tools
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardHeader className="pb-8">
              <CardTitle className="text-3xl mb-4">Ready to Start Trading?</CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Join thousands of traders who trust ChainWise for their crypto investments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                <Link href="/dashboard">
                  Get Started Now
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

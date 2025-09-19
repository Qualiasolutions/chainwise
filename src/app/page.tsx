import HeroSection from "@/components/hero-section"
import HowItWorks from "@/components/how-it-works"
import ChainWiseOrbitalTimeline from "@/components/chainwise-orbital-timeline"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with 3D Globe */}
      <HeroSection />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Interactive Development Roadmap */}
      <div id="roadmap" className="min-h-screen">
        <ChainWiseOrbitalTimeline />
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
        <div className="container mx-auto px-4 text-center">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white max-w-4xl mx-auto">
            <CardHeader className="pb-8">
              <CardTitle className="text-3xl mb-4">Ready to Transform Your Crypto Journey?</CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Join thousands of investors who trust ChainWise AI for smarter crypto decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                  <Link href="/auth/signup">
                    Get Started Free
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Link href="/dashboard">
                    Explore Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

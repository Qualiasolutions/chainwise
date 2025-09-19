"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Sparkles, ArrowRight, Brain } from "lucide-react";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
        <Card className="max-w-2xl w-full text-center shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>

            <CardTitle className="text-3xl mb-2">
              🎉 Welcome to ChainWise Premium!
            </CardTitle>

            <p className="text-lg text-muted-foreground">
              Your subscription has been activated successfully
            </p>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Success Details */}
            <div className="space-y-4">
              <div className="p-6 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  What happens next?
                </h3>
                <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Your premium AI advisor is now active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Access to advanced portfolio analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Priority support and unlimited questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Email confirmation sent to your inbox</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 justify-center">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Get Started with Your Premium Features
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <Brain className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm">AI Chat</div>
                      <div className="text-xs text-muted-foreground">Ask your premium advisor</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm">Portfolio</div>
                      <div className="text-xs text-muted-foreground">Track your investments</div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-4">
              <Button
                asChild
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>

              <p className="text-sm text-muted-foreground">
                Redirecting automatically in {countdown} seconds...
              </p>
            </div>

            {/* Support */}
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Need help getting started?{" "}
                <Link href="/contact" className="text-purple-600 hover:underline">
                  Contact our support team
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
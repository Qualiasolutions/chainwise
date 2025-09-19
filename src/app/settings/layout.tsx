import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Settings, CreditCard, Bell, Shield, HelpCircle } from "lucide-react";
import Link from "next/link";

const settingsNavItems = [
  {
    title: "Profile",
    href: "/settings/profile",
    icon: User,
    description: "Manage your personal information and preferences"
  },
  {
    title: "Account",
    href: "/settings/account",
    icon: Settings,
    description: "Account settings and security options"
  },
  {
    title: "Billing",
    href: "/settings/billing",
    icon: CreditCard,
    description: "Manage your subscription and payment methods"
  },
  {
    title: "Notifications",
    href: "/settings/notifications",
    icon: Bell,
    description: "Configure email and push notifications"
  },
  {
    title: "Privacy",
    href: "/settings/privacy",
    icon: Shield,
    description: "Privacy settings and data management"
  },
  {
    title: "Support",
    href: "/settings/support",
    icon: HelpCircle,
    description: "Get help and contact support"
  }
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              ← Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-2">
              <nav className="space-y-1">
                {settingsNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.href}
                      variant="ghost"
                      className="w-full justify-start h-auto p-3 text-left"
                      asChild
                    >
                      <Link href={item.href}>
                        <div className="flex items-start gap-3">
                          <Icon className="w-5 h-5 mt-0.5 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-sm">{item.title}</div>
                            <div className="text-xs text-muted-foreground line-clamp-2">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </Button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Suspense fallback={
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                </CardContent>
              </Card>
            }>
              {children}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
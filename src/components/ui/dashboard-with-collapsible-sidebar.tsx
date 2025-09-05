"use client"
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useSubscription } from "@/hooks/use-subscription";
import { CryptoService } from "@/lib/crypto-service";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import {
  Home,
  BarChart3,
  Bot,
  Bell,
  Wallet,
  BookOpen,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronsRight,
  Moon,
  Sun,
  Activity,
  DollarSign,
  Users,
  Settings,
  HelpCircle,
  User,
  LogOut,
  Crown,
  Zap,
  CreditCard,
  RefreshCw,
  AlertCircle,
  Target
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface DashboardData {
  totalValue: number;
  dailyChange: number;
  portfolioCount: number;
  activeAlerts: number;
  topCryptos: Array<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    positive: boolean;
  }>;
  recentActivity: Array<{
    icon: React.ComponentType<any>;
    title: string;
    desc: string;
    time: string;
    color: string;
  }>;
}

export const ChainWiseDashboard = () => {
  const { theme, toggleTheme } = useTheme();
  const { session, user, signOut } = useSupabase();
  const { tier, creditBalance } = useSubscription();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      loadDashboardData();
    }
  }, [session]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load crypto data
      const cryptos = await CryptoService.getTopCryptos(5);
      
      // Load user portfolio data
      const portfolioResponse = await fetch('/api/portfolio?includeHoldings=false&limit=10');
      const portfolioData = portfolioResponse.ok ? await portfolioResponse.json() : { data: [], pagination: { total: 0 } };
      
      // Load alerts data
      const alertsResponse = await fetch('/api/alerts?active=true&limit=1');
      const alertsData = alertsResponse.ok ? await alertsResponse.json() : { pagination: { total: 0 } };
      
      // Mock some data for demo (in real app, this would come from your APIs)
      setDashboardData({
        totalValue: 92239.41,
        dailyChange: 4521.67,
        portfolioCount: portfolioData.pagination.total,
        activeAlerts: alertsData.pagination.total,
        topCryptos: cryptos.slice(0, 5).map(crypto => ({
          symbol: crypto.symbol.toUpperCase(),
          name: crypto.name,
          price: crypto.current_price,
          change: crypto.price_change_percentage_24h,
          positive: crypto.price_change_percentage_24h > 0
        })),
        recentActivity: [
          { icon: TrendingUp, title: "Portfolio updated", desc: "BTC position increased by 5%", time: "2 min ago", color: "green" },
          { icon: Bell, title: "Price alert triggered", desc: "ETH reached $3,500 target", time: "5 min ago", color: "blue" },
          { icon: Bot, title: "AI recommendation", desc: "New trading opportunity identified", time: "10 min ago", color: "purple" },
          { icon: Wallet, title: "Portfolio rebalanced", desc: "Automatic rebalancing completed", time: "1 hour ago", color: "orange" },
          { icon: AlertCircle, title: "Market analysis", desc: "Weekly market report available", time: "2 hours ago", color: "red" },
        ]
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <ChainWiseSidebar />
        <DashboardContent 
          dashboardData={dashboardData} 
          loading={loading} 
          onRefresh={loadDashboardData}
          theme={theme}
          toggleTheme={toggleTheme}
          user={user}
          tier={tier}
          creditBalance={creditBalance}
        />
      </div>
    </div>
  );
};

const ChainWiseSidebar = () => {
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState("Dashboard");
  const pathname = usePathname();
  const { session, user, signOut } = useSupabase();
  const { tier, creditBalance } = useSubscription();

  // Update selected based on current pathname
  useEffect(() => {
    if (pathname.includes('/dashboard')) setSelected('Dashboard');
    else if (pathname.includes('/portfolio')) setSelected('Portfolio');
    else if (pathname.includes('/alerts')) setSelected('Alerts');
    else if (pathname.includes('/chat')) setSelected('AI Chat');
    else if (pathname.includes('/learn')) setSelected('Learn');
    else if (pathname.includes('/settings')) setSelected('Settings');
  }, [pathname]);

  const mainMenuItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home, notifs: 0 },
    { title: "Portfolio", url: "/portfolio", icon: BarChart3, notifs: 0 },
    { title: "Alerts", url: "/alerts", icon: Bell, notifs: 3 },
    { title: "AI Chat", url: "/chat", icon: Bot, notifs: 0 },
    { title: "Learn", url: "/learn", icon: BookOpen, notifs: 0 },
  ];

  return (
    <nav
      className={`sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out ${
        open ? 'w-64' : 'w-16'
      } border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 shadow-sm`}
    >
      <TitleSection open={open} user={user} tier={tier} />

      <div className="space-y-1 mb-8">
        {mainMenuItems.map((item) => (
          <Option
            key={item.title}
            Icon={item.icon}
            title={item.title}
            url={item.url}
            selected={selected}
            setSelected={setSelected}
            open={open}
            notifs={item.notifs}
          />
        ))}
      </div>

      {/* Credit Balance */}
      {open && session && (
        <div className="mb-6 px-3">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Credits</span>
            </div>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{creditBalance}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{tier} Plan</p>
          </div>
        </div>
      )}

      {open && (
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-1">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Account
          </div>
          <Option
            Icon={Settings}
            title="Settings"
            url="/settings"
            selected={selected}
            setSelected={setSelected}
            open={open}
          />
          <Option
            Icon={CreditCard}
            title="Billing"
            url="/settings/billing"
            selected={selected}
            setSelected={setSelected}
            open={open}
          />
          <Option
            Icon={HelpCircle}
            title="Help & Support"
            url="/help"
            selected={selected}
            setSelected={setSelected}
            open={open}
          />
          <button
            onClick={() => signOut()}
            className="flex h-11 w-full items-center rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200"
          >
            <div className="grid h-full w-12 place-content-center">
              <LogOut className="h-4 w-4" />
            </div>
            {open && (
              <span className="text-sm font-medium">Sign Out</span>
            )}
          </button>
        </div>
      )}

      <ToggleClose open={open} setOpen={setOpen} />
    </nav>
  );
};

const Option = ({ Icon, title, url, selected, setSelected, open, notifs = 0 }) => {
  const isSelected = selected === title;
  
  return (
    <Link
      href={url}
      onClick={() => setSelected(title)}
      className={`relative flex h-11 w-full items-center rounded-md transition-all duration-200 ${
        isSelected 
          ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm border-l-2 border-blue-500" 
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
      }`}
    >
      <div className="grid h-full w-12 place-content-center">
        <Icon className="h-4 w-4" />
      </div>
      
      {open && (
        <span
          className={`text-sm font-medium transition-opacity duration-200 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {title}
        </span>
      )}

      {notifs > 0 && open && (
        <span className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 dark:bg-blue-600 text-xs text-white font-medium">
          {notifs}
        </span>
      )}
    </Link>
  );
};

const TitleSection = ({ open, user, tier }) => {
  return (
    <div className="mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
      <div className="flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
        <div className="flex items-center gap-3">
          <ChainWiseLogo />
          {open && (
            <div className={`transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex items-center gap-2">
                <div>
                  <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {user?.email?.split('@')[0] || 'ChainWise User'}
                  </span>
                  <div className="flex items-center gap-1">
                    {tier === 'pro' && <Crown className="w-3 h-3 text-yellow-500" />}
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      {tier} Plan
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {open && (
          <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        )}
      </div>
    </div>
  );
};

const ChainWiseLogo = () => {
  return (
    <div className="relative">
      <Image
        src="/logo.png"
        alt="ChainWise Logo"
        width={40}
        height={40}
        className="w-10 h-10 rounded-lg shadow-sm"
      />
    </div>
  );
};

const ToggleClose = ({ open, setOpen }) => {
  return (
    <button
      onClick={() => setOpen(!open)}
      className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      <div className="flex items-center p-3">
        <div className="grid size-10 place-content-center">
          <ChevronsRight
            className={`h-4 w-4 transition-transform duration-300 text-gray-500 dark:text-gray-400 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
        {open && (
          <span
            className={`text-sm font-medium text-gray-600 dark:text-gray-300 transition-opacity duration-200 ${
              open ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Collapse
          </span>
        )}
      </div>
    </button>
  );
};

const DashboardContent = ({ dashboardData, loading, onRefresh, theme, toggleTheme, user, tier, creditBalance }) => {
  const isDark = theme === 'dark';

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Crypto Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {user?.email?.split('@')[0] || 'Trader'}! Monitor your crypto investments.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onRefresh}
            disabled={loading}
            className="relative p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="relative p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </button>
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <Link href="/settings" className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            <User className="h-5 w-5" />
          </Link>
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 animate-pulse">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-1">Total Portfolio</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(dashboardData?.totalValue || 0)}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                +{formatCurrency(dashboardData?.dailyChange || 0)} today
              </p>
            </div>
            
            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-1">Portfolios</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dashboardData?.portfolioCount || 0}</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">Active tracking</p>
            </div>
            
            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <Target className="h-4 w-4 text-purple-500" />
              </div>
              <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-1">Active Alerts</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dashboardData?.activeAlerts || 0}</p>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">Price monitoring</p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <Activity className="h-4 w-4 text-orange-500" />
              </div>
              <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-1">AI Credits</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{creditBalance}</p>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">{tier} plan</p>
            </div>
          </div>
          
          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
                  <Link href="/portfolio" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                    View all
                  </Link>
                </div>
                <div className="space-y-4">
                  {dashboardData?.recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                      <div className={`p-2 rounded-lg ${
                        activity.color === 'green' ? 'bg-green-50 dark:bg-green-900/20' :
                        activity.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20' :
                        activity.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20' :
                        activity.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20' :
                        'bg-red-50 dark:bg-red-900/20'
                      }`}>
                        <activity.icon className={`h-4 w-4 ${
                          activity.color === 'green' ? 'text-green-600 dark:text-green-400' :
                          activity.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                          activity.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                          activity.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                          'text-red-600 dark:text-red-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {activity.desc}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Cryptos & Quick Actions */}
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Cryptocurrencies</h3>
                <div className="space-y-4">
                  {dashboardData?.topCryptos.map((crypto, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">{crypto.symbol}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{crypto.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{crypto.symbol}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(crypto.price)}
                        </p>
                        <p className={`text-xs ${crypto.positive ? 'text-green-400' : 'text-red-400'}`}>
                          {formatPercentage(crypto.change)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/portfolio" className="flex items-center justify-between py-3 px-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">View Portfolio</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 rotate-[-90deg]" />
                  </Link>
                  
                  <Link href="/chat" className="flex items-center justify-between py-3 px-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Ask AI Assistant</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 rotate-[-90deg]" />
                  </Link>
                  
                  <Link href="/alerts" className="flex items-center justify-between py-3 px-4 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Set Price Alert</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 rotate-[-90deg]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChainWiseDashboard;

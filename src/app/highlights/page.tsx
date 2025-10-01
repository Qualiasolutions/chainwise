'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Flame,
  Star,
  RefreshCw,
  Loader2,
  ExternalLink,
  DollarSign,
  Activity,
  BarChart3,
  Gem,
  Eye,
  Volume2,
  Crown
} from 'lucide-react';
import { formatPrice, formatPercentage, formatMarketCap } from '@/lib/crypto-api';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useRouter } from 'next/navigation';

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
}

interface TrendingCoin {
  item: {
    id: string;
    coin_id: number;
    name: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
    small: string;
    large: string;
    slug: string;
    price_btc: number;
    score: number;
    data: {
      price: number;
      price_btc: string;
      price_change_percentage_24h: Record<string, number>;
      market_cap: string;
      market_cap_btc: string;
      total_volume: string;
      total_volume_btc: string;
      sparkline: string;
    };
  };
}

interface TrendingNFT {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  data: {
    floor_price: string;
    floor_price_in_usd_24h_percentage_change: string;
    h24_volume: string;
    h24_average_sale_price: string;
    sparkline: string;
  };
}

interface TrendingCategory {
  id: number;
  name: string;
  market_cap_1h_change: number;
  slug: string;
  coins_count: number;
  data: {
    market_cap: number;
    market_cap_btc: number;
    total_volume: number;
    total_volume_btc: number;
    market_cap_change_percentage_24h: Record<string, number>;
    sparkline: string;
  };
}

interface HighlightsData {
  trending: {
    coins: TrendingCoin[];
    nfts: TrendingNFT[];
    categories: TrendingCategory[];
  };
  global: any;
  topGainers: CoinData[];
  topLosers: CoinData[];
  mostVisited: CoinData[];
  highVolume: CoinData[];
  largeCap: CoinData[];
  smallCapGems: CoinData[];
}

export default function HighlightsPage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<HighlightsData | null>(null);

  // Track page view with Supabase MCP
  useEffect(() => {
    if (user) {
      // Track analytics asynchronously without blocking the UI
      fetch('/api/analytics/page-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: '/highlights',
          user_id: user.id
        })
      }).catch((error) => {
        console.error('Analytics tracking error:', error);
      });
    }
  }, [user]);

  // Redirect to sign-in if not authenticated (after auth check completes)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin?redirect=/highlights');
    }
  }, [user, authLoading, router]);

  const fetchHighlights = async () => {
    try {
      const response = await fetch('/api/crypto/highlights');
      if (response.ok) {
        const highlightsData = await response.json();
        setData(highlightsData);
      }
    } catch (error) {
      console.error('Failed to fetch highlights:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHighlights();
    }
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHighlights();
  };

  // Show loading spinner while checking auth or loading data
  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  // Don't render page content if not authenticated (will redirect)
  if (!user || !data) {
    return null;
  }

  const renderCoinTable = (coins: CoinData[], limit: number = 10) => (
    <div className="border-2 border-purple-500/30 rounded-lg overflow-hidden h-full flex flex-col">
      <div className="overflow-auto flex-1">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 sticky top-0">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-semibold">#</th>
              <th className="px-2 py-2 text-left text-xs font-semibold">Coin</th>
              <th className="px-2 py-2 text-right text-xs font-semibold">Price</th>
              <th className="px-2 py-2 text-right text-xs font-semibold">24h %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {coins.slice(0, limit).map((coin, index) => (
              <tr key={coin.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => window.open(`https://www.coingecko.com/en/coins/${coin.id}`, '_blank')}>
                <td className="px-2 py-2 text-xs font-medium">#{index + 1}</td>
                <td className="px-2 py-2">
                  <div className="flex items-center gap-1.5">
                    <img src={coin.image} alt={coin.name} className="w-5 h-5 rounded-full flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">{coin.name}</div>
                      <div className="text-xs text-muted-foreground uppercase">{coin.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-2 text-right text-xs font-semibold whitespace-nowrap">
                  {formatPrice(coin.current_price)}
                </td>
                <td className={`px-2 py-2 text-right text-xs font-bold whitespace-nowrap ${
                  coin.price_change_percentage_24h >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatPercentage(coin.price_change_percentage_24h)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Helper function to render trending coins table
  const renderTrendingCoinsTable = (coins: TrendingCoin[], limit: number = 10) => (
    <div className="border-2 border-purple-500/30 rounded-lg overflow-hidden h-full flex flex-col">
      <div className="overflow-auto flex-1">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 sticky top-0">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-semibold">#</th>
              <th className="px-2 py-2 text-left text-xs font-semibold">Coin</th>
              <th className="px-2 py-2 text-right text-xs font-semibold">Price</th>
              <th className="px-2 py-2 text-right text-xs font-semibold">24h %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {coins.slice(0, limit).map((coin, index) => (
              <tr key={coin.item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => window.open(`https://www.coingecko.com/en/coins/${coin.item.id}`, '_blank')}>
                <td className="px-2 py-2 text-xs font-medium">#{index + 1}</td>
                <td className="px-2 py-2">
                  <div className="flex items-center gap-1.5">
                    <img src={coin.item.large} alt={coin.item.name} className="w-5 h-5 rounded-full flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">{coin.item.name}</div>
                      <div className="text-xs text-muted-foreground uppercase">{coin.item.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-2 text-right text-xs font-semibold whitespace-nowrap">
                  {formatPrice(coin.item.data.price)}
                </td>
                <td className={`px-2 py-2 text-right text-xs font-bold whitespace-nowrap ${
                  coin.item.data.price_change_percentage_24h.usd >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatPercentage(coin.item.data.price_change_percentage_24h.usd)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-[1800px]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Flame className="h-8 w-8 text-orange-500" />
              Market Highlights
            </h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive cryptocurrency market data and trends from CoinGecko
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Global Market Stats - Full Width */}
      {data.global && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Global Market Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Market Cap</p>
                <p className="text-2xl font-bold">
                  {formatMarketCap(data.global.total_market_cap?.usd || 0)}
                </p>
                {data.global.market_cap_change_percentage_24h_usd !== undefined && (
                  <p className={data.global.market_cap_change_percentage_24h_usd >= 0 ? 'text-green-600 dark:text-green-400 text-sm font-medium' : 'text-red-600 dark:text-red-400 text-sm font-medium'}>
                    {formatPercentage(data.global.market_cap_change_percentage_24h_usd)}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="text-2xl font-bold">
                  {formatMarketCap(data.global.total_volume?.usd || 0)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">BTC Dominance</p>
                <p className="text-2xl font-bold">
                  {data.global.market_cap_percentage?.btc?.toFixed(1) || 0}%
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Active Cryptocurrencies</p>
                <p className="text-2xl font-bold">{data.global.active_cryptocurrencies?.toLocaleString() || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
        {/* 1. Trending Coins */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Trending Coins
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden pt-0">
            {renderTrendingCoinsTable(data.trending.coins, 10)}
          </CardContent>
        </Card>

        {/* 2. Top Gainers */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Top Gainers (24h)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden pt-0">
            {renderCoinTable(data.topGainers, 10)}
          </CardContent>
        </Card>

        {/* 3. Top Losers */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Top Losers (24h)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden pt-0">
            {renderCoinTable(data.topLosers, 10)}
          </CardContent>
        </Card>

        {/* 4. Most Visited */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              Most Visited
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden pt-0">
            {renderCoinTable(data.mostVisited, 10)}
          </CardContent>
        </Card>

        {/* 5. Highest Volume */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-cyan-500" />
              Highest Volume (24h)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden pt-0">
            {renderCoinTable(data.highVolume, 10)}
          </CardContent>
        </Card>

        {/* 6. Large Cap Leaders */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Large Cap Leaders
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden pt-0">
            {renderCoinTable(data.largeCap, 10)}
          </CardContent>
        </Card>

        {/* 7. Small Cap Gems */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Gem className="h-5 w-5 text-purple-500" />
              Small Cap Gems
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden pt-0">
            {renderCoinTable(data.smallCapGems, 10)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

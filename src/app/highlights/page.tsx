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

  const renderCoinTable = (coins: CoinData[]) => (
    <div className="overflow-x-auto border-2 border-purple-500/50 rounded-lg">
      <div className="min-w-[640px]">
        <table className="w-full">
          <thead className="bg-slate-100 dark:bg-slate-800">
            <tr>
              <th className="px-2 sm:px-3 py-2 text-left text-xs font-semibold">#</th>
              <th className="px-2 sm:px-3 py-2 text-left text-xs font-semibold">Coin</th>
              <th className="px-2 sm:px-3 py-2 text-right text-xs font-semibold">Price</th>
              <th className="px-2 sm:px-3 py-2 text-right text-xs font-semibold">24h %</th>
              <th className="px-2 sm:px-3 py-2 text-right text-xs font-semibold hidden sm:table-cell">Market Cap</th>
              <th className="px-2 sm:px-3 py-2 text-right text-xs font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {coins.map((coin, index) => (
              <tr key={coin.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-2 sm:px-3 py-2 text-xs font-medium">#{index + 1}</td>
                <td className="px-2 sm:px-3 py-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <img src={coin.image} alt={coin.name} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">{coin.name}</div>
                      <div className="text-xs text-muted-foreground uppercase">{coin.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="px-2 sm:px-3 py-2 text-right text-xs font-semibold whitespace-nowrap">
                  {formatPrice(coin.current_price)}
                </td>
                <td className={`px-2 sm:px-3 py-2 text-right text-xs font-bold whitespace-nowrap ${
                  coin.price_change_percentage_24h >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatPercentage(coin.price_change_percentage_24h)}
                </td>
                <td className="px-2 sm:px-3 py-2 text-right text-xs hidden sm:table-cell whitespace-nowrap">
                  {formatMarketCap(coin.market_cap)}
                </td>
                <td className="px-2 sm:px-3 py-2 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => window.open(`https://www.coingecko.com/en/coins/${coin.id}`, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Flame className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
              Market Highlights
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Comprehensive cryptocurrency market data and trends from CoinGecko
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm" className="self-start sm:self-auto">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 1. Trending Coins */}
      <section>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <Flame className="h-5 w-5 text-orange-500" />
          Trending Coins
        </h2>
        <div className="overflow-x-auto border-2 border-purple-500/50 rounded-lg">
          <div className="min-w-[640px]">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs font-semibold">#</th>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs font-semibold">Coin</th>
                  <th className="px-2 sm:px-3 py-2 text-right text-xs font-semibold">Price</th>
                  <th className="px-2 sm:px-3 py-2 text-right text-xs font-semibold">24h %</th>
                  <th className="px-2 sm:px-3 py-2 text-right text-xs font-semibold hidden sm:table-cell">Market Cap</th>
                  <th className="px-2 sm:px-3 py-2 text-right text-xs font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {data.trending.coins.map((coin, index) => (
                  <tr key={coin.item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-2 sm:px-3 py-2 text-xs font-medium">#{index + 1}</td>
                    <td className="px-2 sm:px-3 py-2">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <img src={coin.item.large} alt={coin.item.name} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate">{coin.item.name}</div>
                          <div className="text-xs text-muted-foreground uppercase">{coin.item.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-2 text-right text-xs font-semibold whitespace-nowrap">
                      {formatPrice(coin.item.data.price)}
                    </td>
                    <td className={`px-2 sm:px-3 py-2 text-right text-xs font-bold whitespace-nowrap ${
                      coin.item.data.price_change_percentage_24h.usd >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatPercentage(coin.item.data.price_change_percentage_24h.usd)}
                    </td>
                    <td className="px-2 sm:px-3 py-2 text-right text-xs hidden sm:table-cell truncate max-w-[120px]">
                      {coin.item.data.market_cap}
                    </td>
                    <td className="px-2 sm:px-3 py-2 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => window.open(`https://www.coingecko.com/en/coins/${coin.item.id}`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 2. Top Gainers (24h) */}
      <section>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Top Gainers (24h)
        </h2>
        {renderCoinTable(data.topGainers)}
      </section>

      {/* 3. Top Losers (24h) */}
      <section>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <TrendingDown className="h-5 w-5 text-red-500" />
          Top Losers (24h)
        </h2>
        {renderCoinTable(data.topLosers)}
      </section>

      {/* 4. Most Visited */}
      <section>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <Eye className="h-5 w-5 text-blue-500" />
          Most Visited
        </h2>
        {renderCoinTable(data.mostVisited)}
      </section>

      {/* 5. Highest Volume */}
      <section>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <Volume2 className="h-5 w-5 text-cyan-500" />
          Highest Volume (24h)
        </h2>
        {renderCoinTable(data.highVolume)}
      </section>

      {/* 6. Large Cap Coins */}
      <section>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <Crown className="h-5 w-5 text-yellow-500" />
          Large Cap Leaders
        </h2>
        {renderCoinTable(data.largeCap)}
      </section>

      {/* 7. Small Cap Gems */}
      <section>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <Gem className="h-5 w-5 text-purple-500" />
          Small Cap Gems
        </h2>
        {renderCoinTable(data.smallCapGems)}
      </section>

      {/* 8. Trending NFTs */}
      <section>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <Star className="h-5 w-5 text-purple-500" />
          Trending NFTs
        </h2>
        <div className="overflow-x-auto border-2 border-purple-500/50 rounded-lg">
          <table className="w-full">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold">#</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">NFT</th>
                <th className="px-3 py-2 text-right text-xs font-semibold">Floor Price</th>
                <th className="px-3 py-2 text-right text-xs font-semibold">24h %</th>
                <th className="px-3 py-2 text-right text-xs font-semibold">24h Volume</th>
                <th className="px-3 py-2 text-right text-xs font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {data.trending.nfts.map((nft, index) => (
                <tr key={nft.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-3 py-2 text-xs font-medium">#{index + 1}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <img src={nft.thumb} alt={nft.name} className="w-6 h-6 rounded-lg" />
                      <div>
                        <div className="text-xs font-semibold">{nft.name}</div>
                        <div className="text-xs text-muted-foreground uppercase">{nft.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right text-xs font-semibold">{nft.data.floor_price}</td>
                  <td className={`px-3 py-2 text-right text-xs font-bold ${
                    parseFloat(nft.data.floor_price_in_usd_24h_percentage_change) >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatPercentage(parseFloat(nft.data.floor_price_in_usd_24h_percentage_change))}
                  </td>
                  <td className="px-3 py-2 text-right text-xs">{nft.data.h24_volume}</td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => window.open(`https://www.coingecko.com/en/nft/${nft.id}`, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 9. Trending Categories */}
      <section>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-indigo-500" />
          Trending Categories
        </h2>
        <div className="overflow-x-auto border-2 border-purple-500/50 rounded-lg">
          <table className="w-full">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold">#</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Category</th>
                <th className="px-3 py-2 text-right text-xs font-semibold">Market Cap</th>
                <th className="px-3 py-2 text-right text-xs font-semibold">1h %</th>
                <th className="px-3 py-2 text-right text-xs font-semibold">24h %</th>
                <th className="px-3 py-2 text-right text-xs font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {data.trending.categories.map((category, index) => (
                <tr key={category.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-3 py-2 text-xs font-medium">#{index + 1}</td>
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-xs font-semibold">{category.name}</div>
                      <div className="text-xs text-muted-foreground">{category.coins_count} coins</div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right text-xs font-semibold">
                    {formatMarketCap(category.data.market_cap)}
                  </td>
                  <td className={`px-3 py-2 text-right text-xs font-bold ${
                    category.market_cap_1h_change >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatPercentage(category.market_cap_1h_change)}
                  </td>
                  <td className={`px-3 py-2 text-right text-xs font-bold ${
                    category.data.market_cap_change_percentage_24h.usd >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatPercentage(category.data.market_cap_change_percentage_24h.usd)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => window.open(`https://www.coingecko.com/en/categories/${category.slug}`, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 10. Global Market Stats */}
      {data.global && (
        <section>
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
            <Activity className="h-6 w-6 text-green-500" />
            Global Market Statistics
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Market Cap</p>
                  <p className="text-2xl font-bold">
                    {formatMarketCap(data.global.total_market_cap?.usd || 0)}
                  </p>
                  {data.global.market_cap_change_percentage_24h_usd !== undefined && (
                    <p
                      className={
                        data.global.market_cap_change_percentage_24h_usd >= 0
                          ? 'text-green-600 dark:text-green-400 text-sm font-medium'
                          : 'text-red-600 dark:text-red-400 text-sm font-medium'
                      }
                    >
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
        </section>
      )}
    </div>
  );
}

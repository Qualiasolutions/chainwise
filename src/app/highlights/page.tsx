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

  const renderCoinCard = (coin: CoinData, index: number) => (
    <Card key={coin.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={coin.image}
                alt={coin.name}
                className="w-12 h-12 rounded-full"
              />
              <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs">
                #{index + 1}
              </Badge>
            </div>
            <div>
              <CardTitle className="text-lg">{coin.name}</CardTitle>
              <CardDescription className="uppercase">{coin.symbol}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Price</span>
          <span className="font-semibold">{formatPrice(coin.current_price)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">24h Change</span>
          <span
            className={
              coin.price_change_percentage_24h >= 0
                ? 'text-green-600 dark:text-green-400 font-semibold'
                : 'text-red-600 dark:text-red-400 font-semibold'
            }
          >
            {formatPercentage(coin.price_change_percentage_24h)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Market Cap</span>
          <span className="text-sm font-medium">{formatMarketCap(coin.market_cap)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Volume (24h)</span>
          <span className="text-sm font-medium">{formatMarketCap(coin.total_volume)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Rank</span>
          <Badge variant="secondary">#{coin.market_cap_rank}</Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={() =>
            window.open(`https://www.coingecko.com/en/coins/${coin.id}`, '_blank')
          }
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View on CoinGecko
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Flame className="h-8 w-8 text-orange-500" />
              Market Highlights
            </h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive cryptocurrency market data and trends from CoinGecko
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 1. Trending Coins */}
      <section>
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <Flame className="h-6 w-6 text-orange-500" />
          Trending Coins
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.trending.coins.map((coin, index) => (
            <Card key={coin.item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={coin.item.large}
                        alt={coin.item.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{coin.item.name}</CardTitle>
                      <CardDescription className="uppercase">{coin.item.symbol}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Price</span>
                  <span className="font-semibold">{formatPrice(coin.item.data.price)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">24h Change</span>
                  <span
                    className={
                      coin.item.data.price_change_percentage_24h.usd >= 0
                        ? 'text-green-600 dark:text-green-400 font-semibold'
                        : 'text-red-600 dark:text-red-400 font-semibold'
                    }
                  >
                    {formatPercentage(coin.item.data.price_change_percentage_24h.usd)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Market Cap</span>
                  <span className="text-sm font-medium">{coin.item.data.market_cap}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rank</span>
                  <Badge variant="secondary">#{coin.item.market_cap_rank}</Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() =>
                    window.open(`https://www.coingecko.com/en/coins/${coin.item.id}`, '_blank')
                  }
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on CoinGecko
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 2. Top Gainers (24h) */}
      <section>
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <TrendingUp className="h-6 w-6 text-green-500" />
          Top Gainers (24h)
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.topGainers.map((coin, index) => renderCoinCard(coin, index))}
        </div>
      </section>

      {/* 3. Top Losers (24h) */}
      <section>
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <TrendingDown className="h-6 w-6 text-red-500" />
          Top Losers (24h)
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.topLosers.map((coin, index) => renderCoinCard(coin, index))}
        </div>
      </section>

      {/* 4. Most Visited */}
      <section>
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <Eye className="h-6 w-6 text-blue-500" />
          Most Visited
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.mostVisited.map((coin, index) => renderCoinCard(coin, index))}
        </div>
      </section>

      {/* 5. Highest Volume */}
      <section>
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <Volume2 className="h-6 w-6 text-cyan-500" />
          Highest Volume (24h)
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.highVolume.map((coin, index) => renderCoinCard(coin, index))}
        </div>
      </section>

      {/* 6. Large Cap Coins */}
      <section>
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <Crown className="h-6 w-6 text-yellow-500" />
          Large Cap Leaders
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.largeCap.map((coin, index) => renderCoinCard(coin, index))}
        </div>
      </section>

      {/* 7. Small Cap Gems */}
      <section>
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <Gem className="h-6 w-6 text-purple-500" />
          Small Cap Gems
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.smallCapGems.map((coin, index) => renderCoinCard(coin, index))}
        </div>
      </section>

      {/* 8. Trending NFTs */}
      <section>
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <Star className="h-6 w-6 text-purple-500" />
          Trending NFTs
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.trending.nfts.map((nft, index) => (
            <Card key={nft.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={nft.thumb} alt={nft.name} className="w-12 h-12 rounded-lg" />
                      <Badge className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{nft.name}</CardTitle>
                      <CardDescription className="uppercase">{nft.symbol}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Floor Price</span>
                  <span className="font-semibold">{nft.data.floor_price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">24h Change</span>
                  <span
                    className={
                      parseFloat(nft.data.floor_price_in_usd_24h_percentage_change) >= 0
                        ? 'text-green-600 dark:text-green-400 font-semibold'
                        : 'text-red-600 dark:text-red-400 font-semibold'
                    }
                  >
                    {formatPercentage(parseFloat(nft.data.floor_price_in_usd_24h_percentage_change))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">24h Volume</span>
                  <span className="text-sm font-medium">{nft.data.h24_volume}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Sale Price</span>
                  <span className="text-sm font-medium">{nft.data.h24_average_sale_price}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => window.open(`https://www.coingecko.com/en/nft/${nft.id}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on CoinGecko
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 9. Trending Categories */}
      <section>
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <BarChart3 className="h-6 w-6 text-indigo-500" />
          Trending Categories
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.trending.categories.map((category, index) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-orange-500 text-white text-lg px-3 py-1">
                      #{index + 1}
                    </Badge>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <CardDescription>{category.coins_count} coins</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Market Cap</span>
                  <span className="font-semibold">{formatMarketCap(category.data.market_cap)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">1h Change</span>
                  <span
                    className={
                      category.market_cap_1h_change >= 0
                        ? 'text-green-600 dark:text-green-400 font-semibold'
                        : 'text-red-600 dark:text-red-400 font-semibold'
                    }
                  >
                    {formatPercentage(category.market_cap_1h_change)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">24h Change</span>
                  <span
                    className={
                      category.data.market_cap_change_percentage_24h.usd >= 0
                        ? 'text-green-600 dark:text-green-400 font-semibold'
                        : 'text-red-600 dark:text-red-400 font-semibold'
                    }
                  >
                    {formatPercentage(category.data.market_cap_change_percentage_24h.usd)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">24h Volume</span>
                  <span className="text-sm font-medium">{formatMarketCap(category.data.total_volume)}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() =>
                    window.open(`https://www.coingecko.com/en/categories/${category.slug}`, '_blank')
                  }
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on CoinGecko
                </Button>
              </CardContent>
            </Card>
          ))}
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

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Flame, Star, RefreshCw, Loader2, ExternalLink } from 'lucide-react';
import { formatPrice, formatPercentage, formatMarketCap } from '@/lib/crypto-api';

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

export default function HighlightsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trendingCoins, setTrendingCoins] = useState<TrendingCoin[]>([]);
  const [trendingNFTs, setTrendingNFTs] = useState<TrendingNFT[]>([]);
  const [trendingCategories, setTrendingCategories] = useState<TrendingCategory[]>([]);

  const fetchHighlights = async () => {
    try {
      const response = await fetch('/api/crypto/highlights');
      if (response.ok) {
        const data = await response.json();
        setTrendingCoins(data.coins || []);
        setTrendingNFTs(data.nfts || []);
        setTrendingCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch highlights:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHighlights();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHighlights();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Flame className="h-8 w-8 text-orange-500" />
              Market Highlights
            </h1>
            <p className="text-muted-foreground mt-2">
              Trending cryptocurrencies, NFTs, and categories
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="coins" className="space-y-6">
        <TabsList>
          <TabsTrigger value="coins">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trending Coins
          </TabsTrigger>
          <TabsTrigger value="nfts">
            <Star className="w-4 h-4 mr-2" />
            Trending NFTs
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Flame className="w-4 h-4 mr-2" />
            Trending Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="coins">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trendingCoins.map((coin, index) => (
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
                        <CardDescription className="uppercase">
                          {coin.item.symbol}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Price</span>
                    <span className="font-semibold">
                      {formatPrice(coin.item.data.price)}
                    </span>
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
                    <span className="text-sm font-medium">
                      {coin.item.data.market_cap}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Volume (24h)</span>
                    <span className="text-sm font-medium">
                      {coin.item.data.total_volume}
                    </span>
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
                      window.open(
                        `https://www.coingecko.com/en/coins/${coin.item.id}`,
                        '_blank'
                      )
                    }
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on CoinGecko
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="nfts">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trendingNFTs.map((nft, index) => (
              <Card key={nft.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={nft.thumb}
                          alt={nft.name}
                          className="w-12 h-12 rounded-lg"
                        />
                        <Badge className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{nft.name}</CardTitle>
                        <CardDescription className="uppercase">
                          {nft.symbol}
                        </CardDescription>
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
                      {formatPercentage(
                        parseFloat(nft.data.floor_price_in_usd_24h_percentage_change)
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">24h Volume</span>
                    <span className="text-sm font-medium">{nft.data.h24_volume}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg Sale Price</span>
                    <span className="text-sm font-medium">
                      {nft.data.h24_average_sale_price}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() =>
                      window.open(`https://www.coingecko.com/en/nft/${nft.id}`, '_blank')
                    }
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on CoinGecko
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trendingCategories.map((category, index) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-orange-500 text-white text-lg px-3 py-1">
                        #{index + 1}
                      </Badge>
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <CardDescription>
                          {category.coins_count} coins
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Market Cap</span>
                    <span className="font-semibold">
                      {formatMarketCap(category.data.market_cap)}
                    </span>
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
                      {formatPercentage(
                        category.data.market_cap_change_percentage_24h.usd
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">24h Volume</span>
                    <span className="text-sm font-medium">
                      {formatMarketCap(category.data.total_volume)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() =>
                      window.open(
                        `https://www.coingecko.com/en/categories/${category.slug}`,
                        '_blank'
                      )
                    }
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on CoinGecko
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

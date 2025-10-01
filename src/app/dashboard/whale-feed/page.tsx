'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Waves, TrendingUp, TrendingDown, ExternalLink, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface WhaleTransaction {
  id: string;
  hash: string;
  blockchain: string;
  symbol: string;
  amount: number;
  amount_usd: number;
  from: {
    address: string;
    owner: string | null;
    owner_type: string | null;
  };
  to: {
    address: string;
    owner: string | null;
    owner_type: string | null;
  };
  type: string;
  timestamp: string;
  minutes_ago: number;
}

export default function WhaleFeedPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useSupabaseAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([]);
  const [blockchain, setBlockchain] = useState<string>('all');
  const [minValue, setMinValue] = useState<string>('100000');
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
      return;
    }
    if (user) {
      fetchTransactions();
    }
  }, [user, authLoading, blockchain, minValue, router]);

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams({
        limit: '50',
        offset: '0',
        min_usd_value: minValue
      });

      if (blockchain !== 'all') {
        params.append('blockchain', blockchain);
      }

      const response = await fetch(`/api/whale-alerts/feed?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
        setHasMore(data.pagination.has_more);
      } else if (response.status === 401) {
        router.push('/auth/signin');
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const getBlockExplorerUrl = (blockchain: string, hash: string) => {
    switch (blockchain.toLowerCase()) {
      case 'bitcoin':
        return `https://www.blockchain.com/btc/tx/${hash}`;
      case 'ethereum':
        return `https://etherscan.io/tx/${hash}`;
      case 'tron':
        return `https://tronscan.org/#/transaction/${hash}`;
      default:
        return '#';
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return 'Unknown';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatAmount = (amount: number, symbol: string) => {
    return `${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${symbol}`;
  };

  const getTimeAgo = (minutes: number) => {
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getOwnerBadge = (owner: string | null, ownerType: string | null) => {
    if (!owner) return null;

    const colors: Record<string, string> = {
      exchange: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      whale: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      'mining pool': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      wallet: 'bg-green-500/10 text-green-600 border-green-500/20'
    };

    const color = ownerType ? colors[ownerType.toLowerCase()] : colors.wallet;

    return (
      <Badge variant="outline" className={`${color} text-xs`}>
        {owner}
      </Badge>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Waves className="h-8 w-8 text-purple-500" />
              Whale Feed
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time feed of significant cryptocurrency transactions
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

      <div className="flex gap-4 mb-6">
        <Select value={blockchain} onValueChange={setBlockchain}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select blockchain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Blockchains</SelectItem>
            <SelectItem value="bitcoin">Bitcoin</SelectItem>
            <SelectItem value="ethereum">Ethereum</SelectItem>
            <SelectItem value="tron">Tron</SelectItem>
          </SelectContent>
        </Select>

        <Select value={minValue} onValueChange={setMinValue}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Minimum value" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="100000">$100K+</SelectItem>
            <SelectItem value="500000">$500K+</SelectItem>
            <SelectItem value="1000000">$1M+</SelectItem>
            <SelectItem value="5000000">$5M+</SelectItem>
            <SelectItem value="10000000">$10M+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {transactions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No whale transactions found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your filters or check back later
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <Card key={tx.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="capitalize">
                        {tx.blockchain}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {getTimeAgo(tx.minutes_ago)}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {formatCurrency(tx.amount_usd)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatAmount(tx.amount, tx.symbol)}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">From:</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {formatAddress(tx.from.address)}
                        </code>
                        {getOwnerBadge(tx.from.owner, tx.from.owner_type)}
                      </div>

                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">To:</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {formatAddress(tx.to.address)}
                        </code>
                        {getOwnerBadge(tx.to.owner, tx.to.owner_type)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(getBlockExplorerUrl(tx.blockchain, tx.hash), '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Transaction
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => {
              // Implement pagination
              console.log('Load more');
            }}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

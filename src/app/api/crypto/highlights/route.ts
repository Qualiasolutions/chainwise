import { NextRequest, NextResponse } from 'next/server';
import { getCacheHeaders, CACHE_PRESETS } from '@/lib/api-cache';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

export async function GET(request: NextRequest) {
  try {
    // Fetch multiple endpoints in parallel for comprehensive highlights
    const [trendingResponse, globalResponse, topGainersResponse, topLosersResponse] = await Promise.all([
      // Trending coins, NFTs, and categories
      fetch(`${COINGECKO_API_BASE}/search/trending`, {
        headers: { 'Accept': 'application/json' },
      }),
      // Global market data
      fetch(`${COINGECKO_API_BASE}/global`, {
        headers: { 'Accept': 'application/json' },
      }),
      // Top gainers (using coins/markets with sort)
      fetch(`${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=percent_change_24h_desc&per_page=10&page=1&sparkline=false`, {
        headers: { 'Accept': 'application/json' },
      }),
      // Top losers (using coins/markets with sort)
      fetch(`${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=percent_change_24h_asc&per_page=10&page=1&sparkline=false`, {
        headers: { 'Accept': 'application/json' },
      }),
    ]);

    if (!trendingResponse.ok) {
      throw new Error(`CoinGecko trending API error: ${trendingResponse.status}`);
    }

    const trendingData = await trendingResponse.json();
    const globalData = globalResponse.ok ? await globalResponse.json() : null;
    const topGainersData = topGainersResponse.ok ? await topGainersResponse.json() : [];
    const topLosersData = topLosersResponse.ok ? await topLosersResponse.json() : [];

    // Fetch additional data: most visited, recently added, top volume
    const [mostVisitedResponse, highVolumeResponse, largeCapResponse, smallCapResponse] = await Promise.all([
      // Most visited (using market_cap as proxy)
      fetch(`${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false`, {
        headers: { 'Accept': 'application/json' },
      }),
      // Highest volume
      fetch(`${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=volume_desc&per_page=10&page=1&sparkline=false`, {
        headers: { 'Accept': 'application/json' },
      }),
      // Large cap coins
      fetch(`${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`, {
        headers: { 'Accept': 'application/json' },
      }),
      // Small cap gems (lower market cap)
      fetch(`${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=market_cap_asc&per_page=10&page=100&sparkline=false&price_change_percentage=24h`, {
        headers: { 'Accept': 'application/json' },
      }),
    ]);

    const mostVisitedData = mostVisitedResponse.ok ? await mostVisitedResponse.json() : [];
    const highVolumeData = highVolumeResponse.ok ? await highVolumeResponse.json() : [];
    const largeCapData = largeCapResponse.ok ? await largeCapResponse.json() : [];
    const smallCapData = smallCapResponse.ok ? await smallCapResponse.json() : [];

    // Combine all data into comprehensive highlights
    const comprehensiveData = {
      trending: trendingData,
      global: globalData?.data || null,
      topGainers: topGainersData,
      topLosers: topLosersData,
      mostVisited: mostVisitedData,
      highVolume: highVolumeData,
      largeCap: largeCapData,
      smallCapGems: smallCapData,
    };

    // Return response with caching headers for better performance
    return NextResponse.json(comprehensiveData, {
      headers: getCacheHeaders(CACHE_PRESETS.TRENDING_DATA)
    });
  } catch (error) {
    console.error('Highlights API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch highlights data' },
      { status: 500 }
    );
  }
}

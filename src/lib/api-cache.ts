// API Response Caching Utilities
// Provides efficient caching headers and strategies for API routes

export interface CacheConfig {
  maxAge: number; // seconds
  staleWhileRevalidate?: number; // seconds
  public?: boolean;
}

export const CACHE_DURATIONS = {
  // Very short cache for real-time data
  REALTIME: 10, // 10 seconds

  // Short cache for frequently changing data
  SHORT: 60, // 1 minute

  // Medium cache for semi-static data
  MEDIUM: 300, // 5 minutes

  // Long cache for stable data
  LONG: 3600, // 1 hour

  // Very long cache for rarely changing data
  VERY_LONG: 86400, // 24 hours

  // Static cache for immutable data
  STATIC: 604800, // 7 days
};

export function getCacheHeaders(config: CacheConfig): HeadersInit {
  const { maxAge, staleWhileRevalidate, public: isPublic = true } = config;

  const cacheDirectives = [
    isPublic ? 'public' : 'private',
    `max-age=${maxAge}`,
  ];

  if (staleWhileRevalidate) {
    cacheDirectives.push(`stale-while-revalidate=${staleWhileRevalidate}`);
  }

  return {
    'Cache-Control': cacheDirectives.join(', '),
    'CDN-Cache-Control': cacheDirectives.join(', '),
    'Vercel-CDN-Cache-Control': cacheDirectives.join(', '),
  };
}

// Preset cache configurations for common use cases
export const CACHE_PRESETS = {
  // For crypto prices (updates frequently)
  CRYPTO_PRICES: {
    maxAge: CACHE_DURATIONS.REALTIME,
    staleWhileRevalidate: CACHE_DURATIONS.SHORT,
    public: true,
  },

  // For market data (updates less frequently)
  MARKET_DATA: {
    maxAge: CACHE_DURATIONS.SHORT,
    staleWhileRevalidate: CACHE_DURATIONS.MEDIUM,
    public: true,
  },

  // For trending data
  TRENDING_DATA: {
    maxAge: CACHE_DURATIONS.MEDIUM,
    staleWhileRevalidate: CACHE_DURATIONS.LONG,
    public: true,
  },

  // For user-specific data (no public caching)
  USER_DATA: {
    maxAge: CACHE_DURATIONS.SHORT,
    staleWhileRevalidate: CACHE_DURATIONS.MEDIUM,
    public: false,
  },

  // For static content
  STATIC_CONTENT: {
    maxAge: CACHE_DURATIONS.STATIC,
    staleWhileRevalidate: CACHE_DURATIONS.VERY_LONG,
    public: true,
  },

  // No cache for sensitive operations
  NO_CACHE: {
    maxAge: 0,
    public: false,
  },
};

// Helper to add cache headers to NextResponse
export function addCacheHeaders(
  headers: Headers,
  config: CacheConfig
): void {
  const cacheHeaders = getCacheHeaders(config);

  Object.entries(cacheHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
}

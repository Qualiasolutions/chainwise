// Rate Limiter for API Routes
// Uses in-memory cache with LRU eviction

interface RateLimitOptions {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max unique tokens to track
}

interface RateLimitResult {
  isRateLimited: boolean
  remaining: number
  reset: number
}

// Simple in-memory cache (for serverless, consider Redis or Vercel KV)
const cache = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(options: RateLimitOptions = { interval: 60000, uniqueTokenPerInterval: 500 }) {
  return {
    check: (limit: number, token: string): RateLimitResult => {
      const now = Date.now()
      const key = token

      // Clean up expired entries periodically
      if (cache.size > options.uniqueTokenPerInterval) {
        for (const [k, v] of cache.entries()) {
          if (v.resetTime < now) {
            cache.delete(k)
          }
        }
      }

      // Get or create token entry
      let entry = cache.get(key)

      if (!entry || entry.resetTime < now) {
        // Create new entry or reset expired one
        entry = {
          count: 0,
          resetTime: now + options.interval,
        }
        cache.set(key, entry)
      }

      // Increment count
      entry.count += 1

      // Check if rate limited
      const isRateLimited = entry.count > limit
      const remaining = Math.max(0, limit - entry.count)

      return {
        isRateLimited,
        remaining,
        reset: entry.resetTime,
      }
    },
  }
}

// Pre-configured rate limiters for different use cases
export const apiRateLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

export const strictRateLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 200,
})

export const generousRateLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 1000,
})

// Helper function to extract client identifier from request
export function getClientId(request: Request): string {
  // Try to get user ID from auth header or session
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    return `auth:${authHeader.substring(0, 20)}`
  }

  // Fallback to IP address
  const forwardedFor = request.headers.get('x-forwarded-for')
  const ip = forwardedFor?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown'

  return `ip:${ip}`
}

// Helper to create rate limit headers
export function createRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': '100',
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  }
}

// Middleware-style rate limit checker
export async function checkRateLimit(
  request: Request,
  limit: number = 100,
  limiter = apiRateLimiter
): Promise<{ allowed: boolean; headers: HeadersInit }> {
  const clientId = getClientId(request)
  const result = limiter.check(limit, clientId)

  return {
    allowed: !result.isRateLimited,
    headers: createRateLimitHeaders(result),
  }
}

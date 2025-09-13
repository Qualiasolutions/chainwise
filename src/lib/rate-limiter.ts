import { cacheService, cacheKeys } from './cache-service';

export interface RateLimitConfig {
  windowMs: number;     // Time window in milliseconds
  maxRequests: number;  // Maximum requests per window
  keyGenerator?: (req: any) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  current: number;
  remaining: number;
  resetTime: number;
}

class RateLimiter {
  async checkLimit(
    identifier: string,
    endpoint: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const key = cacheKeys.rateLimit(identifier, endpoint);
    const windowStart = Math.floor(Date.now() / config.windowMs) * config.windowMs;
    const windowKey = `${key}:${windowStart}`;
    
    try {
      const current = await cacheService.increment(
        windowKey,
        1,
        Math.ceil(config.windowMs / 1000)
      );
      
      const remaining = Math.max(0, config.maxRequests - current);
      const resetTime = windowStart + config.windowMs;
      
      return {
        success: current <= config.maxRequests,
        limit: config.maxRequests,
        current,
        remaining,
        resetTime,
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      // Fail open - allow request if cache is unavailable
      return {
        success: true,
        limit: config.maxRequests,
        current: 0,
        remaining: config.maxRequests,
        resetTime: Date.now() + config.windowMs,
      };
    }
  }

  async checkMultipleEndpoints(
    identifier: string,
    configs: Record<string, RateLimitConfig>
  ): Promise<Record<string, RateLimitResult>> {
    const results: Record<string, RateLimitResult> = {};
    
    await Promise.all(
      Object.entries(configs).map(async ([endpoint, config]) => {
        results[endpoint] = await this.checkLimit(identifier, endpoint, config);
      })
    );
    
    return results;
  }

  async resetLimit(identifier: string, endpoint: string): Promise<boolean> {
    try {
      const pattern = `${cacheKeys.rateLimit(identifier, endpoint)}:*`;
      return await cacheService.flushPattern(pattern);
    } catch (error) {
      console.error('Rate limit reset error:', error);
      return false;
    }
  }
}

// Rate limit configurations for different endpoints
export const rateLimitConfigs = {
  api: {
    windowMs: 60 * 1000,    // 1 minute
    maxRequests: 60,        // 60 requests per minute
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,           // 5 attempts per 15 minutes
  },
  chat: {
    windowMs: 60 * 1000,    // 1 minute
    maxRequests: 10,        // 10 messages per minute
  },
  portfolio: {
    windowMs: 60 * 1000,    // 1 minute
    maxRequests: 30,        // 30 requests per minute
  },
  premium: {
    windowMs: 60 * 1000,    // 1 minute
    maxRequests: 20,        // 20 requests per minute
  },
  webhook: {
    windowMs: 60 * 1000,    // 1 minute
    maxRequests: 100,       // 100 webhooks per minute
  }
} as const;

export const rateLimiter = new RateLimiter();

// Middleware helper for Next.js API routes
export function createRateLimitMiddleware(
  endpoint: string,
  config: RateLimitConfig = rateLimitConfigs.api
) {
  return async (req: any, userId?: string) => {
    const identifier = userId || req.ip || 'anonymous';
    const result = await rateLimiter.checkLimit(identifier, endpoint, config);
    
    if (!result.success) {
      const error = new Error('Rate limit exceeded') as any;
      error.status = 429;
      error.rateLimitInfo = result;
      throw error;
    }
    
    return result;
  };
}
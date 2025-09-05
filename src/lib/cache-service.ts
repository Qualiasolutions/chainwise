import Redis from 'ioredis';

// Production Redis Cluster Configuration
class CacheService {
  private redis: Redis.Cluster | Redis | null = null;
  private isCluster: boolean = false;

  constructor() {
    this.initializeRedis();
  }

  private initializeRedis() {
    try {
      const redisUrl = process.env.REDIS_URL;
      const redisClusterNodes = process.env.REDIS_CLUSTER_NODES;

      if (redisClusterNodes) {
        // Cluster mode for production
        const nodes = redisClusterNodes.split(',').map(node => {
          const [host, port] = node.split(':');
          return { host, port: parseInt(port, 10) };
        });

        this.redis = new Redis.Cluster(nodes, {
          redisOptions: {
            password: process.env.REDIS_PASSWORD,
            connectTimeout: 10000,
            lazyConnect: true,
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3,
          },
          enableOfflineQueue: false,
          scaleReads: 'slave',
        });
        this.isCluster = true;
      } else if (redisUrl) {
        // Single instance fallback
        this.redis = new Redis(redisUrl, {
          connectTimeout: 10000,
          lazyConnect: true,
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
        });
      }

      if (this.redis) {
        this.redis.on('error', (error) => {
          console.error('Redis connection error:', error);
        });

        this.redis.on('connect', () => {
          console.log('Connected to Redis');
        });
      }
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;
    
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<boolean> {
    if (!this.redis) return false;
    
    try {
      const serialized = JSON.stringify(value);
      const result = await this.redis.setex(key, ttlSeconds, serialized);
      return result === 'OK';
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.redis) return false;
    
    try {
      const result = await this.redis.del(key);
      return result > 0;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (!this.redis || keys.length === 0) return [];
    
    try {
      const values = await this.redis.mget(...keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      console.error(`Cache mget error for keys ${keys.join(', ')}:`, error);
      return keys.map(() => null);
    }
  }

  async mset(keyValues: Record<string, any>, ttlSeconds: number = 300): Promise<boolean> {
    if (!this.redis) return false;
    
    try {
      const pipeline = this.redis.pipeline();
      
      Object.entries(keyValues).forEach(([key, value]) => {
        const serialized = JSON.stringify(value);
        pipeline.setex(key, ttlSeconds, serialized);
      });
      
      const results = await pipeline.exec();
      return results?.every(([err, result]) => !err && result === 'OK') || false;
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  }

  async increment(key: string, amount: number = 1, ttl: number = 3600): Promise<number> {
    if (!this.redis) return 0;
    
    try {
      const pipeline = this.redis.pipeline();
      pipeline.incrby(key, amount);
      pipeline.expire(key, ttl);
      
      const results = await pipeline.exec();
      return (results?.[0]?.[1] as number) || 0;
    } catch (error) {
      console.error(`Cache increment error for key ${key}:`, error);
      return 0;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.redis) return false;
    
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  async flushPattern(pattern: string): Promise<boolean> {
    if (!this.redis) return false;
    
    try {
      if (this.isCluster) {
        // For cluster mode, we need to scan all nodes
        const cluster = this.redis as Redis.Cluster;
        const nodes = cluster.nodes('master');
        
        await Promise.all(nodes.map(async (node) => {
          const keys = await node.keys(pattern);
          if (keys.length > 0) {
            await node.del(...keys);
          }
        }));
      } else {
        // For single instance
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }
      return true;
    } catch (error) {
      console.error(`Cache flush pattern error for ${pattern}:`, error);
      return false;
    }
  }

  disconnect(): void {
    if (this.redis) {
      this.redis.disconnect();
      this.redis = null;
    }
  }
}

// Cache key generators
export const cacheKeys = {
  user: (userId: string) => `user:${userId}`,
  portfolio: (userId: string, portfolioId: string) => `portfolio:${userId}:${portfolioId}`,
  cryptoData: (symbol: string) => `crypto:${symbol}`,
  aiResponse: (userId: string, sessionId: string, hash: string) => `ai:${userId}:${sessionId}:${hash}`,
  marketData: (symbol: string, timeframe: string) => `market:${symbol}:${timeframe}`,
  rateLimit: (userId: string, endpoint: string) => `rate:${userId}:${endpoint}`,
};

// Cache TTL constants (in seconds)
export const cacheTTL = {
  short: 60,           // 1 minute
  medium: 300,         // 5 minutes
  long: 1800,          // 30 minutes
  hour: 3600,          // 1 hour
  day: 86400,          // 24 hours
};

export const cacheService = new CacheService();
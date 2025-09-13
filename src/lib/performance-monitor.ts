import { cacheService } from './cache-service';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  timestamp: number;
  tags?: Record<string, string>;
}

export interface DatabaseMetrics {
  queryTime: number;
  connectionPoolSize: number;
  activeConnections: number;
  slowQueries: number;
}

export interface CacheMetrics {
  hitRate: number;
  missRate: number;
  evictions: number;
  keyCount: number;
  memoryUsage: number;
}

export interface APIMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  endpoint: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 1000;

  // Performance timer utility
  startTimer(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordMetric({
        name,
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
      });
      
      return duration;
    };
  }

  // Record custom metrics
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only recent metrics to prevent memory leaks
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
    
    // Send to monitoring system (Prometheus, DataDog, etc.)
    this.sendToMonitoring(metric);
  }

  // Database performance monitoring
  async monitorDatabaseQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const timer = this.startTimer(`db_query_${queryName}`);
    const startTime = Date.now();
    
    try {
      const result = await queryFn();
      const duration = timer();
      
      this.recordMetric({
        name: 'database_query_success',
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        tags: { query: queryName, status: 'success' },
      });
      
      return result;
    } catch (error) {
      const duration = timer();
      
      this.recordMetric({
        name: 'database_query_error',
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        tags: { query: queryName, status: 'error' },
      });
      
      throw error;
    }
  }

  // Cache performance monitoring
  async monitorCacheOperation<T>(
    operation: string,
    key: string,
    operationFn: () => Promise<T>
  ): Promise<T> {
    const timer = this.startTimer(`cache_${operation}`);
    
    try {
      const result = await operationFn();
      const duration = timer();
      
      this.recordMetric({
        name: `cache_${operation}_success`,
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        tags: { operation, key: this.hashKey(key) },
      });
      
      return result;
    } catch (error) {
      const duration = timer();
      
      this.recordMetric({
        name: `cache_${operation}_error`,
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        tags: { operation, key: this.hashKey(key) },
      });
      
      throw error;
    }
  }

  // API endpoint performance monitoring
  async monitorAPIEndpoint<T>(
    endpoint: string,
    method: string,
    handlerFn: () => Promise<T>
  ): Promise<T> {
    const timer = this.startTimer(`api_${endpoint}_${method}`);
    const startTime = Date.now();
    
    try {
      const result = await handlerFn();
      const duration = timer();
      
      this.recordMetric({
        name: 'api_request_success',
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        tags: { endpoint, method, status: '200' },
      });
      
      return result;
    } catch (error: any) {
      const duration = timer();
      const status = error.status || 500;
      
      this.recordMetric({
        name: 'api_request_error',
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        tags: { endpoint, method, status: status.toString() },
      });
      
      throw error;
    }
  }

  // Memory usage monitoring
  recordMemoryUsage(): void {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      
      this.recordMetric({
        name: 'memory_heap_used',
        value: memUsage.heapUsed,
        unit: 'bytes',
        timestamp: Date.now(),
      });
      
      this.recordMetric({
        name: 'memory_heap_total',
        value: memUsage.heapTotal,
        unit: 'bytes',
        timestamp: Date.now(),
      });
      
      this.recordMetric({
        name: 'memory_external',
        value: memUsage.external,
        unit: 'bytes',
        timestamp: Date.now(),
      });
    }
  }

  // Get performance summary
  getMetricsSummary(timeWindowMs: number = 60000): Record<string, any> {
    const now = Date.now();
    const cutoff = now - timeWindowMs;
    
    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoff);
    
    const summary: Record<string, any> = {};
    
    // Group by metric name
    const grouped = recentMetrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push(metric.value);
      return acc;
    }, {} as Record<string, number[]>);
    
    // Calculate statistics
    Object.entries(grouped).forEach(([name, values]) => {
      if (values.length > 0) {
        const sorted = values.sort((a, b) => a - b);
        summary[name] = {
          count: values.length,
          min: sorted[0],
          max: sorted[sorted.length - 1],
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          p50: sorted[Math.floor(sorted.length * 0.5)],
          p90: sorted[Math.floor(sorted.length * 0.9)],
          p99: sorted[Math.floor(sorted.length * 0.99)],
        };
      }
    });
    
    return summary;
  }

  // Send metrics to external monitoring system
  private async sendToMonitoring(metric: PerformanceMetric): Promise<void> {
    try {
      // In production, send to your monitoring system
      // Example: Prometheus, DataDog, New Relic, etc.
      
      if (process.env.NODE_ENV === 'production') {
        // Example: Send to Prometheus pushgateway
        // await this.sendToPrometheus(metric);
        
        // Example: Send to DataDog
        // await this.sendToDataDog(metric);
      }
      
      // For now, just log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[PERF] ${metric.name}: ${metric.value}${metric.unit}`, metric.tags);
      }
    } catch (error) {
      console.error('Failed to send metric to monitoring system:', error);
    }
  }

  // Hash sensitive keys for privacy
  private hashKey(key: string): string {
    // Simple hash for logging purposes (not cryptographically secure)
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `key_${Math.abs(hash)}`;
  }

  // Clear old metrics
  clearOldMetrics(maxAgeMs: number = 300000): void {
    const cutoff = Date.now() - maxAgeMs;
    this.metrics = this.metrics.filter(m => m.timestamp >= cutoff);
  }

  // Start periodic monitoring
  startPeriodicMonitoring(): void {
    // Record memory usage every 30 seconds
    setInterval(() => {
      this.recordMemoryUsage();
      this.clearOldMetrics();
    }, 30000);
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Start monitoring in production
if (process.env.NODE_ENV === 'production') {
  performanceMonitor.startPeriodicMonitoring();
}

// Utility decorators for automatic monitoring
export function monitorPerformance(name: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const timer = performanceMonitor.startTimer(name);
      try {
        const result = await originalMethod.apply(this, args);
        timer();
        return result;
      } catch (error) {
        timer();
        throw error;
      }
    };
    
    return descriptor;
  };
}
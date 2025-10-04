// Monitoring and analytics utilities

export interface PerformanceMetrics {
  requestId: string;
  timestamp: number;
  duration: number;
  endpoint: string;
  statusCode: number;
  userAgent?: string;
  ip?: string;
  error?: string;
}

export interface UsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  uniqueUsers: number;
  popularPrompts: Record<string, number>;
}

class MonitoringService {
  private metrics: PerformanceMetrics[] = [];
  private usageStats: UsageStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    uniqueUsers: 0,
    popularPrompts: {}
  };

  // Record a performance metric
  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Update usage stats
    this.updateUsageStats(metric);
  }

  // Update usage statistics
  private updateUsageStats(metric: PerformanceMetrics): void {
    this.usageStats.totalRequests++;
    
    if (metric.statusCode >= 200 && metric.statusCode < 300) {
      this.usageStats.successfulRequests++;
    } else {
      this.usageStats.failedRequests++;
    }

    // Calculate average response time
    const totalTime = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    this.usageStats.averageResponseTime = totalTime / this.metrics.length;
  }

  // Get current usage statistics
  getUsageStats(): UsageStats {
    return { ...this.usageStats };
  }

  // Get performance metrics
  getMetrics(limit: number = 100): PerformanceMetrics[] {
    return this.metrics.slice(-limit);
  }

  // Record a popular prompt
  recordPrompt(prompt: string): void {
    const normalizedPrompt = prompt.toLowerCase().trim();
    this.usageStats.popularPrompts[normalizedPrompt] = 
      (this.usageStats.popularPrompts[normalizedPrompt] || 0) + 1;
  }

  // Get health status
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      uptime: number;
      errorRate: number;
      averageResponseTime: number;
      totalRequests: number;
    };
  } {
    const errorRate = this.usageStats.totalRequests > 0 
      ? (this.usageStats.failedRequests / this.usageStats.totalRequests) * 100 
      : 0;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (errorRate > 10 || this.usageStats.averageResponseTime > 5000) {
      status = 'unhealthy';
    } else if (errorRate > 5 || this.usageStats.averageResponseTime > 3000) {
      status = 'degraded';
    }

    return {
      status,
      details: {
        uptime: typeof process !== 'undefined' && process.uptime ? process.uptime() : 0,
        errorRate,
        averageResponseTime: this.usageStats.averageResponseTime,
        totalRequests: this.usageStats.totalRequests
      }
    };
  }

  // Clear old metrics (call periodically)
  cleanup(): void {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    this.metrics = this.metrics.filter(metric => metric.timestamp > oneHourAgo);
  }
}

// Singleton instance
export const monitoring = new MonitoringService();

// Performance tracking decorator
export function trackPerformance(endpoint: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      const requestId = Math.random().toString(36).substring(7);
      
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - startTime;
        
        monitoring.recordMetric({
          requestId,
          timestamp: Date.now(),
          duration,
          endpoint,
          statusCode: 200
        });
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        monitoring.recordMetric({
          requestId,
          timestamp: Date.now(),
          duration,
          endpoint,
          statusCode: 500,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        throw error;
      }
    };
  };
}

// Error tracking
export function trackError(error: Error, context: Record<string, any> = {}): void {
  console.error('Error tracked:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  });
}

// Performance monitoring for API routes
export function createPerformanceTracker(endpoint: string) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  return {
    recordSuccess: (statusCode: number = 200) => {
      const duration = Date.now() - startTime;
      monitoring.recordMetric({
        requestId,
        timestamp: Date.now(),
        duration,
        endpoint,
        statusCode
      });
    },
    recordError: (statusCode: number, error: string) => {
      const duration = Date.now() - startTime;
      monitoring.recordMetric({
        requestId,
        timestamp: Date.now(),
        duration,
        endpoint,
        statusCode,
        error
      });
    }
  };
}

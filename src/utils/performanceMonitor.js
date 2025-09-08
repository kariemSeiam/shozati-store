// Performance monitoring utilities
import { useCallback } from 'react';

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
    this.startTime = performance.now();
    this.isSupported = 'performance' in window && 'PerformanceObserver' in window;
  }

  // Measure component render time
  measureRender(componentName, startTime = performance.now()) {
    return {
      end: () => {
        const duration = performance.now() - startTime;
        this.recordMetric('component_render', {
          component: componentName,
          duration,
          timestamp: Date.now()
        });
        return duration;
      }
    };
  }

  // Measure API request time
  measureApiCall(endpoint, startTime = performance.now()) {
    return {
      end: (success = true) => {
        const duration = performance.now() - startTime;
        this.recordMetric('api_call', {
          endpoint,
          duration,
          success,
          timestamp: Date.now()
        });
        return duration;
      }
    };
  }

  // Record custom metric
  recordMetric(type, data) {
    if (!this.metrics.has(type)) {
      this.metrics.set(type, []);
    }
    
    const metrics = this.metrics.get(type);
    metrics.push(data);
    
    // Keep only last 100 entries per metric type
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  // Get performance metrics
  getMetrics(type) {
    return this.metrics.get(type) || [];
  }

  // Get average for a metric
  getAverage(type, field = 'duration') {
    const metrics = this.getMetrics(type);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, metric) => acc + metric[field], 0);
    return sum / metrics.length;
  }

  // Monitor web vitals
  observeWebVitals() {
    if (!this.isSupported) return;

    // LCP - Largest Contentful Paint
    this.observePerformanceEntry('largest-contentful-paint', (entries) => {
      entries.forEach(entry => {
        this.recordMetric('web_vitals', {
          name: 'LCP',
          value: entry.startTime,
          timestamp: Date.now()
        });
      });
    });

    // FID - First Input Delay
    this.observePerformanceEntry('first-input', (entries) => {
      entries.forEach(entry => {
        this.recordMetric('web_vitals', {
          name: 'FID',
          value: entry.processingStart - entry.startTime,
          timestamp: Date.now()
        });
      });
    });

    // CLS - Cumulative Layout Shift
    this.observePerformanceEntry('layout-shift', (entries) => {
      let clsValue = 0;
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      this.recordMetric('web_vitals', {
        name: 'CLS',
        value: clsValue,
        timestamp: Date.now()
      });
    });
  }

  // Observe specific performance entries
  observePerformanceEntry(entryType, callback) {
    try {
      const observer = new PerformanceObserver(callback);
      observer.observe({ entryTypes: [entryType] });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`Failed to observe ${entryType}:`, error);
    }
  }

  // Monitor memory usage
  getMemoryUsage() {
    if ('memory' in performance) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  }

  // Get bundle loading performance
  getBundleMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource')
      .filter(entry => entry.name.includes('.js') || entry.name.includes('.css'));

    return {
      navigationTiming: {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
        ttfb: navigation.responseStart - navigation.navigationStart
      },
      resources: resources.map(resource => ({
        name: resource.name.split('/').pop(),
        duration: resource.duration,
        size: resource.transferSize || 0,
        type: resource.name.includes('.js') ? 'script' : 'stylesheet'
      }))
    };
  }

  // Generate performance report
  generateReport() {
    const report = {
      timestamp: Date.now(),
      uptime: performance.now() - this.startTime,
      metrics: {},
      memory: this.getMemoryUsage(),
      bundle: this.getBundleMetrics()
    };

    // Add all recorded metrics
    for (const [type, data] of this.metrics) {
      report.metrics[type] = {
        count: data.length,
        average: this.getAverage(type),
        latest: data[data.length - 1] || null
      };
    }

    return report;
  }

  // Log performance summary
  logSummary() {
    const report = this.generateReport();
    
    console.group('🚀 Performance Report');
    console.log('Uptime:', `${Math.round(report.uptime)}ms`);
    
    if (report.memory) {
      console.log('Memory Usage:', `${report.memory.used}MB / ${report.memory.total}MB`);
    }
    
    Object.entries(report.metrics).forEach(([type, data]) => {
      if (data.count > 0) {
        console.log(`${type}:`, `${data.count} calls, avg: ${Math.round(data.average)}ms`);
      }
    });
    
    console.groupEnd();
    
    return report;
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const measureRender = useCallback((componentName) => {
    return performanceMonitor.measureRender(componentName);
  }, []);

  const measureApiCall = useCallback((endpoint) => {
    return performanceMonitor.measureApiCall(endpoint);
  }, []);

  return {
    measureRender,
    measureApiCall,
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    getReport: performanceMonitor.generateReport.bind(performanceMonitor)
  };
};

// Initialize monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.observeWebVitals();
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    performanceMonitor.cleanup();
  });
}
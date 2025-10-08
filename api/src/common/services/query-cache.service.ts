import { Injectable, Logger } from '@nestjs/common';
import { QueryOptimizationService } from './query-optimization.service';

/**
 * In-memory query cache service for frequently accessed data
 * Provides caching for common queries to improve performance
 */
@Injectable()
export class QueryCacheService {
  private readonly logger = new Logger(QueryCacheService.name);
  private readonly cache = new Map<
    string,
    { data: unknown; timestamp: number; ttl: number }
  >();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  constructor(private queryOptimization: QueryOptimizationService) {}

  /**
   * Get cached data or fetch and cache it
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.defaultTTL,
  ): Promise<T> {
    const cached = this.getFromCache<T>(key);
    if (cached) {
      this.logger.debug(`Cache hit for key: ${key}`);
      return cached;
    }

    this.logger.debug(`Cache miss for key: ${key}, fetching data...`);
    const data = await fetcher();
    this.setCache(key, data, ttl);
    return data;
  }

  /**
   * Get data from cache
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      this.logger.debug(`Cache expired for key: ${key}`);
      return null;
    }

    return cached.data as T;
  }

  /**
   * Set data in cache
   */
  private setCache(key: string, data: unknown, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
    this.logger.debug(`Cached data for key: ${key} with TTL: ${ttl}ms`);
  }

  /**
   * Clear cache for a specific key
   */
  clearCache(key: string): void {
    this.cache.delete(key);
    this.logger.debug(`Cleared cache for key: ${key}`);
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.cache.clear();
    this.logger.debug('Cleared all cache');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    keys: string[];
    memoryUsage: number;
  } {
    const now = Date.now();
    const validKeys = Array.from(this.cache.keys()).filter((key) => {
      const cached = this.cache.get(key);
      return cached && now - cached.timestamp <= cached.ttl;
    });

    return {
      size: validKeys.length,
      keys: validKeys,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * Estimate memory usage of cache
   */
  private estimateMemoryUsage(): number {
    let totalSize = 0;
    for (const [key, value] of this.cache.entries()) {
      totalSize += key.length * 2; // UTF-16 string
      totalSize += JSON.stringify(value).length * 2; // Rough estimate
    }
    return totalSize;
  }

  /**
   * Clean expired cache entries
   */
  cleanExpiredCache(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned ${cleaned} expired cache entries`);
    }
  }

  // Cached query methods for common operations

  /**
   * Get cached content list
   */
  async getCachedContentList(
    organizationId: string,
    options: {
      limit?: number;
      offset?: number;
      status?: string;
      contentTypeId?: string;
    } = {},
  ) {
    const cacheKey = `content:${organizationId}:${JSON.stringify(options)}`;
    return this.getOrSet(
      cacheKey,
      () =>
        this.queryOptimization.getOptimizedContentList(organizationId, options),
      2 * 60 * 1000, // 2 minutes cache
    );
  }

  /**
   * Get cached user list
   */
  async getCachedUserList(
    organizationId: string,
    options: {
      limit?: number;
      offset?: number;
      isActive?: boolean;
    } = {},
  ) {
    const cacheKey = `users:${organizationId}:${JSON.stringify(options)}`;
    return this.getOrSet(
      cacheKey,
      () =>
        this.queryOptimization.getOptimizedUserList(organizationId, options),
      5 * 60 * 1000, // 5 minutes cache
    );
  }

  /**
   * Get cached media list
   */
  async getCachedMediaList(
    organizationId: string,
    options: {
      limit?: number;
      offset?: number;
      mimeType?: string;
    } = {},
  ) {
    const cacheKey = `media:${organizationId}:${JSON.stringify(options)}`;
    return this.getOrSet(
      cacheKey,
      () =>
        this.queryOptimization.getOptimizedMediaList(organizationId, options),
      3 * 60 * 1000, // 3 minutes cache
    );
  }

  /**
   * Get cached category list
   */
  async getCachedCategoryList(
    organizationId: string,
    options: {
      limit?: number;
      offset?: number;
      isActive?: boolean;
    } = {},
  ) {
    const cacheKey = `categories:${organizationId}:${JSON.stringify(options)}`;
    return this.getOrSet(
      cacheKey,
      () =>
        this.queryOptimization.getOptimizedCategoryList(
          organizationId,
          options,
        ),
      10 * 60 * 1000, // 10 minutes cache (categories change less frequently)
    );
  }

  /**
   * Get cached tag list
   */
  async getCachedTagList(
    organizationId: string,
    options: {
      limit?: number;
      offset?: number;
      isActive?: boolean;
    } = {},
  ) {
    const cacheKey = `tags:${organizationId}:${JSON.stringify(options)}`;
    return this.getOrSet(
      cacheKey,
      () => this.queryOptimization.getOptimizedTagList(organizationId, options),
      10 * 60 * 1000, // 10 minutes cache (tags change less frequently)
    );
  }

  /**
   * Get cached content type list
   */
  async getCachedContentTypeList(
    organizationId: string,
    options: {
      limit?: number;
      offset?: number;
      isActive?: boolean;
    } = {},
  ) {
    const cacheKey = `contentTypes:${organizationId}:${JSON.stringify(options)}`;
    return this.getOrSet(
      cacheKey,
      () =>
        this.queryOptimization.getOptimizedContentTypeList(
          organizationId,
          options,
        ),
      10 * 60 * 1000, // 10 minutes cache (content types change less frequently)
    );
  }

  /**
   * Get cached organization stats
   */
  async getCachedOrganizationStats(organizationId: string) {
    const cacheKey = `orgStats:${organizationId}`;
    return this.getOrSet(
      cacheKey,
      () => this.queryOptimization.getOrganizationStats(organizationId),
      5 * 60 * 1000, // 5 minutes cache
    );
  }

  /**
   * Invalidate cache for content-related operations
   */
  invalidateContentCache(organizationId: string): void {
    const patterns = [
      `content:${organizationId}:`,
      `orgStats:${organizationId}`,
    ];

    for (const pattern of patterns) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(pattern)) {
          this.clearCache(key);
        }
      }
    }

    this.logger.debug(
      `Invalidated content cache for organization: ${organizationId}`,
    );
  }

  /**
   * Invalidate cache for user-related operations
   */
  invalidateUserCache(organizationId: string): void {
    const patterns = [`users:${organizationId}:`, `orgStats:${organizationId}`];

    for (const pattern of patterns) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(pattern)) {
          this.clearCache(key);
        }
      }
    }

    this.logger.debug(
      `Invalidated user cache for organization: ${organizationId}`,
    );
  }

  /**
   * Invalidate cache for media-related operations
   */
  invalidateMediaCache(organizationId: string): void {
    const patterns = [`media:${organizationId}:`, `orgStats:${organizationId}`];

    for (const pattern of patterns) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(pattern)) {
          this.clearCache(key);
        }
      }
    }

    this.logger.debug(
      `Invalidated media cache for organization: ${organizationId}`,
    );
  }

  /**
   * Invalidate cache for category-related operations
   */
  invalidateCategoryCache(organizationId: string): void {
    const patterns = [
      `categories:${organizationId}:`,
      `orgStats:${organizationId}`,
    ];

    for (const pattern of patterns) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(pattern)) {
          this.clearCache(key);
        }
      }
    }

    this.logger.debug(
      `Invalidated category cache for organization: ${organizationId}`,
    );
  }

  /**
   * Invalidate cache for tag-related operations
   */
  invalidateTagCache(organizationId: string): void {
    const patterns = [`tags:${organizationId}:`, `orgStats:${organizationId}`];

    for (const pattern of patterns) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(pattern)) {
          this.clearCache(key);
        }
      }
    }

    this.logger.debug(
      `Invalidated tag cache for organization: ${organizationId}`,
    );
  }

  /**
   * Invalidate cache for content type-related operations
   */
  invalidateContentTypeCache(organizationId: string): void {
    const patterns = [
      `contentTypes:${organizationId}:`,
      `orgStats:${organizationId}`,
    ];

    for (const pattern of patterns) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(pattern)) {
          this.clearCache(key);
        }
      }
    }

    this.logger.debug(
      `Invalidated content type cache for organization: ${organizationId}`,
    );
  }
}

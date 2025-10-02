/**
 * File cache service interface for caching file contents and metadata
 * Provides operations for storing, retrieving, and managing file-based cache entries
 */
export interface IFileCacheService {
  /**
   * Get cached content for a cache key
   * @param cacheKey - The cache key to get cached content for
   * @returns The cached content or null if not found or expired
   */
  get<T>(cacheKey: string): Promise<T | null>

  /**
   * Set cached content for a cache key
   * @param cacheKey - The cache key to cache content for
   * @param content - The content to cache
   * @param ttl - Time to live in seconds (optional, defaults to 1 hour)
   */
  set<T>(cacheKey: string, content: T, ttl?: number): Promise<void>

  /**
   * Delete cached content for a cache key
   * @param cacheKey - The cache key to remove from cache
   */
  delete(cacheKey: string): Promise<void>

  /**
   * Clear all cached entries
   */
  clear(): Promise<void>

  /**
   * Check if a cache key exists in cache and is not expired
   * @param cacheKey - The cache key to check
   * @returns True if cached and not expired, false otherwise
   */
  has(cacheKey: string): Promise<boolean>

  /**
   * Get cache metadata for a cache key
   * @param cacheKey - The cache key to get metadata for
   * @returns Cache metadata or null if not found
   */
  getMetadata(cacheKey: string): Promise<CacheMetadata | null>

  /**
   * Invalidate cache entries that match a pattern
   * @param pattern - Glob pattern to match cache keys
   */
  invalidatePattern(pattern: string): Promise<void>

  /**
   * Get cache statistics
   * @returns Cache statistics including entry count and size
   */
  getStats(): Promise<CacheStats>
}

/**
 * Cache metadata for tracking cache entry information
 */
export interface CacheMetadata {
  /** Cache key that was cached */
  cacheKey: string
  /** Timestamp when the entry was created */
  createdAt: Date
  /** Timestamp when the entry expires */
  expiresAt: Date | null
  /** Size of the cached content in bytes */
  size: number
  /** Hash of the original content for validation */
  contentHash?: string
}

/**
 * Cache statistics for monitoring cache performance
 */
export interface CacheStats {
  /** Total number of cache entries */
  entryCount: number
  /** Total size of all cached entries in bytes */
  totalSize: number
  /** Number of expired entries */
  expiredCount: number
  /** Cache hit rate (0-1) */
  hitRate: number
}

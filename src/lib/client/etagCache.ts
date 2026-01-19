/**
 * ETag Cache for HTTP Conditional Requests
 *
 * Stores ETags and response data to enable 304 Not Modified responses.
 * Uses in-memory cache with optional size limits to prevent memory bloat.
 *
 * @example
 * ```ts
 * // Store a response with its ETag
 * etagCache.set("/api/v2/characters/123", "abc123", responseData)
 *
 * // Get stored ETag for conditional request
 * const etag = etagCache.getEtag("/api/v2/characters/123")
 *
 * // Get cached data when 304 received
 * const data = etagCache.getData("/api/v2/characters/123")
 * ```
 */

interface CacheEntry<T = unknown> {
  etag: string
  data: T
  timestamp: number
}

class ETagCache {
  private cache: Map<string, CacheEntry> = new Map()
  private maxEntries: number
  private maxAgeMs: number

  constructor(options: { maxEntries?: number; maxAgeMs?: number } = {}) {
    this.maxEntries = options.maxEntries ?? 500
    this.maxAgeMs = options.maxAgeMs ?? 5 * 60 * 1000 // 5 minutes default
  }

  /**
   * Generate a cache key from URL and params
   */
  private getCacheKey(url: string, params?: Record<string, unknown>): string {
    if (!params || Object.keys(params).length === 0) {
      return url
    }
    // Sort params for consistent key generation
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${String(params[key])}`)
      .join("&")
    return `${url}?${sortedParams}`
  }

  /**
   * Store an ETag and response data for a URL
   */
  set<T>(
    url: string,
    etag: string,
    data: T,
    params?: Record<string, unknown>
  ): void {
    const key = this.getCacheKey(url, params)

    // Enforce max entries limit (LRU-style: remove oldest)
    if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      etag,
      data,
      timestamp: Date.now(),
    })
  }

  /**
   * Get the stored ETag for a URL (for If-None-Match header)
   */
  getEtag(url: string, params?: Record<string, unknown>): string | null {
    const key = this.getCacheKey(url, params)
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.maxAgeMs) {
      this.cache.delete(key)
      return null
    }

    return entry.etag
  }

  /**
   * Get cached response data for a URL (when 304 received)
   */
  getData<T>(url: string, params?: Record<string, unknown>): T | null {
    const key = this.getCacheKey(url, params)
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.maxAgeMs) {
      this.cache.delete(key)
      return null
    }

    // Update timestamp on access (LRU behavior)
    entry.timestamp = Date.now()

    return entry.data as T
  }

  /**
   * Check if we have a valid cached entry for a URL
   */
  has(url: string, params?: Record<string, unknown>): boolean {
    return this.getEtag(url, params) !== null
  }

  /**
   * Invalidate cache entry for a URL
   */
  invalidate(url: string, params?: Record<string, unknown>): void {
    const key = this.getCacheKey(url, params)
    this.cache.delete(key)
  }

  /**
   * Invalidate all cache entries matching a URL pattern
   * Useful for invalidating all character entries when one is updated
   */
  invalidatePattern(urlPattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(urlPattern)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics for debugging
   */
  getStats(): { size: number; maxEntries: number; maxAgeMs: number } {
    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
      maxAgeMs: this.maxAgeMs,
    }
  }
}

// Export singleton instance for app-wide use
export const etagCache = new ETagCache()

// Export class for testing or custom instances
export { ETagCache }

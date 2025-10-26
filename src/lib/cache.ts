/**
 * Redis caching layer with automatic serialization and TTL management
 *
 * Features:
 * - Automatic JSON serialization/deserialization
 * - Configurable TTL (time to live)
 * - Cache invalidation patterns
 * - Stale-while-revalidate support
 * - Type-safe cache operations
 */

import { Redis } from '@upstash/redis'

// Create Redis client for caching
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null

export interface CacheOptions {
  /** Time to live in seconds */
  ttl?: number
  /** Use stale data while revalidating in background */
  staleWhileRevalidate?: boolean
  /** Custom serialization function */
  serialize?: (data: any) => string
  /** Custom deserialization function */
  deserialize?: (data: string) => any
}

export class CacheService {
  /**
   * Get cached data or fetch from source
   */
  async get<T>(key: string, fetcher: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
    const {
      ttl = 300, // 5 minutes default
      staleWhileRevalidate = false,
      serialize = JSON.stringify,
      deserialize = JSON.parse,
    } = options

    try {
      // If Redis is not configured, always fetch fresh data
      if (!redis) {
        return fetcher()
      }

      // Try to get from cache
      const cached = await redis.get(key)

      if (cached) {
        const data = deserialize(cached as string)

        // If stale-while-revalidate, refresh in background
        if (staleWhileRevalidate) {
          this.refreshInBackground(key, fetcher, { ttl, serialize })
        }

        return data
      }

      // Cache miss - fetch fresh data
      const freshData = await fetcher()

      // Store in cache (don't await to avoid blocking)
      this.set(key, freshData, { ttl, serialize }).catch(err => {
        console.error('Cache set error:', err)
      })

      return freshData
    } catch (error) {
      console.error('Cache get error:', error)
      // Fallback to fetcher on cache errors
      return fetcher()
    }
  }

  /**
   * Set cache value
   */
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    if (!redis) return

    const { ttl = 300, serialize = JSON.stringify } = options

    try {
      const serialized = serialize(value)
      await redis.setex(key, ttl, serialized)
    } catch (error) {
      console.error('Cache set error:', error)
      throw error
    }
  }

  /**
   * Delete cache key
   */
  async delete(key: string): Promise<void> {
    if (!redis) return

    try {
      await redis.del(key)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    if (!redis) return

    try {
      // Note: Redis SCAN is not available in Upstash REST API
      // For pattern matching, we need to track keys manually
      // This is a simplified version that deletes exact matches
      await redis.del(pattern)
    } catch (error) {
      console.error('Cache delete pattern error:', error)
    }
  }

  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    if (!redis) return false

    try {
      const exists = await redis.exists(key)
      return exists === 1
    } catch (error) {
      console.error('Cache exists error:', error)
      return false
    }
  }

  /**
   * Get remaining TTL for a key
   */
  async ttl(key: string): Promise<number> {
    if (!redis) return -1

    try {
      return await redis.ttl(key)
    } catch (error) {
      console.error('Cache TTL error:', error)
      return -1
    }
  }

  /**
   * Refresh cache in background (fire and forget)
   */
  private refreshInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: Pick<CacheOptions, 'ttl' | 'serialize'>
  ): void {
    // Fire and forget - don't await
    fetcher()
      .then(data => this.set(key, data, options))
      .catch(err => console.error('Background refresh error:', err))
  }
}

/**
 * Default cache service instance
 */
export const cache = new CacheService()

/**
 * Cache key generators for consistency
 */
export const CacheKeys = {
  /** Leaderboard cache key */
  leaderboard: (period: string) => `leaderboard:${period}`,

  /** User stats cache key */
  userStats: (userId: string) => `user:${userId}:stats`,

  /** Chapter progress cache key */
  chapterProgress: (userId: string, chapterId: string) =>
    `user:${userId}:chapter:${chapterId}:progress`,

  /** All chapters progress for a user */
  allChaptersProgress: (userId: string) => `user:${userId}:chapters:all`,

  /** User achievements */
  userAchievements: (userId: string) => `user:${userId}:achievements`,

  /** Chapter content */
  chapter: (chapterId: string) => `chapter:${chapterId}`,

  /** Module test */
  moduleTest: (moduleNumber: number) => `module:${moduleNumber}:test`,
}

/**
 * Cache invalidation helpers
 */
export const CacheInvalidation = {
  /** Invalidate all user-related caches */
  async invalidateUser(userId: string): Promise<void> {
    await Promise.all([
      cache.delete(CacheKeys.userStats(userId)),
      cache.delete(CacheKeys.allChaptersProgress(userId)),
      cache.delete(CacheKeys.userAchievements(userId)),
    ])
  },

  /** Invalidate leaderboard caches (all periods) */
  async invalidateLeaderboard(): Promise<void> {
    await Promise.all([
      cache.delete(CacheKeys.leaderboard('daily')),
      cache.delete(CacheKeys.leaderboard('weekly')),
      cache.delete(CacheKeys.leaderboard('monthly')),
      cache.delete(CacheKeys.leaderboard('all-time')),
    ])
  },

  /** Invalidate chapter progress for a user */
  async invalidateChapterProgress(userId: string, chapterId?: string): Promise<void> {
    if (chapterId) {
      await cache.delete(CacheKeys.chapterProgress(userId, chapterId))
    }
    await cache.delete(CacheKeys.allChaptersProgress(userId))
  },
}

/**
 * Cached function decorator
 */
export function cached<T extends (...args: any[]) => Promise<any>>(
  keyGenerator: (...args: Parameters<T>) => string,
  options: CacheOptions = {}
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: Parameters<T>) {
      const key = keyGenerator(...args)
      return cache.get(key, () => originalMethod.apply(this, args), options)
    }

    return descriptor
  }
}

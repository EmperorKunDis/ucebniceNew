import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create Redis client
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null

// Rate limiters for different endpoints
export const apiLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 h'), // 100 requests per hour
      analytics: true,
      prefix: 'ratelimit:api',
    })
  : null

export const progressLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 h'), // 100 chapter completions per hour
      analytics: true,
      prefix: 'ratelimit:progress',
    })
  : null

export const xpLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, '1 h'), // 50 XP updates per hour
      analytics: true,
      prefix: 'ratelimit:xp',
    })
  : null

export const achievementLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(200, '1 h'), // 200 achievement checks per hour
      analytics: true,
      prefix: 'ratelimit:achievements',
    })
  : null

export const authLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '15 m'), // 10 login attempts per 15 minutes
      analytics: true,
      prefix: 'ratelimit:auth',
    })
  : null

/**
 * Get client identifier from request
 * Uses user ID if authenticated, otherwise IP address
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`
  }

  // Get IP from headers (works with most proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0]?.trim() || 'unknown' : 'unknown'

  return `ip:${ip}`
}

/**
 * Check rate limit and return appropriate response if exceeded
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  // If Redis is not configured, allow all requests (development mode)
  if (!limiter) {
    return { success: true }
  }

  const { success, limit, remaining, reset } = await limiter.limit(identifier)

  return {
    success,
    limit,
    remaining,
    reset,
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { checkRateLimit, getClientIdentifier } from './rate-limit'

/**
 * Apply rate limiting to Next.js API route
 * Returns a response with rate limit info or executes the handler
 */
export async function applyRateLimit(
  request: NextRequest,
  limiter: Ratelimit | null,
  userId?: string
): Promise<NextResponse | null> {
  // Get identifier
  const identifier = getClientIdentifier(request, userId)

  // Check rate limit
  const rateLimitResult = await checkRateLimit(limiter, identifier)

  if (!rateLimitResult.success) {
    // Return 429 Too Many Requests
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.',
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit?.toString() || '',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.reset?.toString() || '',
          'Retry-After': Math.ceil(
            (rateLimitResult.reset || Date.now()) / 1000 - Date.now() / 1000
          ).toString(),
        },
      }
    )
  }

  // Rate limit passed
  return null
}

/**
 * Add rate limit headers to existing response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  limit?: number,
  remaining?: number,
  reset?: number
): NextResponse {
  if (limit !== undefined) {
    response.headers.set('X-RateLimit-Limit', limit.toString())
    response.headers.set('X-RateLimit-Remaining', remaining?.toString() || '0')
    response.headers.set('X-RateLimit-Reset', reset?.toString() || '')
  }
  return response
}

/**
 * Extract user ID from NextAuth session
 */
export async function getUserIdFromSession(): Promise<string | undefined> {
  try {
    // Dynamic import to avoid circular dependencies
    const { getServerSession } = await import('next-auth')
    const { authOptions } = await import('./auth')

    const session = await getServerSession(authOptions)
    return session?.user?.id
  } catch (error) {
    console.error('Error getting user from session:', error)
    return undefined
  }
}

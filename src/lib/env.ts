/**
 * Environment variable validation and type safety
 * Ensures all required environment variables are present
 */

import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // NextAuth
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),

  // OAuth (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // Upstash Redis (optional but recommended for rate limiting)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Sentry (optional)
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export type Env = z.infer<typeof envSchema>

/**
 * Validates environment variables on application startup
 * Throws an error if required variables are missing
 */
export function validateEnv(): Env {
  const env = {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
  }

  const result = envSchema.safeParse(env)

  if (!result.success) {
    console.error('❌ Invalid environment variables:')
    for (const err of result.error.issues) {
      console.error(`  ${err.path.join('.')}: ${err.message}`)
    }

    // In production, throw error. In development, just warn
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment variables')
    } else {
      console.warn(
        '⚠️  Some optional environment variables are missing. App will continue but some features may not work.'
      )
    }
  }

  return result.success ? result.data : (env as Env)
}

/**
 * Check if rate limiting is enabled
 */
export function isRateLimitingEnabled(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

/**
 * Check if Sentry is enabled
 */
export function isSentryEnabled(): boolean {
  return !!process.env.SENTRY_DSN
}

/**
 * Check if OAuth provider is configured
 */
export function isOAuthProviderConfigured(provider: 'google' | 'github'): boolean {
  if (provider === 'google') {
    return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  }
  if (provider === 'github') {
    return !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)
  }
  return false
}

// Export validated environment
export const env = validateEnv()

/**
 * Zod validation schemas for API requests
 * Provides type-safe input validation for all API endpoints
 */

import { z } from 'zod'

// User authentication schemas
export const signupSchema = z.object({
  name: z
    .string()
    .min(2, 'Jméno musí mít alespoň 2 znaky')
    .max(50, 'Jméno může mít maximálně 50 znaků')
    .optional(),
  email: z.string().email('Neplatná emailová adresa'),
  username: z
    .string()
    .min(3, 'Uživatelské jméno musí mít alespoň 3 znaky')
    .max(20, 'Uživatelské jméno může mít maximálně 20 znaků')
    .regex(/^[a-zA-Z0-9_]+$/, 'Uživatelské jméno může obsahovat pouze písmena, čísla a podtržítka'),
  password: z
    .string()
    .min(8, 'Heslo musí mít alespoň 8 znaků')
    .max(100, 'Heslo je příliš dlouhé')
    .regex(/[A-Z]/, 'Heslo musí obsahovat alespoň jedno velké písmeno')
    .regex(/[a-z]/, 'Heslo musí obsahovat alespoň jedno malé písmeno')
    .regex(/[0-9]/, 'Heslo musí obsahovat alespoň jednu číslici'),
})

export const signinSchema = z.object({
  email: z.string().email('Neplatná emailová adresa'),
  password: z.string().min(1, 'Heslo je povinné'),
})

// Progress tracking schemas
export const completeChapterSchema = z.object({
  chapterId: z.string().min(1, 'ID kapitoly je povinné'),
  timeSpent: z.number().int().min(0).optional(),
})

export const updateProgressSchema = z.object({
  lessonId: z.string().min(1, 'ID lekce je povinné'),
  progress: z.number().int().min(0).max(100, 'Pokrok musí být mezi 0 a 100'),
})

// User profile schemas
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  image: z.string().url().optional(),
})

// Leaderboard query schemas
export const leaderboardQuerySchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly', 'all-time']).default('all-time'),
  limit: z.number().int().min(1).max(100).default(100),
  offset: z.number().int().min(0).default(0),
})

// Cognitive glitch schemas
export const submitGlitchAttemptSchema = z.object({
  challengeId: z.string().min(1, 'ID výzvy je povinné'),
  answer: z.any(), // Can be string, number, or object depending on challenge
  hintUsed: z.boolean().default(false),
  timeElapsed: z.number().int().min(0),
})

// Achievement schemas
export const checkAchievementsSchema = z.object({
  context: z.enum(['chapter_complete', 'streak', 'level_up', 'challenge_complete']),
})

// Helper function to validate request body
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      const errors = result.error.issues
        .map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`)
        .join(', ')
      return { success: false, error: errors }
    }

    return { success: true, data: result.data }
  } catch {
    return { success: false, error: 'Neplatná data požadavku' }
  }
}

// Type exports for TypeScript
export type SignupInput = z.infer<typeof signupSchema>
export type SigninInput = z.infer<typeof signinSchema>
export type CompleteChapterInput = z.infer<typeof completeChapterSchema>
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>
export type SubmitGlitchAttemptInput = z.infer<typeof submitGlitchAttemptSchema>
export type CheckAchievementsInput = z.infer<typeof checkAchievementsSchema>

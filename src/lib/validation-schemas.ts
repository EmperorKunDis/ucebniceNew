import { z } from 'zod'
import { VALIDATION } from './constants'

/**
 * Validation schemas for forms using Zod
 * Provides strong type-safe validation with helpful error messages
 */

// Email validation
export const emailSchema = z
  .string()
  .min(1, 'Email je povinný')
  .email('Neplatná emailová adresa')
  .max(VALIDATION.EMAIL.MAX_LENGTH, 'Email je příliš dlouhý')

// Password validation - requires 8+ chars, 1 uppercase, 1 number
export const passwordSchema = z
  .string()
  .min(
    VALIDATION.PASSWORD.MIN_LENGTH,
    `Heslo musí mít alespoň ${VALIDATION.PASSWORD.MIN_LENGTH} znaků`
  )
  .max(VALIDATION.PASSWORD.MAX_LENGTH, 'Heslo je příliš dlouhé')
  .regex(/[A-Z]/, 'Heslo musí obsahovat alespoň jedno velké písmeno')
  .regex(/[0-9]/, 'Heslo musí obsahovat alespoň jedno číslo')

// Username validation
export const usernameSchema = z
  .string()
  .min(
    VALIDATION.USERNAME.MIN_LENGTH,
    `Uživatelské jméno musí mít alespoň ${VALIDATION.USERNAME.MIN_LENGTH} znaky`
  )
  .max(
    VALIDATION.USERNAME.MAX_LENGTH,
    `Uživatelské jméno může mít maximálně ${VALIDATION.USERNAME.MAX_LENGTH} znaků`
  )
  .regex(VALIDATION.USERNAME.PATTERN, 'Pouze malá písmena a číslice')

// Name validation
export const nameSchema = z
  .string()
  .min(VALIDATION.NAME.MIN_LENGTH, `Jméno musí mít alespoň ${VALIDATION.NAME.MIN_LENGTH} znaky`)
  .max(VALIDATION.NAME.MAX_LENGTH, 'Jméno je příliš dlouhé')
  .regex(VALIDATION.NAME.PATTERN, 'Jméno obsahuje neplatné znaky')

// Sign in form schema
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Heslo je povinné'), // No strict validation for sign in
})

// Sign up / Registration form schema
export const signUpSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Potvrzení hesla je povinné'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Hesla se neshodují',
    path: ['confirmPassword'],
  })

// Onboarding step 1 - Name
export const onboardingNameSchema = z.object({
  name: nameSchema,
})

// Onboarding step 2 - Registration
export const onboardingRegisterSchema = signUpSchema

// Onboarding step 3 - Goal
export const onboardingGoalSchema = z.object({
  goal: z.enum(['career', 'skills', 'ai', 'fun'], {
    message: 'Vyberte prosím svůj cíl',
  }),
})

// Onboarding step 4 - Experience
export const onboardingExperienceSchema = z.object({
  experience: z.enum(['beginner', 'some', 'intermediate', 'advanced'], {
    message: 'Vyberte prosím svou zkušenost',
  }),
})

// Profile update schema
export const profileUpdateSchema = z.object({
  name: nameSchema.optional(),
  username: usernameSchema.optional(),
  bio: z
    .string()
    .max(VALIDATION.BIO.MAX_LENGTH, `Bio může mít maximálně ${VALIDATION.BIO.MAX_LENGTH} znaků`)
    .optional(),
})

// Type exports for use in components
export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type OnboardingNameData = z.infer<typeof onboardingNameSchema>
export type OnboardingRegisterData = z.infer<typeof onboardingRegisterSchema>
export type OnboardingGoalData = z.infer<typeof onboardingGoalSchema>
export type OnboardingExperienceData = z.infer<typeof onboardingExperienceSchema>
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>

/**
 * Helper function to format Zod errors for display
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  error.issues.forEach((err: z.ZodIssue) => {
    const firstPath = err.path[0]
    if (firstPath !== undefined) {
      errors[firstPath.toString()] = err.message
    }
  })
  return errors
}

/**
 * Helper function to validate data and return errors
 */
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean
  data?: T
  errors?: Record<string, string>
} {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: formatZodErrors(result.error) }
  }
}

// ========================================
// API VALIDATION SCHEMAS
// ========================================

// Chapter ID validation - must be 2-digit number or special format
export const chapterIdSchema = z
  .string()
  .min(1, 'ID kapitoly je povinné')
  .regex(/^(0[1-9]|[1-3][0-9]|40)$/, 'Neplatné ID kapitoly (01-40)')

// Question ID validation
export const questionIdSchema = z.string().min(1, 'ID otázky je povinné')

// Module number validation (1-4 for the 4 modules)
export const moduleNumberSchema = z
  .number()
  .int('Číslo modulu musí být celé číslo')
  .min(1, 'Číslo modulu musí být mezi 1-4')
  .max(4, 'Číslo modulu musí být mezi 1-4')

// Answer index validation
export const answerIndexSchema = z
  .number()
  .int('Index odpovědi musí být celé číslo')
  .min(0, 'Index odpovědi musí být nezáporný')
  .max(10, 'Neplatný index odpovědi')

// URL validation
export const urlSchema = z.string().url('Neplatná URL adresa')

// Score validation
export const scoreSchema = z
  .number()
  .int('Skóre musí být celé číslo')
  .min(0, 'Skóre musí být nezáporné')

// Time elapsed validation (in seconds)
export const timeElapsedSchema = z
  .number()
  .int('Čas musí být celé číslo')
  .min(0, 'Čas musí být nezáporný')
  .max(7200, 'Čas nemůže překročit 2 hodiny')

// ========================================
// API ROUTE REQUEST SCHEMAS
// ========================================

/**
 * POST /api/progress/complete-chapter
 */
export const completeChapterSchema = z.object({
  chapterId: chapterIdSchema,
})

/**
 * POST /api/questions/answer
 */
export const answerQuestionSchema = z.object({
  chapterId: chapterIdSchema,
  questionId: questionIdSchema,
  answerIndex: answerIndexSchema,
})

/**
 * POST /api/tests/submit
 */
export const submitTestSchema = z.object({
  moduleNumber: moduleNumberSchema,
  score: scoreSchema,
  totalQuestions: z.number().int().min(1).max(100),
  timeElapsed: timeElapsedSchema,
  answers: z
    .array(
      z.object({
        questionId: z.string(),
        answer: z.number().int().min(0),
        correct: z.boolean(),
      })
    )
    .optional(),
})

/**
 * POST /api/projects/submit
 */
export const submitProjectSchema = z.object({
  chapterId: chapterIdSchema,
  projectUrl: urlSchema,
  description: z.string().max(1000, 'Popis může mít maximálně 1000 znaků').optional(),
})

/**
 * POST /api/onboarding/complete
 */
export const completeOnboardingSchema = z.object({
  goal: z.enum(['career', 'skills', 'ai', 'fun']).optional(),
  experience: z.enum(['beginner', 'some', 'intermediate', 'advanced']).optional(),
})

/**
 * GET /api/chapters/progress (query params)
 */
export const chapterProgressQuerySchema = z.object({
  chapterId: chapterIdSchema,
})

// ========================================
// TYPE EXPORTS FOR API ROUTES
// ========================================

export type CompleteChapterData = z.infer<typeof completeChapterSchema>
export type AnswerQuestionData = z.infer<typeof answerQuestionSchema>
export type SubmitTestData = z.infer<typeof submitTestSchema>
export type SubmitProjectData = z.infer<typeof submitProjectSchema>
export type CompleteOnboardingData = z.infer<typeof completeOnboardingSchema>
export type ChapterProgressQuery = z.infer<typeof chapterProgressQuerySchema>

// ========================================
// API VALIDATION HELPER
// ========================================

/**
 * Validates API request body and returns formatted response on error
 * Usage in API routes:
 *
 * const validation = await validateAPIRequest(request, mySchema)
 * if (!validation.success) return validation.response
 * const data = validation.data
 */
export async function validateAPIRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<
  | { success: true; data: T; response?: never }
  | { success: false; data?: never; response: Response }
> {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)

    if (result.success) {
      return { success: true, data: result.data }
    } else {
      const errors = formatZodErrors(result.error)
      return {
        success: false,
        response: new Response(
          JSON.stringify({
            error: 'Validation failed',
            details: errors,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        ),
      }
    }
  } catch (error) {
    return {
      success: false,
      response: new Response(
        JSON.stringify({
          error: 'Invalid JSON in request body',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      ),
    }
  }
}

/**
 * Validates query parameters
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): {
  success: boolean
  data?: T
  errors?: Record<string, string>
} {
  const params = Object.fromEntries(searchParams.entries())
  const result = schema.safeParse(params)

  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: formatZodErrors(result.error) }
  }
}

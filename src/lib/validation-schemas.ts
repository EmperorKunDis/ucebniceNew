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
    errorMap: () => ({ message: 'Vyberte prosím svůj cíl' }),
  }),
})

// Onboarding step 4 - Experience
export const onboardingExperienceSchema = z.object({
  experience: z.enum(['beginner', 'some', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: 'Vyberte prosím svou zkušenost' }),
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
  error.errors.forEach(err => {
    if (err.path.length > 0) {
      errors[err.path[0].toString()] = err.message
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

// ========================================
// ARENA VALIDATION SCHEMAS
// ========================================

// Prize schema for hackathon
export const prizeSchema = z.object({
  place: z.number().int().min(1),
  title: z.string().min(1, 'Název ceny je povinný'),
  description: z.string().default(''),
  value: z.string().default(''),
})

// Judge schema for hackathon
export const judgeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Jméno porotce je povinné'),
  title: z.string().min(1, 'Titul porotce je povinný'),
  company: z.string().min(1, 'Společnost je povinná'),
  bio: z.string().min(1, 'Bio je povinné'),
  avatar: z.string().url().optional().nullable(),
})

/**
 * POST /api/admin/hackathons - Create hackathon
 */
export const createHackathonSchema = z.object({
  title: z.string().min(3, 'Název musí mít alespoň 3 znaky').max(200, 'Název je příliš dlouhý'),
  description: z.string().min(10, 'Popis musí mít alespoň 10 znaků'),
  theme: z.string().min(3, 'Téma musí mít alespoň 3 znaky'),
  startDate: z.string().datetime({ message: 'Neplatné datum začátku' }),
  endDate: z.string().datetime({ message: 'Neplatné datum konce' }),
  registrationDeadline: z.string().datetime({ message: 'Neplatný deadline registrace' }),
  maxTeamSize: z.number().int().min(1).max(10).default(4),
  status: z.enum(['upcoming', 'active', 'completed']).default('upcoming'),
  prizes: z.array(prizeSchema).default([]),
  judges: z.array(judgeSchema).default([]),
  sponsors: z.array(z.string()).default([]),
  bannerImage: z.string().url().optional().nullable(),
})

/**
 * PUT /api/admin/hackathons/[id] - Update hackathon
 */
export const updateHackathonSchema = createHackathonSchema.partial()

/**
 * POST /api/teams - Create team
 */
export const createTeamSchema = z.object({
  name: z
    .string()
    .min(2, 'Název týmu musí mít alespoň 2 znaky')
    .max(50, 'Název týmu je příliš dlouhý'),
  hackathonId: z.string().uuid('Neplatné ID hackathonu'),
})

/**
 * PUT /api/teams/[id] - Update team
 */
export const updateTeamSchema = z.object({
  name: z.string().min(2).max(50).optional(),
})

/**
 * POST /api/teams/[id]/join - Join team
 */
export const joinTeamSchema = z.object({
  skills: z.array(z.string()).default([]),
})

/**
 * POST /api/teams/[id]/project - Submit project
 */
export const submitHackathonProjectSchema = z.object({
  title: z.string().min(3, 'Název projektu musí mít alespoň 3 znaky').max(200),
  description: z.string().min(10, 'Popis projektu musí mít alespoň 10 znaků'),
  githubUrl: z.string().url('Neplatná GitHub URL'),
  demoUrl: z.string().url('Neplatná demo URL').optional().nullable(),
  videoUrl: z.string().url('Neplatná video URL').optional().nullable(),
  screenshots: z.array(z.string().url()).default([]),
  technologies: z.array(z.string()).default([]),
})

/**
 * PUT /api/user/graduate-profile - Update graduate profile
 */
export const updateGraduateProfileSchema = z.object({
  bio: z.string().max(1000, 'Bio může mít maximálně 1000 znaků').optional().nullable(),
  skills: z.array(z.string()).default([]),
  portfolio: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z.string().min(1),
        description: z.string(),
        url: z.string().url(),
        type: z.enum(['project', 'article', 'presentation', 'certificate']),
        technologies: z.array(z.string()).default([]),
      })
    )
    .default([]),
  linkedIn: z.string().url().optional().nullable(),
  github: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),
  lookingForWork: z.boolean().default(false),
  preferredRoles: z.array(z.string()).default([]),
})

// Type exports for Arena schemas
export type CreateHackathonData = z.infer<typeof createHackathonSchema>
export type UpdateHackathonData = z.infer<typeof updateHackathonSchema>
export type CreateTeamData = z.infer<typeof createTeamSchema>
export type UpdateTeamData = z.infer<typeof updateTeamSchema>
export type JoinTeamData = z.infer<typeof joinTeamSchema>
export type SubmitHackathonProjectData = z.infer<typeof submitHackathonProjectSchema>
export type UpdateGraduateProfileData = z.infer<typeof updateGraduateProfileSchema>

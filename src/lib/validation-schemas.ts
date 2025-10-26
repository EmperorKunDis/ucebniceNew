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

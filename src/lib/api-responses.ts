import { NextResponse } from 'next/server'

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INTERNAL_SERVER_ERROR'
  | 'VALIDATION_FAILED'

type ErrorDetails = Record<string, string> | string[]

export function apiError(
  message: string,
  status: number,
  code: ApiErrorCode,
  details?: ErrorDetails
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      code,
      ...(details ? { details } : {}),
    },
    { status }
  )
}

export function badRequest(message = 'Bad request', details?: ErrorDetails): NextResponse {
  return apiError(message, 400, 'BAD_REQUEST', details)
}

export function unauthorized(message = 'Unauthorized'): NextResponse {
  return apiError(message, 401, 'UNAUTHORIZED')
}

export function forbidden(message = 'Forbidden'): NextResponse {
  return apiError(message, 403, 'FORBIDDEN')
}

export function notFound(message = 'Not found'): NextResponse {
  return apiError(message, 404, 'NOT_FOUND')
}

export function serverError(message = 'Internal server error'): NextResponse {
  return apiError(message, 500, 'INTERNAL_SERVER_ERROR')
}

export function validationError(details: ErrorDetails): NextResponse {
  return apiError('Validation failed', 400, 'VALIDATION_FAILED', details)
}

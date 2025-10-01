// API Error Handling Utilities
// Centralized error handling for all API routes

import { NextResponse } from 'next/server'

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export interface ErrorResponse {
  error: string
  code?: string
  details?: any
  timestamp: string
  path?: string
}

export function handleAPIError(error: unknown, path?: string): NextResponse<ErrorResponse> {
  // Log the error for monitoring
  console.error('[API Error]', {
    error,
    path,
    timestamp: new Date().toISOString(),
    stack: error instanceof Error ? error.stack : undefined
  })

  // Handle known APIError instances
  if (error instanceof APIError) {
    return NextResponse.json<ErrorResponse>(
      {
        error: error.message,
        code: error.code,
        details: error.details,
        timestamp: new Date().toISOString(),
        path
      },
      { status: error.statusCode }
    )
  }

  // Handle Supabase errors
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as any
    return NextResponse.json<ErrorResponse>(
      {
        error: supabaseError.message || 'Database error',
        code: supabaseError.code,
        details: supabaseError.details,
        timestamp: new Date().toISOString(),
        path
      },
      { status: 500 }
    )
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return NextResponse.json<ErrorResponse>(
      {
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString(),
        path
      },
      { status: 500 }
    )
  }

  // Handle unknown errors
  return NextResponse.json<ErrorResponse>(
    {
      error: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      path
    },
    { status: 500 }
  )
}

export function validateRequired(data: any, fields: string[]): void {
  const missing = fields.filter(field => !data[field] && data[field] !== 0)
  if (missing.length > 0) {
    throw new APIError(
      `Missing required fields: ${missing.join(', ')}`,
      400,
      'VALIDATION_ERROR',
      { missing }
    )
  }
}

export function validateAuth(session: any): void {
  if (!session) {
    throw new APIError('Unauthorized - Please sign in', 401, 'UNAUTHORIZED')
  }
}

export function validateProfile(profile: any): void {
  if (!profile) {
    throw new APIError('User profile not found', 404, 'PROFILE_NOT_FOUND')
  }
}

export function validateCredits(available: number, required: number): void {
  if (available < required) {
    throw new APIError(
      `Insufficient credits. Required: ${required}, Available: ${available}`,
      402,
      'INSUFFICIENT_CREDITS',
      { required, available }
    )
  }
}

export function validateTier(
  userTier: string,
  requiredTier: 'free' | 'pro' | 'elite'
): void {
  const tierHierarchy = { free: 0, pro: 1, elite: 2 }
  const userLevel = tierHierarchy[userTier as keyof typeof tierHierarchy] || 0
  const requiredLevel = tierHierarchy[requiredTier]

  if (userLevel < requiredLevel) {
    throw new APIError(
      `This feature requires ${requiredTier.toUpperCase()} tier or higher`,
      403,
      'TIER_REQUIRED',
      { userTier, requiredTier }
    )
  }
}

export function validateEnum(value: any, validValues: string[], fieldName: string): void {
  if (!validValues.includes(value)) {
    throw new APIError(
      `Invalid ${fieldName}. Must be one of: ${validValues.join(', ')}`,
      400,
      'INVALID_ENUM_VALUE',
      { field: fieldName, value, validValues }
    )
  }
}

// Rate limiting helper (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): void {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs })
    return
  }

  if (record.count >= maxRequests) {
    throw new APIError(
      'Too many requests. Please try again later.',
      429,
      'RATE_LIMIT_EXCEEDED',
      { resetAt: new Date(record.resetAt).toISOString() }
    )
  }

  record.count++
}

// Clean up rate limit map periodically (call this in a background job)
export function cleanupRateLimits(): void {
  const now = Date.now()
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(key)
    }
  }
}

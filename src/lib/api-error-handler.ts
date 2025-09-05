import { NextResponse } from 'next/server'
import { z } from 'zod'

// Standard error response types
export interface APIError {
  error: string
  message?: string
  details?: any
  code?: string
  timestamp?: string
}

export interface APIErrorResponse {
  error: string
  message?: string
  details?: any
  code?: string
  timestamp: string
  requestId?: string
}

// Standard error codes
export const ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Validation
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  
  // Resource Management
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_EXISTS: 'RESOURCE_EXISTS',
  RESOURCE_LIMIT_EXCEEDED: 'RESOURCE_LIMIT_EXCEEDED',
  
  // Payment & Credits
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  
  // Database
  DATABASE_ERROR: 'DATABASE_ERROR',
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  QUERY_FAILED: 'QUERY_FAILED',
  
  // External Services
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  API_TIMEOUT: 'API_TIMEOUT',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // General
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE'
} as const

// HTTP status code mappings
const STATUS_CODE_MAP = {
  [ERROR_CODES.UNAUTHORIZED]: 401,
  [ERROR_CODES.FORBIDDEN]: 403,
  [ERROR_CODES.TOKEN_EXPIRED]: 401,
  [ERROR_CODES.INVALID_INPUT]: 400,
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 400,
  [ERROR_CODES.VALIDATION_FAILED]: 400,
  [ERROR_CODES.NOT_FOUND]: 404,
  [ERROR_CODES.RESOURCE_EXISTS]: 409,
  [ERROR_CODES.RESOURCE_LIMIT_EXCEEDED]: 403,
  [ERROR_CODES.INSUFFICIENT_CREDITS]: 402,
  [ERROR_CODES.PAYMENT_REQUIRED]: 402,
  [ERROR_CODES.PAYMENT_FAILED]: 402,
  [ERROR_CODES.DATABASE_ERROR]: 500,
  [ERROR_CODES.CONNECTION_FAILED]: 500,
  [ERROR_CODES.QUERY_FAILED]: 500,
  [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 503,
  [ERROR_CODES.API_TIMEOUT]: 504,
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 503,
  [ERROR_CODES.INTERNAL_ERROR]: 500,
  [ERROR_CODES.RATE_LIMITED]: 429,
  [ERROR_CODES.MAINTENANCE_MODE]: 503
}

// Generate request ID for tracking
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Create standardized error response
export function createErrorResponse(
  error: string,
  code?: keyof typeof ERROR_CODES,
  message?: string,
  details?: any,
  statusOverride?: number
): NextResponse<APIErrorResponse> {
  const errorCode = code ? ERROR_CODES[code] : ERROR_CODES.INTERNAL_ERROR
  const status = statusOverride || STATUS_CODE_MAP[errorCode] || 500
  
  const response: APIErrorResponse = {
    error,
    code: errorCode,
    message,
    details,
    timestamp: new Date().toISOString(),
    requestId: generateRequestId()
  }

  // Remove undefined fields
  Object.keys(response).forEach(key => {
    if (response[key as keyof APIErrorResponse] === undefined) {
      delete response[key as keyof APIErrorResponse]
    }
  })

  return NextResponse.json(response, { status })
}

// Handle different error types
export function handleAPIError(error: unknown, context?: string): NextResponse {
  console.error(`API Error${context ? ` in ${context}` : ''}:`, error)

  // Zod validation errors
  if (error instanceof z.ZodError) {
    return createErrorResponse(
      'Validation failed',
      'VALIDATION_FAILED',
      'The provided data is invalid',
      error.errors
    )
  }

  // Database errors (Supabase/PostgreSQL)
  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = error as { code: string; message: string; details?: any }
    
    // Map common PostgreSQL error codes
    switch (dbError.code) {
      case '23505': // unique_violation
        return createErrorResponse(
          'Resource already exists',
          'RESOURCE_EXISTS',
          'A resource with these details already exists'
        )
      case '23503': // foreign_key_violation
        return createErrorResponse(
          'Invalid reference',
          'VALIDATION_FAILED',
          'Referenced resource does not exist'
        )
      case '23514': // check_violation
        return createErrorResponse(
          'Invalid data',
          'VALIDATION_FAILED',
          'Data violates constraints'
        )
      default:
        return createErrorResponse(
          'Database error',
          'DATABASE_ERROR',
          'A database error occurred',
          process.env.NODE_ENV === 'development' ? dbError : undefined
        )
    }
  }

  // Standard Error objects
  if (error instanceof Error) {
    // OpenAI/External API errors
    if (error.message.includes('OpenAI') || error.message.includes('API')) {
      return createErrorResponse(
        'External service error',
        'EXTERNAL_SERVICE_ERROR',
        'External service is temporarily unavailable'
      )
    }

    // Timeout errors
    if (error.message.includes('timeout')) {
      return createErrorResponse(
        'Request timeout',
        'API_TIMEOUT',
        'The request took too long to complete'
      )
    }

    // Generic error
    return createErrorResponse(
      'Internal server error',
      'INTERNAL_ERROR',
      process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    )
  }

  // Unknown error type
  return createErrorResponse(
    'Internal server error',
    'INTERNAL_ERROR',
    'An unexpected error occurred'
  )
}

// Authentication helper
export function handleAuthError(authError?: any, user?: any): NextResponse | null {
  if (authError || !user) {
    return createErrorResponse(
      'Authentication required',
      'UNAUTHORIZED',
      'Please log in to access this resource'
    )
  }
  return null
}

// Credit validation helper
export function validateCredits(
  balance: number, 
  required: number, 
  featureName?: string
): NextResponse | null {
  if (balance < required) {
    return createErrorResponse(
      'Insufficient credits',
      'INSUFFICIENT_CREDITS',
      `You need ${required} credits to use ${featureName || 'this feature'}. Your current balance is ${balance}.`,
      {
        required,
        balance,
        shortfall: required - balance
      }
    )
  }
  return null
}

// Resource limit helper
export function validateResourceLimit(
  current: number,
  limit: number,
  resourceType: string,
  tier?: string
): NextResponse | null {
  if (current >= limit) {
    return createErrorResponse(
      `${resourceType} limit reached`,
      'RESOURCE_LIMIT_EXCEEDED',
      `Your ${tier || 'current'} plan allows up to ${limit} ${resourceType.toLowerCase()}. You currently have ${current}.`,
      {
        current,
        limit,
        resourceType,
        tier,
        upgradeRequired: true
      }
    )
  }
  return null
}

// Success response helper
export function createSuccessResponse<T>(
  data: T, 
  message?: string, 
  status: number = 200
): NextResponse<{ success: true; data: T; message?: string; timestamp: string }> {
  const response = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  }

  // Remove undefined fields
  if (!message) delete response.message

  return NextResponse.json(response, { status })
}

// Pagination response helper
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  },
  message?: string
): NextResponse<{
  success: true
  data: T[]
  pagination: typeof pagination
  message?: string
  timestamp: string
}> {
  const response = {
    success: true,
    data,
    pagination,
    message,
    timestamp: new Date().toISOString()
  }

  if (!message) delete response.message

  return NextResponse.json(response)
}
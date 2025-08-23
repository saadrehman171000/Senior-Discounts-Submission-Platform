/**
 * Error handling utilities for the Senior Discounts API
 */

/**
 * Base API error class
 */
export class APIError extends Error {
  public statusCode: number
  public code: string
  public details?: any

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message)
    this.name = 'APIError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

/**
 * Specific error types
 */
export class ValidationError extends APIError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends APIError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT_ERROR', details)
    this.name = 'ConflictError'
  }
}

export class DuplicateError extends APIError {
  constructor(message: string = 'Duplicate submission detected', details?: any) {
    super(message, 409, 'DUPLICATE_ERROR', details)
    this.name = 'DuplicateError'
  }
}

export class RateLimitError extends APIError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR')
    this.name = 'RateLimitError'
  }
}

export class RecaptchaError extends APIError {
  constructor(message: string = 'reCAPTCHA verification failed') {
    super(message, 400, 'RECAPTCHA_ERROR')
    this.name = 'RecaptchaError'
  }
}

export class DatabaseError extends APIError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR')
    this.name = 'DatabaseError'
  }
}

/**
 * Error response format
 */
export interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: any
    path?: string
    timestamp: string
  }
}

/**
 * Sanitize error details to prevent information leakage
 */
function sanitizeErrorDetails(details: any): any {
  if (!details) return undefined
  
  // If details is an object, sanitize it
  if (typeof details === 'object') {
    const sanitized: any = {}
    
    // Only include safe fields
    const safeFields = ['field', 'suggestion', 'message']
    
    for (const [key, value] of Object.entries(details)) {
      if (safeFields.includes(key) && typeof value === 'string') {
        // Limit string length and remove potentially dangerous content
        sanitized[key] = String(value)
          .replace(/[<>]/g, '') // Remove < and >
          .slice(0, 200) // Limit length
      }
    }
    
    return sanitized
  }
  
  // If details is a string, sanitize it
  if (typeof details === 'string') {
    return details
      .replace(/[<>]/g, '')
      .slice(0, 200)
  }
  
  return undefined
}

/**
 * Create a safe error response
 */
function createErrorResponse(error: APIError, path?: string): Response {
  const safeDetails = sanitizeErrorDetails(error.details)
  
  const errorResponse: ErrorResponse = {
    error: {
      code: error.code,
      message: error.message,
      details: safeDetails,
      path,
      timestamp: new Date().toISOString()
    }
  }

  return Response.json(errorResponse, { 
    status: error.statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
}

/**
 * Centralized error handler that returns safe JSON errors only
 */
export function handleError(error: unknown, path?: string): Response {
  console.error('API Error:', error)

  // Handle known API errors
  if (error instanceof APIError) {
    return createErrorResponse(error, path)
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any
    
    switch (prismaError.code) {
      case 'P2002':
        if (prismaError.meta?.target?.includes('businessNorm')) {
          return createErrorResponse(
            new DuplicateError('A similar discount from this business has already been submitted today', {
              field: prismaError.meta?.target,
              suggestion: 'Please wait until tomorrow to submit another discount'
            }),
            path
          )
        }
        return createErrorResponse(
          new ConflictError('Duplicate entry found', { field: prismaError.meta?.target }),
          path
        )
      
      case 'P2025':
        return createErrorResponse(
          new NotFoundError('Record not found'),
          path
        )
      
      case 'P2003':
        return createErrorResponse(
          new ValidationError('Invalid reference', { field: prismaError.meta?.field_name }),
          path
        )
      
      default:
        return createErrorResponse(
          new DatabaseError('Database operation failed'),
          path
        )
    }
  }

  // Handle validation errors
  if (error && typeof error === 'object' && 'issues' in error) {
    const validationError = error as any
    const firstIssue = validationError.issues?.[0]
    
    if (firstIssue) {
      return createErrorResponse(
        new ValidationError(
          firstIssue.message || 'Validation failed',
          { field: firstIssue.path?.join('.') }
        ),
        path
      )
    }
  }

  // Handle authentication/authorization errors
  if (error instanceof Error) {
    if (error.message.includes('Unauthorized')) {
      return createErrorResponse(
        new AuthenticationError('Authentication required'),
        path
      )
    }
    
    if (error.message.includes('Forbidden') || error.message.includes('Admin access required')) {
      return createErrorResponse(
        new AuthorizationError('Insufficient permissions'),
        path
      )
    }
  }

  // Default error - don't expose internal details
  return createErrorResponse(
    new APIError('An unexpected error occurred', 500, 'INTERNAL_ERROR'),
    path
  )
}

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  VALIDATION: {
    INVALID_JSON: 'Invalid JSON payload',
    PAYLOAD_TOO_LARGE: 'Payload size exceeds maximum allowed',
    INVALID_CONTENT_TYPE: 'Content-Type must be application/json',
    REQUIRED_FIELD: 'This field is required',
    INVALID_FORMAT: 'Invalid format',
  },
  AUTHENTICATION: {
    REQUIRED: 'Authentication required',
    INVALID_TOKEN: 'Invalid or expired token',
    SESSION_EXPIRED: 'Session expired',
  },
  AUTHORIZATION: {
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
    ADMIN_REQUIRED: 'Admin access required',
    UNAUTHORIZED_ACTION: 'Unauthorized action',
  },
  DUPLICATE: {
    SAME_DAY: 'A similar discount from this business has already been submitted today',
    BUSINESS_EXISTS: 'This business already has an active discount in this category',
    WAIT_UNTIL_TOMORROW: 'Please wait until tomorrow to submit another discount',
  },
  RECAPTCHA: {
    VERIFICATION_FAILED: 'reCAPTCHA verification failed',
    INVALID_TOKEN: 'Invalid reCAPTCHA token',
    SCORE_TOO_LOW: 'reCAPTCHA score too low',
  },
  RATE_LIMIT: {
    EXCEEDED: 'Rate limit exceeded',
    TOO_MANY_REQUESTS: 'Too many requests',
    TRY_AGAIN_LATER: 'Please try again later',
  },
} as const

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

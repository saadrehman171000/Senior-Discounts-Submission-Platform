import { z } from 'zod'

/**
 * Security utilities for the Senior Discounts app
 */

/**
 * Maximum payload size in bytes
 */
export const MAX_PAYLOAD_BYTES = parseInt(process.env.MAX_PAYLOAD_BYTES || '32768')

/**
 * Strict URL validation schema
 */
export const StrictUrlSchema = z.string()
  .url('Must be a valid URL')
  .refine(
    (url) => url.startsWith('http://') || url.startsWith('https://'),
    'URL must start with http:// or https://'
  )
  .refine(
    (url) => {
      try {
        const parsed = new URL(url)
        // Block potentially dangerous protocols
        return !['file:', 'data:', 'javascript:', 'vbscript:'].includes(parsed.protocol)
      } catch {
        return false
      }
    },
    'Invalid URL format'
  )
  .refine(
    (url) => {
      try {
        const parsed = new URL(url)
        // Block localhost and private IP ranges in production
        if (process.env.NODE_ENV === 'production') {
          const hostname = parsed.hostname
          if (hostname === 'localhost' || 
              hostname === '127.0.0.1' || 
              hostname.startsWith('192.168.') ||
              hostname.startsWith('10.') ||
              hostname.startsWith('172.')) {
            return false
          }
        }
        return true
      } catch {
        return false
      }
    },
    'Local/private URLs not allowed in production'
  )

/**
 * Sanitize text input to prevent XSS and injection attacks
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Limit length
    .slice(0, 1000)
}

/**
 * Sanitize HTML content (if needed for future use)
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Validate and sanitize ZIP code
 */
export function validateZipCode(zip: string): string | null {
  const cleanZip = sanitizeText(zip)
  if (!/^\d{5}$/.test(cleanZip)) {
    return null
  }
  return cleanZip
}

/**
 * Validate and sanitize phone number
 */
export function validatePhoneNumber(phone: string): string | null {
  if (!phone) return null
  
  const cleanPhone = sanitizeText(phone)
  // Basic phone validation - allows various formats
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  
  // Remove all non-digit characters except +
  const digitsOnly = cleanPhone.replace(/[^\d+]/g, '')
  
  if (!phoneRegex.test(digitsOnly)) {
    return null
  }
  
  return digitsOnly
}

/**
 * Validate payload size
 */
export function validatePayloadSize(payload: any): { valid: boolean; size: number; maxSize: number } {
  const payloadString = JSON.stringify(payload)
  const size = new TextEncoder().encode(payloadString).length
  
  return {
    valid: size < MAX_PAYLOAD_BYTES,
    size,
    maxSize: MAX_PAYLOAD_BYTES
  }
}

/**
 * Validate content type is JSON
 */
export function validateContentType(contentType: string | null): boolean {
  if (!contentType) return false
  
  // Check for JSON content type
  return contentType.includes('application/json')
}

/**
 * Sanitize discount data before persistence
 */
export function sanitizeDiscountData(data: any): any {
  if (!data || typeof data !== 'object') return data
  
  const sanitized: any = {}
  
  // Sanitize string fields
  if (data.business) sanitized.business = sanitizeText(data.business)
  if (data.category) sanitized.category = sanitizeText(data.category)
  if (data.amount) sanitized.amount = sanitizeText(data.amount)
  if (data.days) sanitized.days = sanitizeText(data.days)
  if (data.code) sanitized.code = sanitizeText(data.code)
  if (data.location) sanitized.location = sanitizeText(data.location)
  if (data.phone) sanitized.phone = validatePhoneNumber(data.phone)
  if (data.notes) sanitized.notes = sanitizeText(data.notes)
  
  // Validate and sanitize URLs
  if (data.proof) {
    try {
      sanitized.proof = StrictUrlSchema.parse(data.proof)
    } catch {
      sanitized.proof = null
    }
  }
  
  if (data.website) {
    try {
      sanitized.website = StrictUrlSchema.parse(data.website)
    } catch {
      sanitized.website = null
    }
  }
  
  // Validate ZIP code
  if (data.zip) {
    sanitized.zip = validateZipCode(data.zip)
  }
  
  // Validate dates
  if (data.start) {
    const startDate = new Date(data.start)
    if (!isNaN(startDate.getTime())) {
      sanitized.start = data.start
    }
  }
  
  if (data.end) {
    const endDate = new Date(data.end)
    if (!isNaN(endDate.getTime())) {
      sanitized.end = data.end
    }
  }
  
  // Validate enums
  if (data.minAge && ['50', '55', '60', '62', '65'].includes(data.minAge)) {
    sanitized.minAge = data.minAge
  }
  
  if (data.scope && ['Nationwide', 'Specific locations', 'Online only'].includes(data.scope)) {
    sanitized.scope = data.scope
  }
  
  // Boolean fields
  if (typeof data.ownerConfirm === 'boolean') sanitized.ownerConfirm = data.ownerConfirm
  if (typeof data.tos === 'boolean') sanitized.tos = data.tos
  
  // Hidden fields (should be empty)
  if (data.hp) sanitized.hp = ''
  if (data.recaptchaToken) sanitized.recaptchaToken = data.recaptchaToken
  
  return sanitized
}

/**
 * Security configuration constants
 */
export const SECURITY_CONFIG = {
  MAX_PAYLOAD_BYTES,
  MAX_TEXT_LENGTH: 1000,
  ALLOWED_PROTOCOLS: ['http:', 'https:'],
  BLOCKED_PROTOCOLS: ['file:', 'data:', 'javascript:', 'vbscript:'],
  ZIP_REGEX: /^\d{5}$/,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
} as const

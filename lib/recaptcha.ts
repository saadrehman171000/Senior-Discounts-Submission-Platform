/**
 * reCAPTCHA v3 verification utility
 * https://developers.google.com/recaptcha/docs/v3
 */

interface RecaptchaVerificationResponse {
  success: boolean
  score: number
  action: string
  challenge_ts: string
  hostname: string
  'error-codes'?: string[]
}

/**
 * Verify reCAPTCHA v3 token
 * @param token - The reCAPTCHA token from the client
 * @param action - The action being performed (e.g., 'submit_discount')
 * @param minScore - Minimum score threshold (0.0 to 1.0, default 0.4 as per Chunk 3)
 * @returns Promise<boolean> - Whether verification passed
 */
export async function verifyRecaptcha(
  token: string,
  action: string = 'submit_discount',
  minScore: number = 0.4
): Promise<boolean> {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY
    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY not configured')
      return false
    }

    // Verify token with Google
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    })

    if (!response.ok) {
      console.error('reCAPTCHA verification request failed:', response.statusText)
      return false
    }

    const data: RecaptchaVerificationResponse = await response.json()

    // Check if verification was successful
    if (!data.success) {
      console.error('reCAPTCHA verification failed:', data['error-codes'])
      return false
    }

    // Verify the action matches
    if (data.action !== action) {
      console.error(`reCAPTCHA action mismatch: expected ${action}, got ${data.action}`)
      return false
    }

    // Check if score meets minimum threshold (0.4 as per Chunk 3)
    if (data.score < minScore) {
      console.error(`reCAPTCHA score too low: ${data.score} (minimum: ${minScore})`)
      return false
    }

    // Log successful verification for monitoring
    console.log(`reCAPTCHA verification passed: action=${data.action}, score=${data.score}, hostname=${data.hostname}`)
    
    return true
  } catch (error) {
    console.error('reCAPTCHA verification error:', error)
    return false
  }
}

/**
 * Get reCAPTCHA site key for client-side
 */
export function getRecaptchaSiteKey(): string {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  if (!siteKey) {
    throw new Error('NEXT_PUBLIC_RECAPTCHA_SITE_KEY not configured')
  }
  return siteKey
}

/**
 * Validate reCAPTCHA token format
 */
export function isValidRecaptchaToken(token: string): boolean {
  return typeof token === 'string' && token.length > 0
}

/**
 * reCAPTCHA configuration constants
 */
export const RECAPTCHA_CONFIG = {
  MIN_SCORE: 0.4, // As specified in Chunk 3
  ACTIONS: {
    SUBMIT_DISCOUNT: 'submit_discount',
    ADMIN_ACTION: 'admin_action',
  },
  TIMEOUT_MS: 10000, // 10 seconds
} as const

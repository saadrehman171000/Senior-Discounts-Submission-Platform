import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

/**
 * Simple custom authentication system
 * Only allows saadrehman17100@gmail.com to access admin routes
 */

const ADMIN_EMAIL = "saadrehman17100@gmail.com"

/**
 * Check if user is authenticated as admin (for Server Components)
 */
export function isAdmin(): boolean {
  try {
    const cookieStore = cookies()
    const authToken = cookieStore.get('admin_auth')?.value
    
    if (!authToken) return false
    
    // Simple token validation (in production, use proper JWT)
    const decoded = Buffer.from(authToken, 'base64').toString('utf-8')
    const { email, timestamp } = JSON.parse(decoded)
    
    // Check if token is expired (24 hours)
    const tokenAge = Date.now() - timestamp
    if (tokenAge > 24 * 60 * 60 * 1000) return false
    
    return email === ADMIN_EMAIL
  } catch (error) {
    console.error('Error checking admin access:', error)
    return false
  }
}

/**
 * Check if user is authenticated as admin (for API routes)
 */
export function isAdminFromRequest(request: NextRequest): boolean {
  try {
    const authToken = request.cookies.get('admin_auth')?.value
    
    if (!authToken) return false
    
    // Simple token validation (in production, use proper JWT)
    const decoded = Buffer.from(authToken, 'base64').toString('utf-8')
    const { email, timestamp } = JSON.parse(decoded)
    
    // Check if token is expired (24 hours)
    const tokenAge = Date.now() - timestamp
    if (tokenAge > 24 * 60 * 60 * 1000) return false
    
    return email === ADMIN_EMAIL
  } catch (error) {
    console.error('Error checking admin access:', error)
    return false
  }
}

/**
 * Require admin access - throws error if not admin (for Server Components)
 */
export function requireAdmin(): void {
  if (!isAdmin()) {
    throw new Error("Admin access required")
  }
}

/**
 * Require admin access - throws error if not admin (for API routes)
 */
export function requireAdminFromRequest(request: NextRequest): void {
  if (!isAdminFromRequest(request)) {
    throw new Error("Admin access required")
  }
}

/**
 * Create admin authentication token
 */
export function createAdminToken(email: string): string {
  const tokenData = {
    email,
    timestamp: Date.now()
  }
  return Buffer.from(JSON.stringify(tokenData)).toString('base64')
}

/**
 * Verify admin login credentials
 */
export function verifyAdminLogin(email: string, password: string): boolean {
  // Simple check - in production, use proper password hashing
  return email === ADMIN_EMAIL && password === "admin123"
}

/**
 * Get current authenticated user info
 */
export function getCurrentUser() {
  if (isAdmin()) {
    return {
      email: ADMIN_EMAIL,
      isAdmin: true
    }
  }
  return null
}

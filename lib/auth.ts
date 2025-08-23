import { auth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'

/**
 * Clerk authentication and authorization utilities
 */

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  try {
    const { userId } = await auth()
    if (!userId) return null
    
    return { userId }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { userId } = await auth()
    return !!userId
  } catch (error) {
    console.error('Error checking authentication:', error)
    return false
  }
}

/**
 * Require admin role - throws error if not admin
 * Only allow admin routes if user has role=admin (or publicMetadata.isAdmin = true)
 */
export function requireAdmin() {
  const { userId, sessionClaims } = auth()
  if (!userId) throw new Error("Unauthorized")
  if (!sessionClaims?.metadata?.isAdmin) throw new Error("Forbidden")
  return userId
}

/**
 * Check if user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { userId, sessionClaims } = await auth()
    if (!userId) return false
    
    return !!sessionClaims?.metadata?.isAdmin
  } catch (error) {
    console.error('Error checking admin role:', error)
    return false
  }
}

/**
 * Require authentication - throws error if not authenticated
 */
export function requireAuth() {
  const { userId } = auth()
  if (!userId) {
    throw new Error('Authentication required')
  }
  return userId
}

/**
 * Get user's public profile information
 */
export async function getUserProfile() {
  try {
    const { userId, sessionClaims } = await auth()
    if (!userId) return null
    
    return {
      id: userId,
      metadata: sessionClaims?.metadata || {},
      isAdmin: !!sessionClaims?.metadata?.isAdmin,
    }
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

/**
 * Clerk configuration constants
 */
export const CLERK_CONFIG = {
  ADMIN_ROLE: 'admin',
  ADMIN_METADATA_KEY: 'isAdmin',
} as const

/**
 * Middleware helper for protecting routes
 */
export function createProtectedRoute(requireAdminRole: boolean = false) {
  return async function protectedRoute(request: NextRequest) {
    try {
      if (requireAdminRole) {
        await requireAdmin()
      } else {
        await requireAuth()
      }
      return true
    } catch (error) {
      console.error('Route protection failed:', error)
      return false
    }
  }
}

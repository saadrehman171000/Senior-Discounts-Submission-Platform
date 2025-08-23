import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js middleware for the Senior Discounts app
 * Handles authentication and route protection
 */

// Create route matchers for different types of routes
const isPublicRoute = createRouteMatcher([
  '/',
  '/submit',
  '/api/discounts(.*)',
  '/api/auth(.*)',
])

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
])

const isApiRoute = createRouteMatcher([
  '/api(.*)',
])

export default clerkMiddleware((auth, req) => {
  const { userId, sessionClaims } = auth
  const { pathname } = req.nextUrl

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Check if user is authenticated for protected routes
  if (!userId) {
    // Redirect to sign-in for protected pages
    if (!isApiRoute(req)) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Return 401 for API routes
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  // For admin routes, check if user has admin role
  if (isAdminRoute(req)) {
    const isAdmin = sessionClaims?.metadata?.isAdmin === true
    
    if (!isAdmin) {
      // Return 403 for API routes
      if (isApiRoute(req)) {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        )
      }
      
      // Redirect to unauthorized page for admin pages
      const unauthorizedUrl = new URL('/unauthorized', req.url)
      return NextResponse.redirect(unauthorizedUrl)
    }
  }

  // Allow authenticated users to access other protected routes
  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

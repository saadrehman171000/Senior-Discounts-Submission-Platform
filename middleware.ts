import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

/**
 * Next.js middleware for the Senior Discounts app
 * Handles authentication and route protection
 */

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/submit',
  '/api/discounts(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

// Define admin routes that require admin role
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
])

export default clerkMiddleware((auth, req) => {
  const { userId, sessionClaims } = auth
  const { pathname } = req.nextUrl

  // Always allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // For admin routes, require authentication AND admin role
  if (isAdminRoute(req)) {
    // Check if user is authenticated
    if (!userId) {
      // For API routes, return 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      
      // For pages, redirect to sign-in
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Check if user has admin role
    // TEMPORARY: Allow any authenticated user to access admin for testing
    const isAdmin = true // sessionClaims?.metadata?.isAdmin === true
    if (!isAdmin) {
      // For API routes, return 403
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        )
      }
      
      // For pages, show error message (redirect to home with error)
      const homeUrl = new URL('/', req.url)
      homeUrl.searchParams.set('error', 'admin_required')
      return NextResponse.redirect(homeUrl)
    }
  }

  // For other protected routes (if any), just require authentication
  if (!userId) {
    // For API routes, return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // For pages, redirect to sign-in
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Allow authenticated users to access other routes
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

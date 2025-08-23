import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Simple custom middleware for authentication
 */

// Define public routes that don't require authentication
const isPublicRoute = (pathname: string) => {
  // Exact match for root path
  if (pathname === '/') return true
  
  const basicPublicRoutes = [
    '/submit',
    '/login',
    '/api/auth/login',
    '/api/auth/logout',
  ]
  
  const isBasicPublic = basicPublicRoutes.some(route => pathname.startsWith(route))
  const isDiscountsButNotAdmin = pathname.startsWith('/api/discounts') && !pathname.startsWith('/api/admin')
  
  const result = isBasicPublic || isDiscountsButNotAdmin
  
  console.log(`🔍 Route check for ${pathname}:`)
  console.log(`  - Basic public: ${isBasicPublic}`)
  console.log(`  - Discounts but not admin: ${isDiscountsButNotAdmin}`)
  console.log(`  - Final result: ${result}`)
  
  return result
}

// Define admin routes that require authentication
const isAdminRoute = (pathname: string) => {
  const result = pathname.startsWith('/admin') || pathname.startsWith('/api/admin')
  console.log(`🔒 Admin route check for ${pathname}: ${result}`)
  return result
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Debug logging
  console.log(`🔍 Middleware: ${pathname}`)

  // Always allow public routes
  if (isPublicRoute(pathname)) {
    console.log(`✅ Public route: ${pathname}`)
    return NextResponse.next()
  }

  // For admin routes, check authentication
  if (isAdminRoute(pathname)) {
    console.log(`🔒 Admin route: ${pathname}`)
    const authToken = request.cookies.get('admin_auth')?.value
    
    console.log(`🍪 Auth token: ${authToken ? 'Present' : 'Missing'}`)
    
    if (!authToken) {
      console.log(`❌ No auth token, redirecting to login`)
      // Redirect to login page
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      console.log(`🔍 Validating token...`)
      // Validate token
      const decoded = Buffer.from(authToken, 'base64').toString('utf-8')
      const { email, timestamp } = JSON.parse(decoded)
      
      console.log(`📧 Email: ${email}, Timestamp: ${timestamp}`)
      
      // Check if token is expired (24 hours)
      const tokenAge = Date.now() - timestamp
      if (tokenAge > 24 * 60 * 60 * 1000) {
        console.log(`⏰ Token expired, redirecting to login`)
        // Token expired, redirect to login
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Check if email is admin email
      if (email !== 'saadrehman17100@gmail.com') {
        console.log(`❌ Not admin email, redirecting to home`)
        // Not admin, redirect to home
        return NextResponse.redirect(new URL('/', request.url))
      }

      console.log(`✅ Admin access granted for ${pathname}`)
      // User is authenticated and is admin - allow access
      return NextResponse.next()
    } catch (error) {
      console.log(`❌ Token validation error:`, error)
      // Invalid token, redirect to login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Allow access to other routes
  return NextResponse.next()
}

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

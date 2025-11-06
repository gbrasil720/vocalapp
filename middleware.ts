import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isBetaUser } from '@/lib/beta-access'

// Beta mode toggle - set via environment variable
const BETA_MODE = process.env.BETA_MODE === 'true'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/sign-in',
    '/sign-up',
    '/login-beta',
    '/forgot-password'
  ]
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get session
  const session = await auth.api.getSession({
    headers: request.headers
  })

  // Landing page is always accessible
  if (pathname === '/') {
    const response = NextResponse.next()
    response.headers.set('x-middleware-cache', 'no-cache')
    return response
  }

  // Sign-in and forgot-password pages
  if (pathname === '/sign-in' || pathname === '/forgot-password') {
    const response = NextResponse.next()
    response.headers.set('x-middleware-cache', 'no-cache')
    return response
  }

  // Beta login page - only accessible in beta mode
  if (pathname === '/login-beta') {
    if (!BETA_MODE) {
      // Redirect to normal sign-in if not in beta mode
      const response = NextResponse.redirect(new URL('/sign-in', request.url))
      response.headers.set('x-middleware-cache', 'no-cache')
      return response
    }
    const response = NextResponse.next()
    response.headers.set('x-middleware-cache', 'no-cache')
    return response
  }

  // Sign-up page - block in beta mode
  if (pathname === '/sign-up') {
    if (BETA_MODE) {
      // Redirect to beta login page
      const response = NextResponse.redirect(
        new URL('/login-beta?info=beta-signup-disabled', request.url)
      )
      response.headers.set('x-middleware-cache', 'no-cache')
      return response
    }
    const response = NextResponse.next()
    response.headers.set('x-middleware-cache', 'no-cache')
    return response
  }

  // Admin pages require authentication
  if (pathname.startsWith('/admin')) {
    if (!session) {
      const response = NextResponse.redirect(new URL('/sign-in', request.url))
      response.headers.set('x-middleware-cache', 'no-cache')
      return response
    }

    // Admin check happens in the API routes themselves
    const response = NextResponse.next()
    response.headers.set('x-middleware-cache', 'no-cache')
    return response
  }

  // Dashboard pages require authentication
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      // Redirect to beta login during beta, otherwise normal sign-in
      const loginPath = BETA_MODE ? '/login-beta' : '/sign-in'
      const response = NextResponse.redirect(new URL(loginPath, request.url))
      response.headers.set('x-middleware-cache', 'no-cache')
      return response
    }

    // In beta mode, check for beta access
    if (BETA_MODE) {
      const hasBetaAccess = await isBetaUser(session.user.id)

      if (!hasBetaAccess) {
        // Redirect non-beta users to landing page
        const response = NextResponse.redirect(
          new URL('/?error=beta-required', request.url)
        )
        response.headers.set('x-middleware-cache', 'no-cache')
        return response
      }
    }

    const response = NextResponse.next()
    response.headers.set('x-middleware-cache', 'no-cache')
    return response
  }

  const response = NextResponse.next()
  response.headers.set('x-middleware-cache', 'no-cache')
  return response
}

// Note: Middleware runs on Node.js runtime by default when not specified
// Cannot use Edge runtime due to better-auth's dynamic code evaluation

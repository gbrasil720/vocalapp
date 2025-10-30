import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isBetaUser } from '@/lib/beta-access'

// Set to true to enable beta access control
const WAITLIST_MODE = true

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up', '/forgot-password']
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

  // Sign-up page - block in waitlist mode
  if (pathname === '/sign-up') {
    if (WAITLIST_MODE) {
      // Redirect to landing page with waitlist
      const response = NextResponse.redirect(new URL('/?signup=disabled', request.url))
      response.headers.set('x-middleware-cache', 'no-cache')
      return response
    }
    const response = NextResponse.next()
    response.headers.set('x-middleware-cache', 'no-cache')
    return response
  }

  // Dashboard pages require authentication
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      const response = NextResponse.redirect(new URL('/sign-in', request.url))
      response.headers.set('x-middleware-cache', 'no-cache')
      return response
    }

    // In waitlist mode, check for beta access
    if (WAITLIST_MODE) {
      const hasBetaAccess = await isBetaUser(session.user.id)
      
      if (!hasBetaAccess) {
        // Redirect non-beta users to landing page
        const response = NextResponse.redirect(new URL('/?error=beta-required', request.url))
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

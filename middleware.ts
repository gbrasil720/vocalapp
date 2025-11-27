import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isBetaUser } from '@/lib/beta-access'

const BETA_MODE = process.env.BETA_MODE

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

  // Explicitly skip API routes to prevent any redirects
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  const session = await auth.api.getSession({
    headers: request.headers
  })

  if (pathname === '/') {
    const response = NextResponse.next()
    response.headers.set('x-middleware-cache', 'no-cache')
    return response
  }

  if (pathname === '/sign-in' || pathname === '/forgot-password') {
    const response = NextResponse.next()
    response.headers.set('x-middleware-cache', 'no-cache')
    return response
  }

  if (pathname === '/login-beta') {
    if (!BETA_MODE) {
      const response = NextResponse.redirect(new URL('/sign-in', request.url))
      response.headers.set('x-middleware-cache', 'no-cache')
      return response
    }

    if (session) {
      const response = NextResponse.redirect(new URL('/dashboard', request.url))
      response.headers.set('x-middleware-cache', 'no-cache')
      return response
    }

    const response = NextResponse.next()
    response.headers.set('x-middleware-cache', 'no-cache')
    return response
  }

  if (pathname === '/sign-up') {
    if (BETA_MODE) {
      const response = NextResponse.redirect(
        new URL('/login-beta?info=beta-signup-disabled', request.url)
      )
      response.headers.set('x-middleware-cache', 'no-cache')
      return response
    }

    if (session) {
      const response = NextResponse.redirect(new URL('/dashboard', request.url))
      response.headers.set('x-middleware-cache', 'no-cache')
      return response
    }

    const response = NextResponse.next()
    response.headers.set('x-middleware-cache', 'no-cache')
    return response
  }

  if (pathname.startsWith('/admin')) {
    if (session?.user?.role !== 'admin' && session) {
      const response = NextResponse.redirect(new URL('/dashboard', request.url))
      response.headers.set('x-middleware-cache', 'no-cache')
      return response
    }

    if (!session) {
      const loginPath = BETA_MODE ? '/login-beta' : '/sign-in'
      const response = NextResponse.redirect(new URL(loginPath, request.url))
      response.headers.set('x-middleware-cache', 'no-cache')
      return response
    }

    const response = NextResponse.next()
    response.headers.set('x-middleware-cache', 'no-cache')
    return response
  }

  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      const loginPath = BETA_MODE ? '/login-beta' : '/sign-in'
      const response = NextResponse.redirect(new URL(loginPath, request.url))
      response.headers.set('x-middleware-cache', 'no-cache')
      return response
    }

    if (BETA_MODE) {
      const hasBetaAccess = await isBetaUser(session.user.id)

      if (!hasBetaAccess) {
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

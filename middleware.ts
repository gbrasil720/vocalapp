import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export const config = {
  matcher: ['/dashboard/:path*']
}

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers
  })

  if (!session) {
    const response = NextResponse.redirect(new URL('/sign-in', request.url))
    response.headers.set('x-middleware-cache', 'no-cache')
    return response
  }

  const response = NextResponse.next()
  response.headers.set('x-middleware-cache', 'no-cache')
  return response
}

// Note: Middleware runs on Node.js runtime by default when not specified
// Cannot use Edge runtime due to better-auth's dynamic code evaluation

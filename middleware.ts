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

// Explicitly use Node.js runtime - better-auth uses dynamic code evaluation
// which is not supported in Edge Runtime
export const runtime = 'nodejs'

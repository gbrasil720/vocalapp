import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUserCredits } from '@/lib/credits'

export async function GET() {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user credits (always fresh from DB)
    const credits = await getUserCredits(session.user.id)

    return NextResponse.json(
      { credits },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          Pragma: 'no-cache',
          Expires: '0'
        }
      }
    )
  } catch (error) {
    console.error('Error fetching credits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credits' },
      { status: 500 }
    )
  }
}

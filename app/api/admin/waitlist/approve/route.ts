import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { approveEmail } from '@/lib/waitlist'

/**
 * ADMIN ENDPOINT: Approve an email for beta access
 */
export async function POST(request: Request) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminEmail = process.env.ADMIN_EMAIL || session.user.email
    if (session.user.email !== adminEmail) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access only' },
        { status: 403 }
      )
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const result = await approveEmail(email)

    if (result) {
      return NextResponse.json({
        success: true,
        message: `Successfully approved ${email}`,
        email
      })
    }

    return NextResponse.json(
      { error: 'Failed to approve email' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Error approving email:', error)
    return NextResponse.json(
      {
        error: 'Failed to approve email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}


import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { sendBetaApprovalEmail } from '@/lib/email/beta-approval'
import { approveEmail } from '@/lib/waitlist'

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
      try {
        await sendBetaApprovalEmail(email)
      } catch (error) {
        console.error('Error sending approval email:', error)
        return NextResponse.json(
          {
            error: 'Email notification failed after approving user',
            email
          },
          { status: 500 }
        )
      }

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

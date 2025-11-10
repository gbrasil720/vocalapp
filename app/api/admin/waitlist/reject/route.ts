import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { revokeApproval } from '@/lib/waitlist'

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

    const result = await revokeApproval(email)

    if (result) {
      return NextResponse.json({
        success: true,
        message: `Successfully revoked approval for ${email}`,
        email
      })
    }

    return NextResponse.json(
      { error: 'Failed to revoke approval' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Error revoking approval:', error)
    return NextResponse.json(
      {
        error: 'Failed to revoke approval',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getApprovedEmails,
  getWaitlistEntries,
  isEmailApproved
} from '@/lib/waitlist'

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminEmail =
      process.env.ADMIN_EMAIL ||
      session.user.email ||
      'resendebrasilgui@gmail.com'
    if (session.user.email !== adminEmail) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access only' },
        { status: 403 }
      )
    }

    const waitlistEmails = await getWaitlistEntries(1000)
    const approvedEmails = await getApprovedEmails()
    const approvedSet = new Set(approvedEmails)

    const entries = await Promise.all(
      waitlistEmails.map(async (email) => ({
        email,
        status: approvedSet.has(email) ? 'approved' : 'pending'
      }))
    )

    return NextResponse.json({
      entries,
      total: entries.length,
      approved: approvedEmails.length,
      pending: entries.filter((e) => e.status === 'pending').length
    })
  } catch (error) {
    console.error('Error fetching waitlist:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch waitlist',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

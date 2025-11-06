import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getApprovedEmails,
  getWaitlistEntries,
  isEmailApproved
} from '@/lib/waitlist'

/**
 * ADMIN ENDPOINT: Get all waitlisted emails with their approval status
 */
export async function GET() {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (add your email here or use env variable)
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

    // Get all waitlist entries (increase limit to get more)
    const waitlistEmails = await getWaitlistEntries(1000)
    const approvedEmails = await getApprovedEmails()
    const approvedSet = new Set(approvedEmails)

    // Combine data
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

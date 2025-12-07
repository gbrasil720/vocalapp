import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { user } from '@/db/schema'
import { auth } from '@/lib/auth'

// GET - Check if user has 2FA enabled by checking the user.twoFactorEnabled field
// This field is only set to true after successful TOTP verification, not just when
// the two_factor record is created during the enable() step
export async function GET() {
  try {
    const requestHeaders = await headers()

    const session = await auth.api.getSession({
      headers: requestHeaders
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Check the user's twoFactorEnabled field - this is only true after verification
    const userRecord = await db
      .select({ twoFactorEnabled: user.twoFactorEnabled })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    const twoFactorEnabled = userRecord[0]?.twoFactorEnabled ?? false

    return NextResponse.json({ twoFactorEnabled })
  } catch (error) {
    console.error('Error checking 2FA status:', error)
    return NextResponse.json(
      { error: 'Failed to check 2FA status' },
      { status: 500 }
    )
  }
}

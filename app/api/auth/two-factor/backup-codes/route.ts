import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { twoFactor } from '@/db/schema'
import { auth } from '@/lib/auth'

// GET - Check if user has backup codes and return info
// Note: Due to encryption, we can't view existing codes - users must generate new ones
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

    // Get the two_factor record from database
    const twoFactorRecord = await db
      .select()
      .from(twoFactor)
      .where(eq(twoFactor.userId, userId))
      .limit(1)

    if (twoFactorRecord.length === 0) {
      return NextResponse.json(
        { error: 'Two-factor authentication is not enabled' },
        { status: 400 }
      )
    }

    const { backupCodes: encryptedBackupCodes } = twoFactorRecord[0]

    // Check if backup codes exist (they're encrypted, so we can't show them)
    const hasBackupCodes =
      !!encryptedBackupCodes && encryptedBackupCodes.length > 0

    // We cannot decrypt existing backup codes - user must generate new ones to view them
    return NextResponse.json({
      hasBackupCodes,
      message: hasBackupCodes
        ? 'Backup codes exist but cannot be viewed. Generate new codes to see them.'
        : 'No backup codes found. Please generate backup codes.',
      needsRegeneration: true
    })
  } catch (error) {
    console.error('Error checking backup codes:', error)

    return NextResponse.json(
      { error: 'Failed to check backup codes status.' },
      { status: 500 }
    )
  }
}

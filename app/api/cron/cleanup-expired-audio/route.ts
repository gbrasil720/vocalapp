import { and, eq, isNotNull, lt } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { subscription, transcription } from '@/db/schema'
import { deleteFromBlob } from '@/lib/storage/vercel-blob'

export const maxDuration = 300 // 5 minutes max

export async function GET(req: Request) {
  try {
    // Verify cron secret to prevent unauthorized calls
    const authHeader = req.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    if (!process.env.CRON_SECRET || authHeader !== expectedAuth) {
      console.error('Unauthorized cron job attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🕐 Starting audio cleanup cron job...')

    // Get date 7 days ago (minimum retention period)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    // Query optimization: only get transcriptions that could potentially be expired
    const candidates = await db
      .select({
        id: transcription.id,
        userId: transcription.userId,
        fileUrl: transcription.fileUrl,
        createdAt: transcription.createdAt,
        fileName: transcription.fileName
      })
      .from(transcription)
      .where(
        and(
          isNotNull(transcription.fileUrl),
          lt(transcription.createdAt, sevenDaysAgo)
        )
      )

    console.log(`Found ${candidates.length} candidate files for cleanup`)

    let checkedCount = 0
    let deletedCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const record of candidates) {
      try {
        checkedCount++

        // Get user's subscription to determine retention period
        const [userSub] = await db
          .select()
          .from(subscription)
          .where(eq(subscription.referenceId, record.userId))
          .limit(1)

        // Determine retention days based on subscription
        const retentionDays = getRetentionDays(userSub)

        // Calculate expiration date
        const expirationDate = new Date(
          record.createdAt.getTime() + retentionDays * 24 * 60 * 60 * 1000
        )

        // Check if audio has expired
        if (new Date() > expirationDate) {
          // Delete from Vercel Blob
          if (record.fileUrl) {
            try {
              await deleteFromBlob(record.fileUrl)
              console.log(`✓ Deleted blob: ${record.fileName}`)
            } catch (blobError) {
              console.error(
                `Failed to delete blob for ${record.id}:`,
                blobError
              )
              errors.push(`Blob deletion failed: ${record.fileName}`)
            }
          }

          // Update database to set fileUrl to null
          await db
            .update(transcription)
            .set({ fileUrl: null })
            .where(eq(transcription.id, record.id))

          deletedCount++
          console.log(
            `✓ Expired audio cleanup: ${record.fileName} (${retentionDays} day retention)`
          )
        }
      } catch (error) {
        errorCount++
        console.error(`Error processing record ${record.id}:`, error)
        errors.push(
          `${record.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        candidatesFound: candidates.length,
        filesChecked: checkedCount,
        filesDeleted: deletedCount,
        errors: errorCount
      },
      errorDetails: errors.length > 0 ? errors : undefined
    }

    console.log('✓ Cleanup cron job completed:', result.stats)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Cron job failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * Determine retention period based on subscription
 * @param userSubscription User's subscription record
 * @returns Number of days to retain audio
 */
function getRetentionDays(
  userSubscription: typeof subscription.$inferSelect | undefined
): number {
  // No subscription or inactive = Free plan = 7 days
  if (!userSubscription || userSubscription.status !== 'active') {
    return 7
  }

  // Check plan type
  const plan = userSubscription.plan?.toLowerCase()

  if (plan === 'pro') {
    return 90
  }

  if (plan === 'enterprise') {
    return Number.POSITIVE_INFINITY // Keep indefinitely
  }

  // Default to 7 days for any other case
  return 7
}

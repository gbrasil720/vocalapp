import { and, eq, isNotNull, lt } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { subscription, transcription } from '@/db/schema'
import { deleteFromBlob } from '@/lib/storage/vercel-blob'

export const maxDuration = 300 // 5 minutes max

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    if (!process.env.CRON_SECRET || authHeader !== expectedAuth) {
      console.error('Unauthorized cron job attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🕐 Starting audio cleanup cron job...')

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

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
    let skippedCount = 0
    const errors: string[] = []

    for (const record of candidates) {
      try {
        checkedCount++

        // Look up subscription for this user
        const [userSub] = await db
          .select()
          .from(subscription)
          .where(eq(subscription.referenceId, record.userId))
          .limit(1)

        const retentionDays = getRetentionDays(userSub)
        const fileAgeDays = Math.floor(
          (Date.now() - record.createdAt.getTime()) / (24 * 60 * 60 * 1000)
        )

        // Log subscription lookup results for debugging
        if (userSub) {
          console.log(
            `📋 File: ${record.fileName} | User: ${record.userId} | Plan: ${userSub.plan} | Status: ${userSub.status} | Retention: ${retentionDays} days | Age: ${fileAgeDays} days`
          )
        } else {
          console.log(
            `📋 File: ${record.fileName} | User: ${record.userId} | No subscription found | Retention: ${retentionDays} days (default) | Age: ${fileAgeDays} days`
          )
        }

        const expirationDate = new Date(
          record.createdAt.getTime() + retentionDays * 24 * 60 * 60 * 1000
        )
        const now = new Date()
        const isExpired = now > expirationDate

        if (isExpired) {
          if (record.fileUrl) {
            try {
              await deleteFromBlob(record.fileUrl)
              console.log(
                `✓ Deleted blob: ${record.fileName} (expired after ${retentionDays} days, age: ${fileAgeDays} days)`
              )
            } catch (blobError) {
              console.error(
                `Failed to delete blob for ${record.id}:`,
                blobError
              )
              errors.push(`Blob deletion failed: ${record.fileName}`)
            }
          }

          await db
            .update(transcription)
            .set({ fileUrl: null })
            .where(eq(transcription.id, record.id))

          deletedCount++
        } else {
          skippedCount++
          console.log(
            `⏳ Skipped: ${record.fileName} (not expired, expires in ${Math.ceil((expirationDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))} days)`
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
        filesSkipped: skippedCount,
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

function getRetentionDays(
  userSubscription: typeof subscription.$inferSelect | undefined
): number {
  // If no subscription found, default to free plan retention (7 days)
  if (!userSubscription) {
    return 7
  }

  // Check if subscription is active
  const isActive = userSubscription.status === 'active'
  if (!isActive) {
    console.log(
      `⚠️ Subscription found but not active: plan=${userSubscription.plan}, status=${userSubscription.status}`
    )
    return 7
  }

  // Normalize plan name for comparison (handle case variations)
  const plan = userSubscription.plan?.toLowerCase().trim()

  // Check for Pro plan (handles both 'pro' and 'frequency-plan' from Dodo Payments)
  if (plan === 'pro' || plan === 'frequency-plan' || plan === 'frequency') {
    console.log(
      `✓ Pro plan detected: ${userSubscription.plan} -> 90 days retention`
    )
    return 90
  }

  if (plan === 'enterprise') {
    console.log(
      `✓ Enterprise plan detected: ${userSubscription.plan} -> infinite retention`
    )
    return Number.POSITIVE_INFINITY
  }

  // Unknown plan or free plan - default to 7 days
  console.log(
    `⚠️ Unknown or free plan: ${userSubscription.plan} -> 7 days retention`
  )
  return 7
}

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
    const errors: string[] = []

    for (const record of candidates) {
      try {
        checkedCount++

        const [userSub] = await db
          .select()
          .from(subscription)
          .where(eq(subscription.referenceId, record.userId))
          .limit(1)

        const retentionDays = getRetentionDays(userSub)

        const expirationDate = new Date(
          record.createdAt.getTime() + retentionDays * 24 * 60 * 60 * 1000
        )

        if (new Date() > expirationDate) {
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

function getRetentionDays(
  userSubscription: typeof subscription.$inferSelect | undefined
): number {
  if (!userSubscription || userSubscription.status !== 'active') {
    return 7
  }

  const plan = userSubscription.plan?.toLowerCase()

  if (plan === 'pro') {
    return 90
  }

  if (plan === 'enterprise') {
    return Number.POSITIVE_INFINITY
  }

  return 7
}

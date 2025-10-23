import { and, eq, inArray } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { transcription } from '@/db/schema'
import { auth } from '@/lib/auth'
import { deleteFromBlob } from '@/lib/storage/vercel-blob'

export async function POST(req: Request) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { transcriptionIds } = body as { transcriptionIds: string[] }

    if (
      !transcriptionIds ||
      !Array.isArray(transcriptionIds) ||
      transcriptionIds.length === 0
    ) {
      return NextResponse.json(
        { error: 'Invalid transcription IDs' },
        { status: 400 }
      )
    }

    // Fetch transcriptions to verify ownership and get file URLs
    const transcriptionsToDelete = await db
      .select()
      .from(transcription)
      .where(
        and(
          eq(transcription.userId, session.user.id),
          inArray(transcription.id, transcriptionIds)
        )
      )

    if (transcriptionsToDelete.length === 0) {
      return NextResponse.json(
        { error: 'No transcriptions found to delete' },
        { status: 404 }
      )
    }

    // Delete blob files from storage
    const deletionPromises = transcriptionsToDelete
      .filter((t) => t.fileUrl)
      .map((t) =>
        deleteFromBlob(t.fileUrl as string).catch((err) => {
          console.error(`Failed to delete blob for ${t.id}:`, err)
        })
      )

    await Promise.allSettled(deletionPromises)

    // Delete transcriptions from database
    await db
      .delete(transcription)
      .where(
        and(
          eq(transcription.userId, session.user.id),
          inArray(transcription.id, transcriptionIds)
        )
      )

    return NextResponse.json({
      success: true,
      deletedCount: transcriptionsToDelete.length
    })
  } catch (error) {
    console.error('Error deleting transcriptions:', error)
    return NextResponse.json(
      { error: 'Failed to delete transcriptions' },
      { status: 500 }
    )
  }
}

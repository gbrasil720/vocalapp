import { desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { transcription } from '@/db/schema'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user's transcriptions
    const transcriptions = await db
      .select({
        id: transcription.id,
        fileName: transcription.fileName,
        fileSize: transcription.fileSize,
        mimeType: transcription.mimeType,
        duration: transcription.duration,
        language: transcription.language,
        status: transcription.status,
        creditsUsed: transcription.creditsUsed,
        createdAt: transcription.createdAt,
        completedAt: transcription.completedAt
      })
      .from(transcription)
      .where(eq(transcription.userId, session.user.id))
      .orderBy(desc(transcription.createdAt))
      .limit(50)

    return NextResponse.json({ transcriptions })
  } catch (error) {
    console.error('Error fetching transcriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transcriptions' },
      { status: 500 }
    )
  }
}




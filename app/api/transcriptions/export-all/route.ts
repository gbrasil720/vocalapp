import { desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { transcription } from '@/db/schema'
import { auth } from '@/lib/auth'

export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const transcriptions = await db
      .select({
        id: transcription.id,
        fileName: transcription.fileName,
        text: transcription.text,
        createdAt: transcription.createdAt
      })
      .from(transcription)
      .where(eq(transcription.userId, session.user.id))
      .orderBy(desc(transcription.createdAt))

    const completedTranscriptions = transcriptions.filter(
      (t) => t.text && t.text.trim().length > 0
    )

    if (completedTranscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No completed transcriptions to export' },
        { status: 404 }
      )
    }

    const JSZip = (await import('jszip')).default
    const zip = new JSZip()

    for (const t of completedTranscriptions) {
      const fileName = t.fileName.replace(/\.[^/.]+$/, '') + '.txt'
      zip.file(fileName, t.text || '')
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })

    return new NextResponse(zipBlob, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="transcriptions-${Date.now()}.zip"`
      }
    })
  } catch (error) {
    console.error('Error exporting transcriptions:', error)
    return NextResponse.json(
      { error: 'Failed to export transcriptions' },
      { status: 500 }
    )
  }
}

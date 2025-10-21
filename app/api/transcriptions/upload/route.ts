import { put } from '@vercel/blob'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { subscription, transcription } from '@/db/schema'
import { auth } from '@/lib/auth'
import { getUserCredits } from '@/lib/credits'

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB (OpenAI Whisper limit)
const ALLOWED_TYPES = [
  'audio/mpeg', // mp3
  'audio/mp4', // m4a
  'audio/wav',
  'audio/webm',
  'audio/flac',
  'audio/ogg',
  'video/mp4', // mp4
  'video/mpeg',
  'video/webm'
]

export async function POST(req: Request) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Check if user has enough credits (minimum 1 credit needed)
    const credits = await getUserCredits(userId)
    if (credits < 1) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please purchase more credits.' },
        { status: 402 } // Payment Required
      )
    }

    // Check if user has Pro subscription for multiple file support
    const [sub] = await db
      .select()
      .from(subscription)
      .where(eq(subscription.referenceId, userId))
      .limit(1)

    const isPro = sub && sub.status === 'active'

    // Parse form data
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Check multiple file limit for non-Pro users
    if (!isPro && files.length > 1) {
      return NextResponse.json(
        {
          error:
            'Multiple file uploads are only available for Pro plan subscribers.'
        },
        { status: 403 }
      )
    }

    // Validate each file
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `File "${file.name}" exceeds maximum size of 25MB`
          },
          { status: 400 }
        )
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            error: `File "${file.name}" has unsupported type. Supported: MP3, M4A, WAV, WEBM, FLAC, OGG, MP4`
          },
          { status: 400 }
        )
      }
    }

    // Upload files and create transcription records
    const transcriptions = []

    for (const file of files) {
      // Upload to Vercel Blob
      const blob = await put(
        `transcriptions/${userId}/${Date.now()}-${file.name}`,
        file,
        {
          access: 'public',
          addRandomSuffix: true
        }
      )

      // Create transcription record
      const [newTranscription] = await db
        .insert(transcription)
        .values({
          userId,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          fileUrl: blob.url,
          status: 'processing'
        })
        .returning()

      transcriptions.push(newTranscription)

      // Trigger transcription processing asynchronously
      // Using fetch with no-wait pattern
      fetch(
        `${req.headers.get('origin') || process.env.NEXT_PUBLIC_URL}/api/transcriptions/process`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            transcriptionId: newTranscription.id
          })
        }
      ).catch((error) => {
        console.error('Error triggering transcription:', error)
      })
    }

    return NextResponse.json({
      success: true,
      transcriptions: transcriptions.map((t) => ({
        id: t.id,
        fileName: t.fileName,
        status: t.status,
        createdAt: t.createdAt
      }))
    })
  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    )
  }
}


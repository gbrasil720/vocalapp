import { eq } from 'drizzle-orm'
import { parseBuffer } from 'music-metadata'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { subscription, transcription } from '@/db/schema'
import { auth } from '@/lib/auth'
import { getUserCredits } from '@/lib/credits'
import { calculateTranscriptionCost } from '@/lib/credits/transcription-billing'
import { generateBlobKey, uploadToBlob } from '@/lib/storage/vercel-blob'

const MAX_FILE_SIZE = 25 * 1024 * 1024
const ALLOWED_TYPES = [
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'audio/webm',
  'audio/flac',
  'audio/ogg',
  'audio/x-m4a',
  'audio/aac',
  'video/mp4',
  'video/mpeg',
  'video/webm'
]

const ALLOWED_EXTENSIONS = [
  '.mp3',
  '.m4a',
  '.wav',
  '.webm',
  '.flac',
  '.ogg',
  '.aac',
  '.mp4',
  '.mpeg',
  '.mpg'
]

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot === -1) return ''
  return filename.substring(lastDot).toLowerCase()
}

function isValidFileType(file: File): boolean {
  // Check MIME type first
  if (file.type && ALLOWED_TYPES.includes(file.type)) {
    return true
  }

  // Fallback to file extension if MIME type is missing or incorrect
  const extension = getFileExtension(file.name)
  if (ALLOWED_EXTENSIONS.includes(extension)) {
    return true
  }

  return false
}

export async function POST(req: Request) {
  try {
    console.log('📤 File upload request received')
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      console.error('❌ Unauthorized upload attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    console.log(`✅ Authenticated user: ${userId}`)

    const [sub] = await db
      .select()
      .from(subscription)
      .where(eq(subscription.referenceId, userId))
      .limit(1)

    const isPro = sub && sub.status === 'active'

    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    console.log(`📁 Received ${files.length} file(s)`)
    files.forEach((file, index) => {
      console.log(
        `  File ${index + 1}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB, type: ${file.type || 'unknown'})`
      )
    })

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    if (!isPro && files.length > 1) {
      return NextResponse.json(
        {
          error:
            'Multiple file uploads are only available for Pro plan subscribers.'
        },
        { status: 403 }
      )
    }

    // Validate file sizes and types
    for (const file of files) {
      if (file.size === 0) {
        return NextResponse.json(
          {
            error: `File "${file.name}" is empty`
          },
          { status: 400 }
        )
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `File "${file.name}" exceeds maximum size of 25MB`
          },
          { status: 400 }
        )
      }

      if (!isValidFileType(file)) {
        const detectedType = file.type || 'unknown'
        const extension = getFileExtension(file.name)
        return NextResponse.json(
          {
            error: `File "${file.name}" has unsupported type (${detectedType}${extension ? `, extension: ${extension}` : ''}). Supported: MP3, M4A, WAV, WEBM, FLAC, OGG, AAC, MP4`
          },
          { status: 400 }
        )
      }
    }

    // Extract duration and validate credits for each file
    const fileDetailsArray: Array<{
      file: File
      duration: number
      cost: number
    }> = []

    for (const file of files) {
      try {
        // Extract audio duration
        const fileBuffer = await file.arrayBuffer()
        const metadata = await parseBuffer(
          Buffer.from(fileBuffer),
          { mimeType: file.type },
          { duration: true }
        )

        const durationSeconds = Math.floor(metadata.format.duration || 0)

        if (!durationSeconds || durationSeconds <= 0) {
          return NextResponse.json(
            {
              error: `Cannot extract duration from "${file.name}". Please ensure it's a valid audio file.`
            },
            { status: 400 }
          )
        }

        const cost = calculateTranscriptionCost(durationSeconds)

        fileDetailsArray.push({
          file,
          duration: durationSeconds,
          cost
        })
      } catch (error) {
        console.error(`Error extracting duration from ${file.name}:`, error)
        return NextResponse.json(
          {
            error: `Failed to extract audio duration from "${file.name}". Please ensure it's a valid audio file.`
          },
          { status: 400 }
        )
      }
    }

    // Calculate total cost
    const totalCost = fileDetailsArray.reduce((sum, fd) => sum + fd.cost, 0)

    // Check user has enough credits
    const userCredits = await getUserCredits(userId)
    if (userCredits < totalCost) {
      const totalMinutes = Math.ceil(
        fileDetailsArray.reduce((sum, fd) => sum + fd.duration, 0) / 60
      )
      return NextResponse.json(
        {
          error: `Insufficient credits. You need ${totalCost} credits for ${totalMinutes} minute(s) of audio, but you only have ${userCredits} credits.`
        },
        { status: 402 }
      )
    }

    const transcriptions = []

    // Process each file
    for (const fileDetail of fileDetailsArray) {
      const { file, duration, cost } = fileDetail

      const blobKey = generateBlobKey(userId, file.name)
      const uploadResult = await uploadToBlob(file, blobKey)

      const [newTranscription] = await db
        .insert(transcription)
        .values({
          userId,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          fileUrl: uploadResult.url,
          duration,
          status: 'processing',
          metadata: {
            estimatedCost: cost
          }
        })
        .returning()

      transcriptions.push(newTranscription)

      // Trigger async processing
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
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Upload error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      {
        error: 'Failed to upload files',
        details:
          process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

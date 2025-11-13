import { eq } from 'drizzle-orm'
import { parseBuffer } from 'music-metadata'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { subscription, transcription } from '@/db/schema'
import { auth } from '@/lib/auth'
import { getUserCredits } from '@/lib/credits'
import { calculateTranscriptionCost } from '@/lib/credits/transcription-billing'
import { env } from '@/lib/env'

export const runtime = 'nodejs'
export const maxDuration = 60

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

function isValidFileType(mimeType: string, fileName: string): boolean {
  if (mimeType && ALLOWED_TYPES.includes(mimeType)) {
    return true
  }

  const extension = getFileExtension(fileName)
  if (ALLOWED_EXTENSIONS.includes(extension)) {
    return true
  }

  return false
}

interface FileMetadata {
  fileUrl: string
  fileName: string
  fileSize: number
  mimeType: string
  blobPathname: string
}

export async function POST(req: Request) {
  try {
    console.log('📤 File upload metadata request received')
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

    const body = await req.json()
    const files: FileMetadata[] = Array.isArray(body.files)
      ? body.files
      : [body]

    console.log(`📁 Received metadata for ${files.length} file(s)`)
    files.forEach((file, index) => {
      console.log(
        `  File ${index + 1}: ${file.fileName} (${(file.fileSize / 1024 / 1024).toFixed(2)}MB, type: ${file.mimeType || 'unknown'})`
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

    for (const file of files) {
      if (!file.fileUrl || !file.fileName || !file.fileSize || !file.mimeType) {
        return NextResponse.json(
          {
            error:
              'Missing required fields: fileUrl, fileName, fileSize, mimeType'
          },
          { status: 400 }
        )
      }

      if (file.fileSize === 0) {
        return NextResponse.json(
          {
            error: `File "${file.fileName}" is empty`
          },
          { status: 400 }
        )
      }

      if (file.fileSize > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `File "${file.fileName}" exceeds maximum size of 25MB`
          },
          { status: 400 }
        )
      }

      if (!isValidFileType(file.mimeType, file.fileName)) {
        const extension = getFileExtension(file.fileName)
        return NextResponse.json(
          {
            error: `File "${file.fileName}" has unsupported type (${file.mimeType}${extension ? `, extension: ${extension}` : ''}). Supported: MP3, M4A, WAV, WEBM, FLAC, OGG, AAC, MP4`
          },
          { status: 400 }
        )
      }
    }

    const fileDetailsArray: Array<{
      metadata: FileMetadata
      duration: number
      cost: number
    }> = []

    for (const fileMetadata of files) {
      try {
        console.log(`⬇️  Downloading file from Blob: ${fileMetadata.fileUrl}`)
        const fileResponse = await fetch(fileMetadata.fileUrl)
        if (!fileResponse.ok) {
          throw new Error(
            `Failed to download file from Blob: ${fileResponse.statusText}`
          )
        }

        const fileBuffer = await fileResponse.arrayBuffer()
        const metadata = await parseBuffer(
          Buffer.from(fileBuffer),
          { mimeType: fileMetadata.mimeType },
          { duration: true }
        )

        const durationSeconds = Math.floor(metadata.format.duration || 0)

        if (!durationSeconds || durationSeconds <= 0) {
          return NextResponse.json(
            {
              error: `Cannot extract duration from "${fileMetadata.fileName}". Please ensure it's a valid audio file.`
            },
            { status: 400 }
          )
        }

        const cost = calculateTranscriptionCost(durationSeconds)

        fileDetailsArray.push({
          metadata: fileMetadata,
          duration: durationSeconds,
          cost
        })
      } catch (error) {
        console.error(
          `Error extracting duration from ${fileMetadata.fileName}:`,
          error
        )
        return NextResponse.json(
          {
            error: `Failed to extract audio duration from "${fileMetadata.fileName}". Please ensure it's a valid audio file.`
          },
          { status: 400 }
        )
      }
    }

    const totalCost = fileDetailsArray.reduce((sum, fd) => sum + fd.cost, 0)

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
    const processUrl = new URL(
      '/api/transcriptions/process',
      env.NEXT_PUBLIC_URL || req.url
    )

    for (const fileDetail of fileDetailsArray) {
      const { metadata, duration, cost } = fileDetail

      const [newTranscription] = await db
        .insert(transcription)
        .values({
          userId,
          fileName: metadata.fileName,
          fileSize: metadata.fileSize,
          mimeType: metadata.mimeType,
          fileUrl: metadata.fileUrl,
          duration,
          status: 'processing',
          metadata: {
            estimatedCost: cost
          }
        })
        .returning()

      transcriptions.push(newTranscription)

      fetch(processUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transcriptionId: newTranscription.id
        })
      }).catch((error) => {
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

    const isPayloadError =
      errorMessage.includes('BIG_PAYLOAD') ||
      errorMessage.includes('payload') ||
      errorMessage.includes('413') ||
      errorMessage.includes('Request Entity Too Large')

    console.error('Upload error details:', {
      message: errorMessage,
      isPayloadError,
      stack: error instanceof Error ? error.stack : undefined
    })

    if (isPayloadError) {
      return NextResponse.json(
        {
          error:
            'File size exceeds server limit. Please upload smaller files or contact support for assistance.'
        },
        { status: 413 }
      )
    }

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

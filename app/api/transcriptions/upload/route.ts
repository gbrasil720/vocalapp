import { eq } from 'drizzle-orm'
import { parseBuffer } from 'music-metadata'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { subscription, transcription } from '@/db/schema'
import { auth } from '@/lib/auth'
import { getUserCredits } from '@/lib/credits'
import { calculateTranscriptionCost } from '@/lib/credits/transcription-billing'

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

async function fetchWithRetry(
  url: string,
  options: { retries?: number; delay?: number; initialDelay?: number } = {}
): Promise<Response> {
  const { retries = 5, delay = 1000, initialDelay = 500 } = options

  // Add initial delay to account for blob propagation delay
  if (initialDelay > 0) {
    await new Promise((resolve) => setTimeout(resolve, initialDelay))
  }

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(30000) // 30 second timeout
      })

      if (response.ok) {
        return response
      }

      // Retry 404s with exponential backoff - blob storage may have propagation delay
      if (response.status === 404) {
        if (attempt < retries) {
          const waitTime = delay * 2 ** (attempt - 1) // Exponential backoff: 1s, 2s, 4s, 8s, 16s
          console.warn(
            `Attempt ${attempt}/${retries}: File not found (404) - may be propagation delay. Retrying in ${waitTime}ms...`
          )
          await new Promise((resolve) => setTimeout(resolve, waitTime))
          continue
        }
        // Last attempt failed with 404
        throw new Error(
          `File not found at blob URL (404) after ${retries} attempts. This may indicate the file was not uploaded successfully or the URL is incorrect.`
        )
      }

      // Retry on server errors (5xx) or network errors
      if (
        attempt < retries &&
        (response.status >= 500 || response.status === 0)
      ) {
        const waitTime = delay * 2 ** (attempt - 1) // Exponential backoff
        console.warn(
          `Attempt ${attempt}/${retries} failed with status ${response.status}. Retrying in ${waitTime}ms...`
        )
        await new Promise((resolve) => setTimeout(resolve, waitTime))
        continue
      }

      throw new Error(
        `Failed to fetch file: ${response.status} ${response.statusText}`
      )
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt === retries) {
        throw lastError
      }

      // Retry on network errors (but not if it's a 404 we already handled)
      if (
        error instanceof Error &&
        !error.message.includes('not found') &&
        !error.message.includes('404')
      ) {
        const waitTime = delay * 2 ** (attempt - 1)
        console.warn(
          `Attempt ${attempt}/${retries} failed: ${error.message}. Retrying in ${waitTime}ms...`
        )
        await new Promise((resolve) => setTimeout(resolve, waitTime))
        continue
      }

      // If it's a 404 error from our throw above, don't retry again
      if (error instanceof Error && error.message.includes('404')) {
        throw error
      }

      // For other errors, retry
      const waitTime = delay * 2 ** (attempt - 1)
      console.warn(
        `Attempt ${attempt}/${retries} failed: ${error instanceof Error ? error.message : String(error)}. Retrying in ${waitTime}ms...`
      )
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
  }

  throw lastError || new Error('Failed to fetch file after retries')
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

      // Warn if blobPathname is missing (helpful for debugging)
      if (!file.blobPathname) {
        console.warn(
          `⚠️  blobPathname not provided for file: ${file.fileName}. This may make debugging blob URL issues more difficult.`
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
        // Log both URL and pathname for debugging
        console.log(`⬇️  Downloading file from Blob:`, {
          fileName: fileMetadata.fileName,
          fileUrl: fileMetadata.fileUrl,
          blobPathname: fileMetadata.blobPathname || 'not provided'
        })

        // Validate URL format
        const fileUrl = fileMetadata.fileUrl
        try {
          new URL(fileUrl)
        } catch {
          throw new Error(
            `Invalid file URL format: "${fileUrl}". The blob URL appears to be malformed.`
          )
        }

        // Attempt to fetch with retry logic
        // Increased retries and added initial delay to handle blob propagation delay
        const fileResponse = await fetchWithRetry(fileUrl, {
          retries: 5, // More retries for eventual consistency
          delay: 1000, // Base delay of 1 second
          initialDelay: 500 // Wait 500ms before first attempt
        })

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
        console.error(`Error processing file ${fileMetadata.fileName}:`, error)
        console.error('File metadata:', {
          fileName: fileMetadata.fileName,
          fileUrl: fileMetadata.fileUrl,
          blobPathname: fileMetadata.blobPathname,
          fileSize: fileMetadata.fileSize,
          mimeType: fileMetadata.mimeType
        })

        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'

        // Provide specific error messages based on error type
        if (
          errorMessage.includes('not found') ||
          errorMessage.includes('404')
        ) {
          return NextResponse.json(
            {
              error: `File "${fileMetadata.fileName}" was not found at the provided blob URL. The file may not have been uploaded successfully. Please try uploading again.`,
              details:
                process.env.NODE_ENV === 'development'
                  ? {
                      fileUrl: fileMetadata.fileUrl,
                      blobPathname: fileMetadata.blobPathname
                    }
                  : undefined
            },
            { status: 404 }
          )
        }

        if (
          errorMessage.includes('timeout') ||
          errorMessage.includes('timeout')
        ) {
          return NextResponse.json(
            {
              error: `Timeout while downloading "${fileMetadata.fileName}". The file may be too large or the network connection is slow. Please try again.`
            },
            { status: 408 }
          )
        }

        if (errorMessage.includes('Invalid file URL')) {
          return NextResponse.json(
            {
              error: `Invalid blob URL for file "${fileMetadata.fileName}". Please try uploading again.`
            },
            { status: 400 }
          )
        }

        // Generic error for other cases (parsing, etc.)
        return NextResponse.json(
          {
            error: `Failed to process file "${fileMetadata.fileName}". ${errorMessage.includes('duration') ? 'Could not extract audio duration.' : "Please ensure it's a valid audio file and try again."}`,
            details:
              process.env.NODE_ENV === 'development' ? errorMessage : undefined
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
      process.env.NEXT_PUBLIC_URL || req.url
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

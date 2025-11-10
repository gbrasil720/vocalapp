import { type HandleUploadBody, handleUpload } from '@vercel/blob/client'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateBlobKey } from '@/lib/storage/vercel-blob'

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB
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

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = clientPayload
          ? typeof clientPayload === 'string'
            ? JSON.parse(clientPayload)
            : clientPayload
          : {}

        const fileName = payload.fileName || pathname
        const fileSize = payload.fileSize
        const mimeType = payload.mimeType

        if (fileSize && fileSize > MAX_FILE_SIZE) {
          throw new Error(
            `File size (${(fileSize / 1024 / 1024).toFixed(2)}MB) exceeds maximum of 25MB`
          )
        }

        if (mimeType && !isValidFileType(mimeType, fileName)) {
          throw new Error(
            `File type "${mimeType}" is not supported. Supported: MP3, M4A, WAV, WEBM, FLAC, OGG, AAC, MP4`
          )
        }

        const blobKey = generateBlobKey(userId, fileName)

        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_FILE_SIZE,
          addRandomSuffix: false,
          tokenPayload: JSON.stringify({
            userId,
            fileName,
            fileSize,
            mimeType,
            blobPathname: blobKey
          })
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Blob upload completed', blob.url)

        try {
          const payload = tokenPayload ? JSON.parse(tokenPayload) : {}

          console.log('Upload metadata:', payload)
        } catch (error) {
          console.error('Error processing upload completion:', error)
          throw new Error('Could not process upload')
        }
      }
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error('Error handling upload:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    )
  }
}

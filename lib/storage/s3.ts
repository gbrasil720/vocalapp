import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  },
  ...(process.env.AWS_S3_ENDPOINT && {
    endpoint: process.env.AWS_S3_ENDPOINT,
    forcePathStyle: true // Required for some S3-compatible services
  })
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || ''

if (!BUCKET_NAME) {
  console.warn('AWS_S3_BUCKET_NAME is not configured')
}

export interface UploadResult {
  key: string
  url: string
  bucket: string
}

/**
 * Upload a file to S3
 * @param file - The file to upload
 * @param path - The path/key in the bucket (e.g., 'transcriptions/user-id/file.mp3')
 * @returns Upload result with key and URL
 */
export async function uploadToS3(
  file: File | Blob,
  path: string
): Promise<UploadResult> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer())

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: path,
      Body: buffer,
      ContentType:
        file instanceof File ? file.type : 'application/octet-stream',
      // Optional: Add metadata
      Metadata: {
        originalName: file instanceof File ? file.name : 'unknown',
        uploadedAt: new Date().toISOString()
      }
    })

    await s3Client.send(command)

    // Generate the public URL (if bucket is public) or use signed URL
    const url = getPublicUrl(path)

    return {
      key: path,
      url,
      bucket: BUCKET_NAME
    }
  } catch (error) {
    console.error('Error uploading to S3:', error)
    throw new Error(
      `Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Get a signed URL for secure access to a private file
 * @param key - The file key in S3
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Signed URL
 */
export async function getSignedFileUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    })

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn })
    return signedUrl
  } catch (error) {
    console.error('Error generating signed URL:', error)
    throw new Error(
      `Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Get the public URL for a file (works only if bucket is public)
 * For private buckets, use getSignedFileUrl instead
 * @param key - The file key in S3
 * @returns Public URL
 */
export function getPublicUrl(key: string): string {
  const region = process.env.AWS_REGION || 'us-east-1'

  // If custom endpoint is set, use it
  if (process.env.AWS_S3_ENDPOINT) {
    const endpoint = process.env.AWS_S3_ENDPOINT.replace(/\/$/, '')
    return `${endpoint}/${BUCKET_NAME}/${key}`
  }

  // Standard AWS S3 URL
  return `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`
}

/**
 * Download a file from S3
 * @param key - The file key in S3
 * @returns File buffer
 */
export async function downloadFromS3(key: string): Promise<Buffer> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    })

    const response = await s3Client.send(command)

    if (!response.Body) {
      throw new Error('No data received from S3')
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    // @ts-expect-error - AWS SDK stream types are not properly typed
    for await (const chunk of response.Body) {
      chunks.push(chunk)
    }

    return Buffer.concat(chunks)
  } catch (error) {
    console.error('Error downloading from S3:', error)
    throw new Error(
      `Failed to download file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Delete a file from S3
 * @param key - The file key in S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    })

    await s3Client.send(command)
  } catch (error) {
    console.error('Error deleting from S3:', error)
    throw new Error(
      `Failed to delete file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Generate a unique file path for S3
 * @param userId - User ID
 * @param fileName - Original file name
 * @returns Unique S3 key
 */
export function generateS3Key(userId: string, fileName: string): string {
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `transcriptions/${userId}/${timestamp}-${randomSuffix}-${sanitizedFileName}`
}

/**
 * Extract the S3 key from a full URL
 * @param url - Full S3 URL
 * @returns S3 key
 */
export function extractS3Key(url: string): string | null {
  try {
    // Handle standard S3 URLs
    const s3UrlPattern = /https:\/\/[^/]+\.s3\.[^/]+\.amazonaws\.com\/(.+)/
    const match = url.match(s3UrlPattern)
    if (match) {
      return decodeURIComponent(match[1])
    }

    // Handle custom endpoint URLs
    if (
      process.env.AWS_S3_ENDPOINT &&
      url.includes(process.env.AWS_S3_ENDPOINT)
    ) {
      const parts = url.split(`${BUCKET_NAME}/`)
      if (parts.length > 1) {
        return decodeURIComponent(parts[1])
      }
    }

    // Handle path-style URLs
    const pathStylePattern = /https:\/\/s3\.[^/]+\.amazonaws\.com\/[^/]+\/(.+)/
    const pathMatch = url.match(pathStylePattern)
    if (pathMatch) {
      return decodeURIComponent(pathMatch[1])
    }

    return null
  } catch (error) {
    console.error('Error extracting S3 key from URL:', error)
    return null
  }
}

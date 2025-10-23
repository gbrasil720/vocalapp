import { del, put } from '@vercel/blob'

export interface UploadResult {
  url: string
  pathname: string
  downloadUrl: string
}

export async function uploadToBlob(
  file: File | Blob,
  path: string
): Promise<UploadResult> {
  try {
    const blob = await put(path, file, {
      access: 'public',
      addRandomSuffix: false
    })

    return {
      url: blob.url,
      pathname: blob.pathname,
      downloadUrl: blob.downloadUrl
    }
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error)
    throw new Error(
      `Failed to upload file to Vercel Blob: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export async function deleteFromBlob(url: string): Promise<void> {
  try {
    await del(url)
  } catch (error) {
    console.error('Error deleting from Vercel Blob:', error)
    throw new Error(
      `Failed to delete file from Vercel Blob: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export function generateBlobKey(userId: string, fileName: string): string {
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `transcriptions/${userId}/${timestamp}-${randomSuffix}-${sanitizedFileName}`
}
